# Ilustrações das aberturas de lição

## De onde vieram

[unDraw](https://undraw.co) — ilustrações abertas, uso comercial liberado e
**sem exigência de atribuição**. Foi por isso que escolhi o unDraw em vez do
Storyset: o Storyset é gratuito mas **exige crédito visível**, e o download
passa pelo editor deles, sem URL direta.

Se você preferir o Storyset mesmo assim, o caminho é: baixar pelo site,
colocar os SVGs aqui, e adicionar a linha de crédito em Configurações →
Sobre. O resto do fluxo abaixo continua igual.

## Como foram preparadas

1. Baixadas em SVG pela busca do unDraw (`https://undraw.co/api/search?q=`).
2. **Recoloridas**: o unDraw usa `#6c63ff` como cor de destaque, justamente
   para ser trocada. Virou `#a30019`, o vermelho da marca. Os cinzas e tons
   de pele ficaram como estavam.
3. Convertidas para PNG com fundo transparente (640px de largura, 2x), para
   funcionarem no nativo sem depender de `react-native-svg`.
4. Enviadas para o bucket público `ilustracoes` no Supabase Storage.
5. `licoes.ilustracao` guarda a URL pública.

Os SVGs originais (já recoloridos) ficam aqui como fonte: se um dia
precisarmos de outro tamanho ou de outra cor, é daqui que se regenera.

## Nomenclatura

`<ordem do módulo>-<ordem da lição>.png` — por exemplo, `4-1.png` é a
primeira lição do módulo 4 (Nominativ).

## Trocar uma ilustração

O campo `licoes.ilustracao` aceita duas coisas:

- uma **URL** (é o caso hoje) → a tela mostra a imagem;
- um **nome de glifo Ionicons** → a tela mostra o ícone.

Ou seja, dá para voltar ao ícone ou apontar para outra imagem sem tocar no
código. Quando o CMS existir, é esse campo que o curador edita.
