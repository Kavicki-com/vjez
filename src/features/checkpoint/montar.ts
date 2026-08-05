import type { Exercicio } from '@/types/schema';

/**
 * Monta o checkpoint em runtime, priorizando o que o aluno errou.
 *
 * Regra do CLAUDE.md: "amostra dos exercícios do módulo, priorizando erros
 * (TentativaExercicio)". Não existe lista fixa — cada tentativa sorteia de
 * novo, então refazer não devolve exatamente a mesma prova.
 *
 * A ordem é: primeiro os errados, depois os nunca tentados, e só então os
 * já acertados. Os nunca tentados vêm antes dos acertados de propósito:
 * conteúdo que o aluno nunca viu mede mais do que conteúdo que ele já
 * mostrou dominar.
 */
export function montarCheckpoint(
  exercicios: Exercicio[],
  /** ids que o aluno errou na última tentativa */
  errados: ReadonlySet<string>,
  /** ids que o aluno já acertou alguma vez */
  acertados: ReadonlySet<string>,
  tamanho: number,
  embaralhar: <T>(itens: T[]) => T[] = embaralharAleatorio,
): Exercicio[] {
  const erro: Exercicio[] = [];
  const inedito: Exercicio[] = [];
  const dominado: Exercicio[] = [];

  for (const ex of exercicios) {
    if (errados.has(ex.id)) erro.push(ex);
    else if (acertados.has(ex.id)) dominado.push(ex);
    else inedito.push(ex);
  }

  // Embaralha dentro de cada faixa: a prioridade entre faixas é a regra,
  // mas dentro da faixa não há motivo para a ordem ser sempre a mesma.
  const escolhidos = [
    ...embaralhar(erro),
    ...embaralhar(inedito),
    ...embaralhar(dominado),
  ].slice(0, tamanho);

  // A prova em si sai fora da ordem de prioridade — senão o aluno percebe
  // que os primeiros são justamente os que ele errou.
  return embaralhar(escolhidos);
}

function embaralharAleatorio<T>(itens: T[]): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Nota do checkpoint como fração de 0 a 1, pesada pelos `peso` dos
 * exercícios sorteados — um exercício que vale 2 pesa o dobro de um que
 * vale 1, igual acontece dentro da lição.
 */
export function notaDoCheckpoint(
  exercicios: Exercicio[],
  acertos: Record<string, boolean>,
): number {
  const total = exercicios.reduce((soma, ex) => soma + ex.peso, 0);
  if (total === 0) return 0;
  const ganho = exercicios.reduce(
    (soma, ex) => soma + (acertos[ex.id] ? ex.peso : 0),
    0,
  );
  return ganho / total;
}
