import { useQuery } from '@tanstack/react-query';

import {
  buscarExpressoes,
  buscarLetras,
  buscarNumeros,
  buscarPalavras,
} from './api';

/** Conteúdo curado muda pouco: vale manter em cache por bastante tempo. */
const UMA_HORA = 60 * 60 * 1000;

export function useLetras() {
  return useQuery({
    queryKey: ['letras'],
    queryFn: buscarLetras,
    staleTime: UMA_HORA,
  });
}

export function useNumeros() {
  return useQuery({
    queryKey: ['numeros'],
    queryFn: buscarNumeros,
    staleTime: UMA_HORA,
  });
}

export function useExpressoes() {
  return useQuery({
    queryKey: ['expressoes'],
    queryFn: buscarExpressoes,
    staleTime: UMA_HORA,
  });
}

export function usePalavras(termo: string) {
  return useQuery({
    queryKey: ['palavras', termo.trim()],
    queryFn: () => buscarPalavras(termo),
    staleTime: UMA_HORA,
    // Mantém a lista anterior na tela enquanto a busca nova não chega.
    placeholderData: (anterior) => anterior,
  });
}
