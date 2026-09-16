"""Vetoriza arte chapada: PNG com alfa -> SVG de paths por regiao de cor.

A arte da folha nao tem gradiente nem textura: e uma particao do plano em
poucas cores. Entao da para tratar cada cor como uma mascara, seguir o
contorno dela pela malha de pixels e ajustar curva por cima.

Quatro passos:
  1. quantizar    reduz o JPEG (milhares de tons de ruido) a N cores
  2. contornar    costura as arestas de pixel em lacos fechados exatos
  3. simplificar  Douglas-Peucker come a escadinha de 1px
  4. suavizar     Catmull-Rom vira cubica, menos onde ha canto de verdade

As regioes sao pintadas da maior para a menor, entao o que esta dentro cai
por cima do que esta em volta — e o olho fica sobre a cabeca sem precisar de
ordem declarada. Cada mascara cresce 1px antes de virar contorno: sem isso,
duas regioes vizinhas suavizadas cada uma por si abrem fresta entre elas.
"""
import json
import math
from collections import defaultdict, deque

from PIL import Image, ImageFilter

EPSILON = 1.8        # tolerancia do Douglas-Peucker, em pixels
ANGULO_CANTO = 68    # acima disso a virada e canto, e nao curva
AREA_MINIMA = 14     # regiao menor que isso e ruido de JPEG
DESFOQUE = 1.3       # arredonda a mascara antes de tracar


# ---------------------------------------------------------------- paleta
def quantizar(im, n_cores):
    """Mapeia cada pixel opaco para uma de n_cores, por k-means em RGB."""
    px = im.load()
    w, h = im.size
    amostra = []
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            r, g, b, a = px[x, y]
            if a > 190:
                amostra.append((r, g, b))

    # sementes: k-means++ simplificado, pegando pontos bem espalhados
    centros = [amostra[len(amostra) // 2]]
    while len(centros) < n_cores:
        melhor, melhor_d = None, -1
        for p in amostra[::7]:
            d = min((p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2 for c in centros)
            if d > melhor_d:
                melhor, melhor_d = p, d
        centros.append(melhor)

    for _ in range(12):
        somas = [[0, 0, 0, 0] for _ in centros]
        for p in amostra:
            i = min(range(len(centros)), key=lambda k: (p[0] - centros[k][0]) ** 2
                    + (p[1] - centros[k][1]) ** 2 + (p[2] - centros[k][2]) ** 2)
            s = somas[i]
            s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3] += 1
        novos = []
        for i, s in enumerate(somas):
            novos.append((s[0] // s[3], s[1] // s[3], s[2] // s[3]) if s[3] else centros[i])
        if novos == centros:
            break
        centros = novos

    indice = [-1] * (w * h)
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 128:
                indice[y * w + x] = min(
                    range(len(centros)),
                    key=lambda k: (r - centros[k][0]) ** 2 + (g - centros[k][1]) ** 2 + (b - centros[k][2]) ** 2)
    return centros, indice


# -------------------------------------------------------------- contorno
def contornos(mascara, w, h):
    """Lacos fechados na malha de pixels, na fronteira da mascara.

    Cada pixel da mascara com vizinho de fora contribui a aresta daquele
    lado, orientada. As arestas se encaixam ponta com ponta e fecham
    sozinhas — externas num sentido, buracos no outro, que e o que o
    fill-rule evenodd precisa.
    """
    saindo = defaultdict(list)

    def dentro(x, y):
        return 0 <= x < w and 0 <= y < h and mascara[y * w + x]

    for y in range(h):
        base = y * w
        for x in range(w):
            if not mascara[base + x]:
                continue
            if not dentro(x, y - 1):
                saindo[(x, y)].append((x + 1, y))
            if not dentro(x + 1, y):
                saindo[(x + 1, y)].append((x + 1, y + 1))
            if not dentro(x, y + 1):
                saindo[(x + 1, y + 1)].append((x, y + 1))
            if not dentro(x - 1, y):
                saindo[(x, y + 1)].append((x, y))

    lacos = []
    for inicio in list(saindo):
        while saindo[inicio]:
            laco = [inicio]
            atual = inicio
            while True:
                if not saindo[atual]:
                    break
                prox = saindo[atual].pop()
                if prox == inicio:
                    break
                laco.append(prox)
                atual = prox
            if len(laco) > 7:
                lacos.append(laco)
    return lacos


# ----------------------------------------------------------- simplificar
def douglas_peucker(pontos, eps):
    if len(pontos) < 3:
        return pontos
    ax, ay = pontos[0]
    bx, by = pontos[-1]
    dx, dy = bx - ax, by - ay
    norma = math.hypot(dx, dy)
    pior, pior_i = -1.0, 0
    for i in range(1, len(pontos) - 1):
        px_, py_ = pontos[i]
        if norma == 0:
            d = math.hypot(px_ - ax, py_ - ay)
        else:
            d = abs(dy * px_ - dx * py_ + bx * ay - by * ax) / norma
        if d > pior:
            pior, pior_i = d, i
    if pior <= eps:
        return [pontos[0], pontos[-1]]
    return (douglas_peucker(pontos[:pior_i + 1], eps)[:-1]
            + douglas_peucker(pontos[pior_i:], eps))


def simplificar_fechado(laco, eps):
    # corta o laco em dois arcos para o DP nao amassar o ponto de partida
    n = len(laco)
    meio = n // 2
    a = douglas_peucker(laco[:meio + 1], eps)
    b = douglas_peucker(laco[meio:] + [laco[0]], eps)
    pontos = a[:-1] + b[:-1]
    # tira vertices repetidos que sobraram da costura
    limpo = [pontos[0]]
    for p in pontos[1:]:
        if p != limpo[-1]:
            limpo.append(p)
    return limpo


# -------------------------------------------------------------- suavizar
def para_path(pontos):
    """Catmull-Rom -> cubicas, com canto preservado onde a virada e brusca."""
    n = len(pontos)
    if n < 3:
        return ''

    def virada(i):
        ax, ay = pontos[(i - 1) % n]
        bx, by = pontos[i]
        cx, cy = pontos[(i + 1) % n]
        a1 = math.atan2(by - ay, bx - ax)
        a2 = math.atan2(cy - by, cx - bx)
        d = math.degrees(a2 - a1)
        return abs((d + 180) % 360 - 180)

    canto = [virada(i) > ANGULO_CANTO for i in range(n)]

    def f(v):
        return f'{v:.1f}'.rstrip('0').rstrip('.')

    d = [f'M{f(pontos[0][0])} {f(pontos[0][1])}']
    for i in range(n):
        p0 = pontos[(i - 1) % n]
        p1 = pontos[i]
        p2 = pontos[(i + 1) % n]
        p3 = pontos[(i + 2) % n]
        if canto[i]:
            c1 = (p1[0] + (p2[0] - p1[0]) / 3, p1[1] + (p2[1] - p1[1]) / 3)
        else:
            c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        j = (i + 1) % n
        if canto[j]:
            c2 = (p2[0] - (p2[0] - p1[0]) / 3, p2[1] - (p2[1] - p1[1]) / 3)
        else:
            c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d.append(f'C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p2[0])} {f(p2[1])}')
    d.append('Z')
    return ''.join(d)


# ------------------------------------------------------------------ fora
def arredondar(mascara, w, h, raio=DESFOQUE):
    """Tira o dente de serra de 1px da mascara antes de virar contorno.

    O JPEG deixa a fronteira de cada cor picotada; seguir isso ao pe da
    letra e depois passar curva por cima dava uma borda ondulada. Borrar e
    cortar no meio arredonda a mascara sem mexer na forma.
    """
    img = Image.frombytes('L', (w, h), bytes(255 if v else 0 for v in mascara))
    img = img.filter(ImageFilter.GaussianBlur(raio))
    return bytearray(1 if v > 127 else 0 for v in img.tobytes())


def dilatar(mascara, w, h):
    nova = bytearray(mascara)
    for y in range(h):
        for x in range(w):
            if mascara[y * w + x]:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and mascara[ny * w + nx]:
                    nova[y * w + x] = 1
                    break
    return nova


def vetorizar(entrada, saida, n_cores=8, dilatacao=True, escala=2):
    # Tracar ampliado: detalhe fino (garra, farpa da cauda) tem 2-3px no
    # original e some no desfoque. Em 2x ele sobrevive, e o contorno ainda
    # ganha precisao de meio pixel em relacao a arte original.
    im = Image.open(entrada).convert('RGBA')
    if escala != 1:
        im = im.resize((im.width * escala, im.height * escala), Image.LANCZOS)
    w, h = im.size
    centros, indice = quantizar(im, n_cores)

    regioes = []
    for i, cor in enumerate(centros):
        crua = bytearray(1 if v == i else 0 for v in indice)
        area = sum(crua)
        if area < AREA_MINIMA:
            continue
        suave = arredondar(crua, w, h)
        if not sum(suave):
            suave = crua
        mascara = dilatar(suave, w, h) if dilatacao else suave
        partes = [p for laco in contornos(mascara, w, h)
                  if (p := simplificar_fechado(laco, EPSILON)) and len(p) > 2]
        if not partes:
            continue
        d = ''.join(para_path(p) for p in partes)
        regioes.append({'cor': '#%02X%02X%02X' % cor, 'area': area, 'd': d})

    regioes.sort(key=lambda r: -r['area'])
    corpo = '\n  '.join(
        f'<path fill="{r["cor"]}" fill-rule="evenodd" d="{r["d"]}"/>' for r in regioes)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
           f'width="{w}" height="{h}">\n  {corpo}\n</svg>\n')
    with open(saida, 'w') as fp:
        fp.write(svg)
    print(saida, f'{len(regioes)} regioes,', f'{len(svg) // 1024} KB')
    for r in regioes:
        print('  ', r['cor'], r['area'])
    return regioes


if __name__ == '__main__':
    vetorizar('frontal.png', 'frontal-vetor.svg')
