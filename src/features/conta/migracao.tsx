import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { supabase } from '@/lib/supabase';
import { diaLocal } from '@/features/ofensiva/regras';
import { useProgressoLocal } from '@/features/perfil/ProgressoLocal';

import { useSessao } from './hooks';
import { lerTravessia, limparTravessia } from './travessia';

/**
 * Leva o progresso do convidado para a conta assim que a sessão aparece.
 *
 * Fica montado na raiz porque o login pode acontecer em qualquer tela — no
 * portão do fim da Lição 1, na aba Perfil ou no drawer — e a migração não
 * pode depender de qual porta o aluno usou.
 *
 * Duas fontes, somadas: o estado em memória (login sem recarregar a página)
 * e a travessia (login na web, que troca a página e apaga a memória). Quase
 * sempre só uma das duas tem algo; somar as duas é mais barato do que
 * decidir qual vale.
 */
export function MigracaoDeProgresso() {
  const { sessao } = useSessao();
  const { notas, tentativas, checkpoints, limpar } = useProgressoLocal();
  const cliente = useQueryClient();
  // A sessão muda de identidade a cada refresh de token; sem trava, a
  // migração rodaria de novo e duplicaria as tentativas.
  const migrando = useRef(false);

  useEffect(() => {
    if (!sessao || migrando.current) return;

    const travessia = lerTravessia();

    // O local vence o guardado: se os dois têm a mesma chave, o de memória
    // é o mais recente. Em tentativas isso também evita gravar duas linhas
    // de histórico para o mesmo exercício.
    const todasNotas = { ...travessia?.notas, ...notas };
    const todasTentativas = { ...travessia?.tentativas, ...tentativas };
    const todosCheckpoints = { ...travessia?.checkpoints, ...checkpoints };

    const temAlgo =
      Object.keys(todasNotas).length > 0 ||
      Object.keys(todasTentativas).length > 0 ||
      Object.keys(todosCheckpoints).length > 0;
    if (!temAlgo) return;

    migrando.current = true;

    const payload = {
      licoes: Object.entries(todasNotas).map(([licao_id, nota]) => ({
        licao_id,
        nota,
      })),
      tentativas: Object.entries(todasTentativas).map(
        ([exercicio_id, { acertou, moduloId }]) => ({
          exercicio_id,
          modulo_id: moduloId,
          acertou,
        }),
      ),
      modulos: Object.entries(todosCheckpoints).map(
        ([modulo_id, checkpoint_passado]) => ({
          modulo_id,
          checkpoint_passado,
        }),
      ),
      // O dia carimbado na ida vale mais que o de agora: é o dia em que o
      // aluno de fato estudou, e o login pode ter cruzado a meia-noite.
      dia_local: travessia?.dia ?? diaLocal(),
    };

    void supabase
      .rpc('migrar_progresso', payload)
      .then(({ error }) => {
        if (error) {
          console.warn('Não deu para migrar o progresso:', error.message);
          // Libera para tentar de novo: nem o estado local nem a travessia
          // são tocados, então nada se perde enquanto a migração não passa.
          migrando.current = false;
          return;
        }
        // Só limpa depois de gravado. Limpar antes perderia tudo se a
        // chamada falhasse.
        limpar();
        limparTravessia();
        void cliente.invalidateQueries({ queryKey: ['perfil'] });
        void cliente.invalidateQueries({ queryKey: ['progresso-licoes'] });
        void cliente.invalidateQueries({ queryKey: ['progresso-modulos'] });
      });
  }, [sessao, notas, tentativas, checkpoints, limpar, cliente]);

  return null;
}
