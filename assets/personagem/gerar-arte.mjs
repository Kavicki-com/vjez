/**
 * Figma → arte TSX.
 *
 * O personagem não é UM boneco que o código dobra: é um boneco por POSE,
 * montado pelo artista no Figma. O aceno tem um braço desenhado erguido, a
 * comemoração tem os dois e as pernas esticadas. Nada disso sai de rotação
 * inventada aqui — sai do desenho.
 *
 * A cabeça segue a mesma regra, num eixo só: o **rosto**. Virar de lado e
 * ficar bravo são a mesma operação — trocar o desenho da cabeça inteira. Por
 * isso não existe "vista" separada de "expressão": existe `rosto`, e
 * `sideways` e `bravo` são dois valores dele.
 *
 *   node assets/personagem/gerar-arte.mjs <nome=arquivo.svg>...
 *
 * Três formas de argumento, pelo que o arquivo contém:
 *
 *   folha=…     uma prancha de peças soltas. Todo grupo que não for junta de
 *               montado entra como rosto. Node 1:181.
 *   rosto=…     UM rosto só, exportado do próprio frame: a raiz do SVG já é
 *               ele. O nome sai do id do grupo, em minúsculas — então
 *               `rosto=triste.svg` traz o grupo `Triste` como `triste`.
 *   <pose>=…    um boneco montado. O PRIMEIRO é a REFERÊNCIA: é o chão e o
 *               eixo a que os outros se alinham.
 *
 * Hoje: `parado` (node 10:235), `acena` (16:356, "waving-zef"), `comemora`
 * (17:2, "celebrating-zef"); a folha 1:181; e os rostos 20:71 a 20:139.
 *
 * Os caminhos saem INTACTOS de todos. Cada peça vira um `<Svg>` cujo viewBox
 * é a caixa dela na SUA fonte, e a montagem diz onde ela se assenta no palco.
 * Assim nenhuma coordenada de desenho é reescrita.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SAIDA = resolve(RAIZ, 'src/components/kuna/arte.tsx');

/** A peça `front` de um montado é a junta `cabeca` — ela troca de rosto. */
const JUNTA_DA_PECA = { front: 'cabeca' };

const USO =
  'uso: node assets/personagem/gerar-arte.mjs <nome=arquivo.svg>...\n' +
  '     nome é `folha`, `rosto`, `peca`, ou o nome de uma pose (a primeira é a referência)';

const argumentos = process.argv.slice(2).map((a) => {
  const corte = a.indexOf('=');
  if (corte < 1) {
    console.error(USO);
    process.exit(1);
  }
  return { nome: a.slice(0, corte), caminho: a.slice(corte + 1) };
});

const AVULSOS = new Set(['folha', 'rosto', 'peca']);
const folhas = argumentos.filter((a) => a.nome === 'folha');
const rostosAvulsos = argumentos.filter((a) => a.nome === 'rosto');
const pecasAvulsas = argumentos.filter((a) => a.nome === 'peca');
const origensDosMontados = argumentos.filter((a) => !AVULSOS.has(a.nome));

if (!origensDosMontados.length) {
  console.error(USO);
  process.exit(1);
}

// ---------------------------------------------------------------- recorte

/** Os `<g id="…">` de primeiro nível dentro de um trecho. */
function fatiar(texto) {
  const fora = [];
  const abre = /<g id="([^"]+)">/g;
  let m;
  while ((m = abre.exec(texto))) {
    const nome = m[1];
    const inicio = abre.lastIndex;
    const passo = /<g\b|<\/g>/g;
    passo.lastIndex = inicio;
    let profundidade = 1;
    let n;
    while (profundidade && (n = passo.exec(texto))) {
      profundidade += n[0] === '</g>' ? -1 : 1;
    }
    if (profundidade) throw new Error(`<g id="${nome}"> não fecha.`);
    fora.push({ nome, dentro: texto.slice(inicio, passo.lastIndex - 4) });
    abre.lastIndex = passo.lastIndex;
  }
  return fora;
}

/**
 * A moldura de um arquivo: o único grupo de primeiro nível. Procurar por
 * nome não dá — ele muda a cada export (`zef`, `waving-zef`, `Triste`).
 */
function molduraDe(caminho) {
  const raizes = fatiar(readFileSync(resolve(caminho), 'utf8'));
  if (raizes.length !== 1) {
    throw new Error(`${caminho}: esperava uma moldura só, achei ${raizes.length}.`);
  }
  return raizes[0];
}

/** As peças de uma prancha ou de um montado: os grupos dentro da moldura. */
function pecasDe(caminho) {
  const moldura = molduraDe(caminho);
  const pecas = fatiar(moldura.dentro);
  if (!pecas.length) throw new Error(`${caminho}: a moldura "${moldura.nome}" está vazia.`);
  return pecas;
}

/**
 * Nome de peça a partir do id da camada do Figma. Os rostos vieram
 * batizados em português e com maiúscula — `Triste`, `Sonolento` —, e o
 * resto do desenho é minúsculo. Normaliza em vez de pedir renomeação: o
 * artista não deve ter de lembrar da convenção do código.
 */
function normalizar(id) {
  const nome = id
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
  if (!/^[a-z0-9-]+$/.test(nome)) throw new Error(`nome de camada inválido: "${id}".`);
  return nome;
}

// ----------------------------------------------------------------- caminho

/**
 * Um caminho em comandos com os pontos já absolutos.
 *
 * O Figma só exporta M, L, H, V, C e Z, todos absolutos. Qualquer outro
 * comando é erro em vez de caixa errada em silêncio.
 */
function percorrer(d) {
  const pedacos = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? [];
  const comandos = [];
  let i = 0;
  let cx = 0;
  let cy = 0;
  let ix = 0;
  let iy = 0;
  let comando = '';
  const numero = () => Number(pedacos[i++]);

  while (i < pedacos.length) {
    if (/[A-Za-z]/.test(pedacos[i])) comando = pedacos[i++];
    switch (comando) {
      case 'M':
      case 'L': {
        const de = [cx, cy];
        cx = numero();
        cy = numero();
        if (comando === 'M') {
          ix = cx;
          iy = cy;
        }
        comandos.push({ comando, de, pontos: [[cx, cy]] });
        break;
      }
      case 'H': {
        const de = [cx, cy];
        cx = numero();
        comandos.push({ comando, de, pontos: [[cx, cy]] });
        break;
      }
      case 'V': {
        const de = [cx, cy];
        cy = numero();
        comandos.push({ comando, de, pontos: [[cx, cy]] });
        break;
      }
      case 'C': {
        const de = [cx, cy];
        const pontos = [
          [numero(), numero()],
          [numero(), numero()],
          [numero(), numero()],
        ];
        [cx, cy] = pontos[2];
        comandos.push({ comando, de, pontos });
        break;
      }
      case 'Z':
      case 'z':
        comandos.push({ comando: 'Z', de: [cx, cy], pontos: [] });
        cx = ix;
        cy = iy;
        break;
      default:
        throw new Error(`comando "${comando}" não suportado.`);
    }
  }
  return comandos;
}

/** Extremos de uma cúbica num eixo: as pontas e as raízes da derivada. */
function extremosDaCubica(p0, p1, p2, p3) {
  const fora = [p0, p3];
  const a = -p0 + 3 * p1 - 3 * p2 + p3;
  const b = 2 * (p0 - 2 * p1 + p2);
  const c = p1 - p0;
  let raizes = [];
  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) > 1e-12) raizes = [-c / b];
  } else {
    const delta = b * b - 4 * a * c;
    if (delta >= 0) {
      const r = Math.sqrt(delta);
      raizes = [(-b + r) / (2 * a), (-b - r) / (2 * a)];
    }
  }
  for (const t of raizes) {
    if (t <= 0 || t >= 1) continue;
    const u = 1 - t;
    fora.push(u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3);
  }
  return fora;
}

/**
 * Os elementos desenháveis de um grupo, validados.
 *
 * O gerador PARA se achar um elemento que não sabe desenhar, em vez de
 * ignorá-lo. Foi assim que a boca aberta da `surpreso` sumiu: ela é uma
 * `<ellipse>`, o extrator só pegava `<path>`, e o resultado foi um desenho
 * quase certo — a língua sem a boca — que ninguém nota até olhar de perto.
 * Peça que some é pior que build que quebra.
 */
const DESENHAVEIS = { path: 'Path', ellipse: 'Ellipse', circle: 'Circle' };

function elementosDe(dentro, onde = 'grupo') {
  const fora = [];
  for (const [, tag, bruto] of dentro.matchAll(/<([a-zA-Z][\w-]*)\b([^>]*?)\/?>/g)) {
    if (tag === 'g') continue; // só embrulha; os filhos aparecem sozinhos
    if (!DESENHAVEIS[tag]) {
      throw new Error(
        `${onde}: elemento <${tag}> não é suportado. ` +
          `O react-native-svg aqui só aceita ${Object.keys(DESENHAVEIS).join(', ')} e g.`,
      );
    }
    const props = {};
    for (const [, nome, valor] of bruto.matchAll(/([\w-]+)="([^"]*)"/g)) props[nome] = valor;
    if (props.transform) {
      throw new Error(`${onde}: <${tag}> com transform. Aplique a transformação no Figma.`);
    }
    fora.push({ tag, props });
  }
  if (!fora.length) throw new Error(`${onde}: nenhum elemento desenhável.`);
  return fora;
}

/** Os cantos de um elemento, para caixa e para assinatura. */
function pontosDoElemento({ tag, props }) {
  const n = (chave) => Number(props[chave] ?? 0);
  if (tag === 'path') {
    const fora = [];
    for (const c of percorrer(props.d)) {
      if (c.comando === 'Z') continue;
      if (c.comando === 'C') {
        const [[ax, ay], [bx, by], [dx, dy]] = c.pontos;
        for (const x of extremosDaCubica(c.de[0], ax, bx, dx)) fora.push([x, c.de[1]]);
        for (const y of extremosDaCubica(c.de[1], ay, by, dy)) fora.push([c.de[0], y]);
        fora.push([dx, dy]);
      } else {
        fora.push(c.pontos[0]);
      }
    }
    return fora;
  }
  // Elipse e círculo: os quatro extremos bastam, e são exatos.
  const rx = tag === 'circle' ? n('r') : n('rx');
  const ry = tag === 'circle' ? n('r') : n('ry');
  const cx = n('cx');
  const cy = n('cy');
  return [
    [cx - rx, cy],
    [cx + rx, cy],
    [cx, cy - ry],
    [cx, cy + ry],
  ];
}

/**
 * Caixa de um grupo, de verdade: resolve os extremos de cada cúbica em vez
 * de usar os pontos de controle, que inflariam a caixa.
 */
function caixaDoGrupo(dentro, onde) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const el of elementosDe(dentro, onde)) {
    for (const [x, y] of pontosDoElemento(el)) {
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  }
  return { x: x0, y: y0, largura: x1 - x0, altura: y1 - y0 };
}

/**
 * A forma de um grupo: o desenho dele com a origem na própria caixa.
 *
 * É o que deixa reconhecer que a cauda do `acena` é a MESMA da do `parado`.
 * Cada pose é um export próprio do Figma, com origem própria, então o texto
 * cru das peças nunca bate — sem isto o bundle carregaria o mesmo tronco
 * três vezes.
 *
 * A comparação é por tolerância, não por igualdade: o Figma escreve as
 * coordenadas já arredondadas, e a caixa sai de resolver curva, então a
 * mesma peça em dois exports difere na terceira casa. Arredondar não
 * resolve — só empurra o problema para quem cair perto da fronteira, e foi
 * exatamente o que aconteceu com `perna-dir`.
 */
function formaDoGrupo(dentro, caixa) {
  return elementosDe(dentro).map((el) => {
    const props = Object.entries(el.props)
      .filter(([nome]) => nome !== 'id' && nome !== 'd')
      .map(([nome, valor]) => `${nome}=${valor}`)
      .join(';');
    const pontos = [];
    for (const [x, y] of pontosDoElemento(el)) pontos.push(x - caixa.x, y - caixa.y);
    return { props, forma: el.tag, pontos };
  });
}

/** Duas formas são a mesma peça se nenhum ponto se afasta meio décimo. */
function mesmaForma(a, b) {
  if (a.length !== b.length) return false;
  return a.every((pa, i) => {
    const pb = b[i];
    if (pa.props !== pb.props || pa.forma !== pb.forma) return false;
    if (pa.pontos.length !== pb.pontos.length) return false;
    return pa.pontos.every((v, k) => Math.abs(v - pb.pontos[k]) < 0.05);
  });
}

// ------------------------------------------------------------------- JSX

const ATRIBUTOS = {
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'fill-opacity': 'fillOpacity',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-opacity': 'strokeOpacity',
  'stroke-dasharray': 'strokeDasharray',
};

/** Todo componente do react-native-svg que a arte gerada acaba usando. */
const usados = new Set();

function elementosEmJsx(dentro, recuo) {
  const espaco = '  '.repeat(recuo);
  return elementosDe(dentro)
    .map((el) => {
      const Componente = DESENHAVEIS[el.tag];
      usados.add(Componente);
      const props = Object.entries(el.props)
        .filter(([nome]) => nome !== 'id')
        .map(([nome, valor]) => `${ATRIBUTOS[nome] ?? nome}=${JSON.stringify(valor)}`);
      return `${espaco}<${Componente} ${props.join(' ')} />`;
    })
    .join('\n');
}

// -------------------------------------------------------------- montagens

/** Arte guardada uma vez só, com o nome que ela ganhou na primeira aparição. */
const arte = {};
const caixas = {};
const formas = [];

/**
 * Registra a arte de uma peça e devolve o nome dela. Arte repetida entre
 * montagens volta com o nome da primeira — a variante nova é que ganha
 * sufixo, e o sufixo é a montagem onde ela estreou, para dar onde procurar
 * no Figma.
 */
function guardarArte(junta, dentro, caixa, montagem) {
  const forma = formaDoGrupo(dentro, caixa);
  const jaTem = formas.find((f) => mesmaForma(f.forma, forma));
  if (jaTem) return jaTem.nome;
  const nome = arte[junta] ? `${junta}-${montagem}` : junta;
  if (arte[nome]) throw new Error(`duas artes diferentes com o nome "${nome}".`);
  arte[nome] = dentro;
  caixas[nome] = caixa;
  formas.push({ nome, forma });
  return nome;
}

/** Lê um montado e devolve as peças com caixa, arte registrada e ordem. */
function lerMontado({ nome, caminho }) {
  const pecas = pecasDe(caminho);
  const fora = [];
  for (const { nome: cru, dentro } of pecas) {
    const peca = normalizar(cru);
    const caixa = caixaDoGrupo(dentro, `${nome} / ${peca}`);
    fora.push({
      junta: JUNTA_DA_PECA[peca] ?? peca,
      arte: guardarArte(peca, dentro, caixa, nome),
      caixa,
    });
  }
  return { nome, pecas: fora };
}

const montagens = origensDosMontados.map(lerMontado);
const referencia = montagens[0];

for (const m of montagens) {
  const juntas = m.pecas.map((p) => p.junta);
  for (const obrigatoria of ['cabeca', 'tronco']) {
    if (!juntas.includes(obrigatoria)) {
      throw new Error(`a montagem "${m.nome}" não tem \`${obrigatoria}\`.`);
    }
  }
  const esperadas = referencia.pecas.map((p) => p.junta);
  if (juntas.join() !== esperadas.join()) {
    throw new Error(
      `a montagem "${m.nome}" tem peças ou ordem diferentes da referência` +
        ` "${referencia.nome}":\n  ${juntas.join(', ')}\n  ${esperadas.join(', ')}`,
    );
  }
}

/**
 * Alinhar as montagens: cada export do Figma tem a própria origem, então
 * sem isto o boneco salta de lugar ao trocar de estado.
 *
 *  eixo    o TRONCO. O corpo é a única peça igual em todas as poses, e é
 *          dele que pendem ombro, quadril e pescoço.
 *  chão    o ponto mais baixo. Na comemoração as pernas vêm 50 abaixo — o
 *          artista desenhou o boneco NO AR. Se o chão não fosse comum, o
 *          ciclo do pulo começaria com as patas enterradas; alinhado, o
 *          quadro de baixo é o de contato e o pulo sobe a partir dele.
 */
function tronco(m) {
  return m.pecas.find((p) => p.junta === 'tronco').caixa;
}
function chao(m) {
  return Math.max(...m.pecas.map((p) => p.caixa.y + p.caixa.altura));
}

const eixoRef = tronco(referencia).x;
const chaoRef = chao(referencia);

for (const m of montagens) {
  const dx = eixoRef - tronco(m).x;
  const dy = chaoRef - chao(m);
  m.deslocou = { dx, dy };
  for (const p of m.pecas) {
    p.lugar = { x: p.caixa.x + dx, y: p.caixa.y + dy };
  }
}

// -------------------------------------------------------------- variantes

/**
 * VARIANTE é um desenho alternativo de uma junta, escolhido na hora de
 * renderizar — não na montagem. É como o boneco vira de frente para o lado:
 * trocando o desenho, nunca girando.
 *
 * Duas juntas têm variantes hoje, e elas se comportam diferente:
 *
 *  cabeca   o ROSTO. É um eixo só, porque virar de lado e ficar bravo são a
 *           mesma operação — trocar a cabeça. As vistas mudam de largura
 *           (163 a 194), então todo rosto é PENDURADO pelo pescoço: centro
 *           embaixo, nunca pelo canto, senão a cabeça pula na troca. Para
 *           uma expressão, que tem a caixa da `front`, o deslocamento sai
 *           zero e a regra some sozinha.
 *  tronco   as vistas de corpo. Aqui não há pendurar: elas têm de ter a
 *           caixa do tronco base, porque é dela que pendem ombro, quadril e
 *           pescoço, e um tronco de outro tamanho arrastaria todas as
 *           juntas junto. O gerador exige isso.
 *
 * O primeiro item de cada lista é o desenho do montado de referência: o
 * padrão, o que vale sem ninguém pedir nada.
 */
const variantes = {};
for (const p of referencia.pecas) variantes[p.junta] = [p.arte];

const rostos = variantes.cabeca;

/** Um desenho novo para uma junta, ou o nome do que já tinha a mesma forma. */
function guardarVariante(junta, nome, dentro, caixa) {
  const forma = formaDoGrupo(dentro, caixa);
  const jaTem = formas.find((f) => mesmaForma(f.forma, forma));
  if (jaTem) return jaTem.nome;
  if (arte[nome]) throw new Error(`duas artes diferentes com o nome "${nome}".`);

  // A cabeça pendura pelo pescoço e pode mudar de tamanho; o resto, não.
  if (junta !== 'cabeca') {
    const base = caixas[variantes[junta][0]];
    const fora = Math.max(
      Math.abs(caixa.largura - base.largura),
      Math.abs(caixa.altura - base.altura),
    );
    if (fora > 0.5) {
      throw new Error(
        `"${nome}" mede ${caixa.largura.toFixed(1)} × ${caixa.altura.toFixed(1)}, e ` +
          `"${variantes[junta][0]}" mede ${base.largura.toFixed(1)} × ${base.altura.toFixed(1)}. ` +
          'Variante de corpo tem de ter a caixa da peça base — é dela que pendem as juntas.',
      );
    }
  }

  arte[nome] = dentro;
  caixas[nome] = caixa;
  formas.push({ nome, forma });
  variantes[junta].push(nome);
  return nome;
}

/** A junta a que uma peça avulsa pertence, pelo nome: `tronco-costas` é `tronco`. */
function juntaDaPeca(nome) {
  const candidatas = Object.keys(variantes)
    .filter((j) => nome === j || nome.startsWith(`${j}-`))
    .sort((a, b) => b.length - a.length);
  if (!candidatas.length) {
    throw new Error(
      `a peça "${nome}" não começa com o nome de nenhuma junta ` +
        `(${Object.keys(variantes).join(', ')}).`,
    );
  }
  return candidatas[0];
}

// Da prancha vem tudo que não for peça de corpo — hoje as quatro vistas.
const doCorpo = new Set(referencia.pecas.map((p) => p.arte));
for (const { caminho } of folhas) {
  for (const { nome: cru, dentro } of pecasDe(caminho)) {
    const nome = normalizar(cru);
    if (doCorpo.has(nome)) continue;
    guardarVariante('cabeca', nome, dentro, caixaDoGrupo(dentro, `folha / ${nome}`));
  }
}

// E os avulsos, um por arquivo: a moldura já é a peça.
for (const { nome: tipo, caminho } of [...rostosAvulsos, ...pecasAvulsas]) {
  const moldura = molduraDe(caminho);
  const nome = normalizar(moldura.nome);
  const junta = tipo === 'rosto' ? 'cabeca' : juntaDaPeca(nome);
  guardarVariante(junta, nome, moldura.dentro, caixaDoGrupo(moldura.dentro, `${tipo} / ${nome}`));
}

const caixaDaFront = caixas.front;
const deslocamentoDoRosto = {};
for (const r of rostos) {
  deslocamentoDoRosto[r] = {
    dx: (caixaDaFront.largura - caixas[r].largura) / 2,
    dy: caixaDaFront.altura - caixas[r].altura,
  };
}

/**
 * A cabeça também é recentralizada no eixo do corpo.
 *
 * No montado o artista a deixou alguns pontos à esquerda do eixo do tronco,
 * e de frente isso lê como cabeça torta. Esta é a única correção de posição
 * que o código faz sobre a montagem — e ela também alinha todos os rostos
 * entre si, porque todos pendem deste mesmo ponto.
 */
for (const m of montagens) {
  const corpo = m.pecas.find((p) => p.junta === 'tronco');
  const cabeca = m.pecas.find((p) => p.junta === 'cabeca');
  cabeca.lugar.x = corpo.lugar.x + corpo.caixa.largura / 2 - cabeca.caixa.largura / 2;
}

// ----------------------------------------------------------------- palco

/**
 * O palco é o retângulo que TODAS as montagens ocupam, com folga em volta.
 *
 * A folga não é enfeite: é o espaço que a animação usa por cima do desenho,
 * e por isso é diferente em cada lado. Agora que as poses extremas são
 * desenhadas — o braço do aceno já sai da silhueta, as pernas da
 * comemoração já esticam —, sobra pouco a reservar:
 *
 *  topo      o pulo do `comemora`, que sobe 44
 *  esquerda  o vaivém do braço que acena
 *  direita   o vaivém da cauda
 *  rodapé    nada se mexe para baixo; só o respiro
 *
 * A direita é a maior porque a cauda é comprida e gira pela raiz: 5° na
 * raiz viram uns 27 na ponta, e com folga de 20 ela passava da borda.
 */
const MARGEM = { topo: 52, direita: 34, rodape: 14, esquerda: 22 };

const assentos = montagens.flatMap((m) =>
  m.pecas.map((p) => {
    // A cabeça troca de rosto, e nem todo rosto tem o tamanho da `front`.
    if (p.junta !== 'cabeca') return { ...p.lugar, largura: p.caixa.largura, altura: p.caixa.altura };
    return rostos.map((r) => ({
      x: p.lugar.x + deslocamentoDoRosto[r].dx,
      y: p.lugar.y + deslocamentoDoRosto[r].dy,
      largura: caixas[r].largura,
      altura: caixas[r].altura,
    }));
  }),
).flat();

const minX = Math.min(...assentos.map((a) => a.x));
const minY = Math.min(...assentos.map((a) => a.y));
const maxX = Math.max(...assentos.map((a) => a.x + a.largura));
const maxY = Math.max(...assentos.map((a) => a.y + a.altura));

// Desloca tudo para dentro da folga e zera a origem. Os pivôs de pose.ts
// são fração da caixa da peça, então acompanham sozinhos.
for (const m of montagens) {
  for (const p of m.pecas) {
    p.lugar = {
      x: p.lugar.x - minX + MARGEM.esquerda,
      y: p.lugar.y - minY + MARGEM.topo,
    };
  }
}

const palco = {
  largura: maxX - minX + MARGEM.esquerda + MARGEM.direita,
  altura: maxY - minY + MARGEM.topo + MARGEM.rodape,
};

// ------------------------------------------------------------------ saída

const nomesDeArte = Object.keys(arte);
const juntas = referencia.pecas.map((p) => p.junta);
const num = (v) => Number(v.toFixed(2));

const uniao = (lista) => lista.map((p) => `'${p}'`).join(' | ');

/**
 * As juntas cujo desenho se escolhe na renderização viram um eixo com nome
 * próprio no TypeScript. Uma junta que só tem o desenho do montado não vira
 * eixo — não há o que escolher.
 */
const EIXOS = {
  cabeca: {
    tipo: 'Rosto',
    lista: 'rostos',
    doc:
      'O desenho da cabeça inteira — para onde ela olha E que cara faz.\n * Virar de lado e ficar bravo são a mesma operação, então é um eixo só.',
  },
  tronco: {
    tipo: 'Tronco',
    lista: 'troncos',
    doc:
      'Para que lado o corpo está virado. Virar é do corpo todo: um `sideways`\n * com o tronco de frente lê como pescoço torcido.',
  },
};

const eixosEmTs = Object.entries(EIXOS)
  .filter(([junta]) => variantes[junta]?.length > 1)
  .map(
    ([junta, e]) => `/**
 * ${e.doc}
 */
export type ${e.tipo} = ${uniao(variantes[junta])};

/** Os desenhos de \`${junta}\`, na ordem em que entraram. O primeiro é o padrão. */
export const ${e.lista}: readonly ${e.tipo}[] = [${variantes[junta].map((v) => `'${v}'`).join(', ')}];`,
  )
  .join('\n\n');

// Os desenhos primeiro: é a passada que descobre quais componentes do
// react-native-svg a arte usa, e o import precisa dela já resolvida.
const blocoDosDesenhos = nomesDeArte
  .map((n) => `  '${n}': (\n    <>\n${elementosEmJsx(arte[n], 3)}\n    </>\n  ),`)
  .join('\n');

const arquivo = `/* eslint-disable */
/**
 * GERADO por assets/personagem/gerar-arte.mjs — não edite à mão.
 *
 * Uma montagem por pose, cada uma vinda de um boneco que o artista montou
 * no Figma. Proporção, escala e posição são dele: o aceno tem um braço
 * DESENHADO erguido, não um braço girado por código. A cabeça segue a mesma
 * regra: virar de lado e ficar bravo são a mesma troca de \`Rosto\`.
 *
 * \`caixas\` recorta a peça dentro da sua fonte; \`montagens\` diz, por pose,
 * qual arte cada junta usa e onde ela se assenta no palco. Os pivôs e o
 * movimento por cima ficam em pose.ts e estados.ts.
 */
import type { ReactNode } from 'react';
import { ${[...usados].sort().join(', ')} } from 'react-native-svg';

/** Cada desenho, uma vez só. Variante nova leva o sufixo da pose que a estreou. */
export type Peca = ${uniao(nomesDeArte)};

/** O que o motor move. \`cabeca\` é a junta; a peça dela é o rosto. */
export type Junta = ${uniao(juntas)};

${eixosEmTs}

/** As poses que o artista montou. */
export type NomeDaMontagem = ${uniao(montagens.map((m) => m.nome))};

/**
 * A montagem a que as outras se alinham — o chão e o eixo do boneco.
 * É também a única que tem arte para TODAS as juntas, então é dela que os
 * pivôs das variantes são herdados.
 */
export const montagemDeReferencia: NomeDaMontagem = '${referencia.nome}';

/** O retângulo que as montagens ocupam. Tudo aqui vive nessas unidades. */
export const palco = { largura: ${num(palco.largura)}, altura: ${num(palco.altura)} };

/** Recorte de cada peça dentro da SUA fonte. */
export const caixas: Record<
  Peca,
  { x: number; y: number; largura: number; altura: number }
> = {
${nomesDeArte
  .map((n) => {
    const c = caixas[n];
    return `  '${n}': { x: ${num(c.x)}, y: ${num(c.y)}, largura: ${num(c.largura)}, altura: ${num(c.altura)} },`;
  })
  .join('\n')}
};

/** Quanto o rosto se desloca em relação à \`front\`, para pender do mesmo pescoço. */
export const deslocamentoDoRosto: Record<Rosto, { dx: number; dy: number }> = {
${rostos
  .map((r) => {
    const d = deslocamentoDoRosto[r];
    return `  '${r}': { dx: ${num(d.dx)}, dy: ${num(d.dy)} },`;
  })
  .join('\n')}
};

/** Por pose: a ordem de desenho e onde cada junta se assenta. */
export const montagens: Record<
  NomeDaMontagem,
  { ordem: readonly Junta[]; pecas: Record<Junta, { arte: Peca; x: number; y: number }> }
> = {
${montagens
  .map(
    (m) => `  ${m.nome}: {
    ordem: [${m.pecas.map((p) => `'${p.junta}'`).join(', ')}],
    pecas: {
${m.pecas
  .map(
    (p) =>
      `      '${p.junta}': { arte: '${p.arte}', x: ${num(p.lugar.x)}, y: ${num(p.lugar.y)} },`,
  )
  .join('\n')}
    },
  },`,
  )
  .join('\n')}
};

export const desenhos: Record<Peca, ReactNode> = {
${blocoDosDesenhos}
};
`;

writeFileSync(SAIDA, arquivo);

console.log(`palco ${num(palco.largura)} × ${num(palco.altura)}`);
console.log(`${nomesDeArte.length} desenhos: ${nomesDeArte.join(', ')}`);
for (const m of montagens) {
  console.log(`\n${m.nome}  (deslocada ${num(m.deslocou.dx)}, ${num(m.deslocou.dy)})`);
  for (const p of m.pecas) {
    const c = p.caixa;
    console.log(
      `  ${p.junta.padEnd(10)} ${p.arte.padEnd(16)}` +
        `${num(c.largura).toFixed(1).padStart(7)} × ${num(c.altura).toFixed(1).padStart(7)}` +
        `   em ${num(p.lugar.x).toFixed(1).padStart(7)}, ${num(p.lugar.y).toFixed(1).padStart(6)}`,
    );
  }
}
