# -*- coding: utf-8 -*-
"""
Transcreve croata para respelling silábico em PT-BR.

O croata é fonético — cada letra tem um som só — então a parte segmental é
mecânica e confiável. O que exige julgamento é a tônica; ver nota no fim.

O mapeamento é feito SEGMENTO A SEGMENTO, nunca por replace encadeado:
com replace, 'č' vira 'tch' e o 'c' seguinte transforma o próprio resultado
em 'ttsh'. Cada letra é traduzida uma vez só.
"""
import re, sys

VOGAIS_HR = set('aeiou')

# Dígrafos precisam ser reconhecidos antes das letras soltas.
DIGRAFOS = ('dž', 'lj', 'nj')

MAPA = {
    'dž': 'dj',   # j de "jeans" em inglês
    'lj': 'lh',
    'nj': 'nh',
    'č': 'tch',
    'ć': 'tch',   # mais suave que č, mas sem par no português
    'đ': 'dj',
    'š': 'ch',
    'ž': 'j',
    'c': 'ts',
    'h': 'r',     # aspirado; o mais perto é o "rr" leve
    'j': 'i',     # semivogal, como o "i" de "pai"
    'e': 'é',
    'o': 'ó',
}

def segmentar(p):
    seg, i = [], 0
    while i < len(p):
        if p[i:i+2] in DIGRAFOS:
            seg.append(p[i:i+2]); i += 2
        else:
            seg.append(p[i]); i += 1
    return seg

def silabas(seg):
    """Uma vogal por sílaba. V-CV com uma consoante, VC-CV com duas ou mais."""
    vogais = [i for i, s in enumerate(seg) if s in VOGAIS_HR]
    if len(vogais) <= 1:
        return [seg]
    cortes = []
    for a, b in zip(vogais, vogais[1:]):
        entre = b - a - 1
        cortes.append(b - entre if entre <= 1 else a + 2)
    partes, anterior = [], 0
    for corte in cortes:
        partes.append(seg[anterior:corte]); anterior = corte
    partes.append(seg[anterior:])
    return [p for p in partes if p]

def traduzir(seg, indice, todos):
    letra = seg
    if letra == 's':
        # s croata é sempre surdo. Entre vogais o português leria "z",
        # então dobra; no começo ou junto de consoante, um s basta.
        antes = todos[indice - 1] if indice > 0 else ''
        depois = todos[indice + 1] if indice + 1 < len(todos) else ''
        return 'ss' if antes in VOGAIS_HR and depois in VOGAIS_HR else 's'
    return MAPA.get(letra, letra)

def transcrever(texto):
    if ' ' in texto.strip():
        return ' '.join(transcrever(p) for p in texto.split() if p)

    limpa = re.sub(r'[^\wčćšžđ]', '', texto.lower(), flags=re.UNICODE)
    if not limpa:
        return texto

    seg = segmentar(limpa)
    escrito = [traduzir(s, i, seg) for i, s in enumerate(seg)]

    # Reagrupa os segmentos já traduzidos nas sílabas do original.
    partes, cursor = [], 0
    for silaba in silabas(seg):
        partes.append(''.join(escrito[cursor:cursor + len(silaba)]))
        cursor += len(silaba)

    if len(partes) == 1:
        return partes[0].upper()

    # Tônica: o croata NUNCA acentua a última sílaba de palavra polissílaba,
    # e o padrão majoritário é a primeira. Empréstimos fogem disso — por isso
    # o campo inteiro vai marcado para revisão nativa.
    partes[0] = partes[0].upper()
    return '-'.join(partes)

if __name__ == '__main__':
    for palavra in sys.argv[1:]:
        print(f'{palavra:18} -> {transcrever(palavra)}')
