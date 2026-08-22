#!/usr/bin/env node
/**
 * Gera os dois sons de resposta do exercício: acerto e erro.
 *
 * Por que um script e não dois arquivos baixados: som de interface é
 * decisão de design, e decisão de design tem que ser legível e refazível.
 * Aqui dá para ler as notas, mudar o volume e rodar de novo — um .wav
 * binário no repo seria uma caixa-preta que ninguém ousa tocar.
 *
 * WAV e não MP3: codificar MP3 exigiria dependência nativa, e são 20 KB
 * cada. Metro já trata .wav como asset.
 *
 * Uso: node scripts/gerar-sons.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const DESTINO = join(AQUI, '..', 'assets', 'sons');

const TAXA = 44100;

/**
 * Uma nota com envelope.
 *
 * O ataque de 6 ms existe para não estalar: começar uma senoide em
 * amplitude cheia é um degrau, e degrau no alto-falante é clique. A cauda
 * cai por exponencial, que é como corpo físico soa — decaimento linear
 * soa sintético.
 */
function nota({ hz, segundos, volume = 0.3, hzFinal = hz, brilho = 0.25 }) {
  const total = Math.round(TAXA * segundos);
  const ataque = Math.round(TAXA * 0.006);
  const amostras = new Float32Array(total);
  let fase = 0;

  for (let i = 0; i < total; i++) {
    const t = i / total;
    // Glissando linear entre hz e hzFinal.
    const f = hz + (hzFinal - hz) * t;
    fase += (2 * Math.PI * f) / TAXA;

    const subida = i < ataque ? i / ataque : 1;
    const queda = Math.exp(-3.2 * t);
    // O segundo harmônico dá corpo: senoide pura soa a teste de audiometria.
    const onda = Math.sin(fase) + brilho * Math.sin(2 * fase);

    amostras[i] = onda * subida * queda * volume;
  }
  return amostras;
}

/** Emenda trechos somando as sobreposições, para uma nota deixar cauda na outra. */
function sequencia(trechos) {
  const fim = Math.max(...trechos.map((t) => t.inicio + t.amostras.length));
  const saida = new Float32Array(fim);
  for (const { inicio, amostras } of trechos) {
    for (let i = 0; i < amostras.length; i++) saida[inicio + i] += amostras[i];
  }
  return saida;
}

function paraWav(amostras) {
  const dados = Buffer.alloc(amostras.length * 2);
  for (let i = 0; i < amostras.length; i++) {
    // Trava em -1..1 antes de escalar: soma de trechos pode estourar.
    const v = Math.max(-1, Math.min(1, amostras[i]));
    dados.writeInt16LE(Math.round(v * 32767), i * 2);
  }

  const cabecalho = Buffer.alloc(44);
  cabecalho.write('RIFF', 0);
  cabecalho.writeUInt32LE(36 + dados.length, 4);
  cabecalho.write('WAVE', 8);
  cabecalho.write('fmt ', 12);
  cabecalho.writeUInt32LE(16, 16); // tamanho do bloco fmt
  cabecalho.writeUInt16LE(1, 20); // PCM
  cabecalho.writeUInt16LE(1, 22); // mono
  cabecalho.writeUInt32LE(TAXA, 24);
  cabecalho.writeUInt32LE(TAXA * 2, 28); // bytes por segundo
  cabecalho.writeUInt16LE(2, 32); // alinhamento do bloco
  cabecalho.writeUInt16LE(16, 34); // bits por amostra
  cabecalho.write('data', 36);
  cabecalho.writeUInt32LE(dados.length, 40);

  return Buffer.concat([cabecalho, dados]);
}

const ms = (n) => Math.round((TAXA * n) / 1000);

/**
 * ACERTO — duas notas subindo, E5 e B5 (quinta justa).
 * Curto e alto, porque o acerto interrompe o aluno por meio segundo e
 * devolve ele ao exercício. Quinta em vez de terça: a terça soa doce
 * demais para repetir trinta vezes numa lição.
 */
const acerto = sequencia([
  { inicio: 0, amostras: nota({ hz: 659.25, segundos: 0.16, volume: 0.28 }) },
  { inicio: ms(85), amostras: nota({ hz: 987.77, segundos: 0.28, volume: 0.3 }) },
]);

/**
 * ERRO — uma nota grave só, escorregando para baixo.
 *
 * Deliberadamente manso. O CLAUDE.md diz que errar tira ponto e NÃO
 * bloqueia: o som tem que dizer "não foi essa", não "você falhou". Nada de
 * buzina, nada de dissonância — só peso, grave e curto, e o feedback
 * escrito na tela é quem ensina.
 */
const erro = sequencia([
  {
    inicio: 0,
    amostras: nota({
      hz: 233.08,
      hzFinal: 174.61,
      segundos: 0.3,
      volume: 0.26,
      brilho: 0.12,
    }),
  },
]);

mkdirSync(DESTINO, { recursive: true });
for (const [nome, amostras] of [
  ['acerto', acerto],
  ['erro', erro],
]) {
  const arquivo = join(DESTINO, `${nome}.wav`);
  const wav = paraWav(amostras);
  writeFileSync(arquivo, wav);
  console.log(`${nome}.wav — ${(wav.length / 1024).toFixed(1)} KB`);
}
