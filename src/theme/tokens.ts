/**
 * Tokens visuais do Vjez.
 *
 * Cores amostradas dos assets de marca (assets/icon-new.png, splash-mobile.png)
 * e das telas do Figma — os três batem no vermelho #A30019.
 * Referência de layout = 390px; acima disso o layout expande por breakpoint.
 * Nada de px fixo em posição: só flex, %, e os espaçamentos daqui.
 */

export const cores = {
  /** Fundo da aplicação — off-white quente do Figma. */
  fundo: '#FCF9F8',
  /** Cartões e barras sobre o fundo. */
  superficie: '#FFFFFF',
  /** Preenchimento sutil: campos, estados inativos. */
  fundoSuave: '#F6F3F2',

  texto: '#1E1E1E',
  textoSuave: '#6B6462',
  borda: '#E5E2E1',

  /** Vermelho da marca (escudo do ícone). Ações primárias. */
  primaria: '#A30019',
  primariaSuave: '#F1DBD9',

  /** Azul da marca (fundo do ícone). Estado atual, ênfase secundária. */
  secundaria: '#1445A7',
  secundariaSuave: '#DDE5F5',

  acerto: '#0F7B3D',
  acertoSuave: '#DCF0E4',
  /** Vermelho vivo da bandeira — mais saturado que a primária. */
  erro: '#CE1126',
  erroSuave: '#FBDDE1',
  /** Ofensiva. */
  destaque: '#E8A33D',
} as const;

/**
 * Tons de baixo dos elementos com relevo.
 * O botão e o nó da trilha têm uma borda inferior sólida mais escura que
 * some quando pressionados — é o que dá o "afunda ao tocar" sem sombra.
 */
export const sombraSolida = {
  primaria: '#7A0013',
  secundaria: '#0E3479',
  acerto: '#0B5C2D',
  erro: '#9C0D1D',
  neutra: '#D5D0CE',
} as const;

/** Espessura da borda inferior que dá o relevo. */
export const relevo = 4;

export const espaco = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const raio = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const fonte = {
  pequena: 13,
  corpo: 16,
  subtitulo: 18,
  titulo: 24,
  gigante: 32,
} as const;

/**
 * Peso da fonte vem por FAMÍLIA, não por `fontWeight`.
 * Cada peso da Nunito é um arquivo separado: no nativo, `fontWeight: '700'`
 * sobre a família Regular não engrossa nada — só a família certa engrossa.
 * Use sempre `fontFamily: familia.X`.
 */
export const familia = {
  normal: 'Nunito_400Regular',
  medio: 'Nunito_600SemiBold',
  forte: 'Nunito_800ExtraBold',
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
