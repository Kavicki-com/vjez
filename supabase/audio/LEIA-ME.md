# Áudio

## Situação

**Gerado e no ar**: 180 MP3 (716 kB) no bucket `audio`, com a voz
`hr-HR-Chirp3-HD-Achernar` a 0.9 de velocidade. Cobre alfabeto, números,
dicionário e expressões.

O botão de ouvir aparece sozinho em qualquer item que tenha `audio_url` —
inclusive nos que a curadoria acrescentar depois, bastando rodar o script
de novo (ele pula o que já tem áudio).

O alvo `padezi` (quadro dos casos) também está no ar: 27 faixas novas — as 7
frases de exemplo e cada forma da grade de terminações. As 6 formas de *žena*
o script pulou, porque já existiam pelos exercícios: a mesma faixa serve aos
dois lugares, que é o ponto de indexar por texto.

**Exercícios seguem sem áudio**, de propósito: veja a seção no fim.

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

O conteúdo de hoje são **180 itens e 1.094 caracteres** no total:

| alvo | itens | caracteres |
|---|---|---|
| letras (palavra de exemplo) | 30 | 131 |
| números | 30 | 203 |
| palavras | 93 | 451 |
| expressões | 27 | 309 |

O Cloud TTS cobra por caractere e a faixa gratuita é contada em milhões.
Mil caracteres é ruído estatístico dentro de qualquer plano — mesmo na
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

**Não gera áudio de exercício**, de propósito. O áudio pode entregar a
resposta: numa tradução PT→HR, ouvir a palavra em croata é o gabarito.
Onde o áudio for o enunciado (HR→PT, ou um exercício de escuta), quem decide
é a curadoria, item a item. O app já toca `exercicios.audio_url` quando ele
existe — inclusive tocando sozinho, se a preferência de áudio automático
estiver ligada.

## Alternativas à voz sintética

Se a qualidade do TTS não convencer, o caminho é gravar com um nativo. O
volume é pequeno (181 itens) e a estrutura não muda: basta subir os MP3 com
o mesmo nome de arquivo (`<tipo>/<id>.mp3`) e preencher `audio_url`.
