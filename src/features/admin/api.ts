import { supabase } from '@/lib/supabase';
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database';

/**
 * Acesso do CMS ao conteúdo.
 *
 * DIFERENTE do resto do app de propósito: aqui as consultas devolvem a
 * LINHA CRUA do Postgres (snake_case), não a forma de domínio de
 * @/types/schema. O app lê conteúdo; o CMS edita a tabela. Passar pelos
 * mapeadores obrigaria a desmapear na hora de salvar, e cada volta dessas
 * é uma chance de perder um campo que o editor não conhecia.
 *
 * Quem autoriza a escrita é a RLS, não esta camada: as policies
 * "curador insere/edita/apaga conteudo" (migration
 * rls_escrita_de_conteudo_por_curador) chamam `e_curador()` no banco. Se
 * alguém chamar isto sem papel, o Postgres recusa. O portão da interface é
 * cortesia; a tranca é lá.
 */

export type LicaoDoCms = Tables<'licoes'>;
export type AtividadeDoCms = Tables<'atividades'>;
export type ExercicioDoCms = Tables<'exercicios'>;

export type ModuloComLicoes = Tables<'modulos'> & {
  licoes: Pick<LicaoDoCms, 'id' | 'ordem' | 'titulo_pt'>[];
};

export type LicaoCompleta = LicaoDoCms & {
  modulo: Pick<Tables<'modulos'>, 'id' | 'ordem' | 'tema_pt'> | null;
  atividades: (AtividadeDoCms & { exercicios: ExercicioDoCms[] })[];
};

const porOrdem = <T extends { ordem: number }>(a: T, b: T) => a.ordem - b.ordem;

/**
 * A trilha inteira, com as lições de cada módulo.
 *
 * Duas consultas e a junção em memória, em vez de um join aninhado: são
 * algumas dezenas de linhas no total, e assim a ordenação de cada nível
 * fica explícita aqui — o PostgREST só ordena o nível de cima.
 */
export async function listarModulosDoCms(): Promise<ModuloComLicoes[]> {
  const [modulos, licoes] = await Promise.all([
    supabase.from('modulos').select('*'),
    supabase.from('licoes').select('id, ordem, titulo_pt, modulo_id'),
  ]);
  if (modulos.error) throw modulos.error;
  if (licoes.error) throw licoes.error;

  return modulos.data
    .map((modulo) => ({
      ...modulo,
      licoes: licoes.data
        .filter((l) => l.modulo_id === modulo.id)
        .sort(porOrdem)
        .map(({ id, ordem, titulo_pt }) => ({ id, ordem, titulo_pt })),
    }))
    .sort(porOrdem);
}

/** Uma lição com tudo que pende dela: atividades e exercícios. */
export async function buscarLicaoDoCms(id: string): Promise<LicaoCompleta> {
  const { data, error } = await supabase
    .from('licoes')
    .select(
      '*, modulo:modulos(id, ordem, tema_pt), atividades(*, exercicios(*))',
    )
    .eq('id', id)
    .single();
  if (error) throw error;

  // O PostgREST não ordena o segundo nível de aninhamento, então a ordem
  // das atividades e dos exercícios sai daqui.
  const atividades = (data.atividades ?? [])
    .map((a) => ({ ...a, exercicios: [...(a.exercicios ?? [])].sort(porOrdem) }))
    .sort(porOrdem);

  return { ...data, atividades };
}

export async function salvarExercicio(
  id: string,
  campos: TablesUpdate<'exercicios'>,
): Promise<void> {
  const { error } = await supabase.from('exercicios').update(campos).eq('id', id);
  if (error) throw error;
}

export async function criarExercicio(
  novo: TablesInsert<'exercicios'>,
): Promise<ExercicioDoCms> {
  const { data, error } = await supabase
    .from('exercicios')
    .insert(novo)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function apagarExercicio(id: string): Promise<void> {
  const { error } = await supabase.from('exercicios').delete().eq('id', id);
  if (error) throw error;
}

// A forma do `dados` de cada tipo — como nasce, como se valida e como se
// edita — mora em ./tiposDeExercicio. O banco confere por CHECK
// (`exercicios_dados_por_tipo`), então salvamento malformado volta como
// erro do Postgres em vez de virar exercício quebrado na trilha.
