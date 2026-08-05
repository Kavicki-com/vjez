import { useQuery } from '@tanstack/react-query';

import { buscarPerfil, buscarProgressoLicoes } from './api';

export function usePerfil() {
  return useQuery({ queryKey: ['perfil'], queryFn: buscarPerfil });
}

export function useProgressoLicoes() {
  return useQuery({
    queryKey: ['progresso-licoes'],
    queryFn: buscarProgressoLicoes,
  });
}
