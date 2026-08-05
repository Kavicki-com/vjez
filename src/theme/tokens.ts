/**
 * Tokens visuais do Vjez.
 *
 * Paleta Material 3 vinda dos mockups do Stitch, que batem com o Figma e
 * com os assets de marca no vermelho #a30019.
 * Referência de layout = 390px; acima disso o layout expande por breakpoint.
 * Nada de px fixo em posição: só flex, %, e os espaçamentos daqui.
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
  /** outline-variant: a borda padrão dos cartões. */
  borda: '#e6bdba',

  /** Vermelho da marca. Ações primárias. */
  primaria: '#a30019',
  /** primary-container: vermelho vivo da bandeira, para selos e realces. */
  primariaContainer: '#ce1126',
  sobrePrimariaContainer: '#ffe0dd',
  /** primary-fixed: preenchimento claro. */
  primariaSuave: '#ffdad7',

  /** Azul do Stitch/Figma. Estado atual, ênfase secundária. */
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
