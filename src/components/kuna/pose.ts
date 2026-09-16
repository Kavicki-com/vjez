/**
 * Os pivôs do Kuna — o único número de montagem que não vem do Figma.
 *
 * A POSIÇÃO das peças vem pronta de `arte.tsx`, gerada dos bonecos que o
 * artista montou no Figma: um por pose. Proporção, escala e posição são
 * dele; aqui não se inventa lugar. O que falta é só onde cada peça GIRA,
 * que é informação de animação e não existe no desenho.
 *
 * Os pivôs são **fração da caixa da própria peça**, não coordenada do
 * palco. O gerador desloca tudo para caber na folga das bordas, e a folga
 * muda quando a animação muda: pivô absoluto ficaria errado em silêncio a
 * cada mexida. A fração viaja junto com a peça.
 *
 * Para conferir a olho, a bancada é a rota `/kuna`, com a chave
 * "mostrar pivôs" — e confira GIRANDO, não parado: ombro fora do lugar só
 * abre buraco quando o braço sobe.
 */
import {
  caixas,
  deslocamentoDoRosto,
  montagemDeReferencia,
  montagens,
  palco,
  rostos,
  troncos,
  type Junta as JuntaDesenhada,
  type NomeDaMontagem,
  type Peca,
  type Rosto,
  type Tronco,
} from './arte';

export { palco, rostos, troncos };
export type { NomeDaMontagem, Rosto, Tronco };

/**
 * Como o boneco está nesta renderização: a pose do corpo, o desenho da
 * cabeça e para que lado o corpo está virado.
 *
 * Vem junto num objeto porque as três coisas têm de andar coerentes — um
 * rosto de costas com o tronco de frente não é uma pose, é um erro.
 */
export type Aparencia = {
  montagem: NomeDaMontagem;
  rosto: Rosto;
  tronco: Tronco;
};

/**
 * Que tronco acompanha cada rosto.
 *
 * Virar é do corpo todo, e não só da cabeça: o `sideways` com o tronco de
 * frente lê como pescoço torcido. Por isso o tronco segue o rosto sozinho —
 * quem troca a cara não precisa lembrar de trocar o corpo.
 *
 * É TABELA e não regra porque olhar por cima do ombro é pose legítima: um
 * estado, ou a prop `tronco`, pode contrariar o padrão de propósito.
 *
 * `profile` cai no tronco de três quartos por falta de um mais virado — é a
 * aproximação mais virada que existe desenhada.
 */
const TRONCO_DO_ROSTO: Record<Rosto, Tronco> = {
  front: 'tronco',
  triste: 'tronco',
  bravo: 'tronco',
  surpreso: 'tronco',
  sonolento: 'tronco',
  piscando: 'tronco',
  sideways: 'tronco-sideways',
  profile: 'tronco-sideways',
  backward: 'tronco-costas',
  back: 'tronco-costas',
};

export function troncoDoRosto(rosto: Rosto): Tronco {
  return TRONCO_DO_ROSTO[rosto];
}

/** O que o motor sabe mover. `corpo` não tem arte: é o boneco inteiro. */
export type Junta = JuntaDesenhada | 'corpo';

/**
 * O pulo do `comemora` é translação pura, então o pivô do corpo não muda
 * nada — fica no centro do palco só para o motor ter um ponto de apoio.
 */
export const pivoDoCorpo: readonly [number, number] = [palco.largura / 2, palco.altura / 2];

/**
 * Onde a peça gira, como fração da caixa dela: 0 = borda inicial, 1 = final.
 *
 * Só as peças de CORPO da montagem de referência entram aqui. As variantes —
 * o braço erguido do aceno, a cauda da comemoração — herdam (veja `pivoDe`),
 * porque o ombro e a raiz da cauda são pontos do corpo, e o corpo é o mesmo
 * em todas as poses. Fração à mão para cada variante seria a mesma
 * informação escrita duas vezes, e as duas sairiam do lugar em desencontro.
 */
const NA_PECA: Partial<Record<Peca, readonly [number, number]>> = {
  // O ombro: borda de dentro, lá no alto. Os dois são espelho um do outro.
  'braco-esq': [0.902, 0.095],
  'braco-dir': [0.098, 0.095],
  // A coxa, onde a perna entra no quadril.
  'perna-esq': [0.563, 0.091],
  'perna-dir': [0.439, 0.091],
  // O quadril: o respiro cresce para cima, com a base plantada.
  tronco: [0.498, 0.999],
  // A raiz da cauda, onde ela encontra o corpo.
  calda: [0.244, 0.977],
};

/**
 * O pescoço: centro embaixo da cabeça, seja qual for o rosto.
 *
 * Vale para os dez de hoje e para os que vierem, então é regra e não tabela
 * — um rosto novo não precisa de linha nenhuma aqui.
 */
const PESCOCO: readonly [number, number] = [0.5, 1];
const E_ROSTO = new Set<string>(rostos);
const E_TRONCO = new Set<string>(troncos);

/**
 * A fração da caixa em que a peça gira, se houver uma.
 *
 * As vistas de tronco caem na fração do tronco base: o gerador exige que
 * elas tenham a caixa dele, justamente porque é do tronco que pendem ombro,
 * quadril e pescoço.
 */
function fracaoDe(arte: Peca): readonly [number, number] | undefined {
  if (E_ROSTO.has(arte)) return PESCOCO;
  if (E_TRONCO.has(arte)) return NA_PECA.tronco;
  return NA_PECA[arte];
}

/**
 * A peça de arte de cada junta nesta aparência.
 *
 * A cabeça e o tronco são escolhidos na renderização; o resto vem da
 * montagem. Se um dia uma pose precisar do tronco próprio, ele entra como
 * mais um valor de `Tronco` e o estado o nomeia.
 */
export function arteDa(junta: JuntaDesenhada, ap: Aparencia): Peca {
  if (junta === 'cabeca') return ap.rosto;
  if (junta === 'tronco') return ap.tronco;
  return montagens[ap.montagem].pecas[junta].arte;
}

/** Onde a peça se assenta no palco, já resolvida a aparência. */
export function lugarDe(junta: JuntaDesenhada, ap: Aparencia): { x: number; y: number } {
  const assento = montagens[ap.montagem].pecas[junta];
  // Só a cabeça muda de tamanho entre desenhos; as vistas de tronco têm a
  // caixa do tronco base, então se assentam no mesmo lugar.
  if (junta !== 'cabeca') return { x: assento.x, y: assento.y };
  // Todo rosto pende do mesmo pescoço: as vistas vão de 163 a 194 de
  // largura, e ancorar pelo canto faria a cabeça pular na troca. Para as
  // expressões, que têm a caixa da `front`, o deslocamento é zero.
  const d = deslocamentoDoRosto[ap.rosto];
  return { x: assento.x + d.dx, y: assento.y + d.dy };
}

/**
 * Quanto o corpo desta pose está deslocado em relação à de referência.
 *
 * Na comemoração o artista desenhou as pernas esticadas, e o gerador
 * assentou o boneco pelo chão — então o tronco subiu 50. Ombro, pescoço e
 * raiz da cauda sobem junto, porque são pontos do corpo.
 */
function deslocamentoDoCorpo(montagem: NomeDaMontagem): { dx: number; dy: number } {
  const aqui = montagens[montagem].pecas.tronco;
  const la = montagens[montagemDeReferencia].pecas.tronco;
  return { dx: aqui.x - la.x, dy: aqui.y - la.y };
}

/** Ponto de giro de uma junta nesta pose, em unidades do palco. */
export function pivoDe(junta: JuntaDesenhada, ap: Aparencia): readonly [number, number] {
  const arte = arteDa(junta, ap);
  const fracao = fracaoDe(arte);

  if (fracao) {
    const caixa = caixas[arte];
    const lugar = lugarDe(junta, ap);
    return [lugar.x + fracao[0] * caixa.largura, lugar.y + fracao[1] * caixa.altura];
  }

  // Variante sem fração: gira no mesmo ponto do corpo que a peça base.
  if (ap.montagem === montagemDeReferencia) {
    throw new Error(
      `a peça "${arte}" não tem pivô, e a montagem de referência não tem de onde herdar.`,
    );
  }
  const base = pivoDe(junta, { ...ap, montagem: montagemDeReferencia });
  const d = deslocamentoDoCorpo(ap.montagem);
  return [base[0] + d.dx, base[1] + d.dy];
}

/**
 * Ordem de desenho, herdada do montado — a mesma pilha que o artista
 * empilhou. O tronco vem quase no fim e cobre ombro, quadril e a raiz da
 * cauda, e é essa cobertura que deixa as juntas girarem sem abrir fresta.
 */
export function ordemDe(montagem: NomeDaMontagem): readonly JuntaDesenhada[] {
  return montagens[montagem].ordem;
}
