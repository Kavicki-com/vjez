import { paraExercicio } from '@/lib/mapeadores';
import { supabase } from '@/lib/supabase';
import type { Exercicio } from '@/types/schema';

export type ModuloParaCheckpoint = {
  id: string;
  tema_pt: string;
  ordem: number;
  notaMinima: number;
  tamanho: number;
  exercicios: Exercicio[];
};

/** Módulo com todos os seus exercícios e a configuração do checkpoint. */
export async function buscarModuloParaCheckpoint(
  moduloId: string,
): Promise<ModuloParaCheckpoint> {
  const { data, error } = await supabase
    .from('modulos')
    .select(
      'id, tema_pt, ordem, checkpoints(nota_minima, tamanho), licoes(atividades(exercicios(*)))',
    )
    .eq('id', moduloId)
    .single();
  if (error) throw error;

  const exercicios = (data.licoes ?? [])
    .flatMap((l) => l.atividades ?? [])
    .flatMap((a) => a.exercicios ?? [])
    // Produção livre não entra no checkpoint: ela pontua por participação e
    // depende de correção da IA, então não mede acerto e erro.
    .filter((e) => e.tipo !== 'producao_livre')
    .map(paraExercicio);

  const config = data.checkpoints;

  return {
    id: data.id,
    tema_pt: data.tema_pt,
    ordem: data.ordem,
    notaMinima: config ? Number(config.nota_minima) : 0.7,
    tamanho: config?.tamanho ?? 10,
    exercicios,
  };
}

export type HistoricoDoModulo = {
  errados: Set<string>;
  acertados: Set<string>;
};

/**
 * O que o aluno já errou e acertou neste módulo.
 * Convidado não tem histórico gravado — nesse caso o que vale é o estado
 * da sessão, somado por quem chama.
 */
export async function buscarHistoricoDoModulo(
  moduloId: string,
): Promise<HistoricoDoModulo> {
  const vazio = { errados: new Set<string>(), acertados: new Set<string>() };

  const { data: sessao } = await supabase.auth.getSession();
  const usuarioId = sessao.session?.user.id;
  if (!usuarioId) return vazio;

  const { data, error } = await supabase
    .from('tentativas_exercicio')
    .select('exercicio_id, acertou, data')
    .eq('usuario_id', usuarioId)
    .eq('modulo_id', moduloId)
    .order('data');
  if (error) throw error;

  // A última tentativa de cada exercício é a que conta: acertar depois de
  // errar tira o exercício da fila de prioridade.
  const ultimo = new Map<string, boolean>();
  for (const t of data) ultimo.set(t.exercicio_id, t.acertou);

  const errados = new Set<string>();
  const acertados = new Set<string>();
  for (const [id, acertou] of ultimo) {
    (acertou ? acertados : errados).add(id);
  }
  return { errados, acertados };
}

/** Marca o checkpoint como passado e destranca o módulo seguinte. */
export async function registrarCheckpoint(params: {
  moduloId: string;
  passou: boolean;
  moduloSeguinteId?: string;
}): Promise<void> {
  const { data: sessao } = await supabase.auth.getSession();
  const usuarioId = sessao.session?.user.id;
  if (!usuarioId) return;

  const linhas = [
    {
      usuario_id: usuarioId,
      modulo_id: params.moduloId,
      checkpoint_passado: params.passou,
      desbloqueado: true,
    },
  ];
  if (params.passou && params.moduloSeguinteId) {
    linhas.push({
      usuario_id: usuarioId,
      modulo_id: params.moduloSeguinteId,
      checkpoint_passado: false,
      desbloqueado: true,
    });
  }

  const { error } = await supabase
    .from('progresso_modulo')
    .upsert(linhas, { onConflict: 'usuario_id,modulo_id' });
  if (error) console.warn('Não deu para gravar o checkpoint:', error.message);
}

/** Módulos que o usuário já destravou ou cujo checkpoint já passou. */
export async function buscarProgressoModulos(): Promise<
  { moduloId: string; checkpointPassado: boolean; desbloqueado: boolean }[]
> {
  const { data: sessao } = await supabase.auth.getSession();
  const usuarioId = sessao.session?.user.id;
  if (!usuarioId) return [];

  const { data, error } = await supabase
    .from('progresso_modulo')
    .select('modulo_id, checkpoint_passado, desbloqueado')
    .eq('usuario_id', usuarioId);
  if (error) throw error;

  return data.map((m) => ({
    moduloId: m.modulo_id,
    checkpointPassado: m.checkpoint_passado,
    desbloqueado: m.desbloqueado,
  }));
}
