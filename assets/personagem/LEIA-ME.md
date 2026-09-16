# Kuna — o personagem

**A pose é desenhada; só o movimento é animado.** O artista monta um boneco
inteiro por pose no Figma, e o código não dobra o boneco para chegar nelas:
o braço do aceno está erguido porque existe um desenho dele erguido. O que
o código acrescenta por cima é o vaivém — o aceno balançando, o pulo
subindo, o peito respirando.

Se uma pose nova precisar de ângulo grande, o lugar de resolver é o Figma.

## As fontes

Tudo vem em vetor do arquivo
[`VW4MrtHaY0WYwDXtwyjuI8`](https://www.figma.com/design/VW4MrtHaY0WYwDXtwyjuI8/).

| node | o que é | para que serve |
|---|---|---|
| [`10:235`](https://www.figma.com/design/VW4MrtHaY0WYwDXtwyjuI8/?node-id=10-235) | `zef`, em pé | a montagem de **referência**: o chão e o eixo |
| [`16:356`](https://www.figma.com/design/VW4MrtHaY0WYwDXtwyjuI8/?node-id=16-356) | `waving-zef` | o aceno: braço esquerdo erguido |
| [`17:2`](https://www.figma.com/design/VW4MrtHaY0WYwDXtwyjuI8/?node-id=17-2) | `celebrating-zef` | a comemoração: dois braços, pernas esticadas |
| [`1:181`](https://www.figma.com/design/VW4MrtHaY0WYwDXtwyjuI8/?node-id=1-181) | a **folha** de peças soltas | só as quatro vistas de cabeça que nenhum montado tem |
| [`20:71`](https://www.figma.com/design/VW4MrtHaY0WYwDXtwyjuI8/?node-id=20-71) a [`20:139`](https://www.figma.com/design/VW4MrtHaY0WYwDXtwyjuI8/?node-id=20-139) | cinco **expressões** | `triste`, `bravo`, `surpreso`, `sonolento`, `piscando` |
| [`22:41`](https://www.figma.com/design/VW4MrtHaY0WYwDXtwyjuI8/?node-id=22-41) e [`25:93`](https://www.figma.com/design/VW4MrtHaY0WYwDXtwyjuI8/?node-id=25-93) | duas **vistas de tronco** | `tronco-costas`, `tronco-sideways` |

Cada montado traz sete peças, com o mesmo nome e na mesma ordem de
empilhamento: `calda`, `perna-dir`, `perna-esq`, `braco-esq`, `braco-dir`,
`tronco` e `front`. O gerador recusa um montado que fuja disso.

## Variantes: rosto e tronco

**Variante** é um desenho alternativo de uma junta, escolhido na hora de
renderizar — não na montagem. É como o boneco vira de frente para o lado:
trocando o desenho, nunca girando. Duas juntas têm variantes hoje, e elas
se comportam diferente.

### O rosto

O `front` do montado é a junta `cabeca`, e ela **não gira nem faz careta:
troca de desenho.** O `Rosto` é o desenho da cabeça inteira — para onde ela
olha E que cara faz —, e é **um eixo só**: virar de lado e ficar bravo são a
mesma operação, então `sideways` e `bravo` são dois valores da mesma coisa.
Não existe "vista" separada de "expressão".

| | |
|---|---|
| vistas | `front` `sideways` `profile` `backward` `back` |
| expressões | `triste` `bravo` `surpreso` `sonolento` `piscando` |

Todo rosto pende do *pescoço* (centro embaixo) e não do canto: as vistas têm
larguras de 163 a 194, e ancorar pelo canto faria a cabeça pular. As
expressões têm a caixa exata da `front`, então o deslocamento delas é zero e
a cabeça não se mexe na troca — o artista duplicou a cabeça e trocou só a
cara.

O componente aceita `rosto` como prop, separado de `estado`: o mesmo corpo
`parado` pode estar `triste` ou `surpreso`. Sem a prop, vale o rosto que o
estado pede.

### O tronco

`Tronco` é para que lado o **corpo** está virado: `tronco`,
`tronco-sideways`, `tronco-costas`. Aqui não há pendurar — uma vista de
tronco tem de ter a caixa do tronco base, porque é dela que pendem ombro,
quadril e pescoço, e um tronco de outro tamanho arrastaria todas as juntas
junto. O gerador **exige** isso e para com erro se não bater.

**Virar é do corpo todo.** O tronco acompanha o rosto sozinho, por uma
tabela em `pose.ts` (`troncoDoRosto`): as vistas de lado puxam
`tronco-sideways`, as de costas puxam `tronco-costas`, e as expressões
ficam de frente. Quem troca a cara não precisa lembrar de trocar o corpo, e
cabeça virada com corpo de frente deixa de acontecer por esquecimento.

É tabela e não regra porque **olhar por cima do ombro é pose legítima**: um
estado, ou a prop `tronco`, contraria o padrão de propósito.

`profile` cai no tronco de três quartos por falta de um mais virado — é a
aproximação mais virada que existe desenhada.

**O que ainda não vira junto:** os braços e a cauda. De costas, a cauda
continua desenhada do lado direito. Para uma pose de costas de verdade,
faltam `calda-costas` e os braços.

**`piscando` é uma piscadela, não uma piscada** — fecha um olho só e troca a
boca por um sorriso. Serve como reação; não serve como o tique de piscar de
tempos em tempos. Para esse, falta uma `front` de olhos fechados com a
mesma boca neutra.

## Refazer quando a arte mudar

Os exports vivem em `assets/personagem/figma/`, com o nome do node no Figma,
para o gerador rodar sem depender do MCP nem de quem tem acesso ao arquivo.

1. No Figma, exportar como SVG os nodes da tabela por cima deles.
2. ```
   cd assets/personagem
   node gerar-arte.mjs \
     parado=figma/zef.svg acena=figma/waving-zef.svg comemora=figma/celebrating-zef.svg \
     folha=figma/folha.svg \
     rosto=figma/triste.svg rosto=figma/bravo.svg rosto=figma/surpreso.svg \
     rosto=figma/sonolento.svg rosto=figma/piscando.svg
   ```

O nome antes do `=` diz o que o arquivo é. `folha` é uma prancha de peças
soltas, e dela entra como rosto todo grupo que não for peça de corpo.
`rosto` é uma cara só, exportada do próprio frame: a raiz do SVG já é ela, e
o nome sai do id da camada, em minúsculas — `rosto=triste.svg` traz o grupo
`Triste` como `triste`. `peca` é o mesmo, para uma variante de corpo: a
junta sai do prefixo do nome, então `tronco-costas` entra como variante de
`tronco`. Qualquer outro nome é uma pose, e a **primeira é a referência**.

Para acrescentar uma expressão: exportar o frame e pôr mais um `rosto=` na
linha. Não há nada a mexer no `pose.ts` — o pescoço vale para todo rosto por
regra, não por tabela. Para uma vista de tronco nova, o `peca=` basta, mas
**a tabela `troncoDoRosto` precisa saber dela** se algum rosto for puxá-la.

Isso reescreve `src/components/kuna/arte.tsx`. Os caminhos saem **intactos**:
cada peça vira um `<Svg>` cujo `viewBox` é a caixa dela, então nenhuma
coordenada de desenho é reescrita. O gerador acha a caixa resolvendo os
extremos das curvas — elas batem com a geometria dos frames do Figma até a
casa decimal.

O gerador **para com erro** se um montado trouxer comando de caminho
relativo ou arco. Os de hoje só usam `M`, `L`, `H`, `V`, `C` e `Z`,
absolutos.

### O que ele faz além de recortar

**Junta as poses no mesmo lugar.** Cada export do Figma tem a própria
origem — a prancha do aceno é 31 pontos mais larga que a do parado —, e sem
correção o boneco saltaria de lugar ao trocar de estado. O eixo é o
**tronco**, a única peça igual em todas as poses; o chão é o **ponto mais
baixo**. Na comemoração as pernas vêm 50 abaixo, porque o artista desenhou o
boneco no ar: assentado pelo chão, o quadro de baixo do ciclo vira o de
contato e o pulo sobe a partir dele.

**Guarda cada desenho uma vez só.** O tronco é o mesmo nas três poses, e a
cauda do aceno é a mesma do parado. A comparação é por forma com
tolerância, não por texto: a mesma peça em dois exports difere na terceira
casa, e arredondar só empurra o problema para quem cair perto da fronteira.
Hoje sobram três variantes de verdade — `braco-esq-acena`, `calda-comemora`
e `braco-dir-comemora`. O sufixo é a pose que estreou a variante, para dar
onde procurar no Figma.

**Centraliza a cabeça no eixo do corpo.** No montado ela fica alguns pontos
à esquerda, e de frente isso lê como cabeça torta. É a única correção de
posição que o código faz sobre a montagem.

**Reserva a folga do palco.** A folga é o espaço que a animação usa por cima
do desenho, e é diferente em cada lado: topo para o pulo, esquerda para o
braço que acena, direita para a cauda. A direita é a maior porque a cauda é
comprida e gira pela raiz — 5° na raiz viram uns 27 na ponta.

## Pivôs

`src/components/kuna/pose.ts` tem só os pivôs — ombro, quadril, base da
cauda — como **fração da caixa da peça**, e só para as peças de corpo da
montagem de referência. As variantes herdam: o ombro e a raiz da cauda são
pontos do *corpo*, e o corpo é o mesmo em todas as poses, então o braço
erguido gira no mesmo ombro que o braço baixo. O pescoço não está na tabela:
vale `[0.5, 1]` para todo rosto, por regra.

Ombro fora do lugar abre buraco na junta quando o braço sobe, então confira
**girando**, não parado: a bancada é a rota **`/kuna`**, com a chave
"mostrar pivôs".

## Os estados

`src/components/kuna/estados.ts`, como tabela de quadros — `parado`,
`acena`, `comemora`, `errou`, `pensa`. Cada estado escolhe uma montagem e
um rosto — e o tronco segue —, e descreve o movimento por cima. O motor (`Kuna.tsx`) suaviza a
passagem entre quadros, então dois quadros já dão um vaivém com peso.

Nenhum estado usa as cinco expressões ainda — qual cara vai com qual estado
é decisão de produto, e o CLAUDE.md tem regra sobre ela: no `errou`, "o
boneco não repreende". Enquanto não se decide, quem quiser uma expressão
passa a prop `rosto` na chamada.

`errou` e `pensa` ainda não têm montagem própria: usam a do `parado` com
rotações pequenas. Quando o artista desenhá-las, é só acrescentar o node à
linha de comando do gerador e trocar o `montagem:` do estado.

## O que ainda não dá para fazer

**Piscar de tempos em tempos.** Falta um rosto: uma `front` de olhos
fechados, com a mesma boca neutra. A `piscando` não serve — é piscadela de
um olho só, com sorriso.

E falta motor: piscada de verdade é rápida (~120 ms) e espaçada (a cada 4–6
segundos, com sorteio). O motor de hoje só sabe ciclo de duração fixa, então
uma piscada regular sairia hipnótica. Destrava com sorteio de intervalo em
`Kuna.tsx`.

**Levantar o boné sozinho.** Ele é parte do desenho da cabeça. Para animar,
teria de virar grupo próprio no Figma, dentro de cada rosto.

## Limite do SVG

Só `path`, `ellipse`, `circle` e `g` — o subconjunto que o `react-native-svg`
entende no iOS e no Android. Nada de filtro, máscara, CSS, nem `transform`
num elemento solto (aplique a transformação no Figma).

**O gerador para com erro em qualquer outra coisa**, em vez de ignorá-la. Foi
assim que a boca aberta da `surpreso` sumiu: ela é uma `<ellipse>`, o
extrator só pegava `<path>`, e o resultado foi um desenho quase certo — a
língua sem a boca — que ninguém nota até olhar de perto. Peça que some é
pior que build que quebra.

O import do `arte.tsx` acompanha sozinho o que a arte usa.

O `<Svg>` de cada peça leva `fill="none"`, que é o padrão da raiz do SVG que
o Figma exporta. Não é detalhe: o **Ž** do boné e o háček são caminhos só de
traço, sem `fill`, e em SVG a ausência de `fill` não é "nenhum", é preto —
sem isso cada um vira um borrão.
