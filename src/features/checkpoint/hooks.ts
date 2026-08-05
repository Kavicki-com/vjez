import { useQuery } from '@tanstack/react-query';

import {
  buscarHistoricoDoModulo,
  buscarModuloParaCheckpoint,
  buscarProgressoModulos,
} from './api';

export function useModuloParaCheckpoint(moduloId: string | undefined) {
  return useQuery({
    queryKey: ['checkpoint-modulo', moduloId],
    queryFn: () => buscarModuloParaCheckpoint(moduloId!),
    enabled: Boolean(moduloId),
    staleTime: 60 * 60 * 1000,
  });
}

export function useHistoricoDoModulo(moduloId: string | undefined) {
  return useQuery({
    queryKey: ['historico-modulo', moduloId],
    queryFn: () => buscarHistoricoDoModulo(moduloId!),
    enabled: Boolean(moduloId),
    // Histórico de erro muda a cada exercício: não vale guardar.
    staleTime: 0,
  });
}

export function useProgressoModulos() {
  return useQuery({
    queryKey: ['progresso-modulos'],
    queryFn: buscarProgressoModulos,
  });
}
