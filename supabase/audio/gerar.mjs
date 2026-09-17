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

import { recortar } from './mp3.mjs';
import { DECODIFICADOR, fronteira, medir, temSom } from './som.mjs';

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

/** Quantas vezes tentar de novo quando a faixa sai fora da régua. */
const TENTATIVAS = 3;

/** Itens que passaram das tentativas e foram subidos mesmo assim. */
const suspeitos = [];

/**
 * DURAÇÃO NÃO VÊ SILÊNCIO.
 *
 * O MP3 é de bitrate constante: 0,31s de nada pesa exatamente o mesmo que
 * 0,31s de fala. Foi assim que quatro faixas mudas — "a", "e", "o", "od" —
 * passaram pela régua de duração e foram para o ar. Palavra curta é onde a
 * Chirp3-HD mais colapsa, e é justamente onde a régua é mais frouxa.
 *
 * Quem olha dentro do arquivo é o `som.mjs`, que decodifica com o afconvert
 * do macOS ou com o ffmpeg. Sem nenhum dos dois o script AVISA e segue só
 * com a duração — o que não pode é ficar quieto e a gente descobrir pelo
 * aluno.
 */
if (!DECODIFICADOR) {
  console.warn(
    '\n⚠ Sem afconvert nem ffmpeg: NÃO dá para conferir se a faixa tem som.\n' +
      '  A régua de duração não pega silêncio — um MP3 mudo pesa o mesmo que\n' +
      '  um falado. Ouça tudo o que esta rodada gerar, ou instale o ffmpeg.\n',
  );
}

/** Mede o som, ou devolve null quando não há decodificador na máquina. */
function medirSom(mp3) {
  if (!DECODIFICADOR) return null;
  try {
    return medir(mp3);
  } catch (erro) {
    console.warn(`\n  ⚠ não deu para decodificar e conferir o som: ${erro.message}`);
    return null;
  }
}

/** Itens subidos mesmo sem som audível, depois de esgotar as tentativas. */
const mudos = [];

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

  const existentes = await fetch(`${URL}/rest/v1/audio_hr?select=texto,audio_url`, {
    headers: cabecalhos,
  }).then((r) => r.json());

  const jaTem = new Set(existentes.map((l) => l.texto));
  // Nome do arquivo -> URL do que já está no ar. Dois textos diferentes podem
  // apontar para a mesma faixa, e é assim que se quer.
  const porArquivo = new Map(
    existentes.map((l) => [l.audio_url.slice(l.audio_url.lastIndexOf('/') + 1), l.audio_url]),
  );

  let feitos = 0;
  let pulados = 0;
  let herdados = 0;

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
    // Nome do arquivo a partir do texto, sem acento e sem espaço, para o
    // objeto no Storage ser inspecionável em vez de um uuid opaco. Perde a
    // pontuação de propósito: "Sretno", "sretno" e "Sretno!" são a mesma
    // palavra dita do mesmo jeito, e uma faixa só serve às três.
    const arquivo = texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();

    let url = porArquivo.get(`${arquivo}.mp3`);

    if (url && !refazer && !pedido) {
      // Outro texto já subiu esta MESMA faixa — "Bok," chegando depois de
      // "Bok!". Aponta para o arquivo que existe em vez de sintetizar por
      // cima: o upload usa x-upsert, e re-sortear aqui trocaria em silêncio
      // uma faixa que a curadoria já ouviu e aprovou.
      herdados++;
    } else {
      url = await subir(`${nome}/${arquivo}.mp3`, await sintetizarConferido(texto));
      porArquivo.set(`${arquivo}.mp3`, url);
      feitos++;
    }

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

    process.stdout.write(`\r  ${nome}: ${feitos} gerados`);
  }
  console.log(
    `\r  ${nome}: ${feitos} gerados, ${pulados} já tinham áudio` +
      (herdados ? `, ${herdados} herdaram a faixa de um texto igual` : '') +
      '.        ',
  );
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
 * Um respiro antes do ataque, porque o corte cai na fronteira do quadro de
 * MP3 (24 ms) e decepar o começo de uma vogal é audível.
 */
const PRE_ATAQUE = 0.04;

/** Pico mínimo que um recorte precisa ter para subir. */
const PICO_MINIMO_DO_RECORTE = 0.27;

/**
 * Sintetiza a frase-portadora e sobe só o alvo.
 *
 * A voz não fonatiza texto curtíssimo: "a", "e", "o", "u", "od" e "do" saem
 * com a duração certa e SILÊNCIO dentro. Testado de 0,9 a 0,25 de
 * velocidade — o arquivo cresce e o silêncio cresce junto, então alongar não
 * resolve. O que resolve é dar mais texto em volta: "Slovo a." sai falado
 * sempre.
 *
 * Só que o aluno não pode ouvir "slovo". Então: sintetiza a frase inteira,
 * acha o vale de energia entre o portador e o alvo, e descarta os quadros de
 * MP3 anteriores a ele. O que sobe tem só o "a", com os mesmos bytes que o
 * sintetizador produziu — nada é recodificado.
 *
 * Reprova e sorteia de novo quando não há vale: aí o portador e o alvo
 * saíram grudados, e cortar seria chutar no meio da palavra.
 */
async function comPortador(texto, falado) {
  if (!DECODIFICADOR) {
    throw new Error(
      `"${texto}" precisa de portador recortado, e não há afconvert nem ` +
        'ffmpeg para achar onde cortar. Instale o ffmpeg.',
    );
  }

  const falhas = [];
  // Mais folga que o normal: aqui cada tentativa pode falhar por dois
  // motivos independentes, e sortear de novo é barato.
  for (let i = 1; i <= TENTATIVAS * 2; i++) {
    const inteiro = await sintetizar(falado);
    const corte = fronteira(inteiro);
    if (corte === null) {
      falhas.push('portador grudado no alvo');
      continue;
    }

    const mp3 = recortar(inteiro, Math.max(0, corte - PRE_ATAQUE), Infinity);
    const som = medir(mp3);
    // Barra mais alta que a do `temSom`: aqui sortear de novo é barato, e as
    // faixas boas da biblioteca vivem entre 0,27 e 1,00 de pico. Aceitar
    // 0,21 deixaria a vogal recortada mais baixa que as palavras ao lado
    // dela na mesma lição, e o aluno ouviria o remendo.
    if (som.pico < PICO_MINIMO_DO_RECORTE || !temSom(som)) {
      falhas.push(`recorte saiu fraco (pico ${som.pico.toFixed(3)})`);
      continue;
    }

    // O que sobrou tem que ter a cara do ALVO, não do alvo mais um pedaço de
    // portador — nem de um pedaço do alvo.
    //
    // Contar blocos de voz não serve: "pet" tem a oclusiva do /t/ no meio e
    // sai legitimamente em dois blocos. Quem separa é a duração contra a
    // janela da palavra exibida — com piso folgado, porque recorte não tem o
    // embalo nem a cauda que a síntese inteira tem.
    const { min, max } = faixaEsperada(texto);
    if (som.segundos < min * 0.6 || som.segundos > max) {
      falhas.push(
        `recorte de ${som.segundos.toFixed(2)}s, fora de ` +
          `${(min * 0.6).toFixed(2)}–${max.toFixed(2)}s`,
      );
      continue;
    }

    return mp3;
  }

  mudos.push({ texto, falado, pico: 0, fracao: 0, portador: true, falhas });
  throw new Error(
    `"${texto}" não rendeu recorte limpo de ${JSON.stringify(falado)} em ` +
      `${TENTATIVAS * 2} tentativas: ${falhas.join('; ')}`,
  );
}

/**
 * Sintetiza conferindo a duração E o som, e tenta de novo quando sai fora.
 *
 * A `Chirp3-HD` é generativa: ela não monta a palavra de pedaços gravados,
 * ela *gera* a fala, e de vez em quando colapsa ou alucina. Como cada
 * chamada é independente, repetir costuma resolver — o que não dá é subir o
 * defeito sem olhar, que foi como sete faixas quebradas e quatro mudas foram
 * parar no ar.
 *
 * Passadas as tentativas, sobe a menos absurda e anota na lista de
 * suspeitos: melhor um som ruim com aviso do que um item mudo, e o que a
 * régua não pega (sotaque errado com duração normal) só o ouvido resolve.
 */
async function sintetizarConferido(texto) {
  // A curadoria pode mandar falar uma coisa e mostrar outra. Ver
  // `audio_ajustes`: ou troca a palavra, ou dá um portador para recortar.
  const ajuste = ajustes.get(texto);
  const falado = ajuste?.falado ?? texto;

  if (ajuste?.cortar) return comPortador(texto, falado);

  // A régua mede o que vai ser DITO, não o que vai ser mostrado.
  const { min, max } = faixaEsperada(falado);
  const tentativas = [];

  for (let i = 1; i <= TENTATIVAS; i++) {
    const mp3 = await sintetizar(falado);
    const segundos = mp3.length / BYTES_POR_SEGUNDO;
    const som = medirSom(mp3);
    const duracaoOk = segundos >= min && segundos <= max;

    if (duracaoOk && temSom(som)) return mp3;

    tentativas.push({ mp3, segundos, som });
    const motivo = !duracaoOk
      ? `${segundos.toFixed(2)}s, fora de ${min.toFixed(2)}–${max.toFixed(2)}s`
      : `sem som — pico ${som.pico.toFixed(3)}, ` +
        `${(som.fracao * 100).toFixed(0)}% audível`;
    console.warn(`\n  ⚠ "${texto}": ${motivo} (tentativa ${i}/${TENTATIVAS})`);
  }

  // Sobe a menos absurda e anota. Um item REALMENTE mudo vai para uma lista
  // à parte, porque aí não é questão de gosto: não saiu voz nenhuma, e a
  // saída é um `audio_ajustes` com portador.
  const comSom = tentativas.filter((t) => temSom(t.som));
  const candidatos = comSom.length ? comSom : tentativas;
  const centro = (min + max) / 2;
  candidatos.sort(
    (a, b) => Math.abs(a.segundos - centro) - Math.abs(b.segundos - centro),
  );
  const escolhida = candidatos[0];

  if (!comSom.length && escolhida.som) {
    mudos.push({ texto, falado, pico: escolhida.som.pico, fracao: escolhida.som.fracao });
  } else {
    suspeitos.push({ texto, segundos: escolhida.segundos, min, max });
  }
  return escolhida.mp3;
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
  await fetch(
    `${URL}/rest/v1/audio_ajustes?select=texto,texto_falado,cortar_portador`,
    { headers: cabecalhos },
  )
    .then((r) => (r.ok ? r.json() : []))
    .then((linhas) =>
      linhas.map((l) => [
        l.texto,
        { falado: l.texto_falado, cortar: l.cortar_portador ?? false },
      ]),
    ),
);
if (ajustes.size) {
  const cortados = [...ajustes.values()].filter((a) => a.cortar).length;
  console.log(
    `Ajustes de pronúncia carregados: ${ajustes.size}` +
      (cortados ? `, ${cortados} com portador recortado` : '') +
      '.',
  );
}

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

if (mudos.length) {
  console.log(
    `\n🔇 ${mudos.length} SUBIRAM MUDOS. A voz não disse nada, nas ` +
      `${TENTATIVAS} tentativas — repetir não resolve, porque o problema é ` +
      'o texto ser curto demais para ela.\n' +
      '   A saída é dar um portador em `audio_ajustes` (texto, texto_falado):\n' +
      "   uma letra vira 'Slovo a.', uma preposição vira 'od, od.'.\n",
  );
  for (const m of mudos) {
    const dito = m.falado === m.texto ? '' : ` (falando "${m.falado}")`;
    console.log(
      `   "${m.texto}"${dito}  pico ${m.pico.toFixed(3)}, ` +
        `${(m.fracao * 100).toFixed(0)}% audível`,
    );
  }
  process.exitCode = 1;
}

console.log('\nPronto. O app passa a mostrar o botão de ouvir sozinho.');
