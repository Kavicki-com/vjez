import { useQuery } from '@tanstack/react-query';

import { buscarLicao, buscarTrilha } from './api';

const UMA_HORA = 60 * 60 * 1000;

export function useTrilha() {
  return useQuery({
    queryKey: ['trilha'],
    queryFn: buscarTrilha,
    staleTime: UMA_HORA,
  });
}

export function useLicao(licaoId: string | undefined) {
  return useQuery({
    queryKey: ['licao', licaoId],
    queryFn: () => buscarLicao(licaoId!),
    enabled: Boolean(licaoId),
    staleTime: UMA_HORA,
  });
}
