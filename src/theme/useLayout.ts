import { useWindowDimensions } from 'react-native';

import { breakpoints } from './tokens';

export type Tamanho = 'compacto' | 'medio' | 'largo';

export type Layout = {
  tamanho: Tamanho;
  /** Celular: navegação na barra inferior. */
  compacto: boolean;
  /** Tablet / janela estreita. */
  medio: boolean;
  /** Web larga: navegação lateral permanente, sem barra inferior. */
  largo: boolean;
  largura: number;
};

/**
 * Decide a forma da navegação a partir da largura da janela.
 * Regra 4 do CLAUDE.md: responsivo por composição, sem posição fixa em px.
 */
export function useLayout(): Layout {
  const { width } = useWindowDimensions();
  const tamanho: Tamanho =
    width >= breakpoints.largo
      ? 'largo'
      : width >= breakpoints.medio
        ? 'medio'
        : 'compacto';

  return {
    tamanho,
    compacto: tamanho === 'compacto',
    medio: tamanho === 'medio',
    largo: tamanho === 'largo',
    largura: width,
  };
}
