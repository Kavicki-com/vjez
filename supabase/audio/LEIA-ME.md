# Áudio

## Situação

O app já toca áudio: o botão de ouvir aparece sozinho em qualquer item que
tenha `audio_url`. **Não há nenhum MP3 ainda**, então hoje nenhum botão
aparece. Assim que os arquivos existirem, eles surgem sem tocar no código.

## Por que não gerei aqui

Não existe voz croata disponível localmente. O macOS tem tcheco, eslovaco e
polonês — línguas eslavas, mas com pronúncia diferente o bastante para
ensinarem errado. **Num app de idioma, pronúncia errada é pior que
silêncio.** Por isso o pipeline está pronto e vazio, esperando uma voz de
verdade.

## Gerar

```bash
GOOGLE_TTS_API_KEY=...             \
SUPABASE_URL=https://cltclnrgtlififwvpfra.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=...      \
node supabase/audio/gerar.mjs
```

Opções:

- `--so=letras,numeros,palavras,frases` — gera só o que você listar
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

O Cloud TTS cobra por caractere e tem faixa gratuita mensal. O conteúdo de
hoje — 30 letras, 30 números, 94 palavras e 27 expressões — dá cerca de
1.200 caracteres no total. É desprezível, mas vale conferir antes de rodar
com `--refazer` sobre um conteúdo grande.

## Escolhas embutidas

**Voz:** `hr-HR-Standard-A`, feminina. Trocar `VOZ_HR` troca a voz do app
inteiro. Vale ouvir as opções antes de gerar tudo — a voz vira a "professora"
do app e é cara de trocar depois que o aluno se acostuma.

**Velocidade 0.9**, um pouco abaixo do natural: é material de estudo, e
iniciante perde sílaba em velocidade de conversa. `VELOCIDADE` ajusta.

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
