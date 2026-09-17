/**
 * Quadro das pessoas e dos tempos (item Konjugacija do menu lateral).
 * Conteúdo curado, vindo do Supabase como todo o resto (regra 2).
 */

import { paraFormaLice, paraPessoaVerbal, paraVerboModelo } from '@/lib/mapeadores';
import { supabase } from '@/lib/supabase';
import type { PessoaVerbal, VerboModelo } from '@/types/schema';

export interface QuadroConjugacao {
  /** As colunas, na ordem em que aparecem no quadro. */
  verbos: VerboModelo[];
  /** As seis pessoas, cada uma com as suas 12 células. */
  pessoas: PessoaVerbal[];
}

/**
 * Duas consultas em paralelo, e não um join: os verbos-modelo são as COLUNAS
 * do quadro e precisam existir mesmo nas pessoas que ainda não têm todas as
 * células preenchidas — senão a curadoria acrescenta um verbo novo e a
 * coluna some das linhas incompletas em vez de aparecer vazia.
 */
export async function buscarConjugacao(): Promise<QuadroConjugacao> {
  const [pessoas, verbos] = await Promise.all([
    supabase.from('lica').select('*, lice_formas(*)').order('numero'),
    supabase.from('verbos_modelo').select('*').order('ordem'),
  ]);

  if (pessoas.error) throw pessoas.error;
  if (verbos.error) throw verbos.error;

  return {
    verbos: verbos.data.map(paraVerboModelo),
    pessoas: pessoas.data.map((linha) =>
      paraPessoaVerbal(linha, linha.lice_formas.map(paraFormaLice)),
    ),
  };
}
