import { supabase } from '@/lib/supabase';

import { diaLocal } from './regras';

/**
 * Marca o dia de hoje como ativo. Chamado uma vez por lição concluída —
 * é a segunda chamada no mesmo dia que recupera uma ofensiva em risco.
 *
 * Convidado não tem linha em public.usuarios; a ofensiva dele só passa a
 * existir quando a conta existe (item 10).
 */
export async function registrarDiaAtivo(): Promise<void> {
  const { data: sessao } = await supabase.auth.getSession();
  if (!sessao.session) return;

  const { error } = await supabase.rpc('registrar_dia_ativo', {
    dia_local: diaLocal(),
  });
  if (error) console.warn('Não deu para registrar a ofensiva:', error.message);
}
