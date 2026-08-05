/**
 * Leitura da trilha e das lições. Conteúdo vem todo do Supabase.
 */

import { paraExercicio } from '@/lib/mapeadores';
import { supabase } from '@/lib/supabase';
import { ORDEM_ATIVIDADES } from '@/lib/regras';
import type { Atividade, Exercicio, TipoAtividade } from '@/types/schema';

export type LicaoResumo = {
  id: string;
  titulo_pt: string;
  ordem: number;
};

export type ModuloResumo = {
  id: string;
  tema_pt: string;
  ordem: number;
  nivel: string;
  licoes: LicaoResumo[];
};

/** Trilha da tela Início: módulos em ordem, com as lições de cada um. */
export async function buscarTrilha(): Promise<ModuloResumo[]> {
  const { data, error } = await supabase
    .from('modulos')
    .select('id, tema_pt, ordem, nivel, licoes(id, titulo_pt, ordem)')
    .order('ordem')
    .order('ordem', { referencedTable: 'licoes' });
  if (error) throw error;

  return data.map((m) => ({
    id: m.id,
    tema_pt: m.tema_pt,
    ordem: m.ordem,
    nivel: m.nivel,
    licoes: m.licoes ?? [],
  }));
}

export type LicaoCompleta = {
  id: string;
  titulo_pt: string;
  ordem: number;
  moduloId: string;
  atividades: Atividade[];
  /** Todos os exercícios, na ordem em que aparecem. */
  exercicios: Exercicio[];
};

/**
 * Lição inteira: atividades na escada de dificuldade e seus exercícios.
 * A ordem das atividades é a do CLAUDE.md, não a do banco — se a curadoria
 * gravar `ordem` trocada, a escada continua valendo.
 */
export async function buscarLicao(licaoId: string): Promise<LicaoCompleta> {
  const { data, error } = await supabase
    .from('licoes')
    .select(
      'id, titulo_pt, ordem, modulo_id, atividades(id, tipo, titulo_pt, ordem, exercicios(*))',
    )
    .eq('id', licaoId)
    .single();
  if (error) throw error;

  const posicao = (tipo: TipoAtividade) => {
    const i = ORDEM_ATIVIDADES.indexOf(tipo);
    return i === -1 ? ORDEM_ATIVIDADES.length : i;
  };

  const atividades: Atividade[] = (data.atividades ?? [])
    .sort((a, b) => posicao(a.tipo) - posicao(b.tipo))
    .map((a) => ({
      id: a.id,
      tipo: a.tipo,
      titulo_pt: a.titulo_pt,
      exercicios: (a.exercicios ?? [])
        .sort((x, y) => x.ordem - y.ordem)
        .map(paraExercicio),
    }));

  return {
    id: data.id,
    titulo_pt: data.titulo_pt,
    ordem: data.ordem,
    moduloId: data.modulo_id,
    atividades,
    exercicios: atividades.flatMap((a) => a.exercicios),
  };
}
