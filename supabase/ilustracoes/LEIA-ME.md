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
2. **Recoloridas para a bandeira** com `tricolor.py`, que reduz a paleta
   inteira (46 cores no original) a três famílias: branco, azul e vermelho.

   Como funciona: cada cor é classificada por matiz — quentes (vermelho,
   rosa, laranja, amarelo) viram vermelho, frias (verde, ciano, azul, roxo)
   viram azul, e neutros dependem da luminosidade: cinza claro fica como
   está, porque cinza claro já *é* branco sombreado; cinza escuro vira
   azul-marinho, para o traço da ilustração trazer a terceira cor no lugar
   do preto.

   A cor de saída é amostrada na rampa **pela luminosidade real** do tom
   original, não por uma posição fixa. Isso preserva o sombreado e faz o
   vermelho da marca cair exatamente em `#a30019` em vez de escorregar para
   o tom vizinho.

   Para regerar: `cd supabase/ilustracoes && python3 tricolor.py aplicar`
   (ou `previa '#abcdef'` para testar uma cor).
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
