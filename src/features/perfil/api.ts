import { paraUsuario } from '@/lib/mapeadores';
import { supabase } from '@/lib/supabase';
import type { ProgressoLicao, Usuario } from '@/types/schema';

/** Perfil do usuário logado. Convidado não tem linha, então devolve null. */
export async function buscarPerfil(): Promise<Usuario | null> {
  const { data: sessao } = await supabase.auth.getSession();
  const id = sessao.session?.user.id;
  if (!id) return null;

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? paraUsuario(data) : null;
}

/** Lições já concluídas. Vazio para convidado. */
export async function buscarProgressoLicoes(): Promise<ProgressoLicao[]> {
  const { data: sessao } = await supabase.auth.getSession();
  const id = sessao.session?.user.id;
  if (!id) return [];

  const { data, error } = await supabase
    .from('progresso_licao')
    .select('*')
    .eq('usuario_id', id);
  if (error) throw error;

  return data.map((l) => ({
    usuarioId: l.usuario_id,
    licaoId: l.licao_id,
    nota: Number(l.nota),
    concluida: l.concluida,
    data: l.data,
  }));
}
