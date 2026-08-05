import type { Session } from '@supabase/supabase-js';

/**
 * Foto e nome vêm do provedor pelo `user_metadata` da sessão.
 *
 * Ficam fora do banco de propósito: assim a foto está sempre atual (trocar
 * no Google reflete no próximo login), não guardamos um dado pessoal a mais,
 * e não há coluna para dessincronizar. Se algum dia precisarmos da foto no
 * servidor, aí sim vira coluna em public.usuarios.
 *
 * A Apple não devolve foto — só nome, e apenas no primeiro login.
 */
export function fotoDaSessao(sessao: Session | null): string | undefined {
  const meta = sessao?.user.user_metadata;
  const url = meta?.avatar_url ?? meta?.picture;
  return typeof url === 'string' && url.length > 0 ? url : undefined;
}

export function nomeDaSessao(sessao: Session | null): string | undefined {
  const meta = sessao?.user.user_metadata;
  const nome = meta?.full_name ?? meta?.name;
  return typeof nome === 'string' && nome.length > 0 ? nome : undefined;
}
