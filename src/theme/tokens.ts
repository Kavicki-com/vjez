/**
 * Tokens visuais do Vjez.
 *
 * Paleta Material 3 vinda dos mockups do Stitch, que batem com o Figma e
 * com os assets de marca no vermelho #a30019.
 * Referência de layout = 390px; acima disso o layout expande por breakpoint.
 * Nada de px fixo em posição: só flex, %, e os espaçamentos daqui.
 *
 * ---------------------------------------------------------------------
 * REGRA DE COR — 60-30-10
 * ---------------------------------------------------------------------
 * 60% NEUTRO    `fundo`, `superficie`, `fundoSuave`, `superficie*`
 *               Fundo de tela, cartões, listas, campos.
 *
 * 30% VERMELHO  `primaria` e família
 *               A cor da marca e da ação: šahovnica, wordmark, CTA,
 *               títulos de comemoração, capas, ícones de conteúdo.
 *               É o que faz o app parecer o app.
 *
 * 10% AZUL      `secundaria` e família
 *               Duas coisas, e só elas:
 *               1. A CASCA DA NAVEGAÇÃO — a lateral e a barra inferior
 *                  são painéis azuis sólidos, com os itens em branco.
 *                  Contam como 10% porque são moldura: ficam na borda da
 *                  tela e o conteúdo nunca é azul.
 *               2. PROGRESSO — barras de avanço, o nó "atual" da trilha,
 *                  XP, e a opção selecionada dentro do exercício.
 *
 * O teste é o significado, não a área: se o elemento diz "ação", "marca"
 * ou "escolha de conteúdo" (chips do dicionário), é vermelho; se diz
 * "onde você está" ou "o quanto você andou", é azul.
 *
 * BORDA: cinza é o padrão de todo cartão. Borda colorida é estado, nunca
 * decoração — verde quando a lição ou a prova foi concluída.
 *
 * Fora da conta: `erro`, `acerto` e `destaque` (ofensiva) — semânticas,
 * só aparecem no instante em que significam algo.
 */

export const cores = {
  /** background / surface — off-white quente. */
  fundo: '#fcf9f8',
  /** surface-container-lowest: cartões e barras. */
  superficie: '#ffffff',
  /** surface-container-low: preenchimento sutil, campos, estados inativos. */
  fundoSuave: '#f6f3f2',
  /** surface-container. */
  superficieMedia: '#f0eded',
  /** surface-container-high. */
  superficieAlta: '#eae7e7',
  /** surface-variant / surface-container-highest. */
  superficieVariante: '#e5e2e1',

  /** on-surface. */
  texto: '#1c1b1b',
  /** on-surface-variant — quente, não cinza neutro. */
  textoSuave: '#5c3f3d',
  /** outline. */
  contorno: '#916f6c',
  /**
   * outline-variant: a borda padrão dos cartões — cinza neutro.
   * Era um rosa-avermelhado (#e6bdba) que punha um contorno vermelho em
   * todo cartão do app e comia o orçamento dos 30%. Borda colorida agora
   * só significa estado: verde quando a lição ou a prova foi concluída.
   */
  borda: '#d9d4d3',

  /** Vermelho da marca. Os 30%: identidade e ação. */
  primaria: '#a30019',
  /** primary-container: vermelho vivo da bandeira, para selos e realces. */
  primariaContainer: '#ce1126',
  sobrePrimariaContainer: '#ffe0dd',
  /** primary-fixed: preenchimento claro. */
  primariaSuave: '#ffdad7',

  /**
   * Azul do Stitch/Figma. Os 10%: progresso, seleção e posição.
   * Escasso de propósito — é o acento que só aparece onde a interface
   * precisa dizer "você está aqui" ou "você andou isto".
   */
  secundaria: '#0c5fae',
  secundariaContainer: '#6eaafe',
  sobreSecundariaContainer: '#003e76',
  secundariaSuave: '#d5e3ff',

  /** Terracota: terceira voz, usada em dicas e conquistas. */
  terciaria: '#8c3220',
  terciariaContainer: '#ab4935',
  sobreTerciariaContainer: '#ffe1da',

  erro: '#ba1a1a',
  erroSuave: '#ffdad6',
  sobreErro: '#93000a',

  /**
   * A paleta M3 do Stitch não traz verde de sucesso — os mockups usam um
   * verde solto no estado de acerto. Fica aqui como token para não repetir
   * hex solto pelo código.
   */
  acerto: '#107c41',
  acertoSuave: '#d7f0e1',

  /** Ofensiva. */
  destaque: '#E8A33D',
} as const;

/**
 * CORES DE ASSOCIAÇÃO — exceção declarada à regra 60-30-10.
 *
 * Usadas em um lugar só: o exercício de ligar pares. Ali a cor não é
 * enfeite nem marca, é a própria resposta — é o que diz "este croata vai
 * com este português". Sem ela o aluno liga seis pares e fica com seis
 * fichas cinzas iguais, sem enxergar o que ligou com o quê.
 *
 * Por que não resolver com o azul de seleção: azul significa "onde você
 * está" e é um só. Associação precisa de VÁRIAS cores simultâneas e
 * distinguíveis entre si — é uma dimensão diferente da paleta, não uma
 * ampliação dos 10%.
 *
 * Seis tons, todos passando em contraste sobre o texto escuro, escolhidos
 * para se separarem também em daltonismo (nenhum par vermelho/verde
 * vizinho). A cor nunca anda sozinha: as duas fichas ligadas também exibem
 * o texto da parceira, então quem não distingue a cor lê a ligação.
 *
 * Nenhuma delas é `acerto` ou `erro`: depois de verificar, verde e vermelho
 * entram por cima e a associação sai de cena — corrigido manda mais que
 * ligado.
 */
export const associacao = [
  { borda: '#0c5fae', fundo: '#dbe6fb', texto: '#003e76' },
  { borda: '#8c3220', fundo: '#f7e0d9', texto: '#5f1b0d' },
  { borda: '#5b3fa8', fundo: '#e6def9', texto: '#33206e' },
  { borda: '#0f6b62', fundo: '#d5eae6', texto: '#04443d' },
  { borda: '#8a5e12', fundo: '#f4e7c9', texto: '#5a3c05' },
  { borda: '#a3336f', fundo: '#f8dde9', texto: '#6b1c47' },
] as const;

/**
 * Dourado da medalha de conquista. Três paradas porque medalha sem
 * gradiente vira só um círculo amarelo — o que dá o brilho é a variação.
 */
export const ouro = {
  brilho: '#FDF3B8',
  claro: '#F2D06B',
  medio: '#DDA92E',
  escuro: '#A9761B',
  borda: '#8A5E12',
} as const;

/**
 * Tons de baixo dos elementos com relevo.
 * O botão e o nó da trilha têm uma borda inferior sólida mais escura que
 * some quando pressionados — é o que dá o "afunda ao tocar" sem sombra.
 */
export const sombraSolida = {
  /** on-primary-fixed-variant, o mesmo tom que o Stitch usa na borda de baixo. */
  primaria: '#930015',
  secundaria: '#004787',
  acerto: '#0b5c30',
  erro: '#93000a',
  neutra: '#dcd9d9',
} as const;

/** Espessura da borda inferior que dá o relevo. */
export const relevo = 4;

/**
 * Drop shadow dos elementos elevados.
 *
 * É o que substituiu o relevo sólido no botão: a mesma leitura de "isto
 * está acima da tela", sem a borda inferior escura. O par existe porque
 * a sombra também é a animação — ao pressionar ela encolhe e o botão
 * desce 1px, que é o que dá o toque físico agora.
 *
 * `elevation` é o que o Android lê; `shadow*` cobre iOS e web.
 */
export const sombra = {
  elevada: {
    shadowColor: '#1c1b1b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
  },
  pressionada: {
    shadowColor: '#1c1b1b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.14,
    shadowRadius: 2,
    elevation: 1,
  },
} as const;

/** Escala de espaçamento do Stitch. */
export const espaco = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 64,
} as const;

/** Raios do Stitch: 4 / 8 / 12 / pílula. */
export const raio = {
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

/**
 * Escala tipográfica do Stitch.
 * label-sm 12 · label-bold 14 · body-md 16 · body-lg 18 ·
 * headline-md 24 · headline-lg-mobile 28 · headline-lg 32 · headline-xl 48
 */
export const fonte = {
  pequena: 12,
  rotulo: 14,
  corpo: 16,
  subtitulo: 18,
  titulo: 24,
  tituloGrande: 28,
  gigante: 32,
  heroi: 48,
} as const;

/** Altura de linha correspondente a cada tamanho. */
export const linha = {
  pequena: 16,
  rotulo: 20,
  corpo: 24,
  subtitulo: 28,
  titulo: 32,
  tituloGrande: 36,
  gigante: 40,
  heroi: 56,
} as const;

/** Tracking: títulos apertam, rótulos abrem. */
export const tracking = {
  titulo: -0.3,
  heroi: -0.9,
  rotulo: 0.3,
  rotuloPequeno: 0.12,
} as const;

/**
 * Peso da fonte vem por FAMÍLIA, não por `fontWeight`.
 * Cada peso da Nunito Sans é um arquivo separado: no nativo,
 * `fontWeight: '700'` sobre a família Regular não engrossa nada — só a
 * família certa engrossa. Use sempre `fontFamily: familia.X`.
 */
export const familia = {
  normal: 'NunitoSans_400Regular',
  medio: 'NunitoSans_600SemiBold',
  forte: 'NunitoSans_700Bold',
  extraForte: 'NunitoSans_800ExtraBold',
} as const;

/**
 * compacto: celular, nav inferior.
 * medio:    tablet / janela estreita.
 * largo:    web larga, nav lateral permanente.
 */
export const breakpoints = {
  medio: 720,
  largo: 1080,
} as const;

/** Largura máxima de coluna de leitura — evita linha longa demais na web. */
export const larguraMaximaConteudo = 720;

/** Largura da navegação lateral quando ela é permanente. */
export const larguraNavLateral = 260;
