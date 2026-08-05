import { supabase } from '@/lib/supabase';
import type { Exercicio } from '@/types/schema';

/**
 * Registra a tentativa para alimentar o checkpoint (que prioriza erros)
 * e a analytics.
 *
 * Convidado não tem linha em public.usuarios, então não há o que gravar:
 * o progresso dele vive no estado do app até o login migrar (item 10).
 * Falha de rede aqui não pode derrubar a lição — o aluno continua.
 */
export async function registrarTentativa(params: {
  exercicio: Exercicio;
  moduloId: string;
  acertou: boolean;
  tentativas: number;
}): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const usuarioId = data.session?.user.id;
  if (!usuarioId) return;

  const { error } = await supabase.from('tentativas_exercicio').insert({
    usuario_id: usuarioId,
    exercicio_id: params.exercicio.id,
    modulo_id: params.moduloId,
    acertou: params.acertou,
    tentativas: params.tentativas,
  });
  if (error) console.warn('Não deu para registrar a tentativa:', error.message);
}

/** Grava a nota da lição. Mesma regra: sem conta, não há o que gravar. */
export async function registrarNota(params: {
  licaoId: string;
  nota: number;
}): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const usuarioId = data.session?.user.id;
  if (!usuarioId) return;

  const { error } = await supabase.from('progresso_licao').upsert(
    {
      usuario_id: usuarioId,
      licao_id: params.licaoId,
      nota: params.nota,
      concluida: true,
    },
    { onConflict: 'usuario_id,licao_id' },
  );
  if (error) console.warn('Não deu para registrar a nota:', error.message);
}
