/**
 * Leitura da camada basal (aba Dicionário) do Supabase.
 * Todo o conteúdo vem do banco — nada embutido no bundle (regra 2).
 */

import {
  paraFrase,
  paraLetra,
  paraLexItem,
  paraNumero,
} from '@/lib/mapeadores';
import { supabase } from '@/lib/supabase';
import type { Frase, Letra, LexItem, Numero } from '@/types/schema';

export async function buscarLetras(): Promise<Letra[]> {
  const { data, error } = await supabase
    .from('letras')
    .select('*')
    .order('ordem');
  if (error) throw error;
  return data.map(paraLetra);
}

export async function buscarNumeros(): Promise<Numero[]> {
  const { data, error } = await supabase
    .from('numeros')
    .select('*')
    .order('valor');
  if (error) throw error;
  return data.map(paraNumero);
}

export async function buscarExpressoes(): Promise<Frase[]> {
  const { data, error } = await supabase.from('frases').select('*').order('hr');
  if (error) throw error;
  return data.map(paraFrase);
}

/**
 * Dicionário PT <-> HR. Sem termo, devolve tudo em ordem alfabética
 * (o conjunto é pequeno e cabe no cache).
 *
 * Vai por RPC porque a busca precisa ignorar acento dos dois lados —
 * "agua" tem que achar "água" e "zena" tem que achar "žena". O PostgREST
 * não chama unaccent() num filtro ilike, então quem faz isso é a função
 * buscar_lex_items no banco (que roda sob a RLS do chamador).
 */
export async function buscarPalavras(termo: string): Promise<LexItem[]> {
  const { data, error } = await supabase.rpc('buscar_lex_items', {
    termo: termo.trim(),
  });
  if (error) throw error;
  return data.map(paraLexItem);
}

/** Agrupa por categoria preservando a ordem alfabética dentro de cada uma. */
export function agruparPorCategoria(
  itens: LexItem[],
): { categoria: string; itens: LexItem[] }[] {
  const mapa = new Map<string, LexItem[]>();
  for (const item of itens) {
    const grupo = mapa.get(item.categoria);
    if (grupo) grupo.push(item);
    else mapa.set(item.categoria, [item]);
  }
  return [...mapa.entries()]
    .map(([categoria, itens]) => ({ categoria, itens }))
    .sort((a, b) => a.categoria.localeCompare(b.categoria, 'pt-BR'));
}
