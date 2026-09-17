/**
 * Cirurgia de MP3 por quadro, sem recodificar.
 *
 * Um MP3 é uma fila de quadros, cada um com o seu cabeçalho e uma duração
 * fixa. Jogar fora os primeiros recorta o começo do áudio sem decodificar e
 * sem re-encodar: o que sobra continua sendo um MP3 válido, com exatamente
 * os mesmos bytes que o sintetizador produziu nos trechos que ficaram.
 *
 * É o que permite subir só o "a" de "Slovo a." sem perder uma geração de
 * qualidade nem trazer um encoder para dentro do projeto.
 *
 * O MP3 do Google sai em MPEG-2 Layer III a 24 kHz e 32 kbps: quadros de 96
 * bytes e 24 ms. O parser abaixo não assume isso — lê do cabeçalho — mas é
 * bom saber a ordem de grandeza: a menor fatia possível é 24 ms.
 */

const TAXAS_MPEG1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
const TAXAS_MPEG2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];
const AMOSTRAGENS = {
  3: [44100, 48000, 32000], // MPEG 1
  2: [22050, 24000, 16000], // MPEG 2
  0: [11025, 12000, 8000], // MPEG 2.5
};

/** A fila de quadros: onde cada um começa, quanto ocupa e quanto dura. */
export function quadros(buf) {
  let p = 0;
  // Pula o ID3v2, se houver: é metadado, não áudio.
  if (buf.length > 10 && buf.toString('ascii', 0, 3) === 'ID3') {
    p = 10 + ((buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9]);
  }

  const lista = [];
  while (p + 4 <= buf.length) {
    // Sincronia: 11 bits ligados.
    if (buf[p] !== 0xff || (buf[p + 1] & 0xe0) !== 0xe0) {
      p++;
      continue;
    }
    const versao = (buf[p + 1] >> 3) & 0x03; // 3 = MPEG1, 2 = MPEG2, 0 = 2.5
    const camada = (buf[p + 1] >> 1) & 0x03; // 1 = Layer III
    const iTaxa = (buf[p + 2] >> 4) & 0x0f;
    const iAmostragem = (buf[p + 2] >> 2) & 0x03;
    const padding = (buf[p + 2] >> 1) & 0x01;

    // 1 é versão reservada; 15 e 0 são bitrates inválidos; 3 é amostragem
    // reservada. Nada disso é quadro: era coincidência de bytes.
    if (camada !== 1 || versao === 1 || iTaxa === 0 || iTaxa === 15 || iAmostragem === 3) {
      p++;
      continue;
    }

    const kbps = (versao === 3 ? TAXAS_MPEG1 : TAXAS_MPEG2)[iTaxa];
    const hz = AMOSTRAGENS[versao][iAmostragem];
    const porQuadro = versao === 3 ? 1152 : 576;
    const tamanho = Math.floor(((versao === 3 ? 144 : 72) * kbps * 1000) / hz) + padding;

    if (tamanho < 4 || p + tamanho > buf.length) break;

    lista.push({ inicio: p, tamanho, segundos: porQuadro / hz });
    p += tamanho;
  }
  return lista;
}

/**
 * Recorta mantendo só os quadros que tocam o intervalo [de, ate] em segundos.
 *
 * O corte cai na fronteira do quadro mais próxima, nunca no meio: por isso a
 * precisão é de 24 ms, e por isso quem chama deixa uma folga antes do ataque.
 */
export function recortar(buf, de, ate) {
  const lista = quadros(buf);
  if (!lista.length) throw new Error('não achei quadro de MP3 nenhum');

  let t = 0;
  const dentro = [];
  for (const q of lista) {
    const fim = t + q.segundos;
    if (fim > de && t < ate) dentro.push(q);
    t = fim;
  }
  if (!dentro.length) throw new Error(`recorte ${de}–${ate}s não pegou quadro nenhum`);

  const ultimo = dentro[dentro.length - 1];
  return buf.subarray(dentro[0].inicio, ultimo.inicio + ultimo.tamanho);
}
