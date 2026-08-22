import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { usePerfil } from '@/features/perfil/hooks';
import type { TablesInsert, TablesUpdate } from '@/types/database';

import {
  apagarExercicio,
  buscarLicaoDoCms,
  criarExercicio,
  listarModulosDoCms,
  salvarExercicio,
} from './api';

/**
 * O papel decide o que a interface mostra — nunca o que o banco aceita.
 * Quem tranca a escrita é a RLS (`e_curador()`); aqui só evitamos oferecer
 * um botão que iria falhar.
 */
export function useEhCurador(): { ehCurador: boolean; carregando: boolean } {
  const { data: perfil, isPending } = usePerfil();
  return {
    ehCurador: perfil?.papel === 'curador' || perfil?.papel === 'admin',
    carregando: isPending,
  };
}

export function useModulosDoCms() {
  return useQuery({
    queryKey: ['cms', 'modulos'],
    queryFn: listarModulosDoCms,
  });
}

export function useLicaoDoCms(id: string) {
  return useQuery({
    queryKey: ['cms', 'licao', id],
    queryFn: () => buscarLicaoDoCms(id),
    enabled: Boolean(id),
  });
}

/**
 * As três escritas de exercício, com a mesma invalidação.
 *
 * `licaoId` viaja como parâmetro do hook e não do mutate porque é ele que
 * diz QUAL consulta recarregar — e quem chama sempre está dentro de uma
 * lição. Invalidar a lista de módulos junto: mudar exercício muda a
 * contagem que aparece lá.
 */
export function useEscritaDeExercicio(licaoId: string) {
  const cliente = useQueryClient();

  const recarregar = () => {
    void cliente.invalidateQueries({ queryKey: ['cms', 'licao', licaoId] });
    void cliente.invalidateQueries({ queryKey: ['cms', 'modulos'] });
    // O aluno lê o mesmo conteúdo por outras chaves; sem isto, a edição só
    // apareceria depois de recarregar o app. `['licao']` sem o id casa por
    // prefixo e alcança todas as lições em cache.
    void cliente.invalidateQueries({ queryKey: ['licao'] });
    void cliente.invalidateQueries({ queryKey: ['trilha'] });
    void cliente.invalidateQueries({ queryKey: ['checkpoint-modulo'] });
  };

  const salvar = useMutation({
    mutationFn: ({
      id,
      campos,
    }: {
      id: string;
      campos: TablesUpdate<'exercicios'>;
    }) => salvarExercicio(id, campos),
    onSuccess: recarregar,
  });

  const criar = useMutation({
    mutationFn: (novo: TablesInsert<'exercicios'>) => criarExercicio(novo),
    onSuccess: recarregar,
  });

  const apagar = useMutation({
    mutationFn: (id: string) => apagarExercicio(id),
    onSuccess: recarregar,
  });

  return { salvar, criar, apagar };
}
