import type { Ionicons } from '@expo/vector-icons';

import type { ModuloNaTrilha } from '@/features/trilha/estado';
import { NOTA_MAXIMA_LICAO } from '@/lib/regras';

export type Conquista = {
  id: string;
  titulo: string;
  descricao: string;
  icone: keyof typeof Ionicons.glyphMap;
  atual: number;
  meta: number;
  concluida: boolean;
};

type Entrada = {
  licoesConcluidas: number;
  diasDeOfensiva: number;
  trilha: ModuloNaTrilha[];
  /** Melhor nota obtida em qualquer lição. */
  melhorNota: number;
};

/**
 * Conquistas derivadas do progresso real — não há tabela de conquistas.
 *
 * São regra de produto, como as constantes de @/lib/regras: nascem de
 * contadores que já existem, então não dependem de curadoria e não podem
 * ficar dessincronizadas do que o aluno fez.
 *
 * São oito de propósito: a grade mostra 4 por linha em tela larga e 2 no
 * celular, então oito fecha as linhas nos dois casos.
 */
export function calcularConquistas(entrada: Entrada): Conquista[] {
  const { licoesConcluidas, diasDeOfensiva, trilha, melhorNota } = entrada;

  const alfabeto = trilha.find((m) => m.ordem === 1);
  const checkpointsPassados = trilha.filter((m) => m.checkpointPassado).length;
  const casosVencidos = trilha.filter(
    (m) => m.padez !== null && m.checkpointPassado,
  ).length;
  const totalDeLicoes = trilha.reduce((n, m) => n + m.total, 0);

  const conquistas: Conquista[] = [
    {
      id: 'primeiros-passos',
      titulo: 'Primeiros passos',
      descricao: 'Conclua sua primeira lição.',
      icone: 'footsteps',
      atual: Math.min(licoesConcluidas, 1),
      meta: 1,
      concluida: licoesConcluidas >= 1,
    },
    {
      id: 'nota-cheia',
      titulo: 'Nota cheia',
      descricao: `Tire ${NOTA_MAXIMA_LICAO} em uma lição.`,
      icone: 'star',
      atual: Math.min(Math.floor(melhorNota), NOTA_MAXIMA_LICAO),
      meta: NOTA_MAXIMA_LICAO,
      concluida: melhorNota >= NOTA_MAXIMA_LICAO,
    },
    {
      id: 'alfabeto',
      titulo: 'Alfabeto',
      descricao: 'Termine as lições de Alfabeto e sons.',
      icone: 'text',
      atual: alfabeto?.concluidas ?? 0,
      meta: Math.max(alfabeto?.total ?? 0, 1),
      concluida: Boolean(
        alfabeto && alfabeto.total > 0 && alfabeto.concluidas >= alfabeto.total,
      ),
    },
    {
      id: 'primeiro-checkpoint',
      titulo: 'Primeira prova',
      descricao: 'Passe em um checkpoint.',
      icone: 'ribbon',
      atual: Math.min(checkpointsPassados, 1),
      meta: 1,
      concluida: checkpointsPassados >= 1,
    },
    {
      id: 'meia-duzia',
      titulo: 'Meia dúzia',
      descricao: 'Conclua 6 lições.',
      icone: 'library',
      atual: Math.min(licoesConcluidas, 6),
      meta: 6,
      concluida: licoesConcluidas >= 6,
    },
    {
      id: 'constante',
      titulo: 'Constante',
      descricao: 'Estude 7 dias seguidos.',
      icone: 'flame',
      atual: Math.min(diasDeOfensiva, 7),
      meta: 7,
      concluida: diasDeOfensiva >= 7,
    },
    {
      id: 'sete-casos',
      titulo: 'Sete casos',
      descricao: 'Passe nos checkpoints dos 7 padeži.',
      icone: 'school',
      atual: Math.min(casosVencidos, 7),
      meta: 7,
      concluida: casosVencidos >= 7,
    },
    {
      id: 'trilha-inteira',
      titulo: 'Trilha inteira',
      descricao: 'Conclua todas as lições da trilha.',
      icone: 'trophy',
      atual: licoesConcluidas,
      meta: Math.max(totalDeLicoes, 1),
      concluida: totalDeLicoes > 0 && licoesConcluidas >= totalDeLicoes,
    },
  ];

  // As ganhas sobem; entre as pendentes, as mais perto de fechar vêm antes.
  return conquistas.sort((a, b) => {
    if (a.concluida !== b.concluida) return a.concluida ? -1 : 1;
    return b.atual / b.meta - a.atual / a.meta;
  });
}
