import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

/**
 * Sessão atual. `carregando` distingue "ainda não sei" de "não tem sessão" —
 * sem isso o portão de login pisca na tela de quem já está logado.
 */
export function useSessao() {
  const [sessao, setSessao] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);
  const cliente = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setCarregando(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_evento, nova) => {
      setSessao(nova);
      setCarregando(false);
      // Perfil e progresso mudam de dono junto com a sessão.
      void cliente.invalidateQueries({ queryKey: ['perfil'] });
      void cliente.invalidateQueries({ queryKey: ['progresso-licoes'] });
    });

    return () => data.subscription.unsubscribe();
  }, [cliente]);

  return { sessao, carregando, autenticado: Boolean(sessao) };
}
