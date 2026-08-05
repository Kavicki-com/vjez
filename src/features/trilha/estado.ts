import type { ModuloResumo } from '@/features/licao/api';
import type { ProgressoLicao } from '@/types/schema';

export type EstadoModulo = 'concluido' | 'atual' | 'bloqueado';

export type ModuloNaTrilha = ModuloResumo & {
  estado: EstadoModulo;
  concluidas: number;
  total: number;
  checkpointPassado: boolean;
  /** Todas as lições feitas: o checkpoint abre. */
  checkpointLiberado: boolean;
  /** Lição para abrir ao tocar no nó: a primeira ainda não concluída. */
  proximaLicaoId: string | null;
};

/**
 * Estado de cada módulo na trilha.
 *
 * O que destranca um módulo é o CHECKPOINT do anterior, não as lições dele
 * — é a regra do CLAUDE.md. Terminar as lições só libera a prova.
 *
 * Módulos sem lição nenhuma (curadoria em andamento) não podem ser "o
 * atual", senão a trilha travaria num nó vazio; e também não travam a fila,
 * porque exigir checkpoint de um módulo vazio deixaria o resto inalcançável
 * para sempre.
 */
export function montarTrilha(
  modulos: ModuloResumo[],
  progresso: ProgressoLicao[],
  checkpointsPassados: ReadonlySet<string> = new Set(),
): ModuloNaTrilha[] {
  const concluidas = new Set(
    progresso.filter((p) => p.concluida).map((p) => p.licaoId),
  );

  let anteriorLiberaSeguinte = true;
  let achouAtual = false;

  return modulos.map((modulo) => {
    const total = modulo.licoes.length;
    const feitas = modulo.licoes.filter((l) => concluidas.has(l.id)).length;
    const pendente = modulo.licoes.find((l) => !concluidas.has(l.id)) ?? null;

    const desbloqueado = anteriorLiberaSeguinte;
    const checkpointPassado = checkpointsPassados.has(modulo.id);
    const checkpointLiberado = total > 0 && feitas === total;

    let estado: EstadoModulo;
    if (!desbloqueado || total === 0) {
      estado = 'bloqueado';
    } else if (checkpointPassado) {
      estado = 'concluido';
    } else if (!achouAtual) {
      estado = 'atual';
      achouAtual = true;
    } else {
      estado = 'bloqueado';
    }

    // Módulo sem conteúdo é atravessado: exigir o checkpoint dele deixaria
    // tudo o que vem depois inalcançável enquanto a curadoria não chega.
    anteriorLiberaSeguinte = total === 0 ? desbloqueado : checkpointPassado;

    return {
      ...modulo,
      estado,
      concluidas: feitas,
      total,
      checkpointPassado,
      checkpointLiberado,
      proximaLicaoId: pendente?.id ?? modulo.licoes[0]?.id ?? null,
    };
  });
}
