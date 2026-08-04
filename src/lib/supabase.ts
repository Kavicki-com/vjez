import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

import type { Database } from '@/types/database';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const chavePublica = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !chavePublica) {
  throw new Error(
    'Faltam EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copie .env.example para .env.',
  );
}

/**
 * A sessão de auth é a ÚNICA coisa que persiste fora do estado do app:
 * no nativo via AsyncStorage, na web via o storage padrão do supabase-js.
 * Progresso e conteúdo continuam em memória + Supabase (regra 5 do CLAUDE.md).
 */
export const supabase = createClient<Database>(url, chavePublica, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Só a web recebe a sessão de volta pela URL no fluxo OAuth.
    detectSessionInUrl: Platform.OS === 'web',
  },
});

/** URL pública de um MP3 no bucket `audio`. */
export function urlDoAudio(caminho: string): string {
  return supabase.storage.from('audio').getPublicUrl(caminho).data.publicUrl;
}
