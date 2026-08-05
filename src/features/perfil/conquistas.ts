import type { Ionicons } from '@expo/vector-icons';

import type { ModuloNaTrilha } from '@/features/trilha/estado';

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
  modulosConcluidos: number;
  diasDeOfensiva: number;
  trilha: ModuloNaTrilha[];
};

/**
 * Conquistas derivadas do progresso real — não há tabela de conquistas.
 *
 * São regra de produto, como as constantes de @/lib/regras: nascem de
 * contadores que já existem, então não dependem de curadoria e não podem
 * ficar dessincronizadas do que o aluno fez.
 */
export function calcularConquistas(entrada: Entrada): Conquista[] {
  const { licoesConcluidas, modulosConcluidos, diasDeOfensiva, trilha } = entrada;

  const alfabeto = trilha.find((m) => m.ordem === 1);
  const licoesDoAlfabeto = alfabeto?.total ?? 0;
  const feitasNoAlfabeto = alfabeto?.concluidas ?? 0;

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
      id: 'alfabeto',
      titulo: 'Alfabeto dominado',
      descricao: 'Termine todas as lições de Alfabeto e sons.',
      icone: 'text',
      atual: feitasNoAlfabeto,
      meta: Math.max(licoesDoAlfabeto, 1),
      concluida: licoesDoAlfabeto > 0 && feitasNoAlfabeto >= licoesDoAlfabeto,
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
      id: 'explorador',
      titulo: 'Explorador',
      descricao: 'Conclua 3 módulos.',
      icone: 'map',
      atual: Math.min(modulosConcluidos, 3),
      meta: 3,
      concluida: modulosConcluidos >= 3,
    },
  ];

  // As conquistas já ganhas sobem, e as em andamento vêm antes das paradas.
  return conquistas.sort((a, b) => {
    if (a.concluida !== b.concluida) return a.concluida ? -1 : 1;
    return b.atual / b.meta - a.atual / a.meta;
  });
}
