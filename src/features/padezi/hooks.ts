import { useQuery } from '@tanstack/react-query';

import { buscarPadezi } from './api';

/** Quadro de consulta: muda só quando a curadoria corrige alguma linha. */
const UMA_HORA = 60 * 60 * 1000;

export function usePadezi() {
  return useQuery({
    queryKey: ['padezi'],
    queryFn: buscarPadezi,
    staleTime: UMA_HORA,
  });
}
