#!/usr/bin/env node
/**
 * Gera os MP3 da camada basal com o Google Cloud Text-to-Speech, sobe para o
 * bucket `audio` do Storage e grava a URL na linha correspondente.
 *
 * Uso:
 *   GOOGLE_TTS_API_KEY=...  \
 *   SUPABASE_URL=...        \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   node supabase/audio/gerar.mjs [--so=letras,numeros,palavras,frases,opcoes,padezi] [--refazer]
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

/**
 * `--texto=pas,put,trg` refaz só estes, em qualquer alvo.
 *
 * Existe porque a voz é generativa: cada chamada é um sorteio, e um
 * `--refazer` em `palavras` inteiro re-sortearia as 180 — consertando sete e
 * arriscando quebrar as que hoje estão boas. Conserto de som é cirúrgico.
 */
const alvoDeTexto = args.find((a) => a.startsWith('--texto='))
  ? new Set(
      args
        .find((a) => a.startsWith('--texto='))
        .slice(8)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    )
  : null;

/**
 * O MP3 do Google sai em 32 kbps constantes — 4000 bytes por segundo, medido
 * em toda a biblioteca já gerada. Então dá para saber a duração do áudio sem
 * ffmpeg, sem decodificar nada: é o tamanho do buffer dividido por isto.
 */
const BYTES_POR_SEGUNDO = 4000;

/** Quantas vezes tentar de novo quando a duração sai fora da faixa. */
const TENTATIVAS = 3;

/** Itens que passaram das tentativas e foram subidos mesmo assim. */
const suspeitos = [];

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
  const [resposta, verbetes] = await Promise.all([
    fetch(`${URL}/rest/v1/exercicios?select=tipo,dados`, { headers: cabecalhos }),
    fetch(`${URL}/rest/v1/lex_items?select=hr`, { headers: cabecalhos }).then(
      (r) => r.json(),
    ),
  ]);
  const linhas = await resposta.json();
  const doDicionario = new Set(verbetes.map((v) => v.hr.toLowerCase()));

  const textos = new Set();
  for (const { tipo, dados } of linhas) {
    if (!dados) continue;

    // Opções croatas: onde a curadoria marcou, e também onde a opção é
    // palavra de dicionário.
    //
    // A segunda regra existe porque a marcação tem falso negativo — há
    // exercício com ["kruh","konj","kava","kuća"] sem `falar_opcoes`, e são
    // quatro verbetes com áudio no dicionário. Já o que a regra NÃO pega
    // continua mudo por bom motivo: opção que é transcrição de som
    // ("k", "s", "tch") ou português ("para onde?") não é croata, e a voz
    // croata leria como lixo.
    if (tipo === 'escolher_forma') {
      for (const opcao of dados.opcoes ?? []) {
        if (dados.falar_opcoes || doDicionario.has(String(opcao).toLowerCase())) {
          textos.add(opcao);
        }
      }
    }

    // As fichas croatas de ligar pares: é onde a palavra mais aparece solta.
    if (tipo === 'ligar_pares') {
      for (const par of dados.pares ?? []) textos.add(par.hr);
    }

    // A RESPOSTA certa de cada template. O app só toca isso no feedback,
    // depois de o aluno responder — antes, seria o gabarito em voz alta.
    if (tipo === 'traducao') textos.add(dados.respostas_aceitas?.[0]);
    if (tipo === 'preencher_lacuna') textos.add(dados.resposta);
    if (tipo === 'montar_frase') textos.add(dados.alvo_hr);
  }
  await gerarPorTexto('opcoes', textos);
}

/**
 * Quadro dos casos (menu lateral → Padeži): a frase de exemplo de cada caso
 * e cada forma da grade de terminações.
 *
 * Vai para audio_hr, e não para uma coluna audio_url, pelo mesmo motivo das
 * opções: são formas flexionadas (gradu, ženama, poljem) que se repetem
 * entre a grade, os exercícios e o dicionário. Guardando por texto, a mesma
 * faixa serve aos três — e as células com duas formas ganham duas faixas,
 * uma por palavra, em vez de o TTS ler a barra.
 */
async function processarPadezi() {
  const [casos, celulas] = await Promise.all([
    fetch(`${URL}/rest/v1/padezi?select=exemplo_hr`, { headers: cabecalhos })
      .then((r) => r.json()),
    fetch(`${URL}/rest/v1/padez_terminacoes?select=exemplos_hr`, {
      headers: cabecalhos,
    }).then((r) => r.json()),
  ]);

  const textos = new Set();
  for (const linha of casos) textos.add(linha.exemplo_hr);
  for (const linha of celulas) {
    for (const forma of linha.exemplos_hr ?? []) textos.add(forma);
  }

  await gerarPorTexto('padezi', textos);
}

/** Sintetiza textos soltos e guarda em audio_hr, indexado pelo texto. */
async function gerarPorTexto(nome, textos) {
  textos.delete(undefined);
  textos.delete(null);

  const jaTem = new Set(
    await fetch(`${URL}/rest/v1/audio_hr?select=texto`, { headers: cabecalhos })
      .then((r) => r.json())
      .then((linhas) => linhas.map((l) => l.texto)),
  );

  let feitos = 0;
  let pulados = 0;

  for (const texto of textos) {
    const pedido = alvoDeTexto?.has(texto) ?? false;
    if (alvoDeTexto && !pedido) {
      pulados++;
      continue;
    }
    if (jaTem.has(texto) && !refazer && !pedido) {
      pulados++;
      continue;
    }
    const mp3 = await sintetizarConferido(texto);
    // Nome do arquivo a partir do texto, sem acento e sem espaço, para o
    // objeto no Storage ser inspecionável em vez de um uuid opaco.
    const arquivo = texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    const url = await subir(`${nome}/${arquivo}.mp3`, mp3);

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
    process.stdout.write(`\r  ${nome}: ${feitos} gerados`);
  }
  console.log(`\r  ${nome}: ${feitos} gerados, ${pulados} já tinham áudio.        `);
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

/**
 * Sílabas, a olho: cada grupo de vogais é uma.
 *
 * Croata tem `r` silábico — `trg`, `crn`, `vrt` não têm vogal nenhuma e
 * mesmo assim são palavras de uma sílaba. Por isso o `r` entra quando não
 * sobrou vogal.
 */
function silabas(texto) {
  const vogais = texto.toLowerCase().match(/[aeiouáéíóúàèìòù]+/g)?.length ?? 0;
  if (vogais > 0) return vogais;
  return texto.match(/r/gi)?.length || 1;
}

/**
 * Faixa de duração plausível para um texto.
 *
 * Calibrada na biblioteca que já está no ar: palavra de uma sílaba sai entre
 * 0,70s (`sin`, `kuća`) e 0,96s (`dan`). Fora disso não é sotaque, é defeito
 * — abaixo do mínimo o áudio veio truncado (`pas` saiu com 0,31s, metade do
 * necessário para dizer a palavra), acima do máximo veio sobra: palavra a
 * mais, ou a voz soletrando letra por letra (`trg`, 1,06s).
 */
function faixaEsperada(texto) {
  const s = silabas(texto);
  // Letra solta ("Đ") e partícula de duas letras ("ja", "ti") são curtas de
  // verdade — saem em 0,3s sem defeito nenhum. O piso de palavra acusaria
  // falso positivo nelas, então elas têm o seu.
  const min = texto.length <= 2 ? 0.24 : 0.62 + 0.05 * (s - 1);
  // O piso quase não cresce com a sílaba porque o custo fixo (ataque e queda
  // da voz) domina em palavra curta: `kuća`, com duas, sai em 0,70s — quase
  // o mesmo que `sin`, com uma.
  return { min, max: 0.98 + 0.42 * (s - 1) };
}

/**
 * Sintetiza conferindo a duração, e tenta de novo quando sai fora.
 *
 * A `Chirp3-HD` é generativa: ela não monta a palavra de pedaços gravados,
 * ela *gera* a fala, e de vez em quando colapsa ou alucina. Como cada
 * chamada é independente, repetir costuma resolver — o que não dá é subir o
 * defeito sem olhar, que foi como sete faixas quebradas foram parar no ar.
 *
 * Passadas as tentativas, sobe a menos absurda e anota na lista de
 * suspeitos: melhor um som ruim com aviso do que um item mudo, e o que a
 * régua não pega (sotaque errado com duração normal) só o ouvido resolve.
 */
async function sintetizarConferido(texto) {
  // A curadoria pode mandar falar uma coisa e mostrar outra: há palavra que
  // esta voz só diz inteira com um ponto no fim. Ver `audio_ajustes`.
  const falado = ajustes.get(texto) ?? texto;
  const { min, max } = faixaEsperada(texto);
  const tentativas = [];

  for (let i = 1; i <= TENTATIVAS; i++) {
    const mp3 = await sintetizar(falado);
    const segundos = mp3.length / BYTES_POR_SEGUNDO;
    if (segundos >= min && segundos <= max) return mp3;

    tentativas.push({ mp3, segundos });
    console.warn(
      `\n  ⚠ "${texto}": ${segundos.toFixed(2)}s, fora de ` +
        `${min.toFixed(2)}–${max.toFixed(2)}s (tentativa ${i}/${TENTATIVAS})`,
    );
  }

  const centro = (min + max) / 2;
  tentativas.sort(
    (a, b) => Math.abs(a.segundos - centro) - Math.abs(b.segundos - centro),
  );
  suspeitos.push({ texto, segundos: tentativas[0].segundos, min, max });
  return tentativas[0].mp3;
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
    const texto = alvo.texto(linha);
    if (!texto) continue;

    // O `--texto` manda mais que o `audio_url` já preenchido: quem pede um
    // item pelo nome está justamente querendo refazer o que existe.
    const pedido = alvoDeTexto?.has(texto) ?? false;
    if (alvoDeTexto && !pedido) {
      pulados++;
      continue;
    }
    if (linha.audio_url && !refazer && !pedido) {
      pulados++;
      continue;
    }

    const mp3 = await sintetizarConferido(texto);
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

/**
 * Ajustes de curadoria, carregados antes de qualquer chamada ao TTS:
 * texto exibido → texto falado.
 */
const ajustes = new Map(
  await fetch(`${URL}/rest/v1/audio_ajustes?select=texto,texto_falado`, {
    headers: cabecalhos,
  })
    .then((r) => (r.ok ? r.json() : []))
    .then((linhas) => linhas.map((l) => [l.texto, l.texto_falado])),
);
if (ajustes.size) console.log(`Ajustes de pronúncia carregados: ${ajustes.size}.`);

for (const alvo of ALVOS) {
  if (filtro && !filtro.includes(alvo.nome)) continue;
  await processar(alvo);
}
if (!filtro || filtro.includes('opcoes')) await processarOpcoes();
if (!filtro || filtro.includes('padezi')) await processarPadezi();
if (suspeitos.length) {
  console.log(`\n⚠ ${suspeitos.length} no ar mesmo fora da faixa — ouça estes:`);
  for (const s of suspeitos) {
    console.log(
      `   "${s.texto}"  ${s.segundos.toFixed(2)}s ` +
        `(esperado ${s.min.toFixed(2)}–${s.max.toFixed(2)}s)`,
    );
  }
}
console.log('\nPronto. O app passa a mostrar o botão de ouvir sozinho.');
