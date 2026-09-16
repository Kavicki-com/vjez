"""Corta a figura vetorizada em pecas animaveis.

O corte acontece no RASTER, antes do tracado: cada peca e uma mascara, e o
tracador roda uma vez por peca. Sai um SVG com um <g> por peca, ja no lugar
certo — montado, o desenho e identico ao inteiro.

Peca que gira precisa de SOBRA: um pedaco a mais, enfiado por baixo da peca
vizinha. Sem isso, girar o braco abre um buraco no ombro. A sobra e sempre
desenhada antes de quem a cobre.
"""
from collections import deque

from PIL import Image, ImageDraw

import vetorizar as V

FONTE = 'frontal.png'
N_CORES = 10

# --- medidas lidas do perfil da silhueta (399 x 543) ---
PESCOCO = 176        # onde a cabeca acaba e o tronco comeca
PESCOCO_SOBRA = 198  # ate onde a cabeca desce, escondida atras do tronco
PESCOCO_X = (160, 270)
BRACOS_Y = (182, 256)
TRONCO_X = (158, 270)   # fora disso, na faixa dos bracos, e braco
MEIO_X = 214            # divisor entre braco esquerdo e direito


def carregar():
    im = Image.open(FONTE).convert('RGBA')
    centros, indice = V.quantizar(im, N_CORES)
    return im, centros, indice


def ilhas(indice, alvo, w, h, minimo=150):
    visto = bytearray(w * h)
    fora = []
    for s in range(w * h):
        if indice[s] != alvo or visto[s]:
            continue
        ilha, f = [], deque([s])
        visto[s] = 1
        while f:
            j = f.popleft()
            ilha.append(j)
            jx, jy = j % w, j // w
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = jx + dx, jy + dy
                k = ny * w + nx
                if 0 <= nx < w and 0 <= ny < h and indice[k] == alvo and not visto[k]:
                    visto[k] = 1
                    f.append(k)
        if len(ilha) >= minimo:
            fora.append(ilha)
    return fora


def engordar(mascara, w, h, vezes):
    for _ in range(vezes):
        mascara = V.dilatar(mascara, w, h)
    return mascara


def montar_pecas(im, centros, indice):
    w, h = im.size
    px = im.load()
    figura = bytearray(1 if px[i % w, i // w][3] > 128 else 0 for i in range(w * h))

    # azul do bone: todas as cores em que o azul manda
    azuis = {i for i, c in enumerate(centros) if c[2] > c[0] + 25}
    marrom = max(range(len(centros)),
                 key=lambda i: sum(1 for v in indice if v == i))

    # cauda: a maior ilha de marrom escuro, e ela mora a direita
    escuro = min(range(len(centros)), key=lambda k: sum(centros[k]))
    candidatas = ilhas(indice, escuro, w, h, minimo=2000)
    cauda_ilha = max(candidatas, key=len)
    cauda = bytearray(w * h)
    for j in cauda_ilha:
        cauda[j] = 1

    bone = bytearray(1 if indice[i] in azuis else 0 for i in range(w * h))

    # olhos: as duas ilhas escuras pequenas la em cima. Engordam 6px para
    # levar junto o brilho branco, que mora dentro do oval escuro.
    olhos = sorted((il for il in ilhas(indice, escuro, w, h, minimo=200)
                    if len(il) < 800 and max(j // w for j in il) < 150),
                   key=lambda il: min(j % w for j in il))
    def so(ilha):
        m = bytearray(w * h)
        for j in ilha:
            m[j] = 1
        return bytearray(1 if figura[i] and v else 0
                         for i, v in enumerate(engordar(m, w, h, 6)))
    olho_esq, olho_dir = (so(olhos[0]), so(olhos[-1])) if len(olhos) >= 2 else (bytearray(w*h), bytearray(w*h))
    tapar_olhos = bytearray(1 if olho_esq[i] or olho_dir[i] else 0 for i in range(w * h))

    def regiao(teste):
        return bytearray(1 if figura[i] and teste(i % w, i // w) else 0
                         for i in range(w * h))

    braco_esq = regiao(lambda x, y: BRACOS_Y[0] <= y <= BRACOS_Y[1] and x <= MEIO_X)
    braco_dir = regiao(lambda x, y: BRACOS_Y[0] <= y <= BRACOS_Y[1] and x > MEIO_X)
    # so o que passa da silhueta do tronco e braco de verdade; o resto e sobra
    braco_exclusivo = regiao(
        lambda x, y: BRACOS_Y[0] <= y <= BRACOS_Y[1] and (x < TRONCO_X[0] or x > TRONCO_X[1]))

    cabeca = regiao(lambda x, y: y < PESCOCO or (
        y < PESCOCO_SOBRA and PESCOCO_X[0] <= x <= PESCOCO_X[1]))

    # O tronco fica com o que nao e cauda visivel, braco visivel nem cabeca.
    # A faixa do pescoco (PESCOCO..PESCOCO_SOBRA) fica nos dois: e a sobra da
    # cabeca, que desce por cima do peito e some quando a cabeca inclina.
    tronco = bytearray(
        1 if figura[i] and not cauda[i] and not braco_exclusivo[i]
        and (i // w) >= PESCOCO else 0
        for i in range(w * h))

    # Ombro: um disco de corpo por baixo de cada braco. Sem ele, girar o
    # braco para baixo descobre a area que o braco ocupava em T e abre uma
    # fresta clara no ombro. O disco fica escondido enquanto o braco esta em
    # T e vira o ombro redondo quando ele desce.
    for ox, oy in ((168, 206), (262, 206)):
        for y in range(oy - 27, oy + 28):
            for x in range(ox - 27, ox + 28):
                if 0 <= x < w and 0 <= y < h and (x - ox) ** 2 + (y - oy) ** 2 <= 27 * 27:
                    if figura[y * w + x]:
                        tronco[y * w + x] = 1

    # sobras: cada peca movel invade a vizinha que vai cobri-la
    cauda_sobra = bytearray(1 if figura[i] and v else 0
                            for i, v in enumerate(engordar(cauda, w, h, 12)))
    bone_sobra = bytearray(1 if figura[i] and v else 0
                           for i, v in enumerate(engordar(bone, w, h, 7)))

    return {
        'figura': figura, 'marrom': marrom, 'azuis': azuis,
        'olhos': [('olho-esq', olho_esq), ('olho-dir', olho_dir)],
        'tapar_olhos': tapar_olhos,
        'pivo_olhos': {nome: (
            (min(j % w for j in il) + max(j % w for j in il)) // 2,
            (min(j // w for j in il) + max(j // w for j in il)) // 2)
            for nome, il in zip(('olho-esq', 'olho-dir'), (olhos[0], olhos[-1]))} if len(olhos) >= 2 else {},
        'pecas': [
            # nome,        mascara,      ordem de desenho, remapear cor
            ('cauda',      cauda_sobra,  None),
            ('braco-esq',  braco_esq,    None),
            ('braco-dir',  braco_dir,    None),
            ('tronco',     tronco,       None),
            ('cabeca',     cabeca,       {i: marrom for i in azuis}),
            ('bone',       bone_sobra,   None),
        ],
    }


def previa(im, dados, destino):
    """Pinta cada peca de uma cor, para eu conferir o corte."""
    w, h = im.size
    tons = [(220, 70, 70), (70, 140, 220), (90, 190, 120),
            (230, 170, 60), (160, 110, 210), (60, 190, 200)]
    fora = Image.new('RGBA', (w, h), (255, 255, 255, 255))
    p = fora.load()
    for (nome, mascara, _), tom in zip(dados['pecas'], tons):
        for i, v in enumerate(mascara):
            if v:
                p[i % w, i // w] = tom + (255,)
    fora.save(destino)
    for (nome, mascara, _) in dados['pecas']:
        xs = [i % w for i, v in enumerate(mascara) if v]
        ys = [i // w for i, v in enumerate(mascara) if v]
        print(f'  {nome:10s} {sum(mascara):6d} px   x {min(xs):3d}..{max(xs):3d}   y {min(ys):3d}..{max(ys):3d}')


if __name__ == '__main__':
    im, centros, indice = carregar()
    dados = montar_pecas(im, centros, indice)
    previa(im, dados, 'pecas-previa.png')


# ---------------------------------------------------------------- tracado
ESCALA = 2

# Pivos lidos da figura, em coordenadas da arte (399 x 543). O SVG sai em
# dobro, entao cada um e multiplicado por ESCALA na hora de escrever.
PIVOS = {
    'bone':      (212, 58),    # aba, onde ele se apoia na testa
    'cabeca':    (213, 186),   # pescoco
    'braco-esq': (168, 206),   # ombro
    'braco-dir': (262, 206),   # ombro
    'cauda':     (297, 428),   # quadril, onde a cauda some atras do corpo
    'tronco':    (213, 520),   # base, para o respiro escalar em Y
}


def ampliar(mascara, w, h, e):
    """Repete cada pixel e x e, para casar com a arte ampliada."""
    W = w * e
    nova = bytearray(W * h * e)
    for y in range(h):
        linha = y * w
        for x in range(w):
            if mascara[linha + x]:
                for dy in range(e):
                    base = (y * e + dy) * W + x * e
                    for dx in range(e):
                        nova[base + dx] = 1
    return nova


def tracar_peca(indice, mascara, w, h, centros, remapa=None, tapar=None, cor_tapa=None):
    """Roda o tracador so na area da peca, e so nas cores que ela usa."""
    xs = [i % w for i, v in enumerate(mascara) if v]
    ys = [i // w for i, v in enumerate(mascara) if v]
    if not xs:
        return ''
    pad = 8
    x0, x1 = max(0, min(xs) - pad), min(w, max(xs) + pad + 1)
    y0, y1 = max(0, min(ys) - pad), min(h, max(ys) + pad + 1)
    sw, sh = x1 - x0, y1 - y0

    # recorta indice e mascara para a caixa da peca
    sub_idx, sub_msk = [], bytearray(sw * sh)
    for y in range(y0, y1):
        linha = y * w
        for x in range(x0, x1):
            j = (y - y0) * sw + (x - x0)
            dentro = mascara[linha + x]
            sub_msk[j] = 1 if dentro else 0
            c = indice[linha + x]
            if tapar is not None and tapar[linha + x]:
                c = cor_tapa
            elif remapa and c in remapa:
                c = remapa[c]
            sub_idx.append(c if dentro else -1)

    regioes = []
    for i, cor in enumerate(centros):
        crua = bytearray(1 if sub_idx[j] == i else 0 for j in range(sw * sh))
        area = sum(crua)
        if area < V.AREA_MINIMA:
            continue
        suave = V.arredondar(crua, sw, sh)
        if not sum(suave):
            suave = crua
        m = V.dilatar(suave, sw, sh)
        # a dilatacao nao pode vazar para fora da peca
        m = bytearray(1 if m[j] and sub_msk[j] else 0 for j in range(sw * sh))
        partes = []
        for laco in V.contornos(m, sw, sh):
            p = V.simplificar_fechado(laco, V.EPSILON)
            if len(p) > 2:
                partes.append([(px + x0, py + y0) for px, py in p])
        if partes:
            regioes.append((area, '#%02X%02X%02X' % cor,
                            ''.join(V.para_path(p) for p in partes)))

    regioes.sort(key=lambda r: -r[0])
    return '\n      '.join(
        f'<path fill="{cor}" fill-rule="evenodd" d="{d}"/>' for _, cor, d in regioes)


def escrever_rig(destino='kuna-rig.svg'):
    im, centros, indice = carregar()
    dados = montar_pecas(im, centros, indice)
    w, h = im.size

    grande = im.resize((w * ESCALA, h * ESCALA), Image.LANCZOS)
    W, H = grande.size
    centros_g, indice_g = V.quantizar(grande, N_CORES)
    azul_g = {i for i, c in enumerate(centros_g) if c[2] > c[0] + 25}
    marrom_g = max(range(len(centros_g)),
                   key=lambda i: sum(1 for v in indice_g if v == i))

    tapar_g = ampliar(dados['tapar_olhos'], w, h, ESCALA)

    def grupo(nome, mascara, remapa=None, tapar=None, dentro='', pivo=None):
        corpo = tracar_peca(indice_g, mascara, W, H, centros_g,
                            remapa, tapar, marrom_g)
        px, py = pivo or PIVOS[nome]
        return (f'    <g id="{nome}" data-pivo="{px * ESCALA},{py * ESCALA}">\n'
                f'      {corpo}\n{dentro}    </g>')

    # olhos: viram subgrupos DENTRO da cabeca, para acompanhar a inclinacao
    olhos = ''
    for nome, mascara in dados['olhos']:
        m = ampliar(mascara, w, h, ESCALA)
        pivo = dados['pivo_olhos'][nome]
        olhos += grupo(nome, m, pivo=pivo).replace('    <g', '      <g').replace(
            '\n    </g>', '\n      </g>') + '\n'
        print('  tracou', nome)

    grupos = []
    for nome, mascara, remapa in dados['pecas']:
        m = ampliar(mascara, w, h, ESCALA)
        remapa_g = {i: marrom_g for i in azul_g} if remapa else None
        if nome == 'cabeca':
            grupos.append(grupo(nome, m, remapa_g, tapar_g, dentro=olhos))
        else:
            grupos.append(grupo(nome, m, remapa_g))
        print('  tracou', nome)

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
           f'width="{W}" height="{H}">\n'
           f'  <g id="corpo">\n' + '\n'.join(grupos) + '\n  </g>\n</svg>\n')
    with open(destino, 'w') as fp:
        fp.write(svg)
    print(destino, len(svg) // 1024, 'KB')
    print('pivos dos olhos:', dados['pivo_olhos'])
