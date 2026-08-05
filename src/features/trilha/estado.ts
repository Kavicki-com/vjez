import type { ModuloResumo } from '@/features/licao/api';
import type { ProgressoLicao } from '@/types/schema';

export type EstadoModulo = 'concluido' | 'atual' | 'bloqueado';

export type ModuloNaTrilha = ModuloResumo & {
  estado: EstadoModulo;
  concluidas: number;
  total: number;
  /** Lição para abrir ao tocar no nó: a primeira ainda não concluída. */
  proximaLicaoId: string | null;
};

/**
 * Estado de cada módulo na trilha.
 *
 * O módulo atual é o primeiro que ainda tem lição pendente. Módulos sem
 * lição nenhuma (curadoria em andamento) não podem ser "o atual", senão a
 * trilha travaria num nó vazio — eles ficam bloqueados até ganharem conteúdo.
 */
export function montarTrilha(
  modulos: ModuloResumo[],
  progresso: ProgressoLicao[],
): ModuloNaTrilha[] {
  const concluidas = new Set(
    progresso.filter((p) => p.concluida).map((p) => p.licaoId),
  );

  let achouAtual = false;

  return modulos.map((modulo) => {
    const total = modulo.licoes.length;
    const feitas = modulo.licoes.filter((l) => concluidas.has(l.id)).length;
    const pendente = modulo.licoes.find((l) => !concluidas.has(l.id)) ?? null;

    let estado: EstadoModulo;
    if (total > 0 && feitas === total) {
      estado = 'concluido';
    } else if (total > 0 && !achouAtual) {
      estado = 'atual';
      achouAtual = true;
    } else {
      estado = 'bloqueado';
    }

    return {
      ...modulo,
      estado,
      concluidas: feitas,
      total,
      proximaLicaoId: pendente?.id ?? modulo.licoes[0]?.id ?? null,
    };
  });
}
