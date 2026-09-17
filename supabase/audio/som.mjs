/**
 * O que há DENTRO do MP3 — porque o tamanho do arquivo não conta essa
 * história.
 *
 * O MP3 do Google é de bitrate constante: 0,31s de silêncio pesa exatamente
 * o mesmo que 0,31s de fala. Foi assim que quatro faixas mudas passaram pela
 * régua de duração do gerador e foram para o ar. Para saber se saiu voz é
 * preciso decodificar.
 *
 * Sem dependência nova: o `afconvert` vem com o macOS e o `ffmpeg` serve se
 * estiver instalado. Não havendo nenhum dos dois, quem chama decide — e o
 * gerador avisa alto em vez de ficar quieto.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** Quadro de 20 ms acima disto conta como som. −45 dBFS. */
const PISO = 10 ** (-45 / 20);
/** Resolução da análise. */
const JANELA = 0.01;

export const DECODIFICADOR = (() => {
  for (const cmd of ['afconvert', 'ffmpeg']) {
    try {
      execFileSync('which', [cmd], { stdio: 'ignore' });
      return cmd;
    } catch {
      /* não instalado; tenta o próximo */
    }
  }
  return null;
})();

function argumentos(cmd, entrada, saida) {
  return cmd === 'afconvert'
    ? ['-f', 'WAVE', '-d', 'LEI16@44100', entrada, saida]
    : ['-v', 'quiet', '-y', '-i', entrada, '-ac', '1', '-ar', '44100', saida];
}

/** Decodifica para PCM e devolve as amostras em −1..1. */
function amostras(mp3) {
  const base = join(
    tmpdir(),
    `vjez-som-${process.pid}-${Math.random().toString(36).slice(2)}`,
  );
  try {
    writeFileSync(`${base}.mp3`, mp3);
    execFileSync(DECODIFICADOR, argumentos(DECODIFICADOR, `${base}.mp3`, `${base}.wav`), {
      stdio: 'ignore',
    });
    const wav = readFileSync(`${base}.wav`);

    // Acha o bloco `data`: o cabeçalho WAV não tem tamanho fixo.
    let p = 12;
    while (p < wav.length - 8 && wav.toString('ascii', p, p + 4) !== 'data') {
      p += 8 + wav.readUInt32LE(p + 4);
    }
    const inicio = p + 8;
    const canais = wav.readUInt16LE(22) || 1;
    const hz = wav.readUInt32LE(24) || 44100;
    const total = Math.floor((wav.length - inicio) / 2 / canais);

    const v = new Float32Array(total);
    for (let i = 0; i < total; i++) v[i] = wav.readInt16LE(inicio + i * canais * 2) / 32768;
    return { v, hz };
  } finally {
    for (const ext of ['.mp3', '.wav']) rmSync(`${base}${ext}`, { force: true });
  }
}

/** Energia por janela de 10 ms. */
function energia(v, hz) {
  const q = Math.round(hz * JANELA);
  const saida = [];
  for (let i = 0; i < v.length; i += q) {
    let sq = 0;
    let c = 0;
    for (let j = i; j < Math.min(i + q, v.length); j++) {
      sq += v[j] * v[j];
      c++;
    }
    saida.push(Math.sqrt(sq / c));
  }
  return saida;
}

/**
 * Pico e fração audível — a medida grossa, de aprovar ou reprovar.
 *
 * Calibrada na biblioteca que está no ar: as faixas boas têm pico acima de
 * 0,27 e pelo menos 31% das janelas com som; as mudas tinham pico abaixo de
 * 0,022 e ZERO janelas audíveis. Não é linha tênue, é abismo — qualquer
 * corte no meio separa os dois grupos.
 */
export function medir(mp3) {
  const { v, hz } = amostras(mp3);
  const e = energia(v, hz);
  let pico = 0;
  for (let i = 0; i < v.length; i++) if (Math.abs(v[i]) > pico) pico = Math.abs(v[i]);
  const audiveis = e.filter((x) => x > PISO).length;
  return { pico, fracao: e.length ? audiveis / e.length : 0, segundos: v.length / hz };
}

/** Veio som de verdade? Sem decodificador, dá o benefício da dúvida. */
export function temSom(medida) {
  return medida === null || (medida.pico >= 0.15 && medida.fracao >= 0.2);
}

/**
 * Onde o portador acaba e o alvo começa, em segundos.
 *
 * Não procura silêncio absoluto: procura o VALE — o ponto em que a energia
 * despenca em relação ao resto da fala. Limiar fixo em dBFS falha porque a
 * pausa entre "Slovo" e "a" nem sempre é silêncio de verdade; às vezes é só
 * um buraco 20 dB abaixo do que veio antes, e dura 60 ms.
 *
 * Devolve null quando não há vale nenhum: aí o portador e o alvo saíram
 * grudados, e a saída é sortear outra síntese, não cortar no chute.
 */
export function fronteira(mp3) {
  const { v, hz } = amostras(mp3);
  const e = energia(v, hz);
  const duracao = v.length / hz;

  const falantes = e.filter((x) => x > PISO).sort((a, b) => a - b);
  if (!falantes.length) return null;
  const tipico = falantes[Math.floor(falantes.length / 2)];
  const fundo = tipico / 8; // −18 dB abaixo da fala típica: isto é vale

  // Só procura na parte de trás: vale dentro do portador não interessa.
  const de = Math.floor((duracao * 0.25) / JANELA);
  const ate = Math.floor((duracao - 0.1) / JANELA);

  const vales = [];
  let inicio = null;
  for (let i = de; i < Math.min(ate, e.length); i++) {
    if (e[i] < fundo && inicio === null) inicio = i;
    if (e[i] >= fundo && inicio !== null) {
      vales.push({ de: inicio * JANELA, ate: i * JANELA });
      inicio = null;
    }
  }

  const bons = vales.filter((t) => t.ate - t.de >= 0.03);
  if (!bons.length) return null;

  const ultimo = bons[bons.length - 1];
  // Sobrou fala suficiente depois do vale para o corte valer a pena?
  if (duracao - ultimo.ate < 0.12) return null;
  return ultimo.ate;
}

/** Quantos blocos de voz há no arquivo. Um corte limpo tem exatamente um. */
export function blocosDeVoz(mp3) {
  const { v, hz } = amostras(mp3);
  const e = energia(v, hz);
  let blocos = 0;
  let dentro = false;
  let silencio = 0;
  for (const x of e) {
    if (x > PISO) {
      if (!dentro) blocos++;
      dentro = true;
      silencio = 0;
    } else if (dentro && ++silencio * JANELA >= 0.06) {
      dentro = false;
    }
  }
  return blocos;
}
