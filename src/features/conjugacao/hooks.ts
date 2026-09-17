import { useQuery } from '@tanstack/react-query';

import { buscarConjugacao } from './api';

/** Quadro de consulta: muda só quando a curadoria corrige alguma linha. */
const UMA_HORA = 60 * 60 * 1000;

export function useConjugacao() {
  return useQuery({
    queryKey: ['conjugacao'],
    queryFn: buscarConjugacao,
    staleTime: UMA_HORA,
  });
}
