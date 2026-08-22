import { useCallback } from 'react';

import { useProgressoLocal } from '@/features/perfil/ProgressoLocal';

import { entrarComGoogle } from './api';
import { guardarTravessia } from './travessia';

/**
 * Entrar com Google guardando antes o que o convidado fez.
 *
 * Toda tela que oferece login usa ISTO, e não o `entrarComGoogle` cru: na
 * web o login troca a página, e o que não estiver guardado antes de sair
 * não existe mais quando o aluno volta. Ver `travessia.ts`.
 */
export function useEntrarComGoogle(): () => Promise<void> {
  const { notas, tentativas, checkpoints, temProgresso } = useProgressoLocal();

  return useCallback(async () => {
    if (temProgresso) guardarTravessia({ notas, tentativas, checkpoints });
    await entrarComGoogle();
  }, [notas, tentativas, checkpoints, temProgresso]);
}
