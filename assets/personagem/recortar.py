"""Isola a figura do papel da folha de modelo.

O papel, as linhas-guia e a sombra do chao sao todos cinza claro e pouco
saturados; o bicho e marrom, creme e indigo. O corte usa isso como regra,
mas por INUNDACAO a partir da borda — assim o branco do brilho do olho,
que pela regra de cor seria fundo, sobrevive por estar cercado.
"""
from collections import deque
from PIL import Image, ImageFilter

ORIGEM = '/Users/kavicki/Downloads/Gemini_Generated_Image_jdd27tjdd27tjdd2.jpeg'


def e_papel(p):
    r, g, b = p
    return (max(p) - min(p)) < 30 and (r + g + b) / 3 > 185


def isolar(caixa, destino, margem=6):
    im = Image.open(ORIGEM).convert('RGB').crop(caixa)
    w, h = im.size
    px = im.load()

    # 1. inundacao a partir de toda a borda: o que e papel e alcancavel de fora
    fundo = bytearray(w * h)
    fila = deque()
    for x in range(w):
        for y in (0, h - 1):
            if not fundo[y * w + x] and e_papel(px[x, y]):
                fundo[y * w + x] = 1
                fila.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not fundo[y * w + x] and e_papel(px[x, y]):
                fundo[y * w + x] = 1
                fila.append((x, y))
    while fila:
        x, y = fila.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not fundo[ny * w + nx] and e_papel(px[nx, ny]):
                fundo[ny * w + nx] = 1
                fila.append((nx, ny))

    # 2. maior ilha do que sobrou = o bicho. Some marca de lapis, pedaco de
    #    linha-guia e qualquer respingo do vizinho ao lado na folha.
    visto = bytearray(w * h)
    melhor, melhor_tam = None, 0
    for i in range(w * h):
        if fundo[i] or visto[i]:
            continue
        ilha, fila = [], deque([i])
        visto[i] = 1
        while fila:
            j = fila.popleft()
            ilha.append(j)
            jx, jy = j % w, j // w
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = jx + dx, jy + dy
                k = ny * w + nx
                if 0 <= nx < w and 0 <= ny < h and not fundo[k] and not visto[k]:
                    visto[k] = 1
                    fila.append(k)
        if len(ilha) > melhor_tam:
            melhor, melhor_tam = ilha, len(ilha)

    alfa = Image.new('L', (w, h), 0)
    ap = alfa.load()
    for j in melhor:
        ap[j % w, j // w] = 255

    # 3. o JPEG deixa franja clara na borda: encolhe 1px e suaviza meio px
    alfa = alfa.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))

    fora = im.convert('RGBA')
    fora.putalpha(alfa)
    fora = fora.crop(fora.getbbox())
    fora = fora.crop((-margem, -margem, fora.width + margem, fora.height + margem))
    fora.save(destino)
    print(destino, fora.size, 'de', melhor_tam, 'px de figura')
    return fora


if __name__ == '__main__':
    isolar((60, 855, 490, 1445), 'frontal.png')
