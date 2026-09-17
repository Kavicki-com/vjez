# Áudio

## Situação

**Gerado e no ar**: 180 MP3 da camada basal (alfabeto, números, dicionário,
expressões) mais **341 faixas em `audio_hr`**, indexadas por texto. Tudo com a
voz `hr-HR-Chirp3-HD-Achernar` a 0.9 de velocidade.

O botão de ouvir aparece sozinho em qualquer item que tenha `audio_url` —
inclusive nos que a curadoria acrescentar depois, bastando rodar o script
de novo (ele pula o que já tem áudio).

O alvo `padezi` (quadro dos casos) também está no ar: as 7 frases de exemplo
e cada forma da grade de terminações. As 6 formas de *žena* o script pulou,
porque já existiam pelos exercícios: a mesma faixa serve aos dois lugares,
que é o ponto de indexar por texto.

**Conteúdo novo chega mudo.** Uma leva de lições entra no banco sem áudio
nenhum — o `audio_hr` só conhece o que o gerador já viu. Depois de qualquer
seed de conteúdo, rode `--so=opcoes`: é o alvo que varre os exercícios e gera
só o que falta. Foi o que faltou depois dos seeds 012–014, e deixou as
lições novas mudas até o dia seguinte.

**O que o script não fala em exercício** está na seção do fim: a regra é
sobre entregar a resposta, não sobre poupar faixa.

## Gerar

```bash
GOOGLE_TTS_API_KEY=...             \
SUPABASE_URL=https://cltclnrgtlififwvpfra.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=...      \
node supabase/audio/gerar.mjs
```

Opções:

- `--so=letras,numeros,palavras,frases,opcoes,padezi` — gera só o que você listar
- `--refazer` — regera mesmo o que já tem áudio (troca de voz, por exemplo)

O script pula o que já tem `audio_url`, então dá para rodar de novo depois de
a curadoria acrescentar conteúdo: ele gera só o que falta.

### O que precisa

1. Projeto no Google Cloud com **Cloud Text-to-Speech API** ativada.
2. Uma **chave de API** restrita a essa API.
3. A **service_role key** do Supabase (Painel → Settings → API). Ela escreve
   em conteúdo curado e sobe no Storage — é trabalho em lote, fora do app.
   **Nunca embarque essa chave no cliente.**

### Custo

O conteúdo de hoje são **521 faixas e 3.981 caracteres** no total:

| alvo | itens | caracteres |
|---|---|---|
| letras (palavra de exemplo) | 30 | 131 |
| números | 30 | 203 |
| palavras | 93 | 451 |
| expressões | 27 | 309 |
| `audio_hr` (exercícios e padeži) | 341 | 2.887 |

O Cloud TTS cobra por caractere e a faixa gratuita é contada em milhões.
Quatro mil caracteres é ruído estatístico dentro de qualquer plano — mesmo na
família Chirp3-HD, que é a premium. Vale conferir o preço vigente em
https://cloud.google.com/text-to-speech/pricing antes de rodar `--refazer`
sobre um conteúdo muito maior, mas para o volume atual não há o que pesar.

## Escolhas embutidas

**Voz:** `hr-HR-Chirp3-HD-Achernar`, feminina.

O croata **não tem** vozes Standard, WaveNet nem Neural2 no Google — só a
família **Chirp3-HD**, com 30 vozes. Não há escolha de tier: ou é Chirp3-HD
ou é outro fornecedor. A lista completa está em
https://cloud.google.com/text-to-speech/docs/list-voices-and-types

Trocar `VOZ_HR` troca a voz do app inteiro. Vale ouvir algumas antes de
gerar tudo — a voz vira a "professora" do app e é cara de trocar depois que
o aluno se acostuma.

**Velocidade 0.9**, um pouco abaixo do natural: é material de estudo, e
iniciante perde sílaba em velocidade de conversa. `VELOCIDADE` ajusta, e
Chirp3-HD aceita de 0.25 a 2.0.

**Alfabeto fala a palavra de exemplo, não a letra.** A letra sozinha ensina
pouco; o que fixa o som é ouvir `čokolada` para o Č.

## O que o script NÃO faz

**Não preenche `exercicios.audio_url`**, de propósito: esse campo é o áudio
do *enunciado*, e tocá-lo antes da resposta entregaria o gabarito numa
tradução PT→HR. Onde o enunciado for para ouvir (HR→PT, ou um exercício de
escuta), quem decide é a curadoria, item a item. O app toca
`exercicios.audio_url` quando ele existe — inclusive sozinho, se a
preferência de áudio automático estiver ligada.

O que ele **gera** é o áudio das palavras que aparecem no exercício, em
`audio_hr`: as fichas croatas do `ligar_pares`, as respostas certas de cada
template (tocadas só no feedback, depois de o aluno responder) e as opções do
`escolher_forma`.

**Opção de `escolher_forma` só fala** quando é verbete do dicionário ou
quando a curadoria marcou `falar_opcoes` no `dados`. Sem isso o exercício
fica mudo, e é assim que se quer em metade deles: opção em português ("fumar",
"feminino"), nome de caso ("Genitiv"), transcrição de som ("ts", "tch") ou
frase que mistura as duas línguas. Voz croata lendo português é pior do que
silêncio. Onde as quatro opções são croatas, marque — ver seed
`015_opcoes_que_falam.sql`.

## A voz não diz texto curtíssimo

Letra solta e palavra de duas letras saem **com a duração certa e silêncio
dentro**: `a`, `e`, `o`, `u`, `od` e `do` tinham pico abaixo de 0,022 e ZERO
janelas audíveis, contra 0,27 e 31% das faixas boas.

**Baixar a velocidade não resolve.** Medido de 0,9 a 0,25, três sorteios
cada: a 0,25 o `a` dura 1,03s e continua mudo. O arquivo cresce e o silêncio
cresce junto — não é que ela corra demais, é que não gera fonação para
entrada curtíssima.

**E não é monossílabo.** `krv`, `trg`, `prst` e `sin` saem bem em qualquer
velocidade. `dan` é a fronteira: funciona a 0,9, colapsa a 0,7 e 0,5, volta a
funcionar a 0,35 — sorteio, não curva.

O que resolve é mais **texto**, não mais tempo. Daí o `cortar_portador` em
`audio_ajustes`: o gerador sintetiza `Slovo a.` ("a letra a"), acha o vale de
energia entre o portador e a vogal, e descarta os quadros de MP3 anteriores a
ele. O que sobe tem só a vogal, com os mesmos bytes que o sintetizador
produziu — `supabase/audio/mp3.mjs` recorta por quadro, sem recodificar.

Reprova e sorteia de novo quando não há vale: aí o portador e o alvo saíram
grudados, e cortar seria chutar no meio da palavra.

## Duração não vê silêncio

O MP3 é de bitrate constante: 0,31s de nada pesa o mesmo que 0,31s de fala.
Foi assim que as quatro mudas passaram pela régua e foram para o ar.

`supabase/audio/som.mjs` decodifica com o `afconvert` do macOS ou com o
`ffmpeg` e mede pico e fração audível. Sem nenhum dos dois na máquina o
script **avisa alto** e segue só com a duração — o que não pode é ficar
quieto e a gente descobrir pelo aluno.

## Alternativas à voz sintética

Se a qualidade do TTS não convencer, o caminho é gravar com um nativo. O
volume é pequeno (181 itens) e a estrutura não muda: basta subir os MP3 com
o mesmo nome de arquivo (`<tipo>/<id>.mp3`) e preencher `audio_url`.
