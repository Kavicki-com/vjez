#!/usr/bin/env node
/**
 * Ouve a biblioteca inteira no lugar de você, e diz o que está mudo.
 *
 * Uso:
 *   SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=...  node supabase/audio/conferir.mjs
 *
 * O `gerar.mjs` confere cada faixa no instante em que a cria, mas isso só
 * vale para o que foi gerado DEPOIS de a conferência existir. Tudo o que
 * subiu antes nunca foi ouvido por ninguém — foi assim que cinco faixas
 * mudas ficaram semanas no ar, inclusive a palavra de exemplo da letra P.
 *
 * Rode depois de cada leva de conteúdo, e sempre que trocar de voz.
 * Sai com código 1 se achar faixa muda, para travar num pipeline.
 */
import { DECODIFICADOR, medir } from './som.mjs';

const URL = process.env.SUPABASE_URL;
const CHAVE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !CHAVE) {
  console.error('Faltam SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}
if (!DECODIFICADOR) {
  console.error(
    'Sem afconvert nem ffmpeg: não dá para decodificar e conferir nada.\n' +
      'No macOS o afconvert já vem instalado; fora dele, instale o ffmpeg.',
  );
  process.exit(1);
}

/** Abaixo disto está mudo; abaixo do segundo, baixo demais. */
const MUDA = 0.05;
const FRACA = 0.25;

const cabecalhos = { apikey: CHAVE, Authorization: `Bearer ${CHAVE}` };
const pega = (caminho) =>
  fetch(`${URL}/rest/v1/${caminho}`, { headers: cabecalhos }).then((r) => r.json());

const [letras, numeros, lex, frases, porTexto] = await Promise.all([
  pega('letras?select=letra,exemplo_hr,audio_url&limit=500'),
  pega('numeros?select=valor,hr,audio_url&limit=500'),
  pega('lex_items?select=hr,audio_url&limit=2000'),
  pega('frases?select=hr,audio_url&limit=2000'),
  pega('audio_hr?select=texto,audio_url&limit=2000'),
]);

const alvos = [
  ...letras.map((r) => ({ onde: 'alfabeto', chave: r.letra, diz: r.exemplo_hr ?? r.letra, url: r.audio_url })),
  ...numeros.map((r) => ({ onde: 'números', chave: String(r.valor), diz: r.hr, url: r.audio_url })),
  ...lex.map((r) => ({ onde: 'dicionário', chave: r.hr, diz: r.hr, url: r.audio_url })),
  ...frases.map((r) => ({ onde: 'expressões', chave: r.hr, diz: r.hr, url: r.audio_url })),
  ...porTexto.map((r) => ({ onde: 'audio_hr', chave: r.texto, diz: r.texto, url: r.audio_url })),
].filter((a) => a.url);

console.log(`Conferindo ${alvos.length} faixas…`);

const medidas = [];
let feitas = 0;

// Dez por vez: o Storage estrangula centenas de pedidos simultâneos, e
// decodificar é trabalho de CPU que não ganha nada com mais paralelismo.
for (let i = 0; i < alvos.length; i += 10) {
  const lote = alvos.slice(i, i + 10);
  const baixados = await Promise.all(
    lote.map((a) => fetch(a.url).then((r) => (r.ok ? r.arrayBuffer() : null))),
  );
  lote.forEach((a, k) => {
    feitas++;
    if (!baixados[k]) {
      medidas.push({ ...a, erro: 'não baixou' });
      return;
    }
    try {
      medidas.push({ ...a, ...medir(Buffer.from(baixados[k])) });
    } catch (erro) {
      medidas.push({ ...a, erro: erro.message });
    }
  });
  process.stdout.write(`\r  ${feitas}/${alvos.length}`);
}

const linha = (m) =>
  `   ${m.onde.padEnd(11)} "${m.chave}"` +
  (m.diz !== m.chave ? ` (fala "${m.diz}")` : '') +
  `  pico ${m.pico.toFixed(3)}  ${(m.fracao * 100).toFixed(0)}% audível  ` +
  `${m.segundos.toFixed(2)}s`;

const mudas = medidas.filter((m) => m.pico !== undefined && m.pico < MUDA);
const fracas = medidas.filter((m) => m.pico !== undefined && m.pico >= MUDA && m.pico < FRACA);
const erros = medidas.filter((m) => m.erro);

console.log(`\r${medidas.length} medidas.                    \n`);

if (mudas.length) {
  console.log(`🔇 ${mudas.length} MUDAS — a voz não disse nada:`);
  for (const m of mudas.sort((a, b) => a.pico - b.pico)) console.log(linha(m));
  console.log(
    '\n   Conserto: uma linha em `audio_ajustes` com portador e ' +
      '`cortar_portador`.\n   Ver o seed 016 para os portadores que funcionam.\n',
  );
} else {
  console.log('🔊 Nenhuma faixa muda.');
}

if (fracas.length) {
  console.log(`\n⚠ ${fracas.length} fracas (pico < ${FRACA}) — ouça e decida:`);
  for (const m of fracas.sort((a, b) => a.pico - b.pico)) console.log(linha(m));
}

if (erros.length) {
  console.log(`\n✗ ${erros.length} não deram para medir:`);
  for (const e of erros) console.log(`   ${e.onde} "${e.chave}": ${e.erro}`);
}

if (mudas.length || erros.length) process.exitCode = 1;
