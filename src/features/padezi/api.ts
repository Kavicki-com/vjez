/**
 * Quadro dos 7 casos (item Padeži do menu lateral).
 * Conteúdo curado, vindo do Supabase como todo o resto (regra 2).
 */

import { paraCasoPadez, paraTerminacaoPadez } from '@/lib/mapeadores';
import { supabase } from '@/lib/supabase';
import type { CasoPadez } from '@/types/schema';

/**
 * Cada caso já vem com a grade de terminações embutida numa consulta só
 * (padezi + padez_terminacoes pela FK): são 7 linhas e 42 terminações, e
 * separar em duas idas ao servidor só faria a grade aparecer depois do
 * cartão.
 */
export async function buscarPadezi(): Promise<CasoPadez[]> {
  const { data, error } = await supabase
    .from('padezi')
    .select('*, padez_terminacoes(*)')
    .order('numero');
  if (error) throw error;
  return data.map((linha) =>
    paraCasoPadez(linha, linha.padez_terminacoes.map(paraTerminacaoPadez)),
  );
}
