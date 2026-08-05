import type { Exercicio } from '@/types/schema';

import type { Resposta } from '../correcao';

/** Contrato comum de todo template de exercício. */
export type PropsExercicio<T extends Exercicio = Exercicio> = {
  exercicio: T;
  resposta: Resposta | null;
  aoResponder: (resposta: Resposta) => void;
  /** Depois de verificar, a resposta não muda mais. */
  travado: boolean;
  /** Só existe depois de verificar. */
  acertou?: boolean;
};
