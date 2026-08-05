import io, os, re, sys, colorsys

# Rampas ancoradas pela luminosidade real de cada tom: assim o vermelho da
# marca cai exatamente em #a30019 e o sombreado original é preservado, em vez
# de escorregar para o tom vizinho.
RAMPAS = {
  'vermelho': ['#fff5f4','#ffdad7','#ffb3ae','#e8515f','#ce1126','#a30019','#5e0010'],
  'azul':     ['#f2f7ff','#d5e3ff','#a6c8ff','#3d86d6','#0c5fae','#004787','#001c3b'],
}

def hex_para_rgb(h):
    h = h.lstrip('#')
    if len(h) == 3: h = ''.join(c*2 for c in h)
    return tuple(int(h[i:i+2], 16) / 255 for i in (0, 2, 4))

def rgb_para_hex(rgb):
    return '#%02x%02x%02x' % tuple(round(max(0, min(1, c)) * 255) for c in rgb)

def lum(rgb):
    return colorsys.rgb_to_hls(*rgb)[1]

# (luminosidade, rgb) de cada parada, do claro para o escuro
PARADAS = {
    nome: sorted(((lum(hex_para_rgb(c)), hex_para_rgb(c)) for c in cores), reverse=True)
    for nome, cores in RAMPAS.items()
}

def amostrar(nome, l):
    paradas = PARADAS[nome]
    if l >= paradas[0][0]: return rgb_para_hex(paradas[0][1])
    if l <= paradas[-1][0]: return rgb_para_hex(paradas[-1][1])
    for (l1, c1), (l2, c2) in zip(paradas, paradas[1:]):
        if l2 <= l <= l1:
            f = 0 if l1 == l2 else (l1 - l) / (l1 - l2)
            return rgb_para_hex(tuple(c1[k] + (c2[k] - c1[k]) * f for k in range(3)))
    return rgb_para_hex(paradas[-1][1])

def converter(hexa):
    r, g, b = hex_para_rgb(hexa)
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    grau = h * 360
    if s < 0.12:
        # Cinza claro já É branco sombreado: fica como está.
        # Cinza escuro vira azul-marinho, para o traço da ilustração ter
        # a terceira cor em vez de preto.
        return hexa if l >= 0.72 else amostrar('azul', l)
    return amostrar('vermelho' if (grau >= 300 or grau <= 60) else 'azul', l)

if __name__ == '__main__':
    if sys.argv[1] == 'previa':
        for c in sys.argv[2:]:
            print(f'  {c:9} -> {converter(c)}')
    else:
        total = 0
        for f in sorted(os.listdir('.')):
            if not f.endswith('.svg'): continue
            s = io.open(f, encoding='utf-8', errors='ignore').read()
            io.open(f, 'w', encoding='utf-8').write(
                re.sub(r'#[0-9a-fA-F]{3}\b|#[0-9a-fA-F]{6}\b',
                       lambda m: converter(m.group(0)), s))
            total += 1
        print(total, 'SVGs convertidos')
