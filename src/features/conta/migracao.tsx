import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { supabase } from '@/lib/supabase';
import { diaLocal } from '@/features/ofensiva/regras';
import { useProgressoLocal } from '@/features/perfil/ProgressoLocal';

import { useSessao } from './hooks';

/**
 * Leva o progresso do convidado para a conta assim que a sessão aparece.
 *
 * Fica montado na raiz porque o login pode acontecer em qualquer tela — no
 * portão do fim da Lição 1, na aba Perfil ou no drawer — e a migração não
 * pode depender de qual porta o aluno usou.
 */
export function MigracaoDeProgresso() {
  const { sessao } = useSessao();
  const { notas, tentativas, checkpoints, temProgresso, limpar } =
    useProgressoLocal();
  const cliente = useQueryClient();
  // A sessão muda de identidade a cada refresh de token; sem trava, a
  // migração rodaria de novo e duplicaria as tentativas.
  const migrando = useRef(false);

  useEffect(() => {
    if (!sessao || !temProgresso || migrando.current) return;
    migrando.current = true;

    const payload = {
      licoes: Object.entries(notas).map(([licao_id, nota]) => ({
        licao_id,
        nota,
      })),
      tentativas: Object.entries(tentativas).map(
        ([exercicio_id, { acertou, moduloId }]) => ({
          exercicio_id,
          modulo_id: moduloId,
          acertou,
        }),
      ),
      modulos: Object.entries(checkpoints).map(
        ([modulo_id, checkpoint_passado]) => ({
          modulo_id,
          checkpoint_passado,
        }),
      ),
      dia_local: diaLocal(),
    };

    void supabase
      .rpc('migrar_progresso', payload)
      .then(({ error }) => {
        if (error) {
          console.warn('Não deu para migrar o progresso:', error.message);
          // Libera para tentar de novo: o estado local segue intacto, então
          // nada se perde enquanto a migração não passa.
          migrando.current = false;
          return;
        }
        // Só limpa depois de gravado. Limpar antes perderia tudo se a
        // chamada falhasse.
        limpar();
        void cliente.invalidateQueries({ queryKey: ['perfil'] });
        void cliente.invalidateQueries({ queryKey: ['progresso-licoes'] });
        void cliente.invalidateQueries({ queryKey: ['progresso-modulos'] });
      });
  }, [sessao, temProgresso, notas, tentativas, checkpoints, limpar, cliente]);

  return null;
}
