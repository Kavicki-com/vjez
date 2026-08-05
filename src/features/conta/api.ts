import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

/**
 * Login com Google.
 *
 * Na web o Supabase devolve a sessão pela URL (detectSessionInUrl liga isso).
 * No nativo o fluxo precisa de navegador do sistema + deep link `vjez://`,
 * e ainda depende dos Client IDs de iOS/Android — por isso segue bloqueado
 * com uma mensagem clara em vez de falhar sem explicação.
 */
export async function entrarComGoogle(): Promise<void> {
  if (Platform.OS !== 'web') {
    throw new Error(
      'O login no celular ainda não está configurado. Por enquanto, use o Vjez no navegador.',
    );
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function sair(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Exclusão de conta — exigida pela App Store.
 * Apagar de auth.users precisa de privilégio de admin, então quem faz isso
 * é uma Edge Function; aqui fica só o ponto de entrada.
 */
export async function excluirConta(): Promise<void> {
  const { error } = await supabase.functions.invoke('excluir-conta');
  if (error) throw error;
  await supabase.auth.signOut();
}
