/**
 * Tokens visuais — PROVISÓRIOS.
 * Serão substituídos pelos valores do Figma (design/vjez).
 * Nada de px fixo em layout: use flex, %, e os espaçamentos daqui.
 */

export const cores = {
  fundo: '#FFFFFF',
  fundoSuave: '#F4F6FA',
  texto: '#12151C',
  textoSuave: '#5B6472',
  borda: '#E2E6EE',
  primaria: '#1E5AE8',
  primariaSuave: '#E6EDFD',
  acerto: '#12A150',
  erro: '#E0334B',
  destaque: '#F5A524',
} as const;

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
  corpo: 16,
  pequena: 13,
  titulo: 24,
  subtitulo: 18,
  gigante: 32,
} as const;

/** Referência do Figma = 390px. Acima disso, expandir o layout. */
export const breakpoints = {
  compacto: 0,
  medio: 720,
  largo: 1080,
} as const;
