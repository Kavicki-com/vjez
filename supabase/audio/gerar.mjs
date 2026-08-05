#!/usr/bin/env node
/**
 * Gera os MP3 da camada basal com o Google Cloud Text-to-Speech, sobe para o
 * bucket `audio` do Storage e grava a URL na linha correspondente.
 *
 * Uso:
 *   GOOGLE_TTS_API_KEY=...  \
 *   SUPABASE_URL=...        \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   node supabase/audio/gerar.mjs [--so=letras,numeros,palavras,frases,opcoes] [--refazer]
 *
 * Roda com service_role de propósito: é trabalho em lote, fora do app, e
 * precisa escrever em conteúdo curado. Nunca embarque essa chave no cliente.
 *
 * NÃO gera áudio de exercício. O áudio de um exercício pode entregar a
 * resposta — numa tradução PT→HR, ouvir a palavra em croata é o gabarito.
 * Onde o áudio for o enunciado (HR→PT), quem decide é a curadoria.
 */

const API_KEY = process.env.GOOGLE_TTS_API_KEY;
const URL = process.env.SUPABASE_URL;
const CHAVE = process.env.SUPABASE_SERVICE_ROLE_KEY;

// O croata NÃO tem vozes Standard, WaveNet nem Neural2 no Google — só a
// família Chirp3-HD, que é a premium. Usar um nome de voz Standard aqui
// devolve erro da API. São 30 opções; esta é feminina.
// Lista: https://cloud.google.com/text-to-speech/docs/list-voices-and-types
const VOZ = process.env.VOZ_HR ?? 'hr-HR-Chirp3-HD-Achernar';
// Chirp3-HD aceita de 0.25 a 2.0. Um pouco lento porque é material de
// estudo: iniciante perde sílaba em ritmo de conversa.
const VELOCIDADE = Number(process.env.VELOCIDADE ?? 0.9);

if (!API_KEY || !URL || !CHAVE) {
  console.error(
    'Faltam variáveis: GOOGLE_TTS_API_KEY, SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.',
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const refazer = args.includes('--refazer');
const filtro = args.find((a) => a.startsWith('--so='))?.slice(5).split(',');

/** Cada alvo diz de onde ler, o que falar e onde guardar. */
const ALVOS = [
  {
    nome: 'letras',
    tabela: 'letras',
    colunas: 'id, letra, exemplo_hr, audio_url',
    // A letra sozinha ensina pouco: o que fixa o som é a palavra de exemplo.
    texto: (r) => r.exemplo_hr ?? r.letra,
  },
  { nome: 'numeros', tabela: 'numeros', colunas: 'id, hr, audio_url', texto: (r) => r.hr },
  { nome: 'palavras', tabela: 'lex_items', colunas: 'id, hr, audio_url', texto: (r) => r.hr },
  { nome: 'frases', tabela: 'frases', colunas: 'id, hr, audio_url', texto: (r) => r.hr },
];

/**
 * Opções de exercício são formas flexionadas — "kavu", "školi", "ženom" —
 * que não existem como verbete, então vão para audio_hr, indexado por texto.
 *
 * Só entram as de exercícios marcados com `falar_opcoes` na curadoria.
 * Metade das opções do app é português ("para onde?", "Nominativ") e
 * algumas perguntas são sobre o som — nelas, ouvir É a resposta.
 */
async function processarOpcoes() {
  const resposta = await fetch(
    `${URL}/rest/v1/exercicios?select=dados&tipo=eq.escolher_forma`,
    { headers: cabecalhos },
  );
  const linhas = await resposta.json();

  const textos = new Set();
  for (const { dados } of linhas) {
    if (!dados?.falar_opcoes) continue;
    for (const opcao of dados.opcoes ?? []) textos.add(opcao);
  }

  const jaTem = new Set(
    await fetch(`${URL}/rest/v1/audio_hr?select=texto`, { headers: cabecalhos })
      .then((r) => r.json())
      .then((linhas) => linhas.map((l) => l.texto)),
  );

  let feitos = 0;
  let pulados = 0;

  for (const texto of textos) {
    if (jaTem.has(texto) && !refazer) {
      pulados++;
      continue;
    }
    const mp3 = await sintetizar(texto);
    // Nome do arquivo a partir do texto, sem acento e sem espaço, para o
    // objeto no Storage ser inspecionável em vez de um uuid opaco.
    const arquivo = texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    const url = await subir(`opcoes/${arquivo}.mp3`, mp3);

    const upsert = await fetch(`${URL}/rest/v1/audio_hr?on_conflict=texto`, {
      method: 'POST',
      headers: {
        ...cabecalhos,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ texto, audio_url: url }),
    });
    if (!upsert.ok) throw new Error(`audio_hr ${upsert.status}: ${await upsert.text()}`);

    feitos++;
    process.stdout.write(`\r  opcoes: ${feitos} gerados`);
  }
  console.log(`\r  opcoes: ${feitos} gerados, ${pulados} já tinham áudio.        `);
}

const cabecalhos = { apikey: CHAVE, Authorization: `Bearer ${CHAVE}` };

async function sintetizar(texto) {
  const resposta = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: texto },
        voice: { languageCode: 'hr-HR', name: VOZ },
        audioConfig: { audioEncoding: 'MP3', speakingRate: VELOCIDADE },
      }),
    },
  );
  if (!resposta.ok) {
    throw new Error(`TTS ${resposta.status}: ${await resposta.text()}`);
  }
  const { audioContent } = await resposta.json();
  return Buffer.from(audioContent, 'base64');
}

async function subir(caminho, mp3) {
  const resposta = await fetch(`${URL}/storage/v1/object/audio/${caminho}`, {
    method: 'POST',
    headers: { ...cabecalhos, 'Content-Type': 'audio/mpeg', 'x-upsert': 'true' },
    body: mp3,
  });
  if (!resposta.ok) {
    throw new Error(`Upload ${resposta.status}: ${await resposta.text()}`);
  }
  return `${URL}/storage/v1/object/public/audio/${caminho}`;
}

async function processar(alvo) {
  const resposta = await fetch(
    `${URL}/rest/v1/${alvo.tabela}?select=${encodeURIComponent(alvo.colunas)}`,
    { headers: cabecalhos },
  );
  const linhas = await resposta.json();

  let feitos = 0;
  let pulados = 0;

  for (const linha of linhas) {
    if (linha.audio_url && !refazer) {
      pulados++;
      continue;
    }
    const texto = alvo.texto(linha);
    if (!texto) continue;

    const mp3 = await sintetizar(texto);
    const url = await subir(`${alvo.nome}/${linha.id}.mp3`, mp3);

    const upd = await fetch(`${URL}/rest/v1/${alvo.tabela}?id=eq.${linha.id}`, {
      method: 'PATCH',
      headers: { ...cabecalhos, 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio_url: url }),
    });
    if (!upd.ok) throw new Error(`PATCH ${upd.status}: ${await upd.text()}`);

    feitos++;
    process.stdout.write(`\r  ${alvo.nome}: ${feitos} gerados`);
  }
  console.log(
    `\r  ${alvo.nome}: ${feitos} gerados, ${pulados} já tinham áudio.        `,
  );
}

for (const alvo of ALVOS) {
  if (filtro && !filtro.includes(alvo.nome)) continue;
  await processar(alvo);
}
if (!filtro || filtro.includes('opcoes')) await processarOpcoes();
console.log('\nPronto. O app passa a mostrar o botão de ouvir sozinho.');
