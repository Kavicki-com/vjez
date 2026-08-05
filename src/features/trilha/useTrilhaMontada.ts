import { useMemo } from 'react';

import { useProgressoModulos } from '@/features/checkpoint/hooks';
import { useTrilha } from '@/features/licao/hooks';
import { useProgressoLocal } from '@/features/perfil/ProgressoLocal';
import { usePerfil, useProgressoLicoes } from '@/features/perfil/hooks';
import type { ProgressoLicao } from '@/types/schema';

import { montarTrilha } from './estado';

/**
 * Trilha pronta para exibir, juntando servidor e sessão.
 *
 * As três telas que mostram progresso (Início, Perfil e a da unidade)
 * precisam da mesma combinação; duplicar isso convidava a divergirem.
 */
export function useTrilhaMontada() {
  const trilhaBruta = useTrilha();
  const { data: perfil } = usePerfil();
  const { data: progressoServidor } = useProgressoLicoes();
  const { data: progressoModulos } = useProgressoModulos();
  const { notas, checkpoints } = useProgressoLocal();

  const trilha = useMemo(() => {
    if (!trilhaBruta.data) return [];

    const local: ProgressoLicao[] = Object.entries(notas).map(
      ([licaoId, nota]) => ({
        usuarioId: perfil?.id ?? 'convidado',
        licaoId,
        nota,
        concluida: true,
        data: '',
      }),
    );

    const passados = new Set<string>([
      ...(progressoModulos ?? [])
        .filter((m) => m.checkpointPassado)
        .map((m) => m.moduloId),
      ...Object.entries(checkpoints)
        .filter(([, passou]) => passou)
        .map(([moduloId]) => moduloId),
    ]);

    return montarTrilha(
      trilhaBruta.data,
      [...(progressoServidor ?? []), ...local],
      passados,
    );
  }, [trilhaBruta.data, progressoServidor, progressoModulos, notas, checkpoints, perfil?.id]);

  return {
    trilha,
    isPending: trilhaBruta.isPending,
    isError: trilhaBruta.isError,
    notasDoServidor: progressoServidor ?? [],
    notasLocais: notas,
  };
}
