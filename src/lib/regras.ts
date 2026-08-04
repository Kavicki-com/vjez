/**
 * Constantes das mecânicas descritas no CLAUDE.md.
 * São regras do produto — não são conteúdo, então vivem no código.
 */

/** Toda lição vale /10 (soma dos `peso` acertados). */
export const NOTA_MAXIMA_LICAO = 10;

/** Checkpoint de fim de módulo: nota mínima 70%. */
export const CHECKPOINT_NOTA_MINIMA = 0.7;

/** Revisão geral acontece a cada 3 módulos. */
export const REVISAO_GERAL_A_CADA_MODULOS = 3;

/** Produção livre: teto de caracteres enviados ao corretor. */
export const MAX_CARACTERES_PRODUCAO_LIVRE = 400;

/** Ofensiva: 2 dias sem atividade → zerada. */
export const DIAS_SEM_ATIVIDADE_PARA_ZERAR = 2;

/** Portão de login aparece no fim desta lição (guest-first). */
export const ORDEM_LICAO_PORTAO_LOGIN = 1;

/** Ordem fixa das 3 atividades de cada lição (escada de dificuldade). */
export const ORDEM_ATIVIDADES = [
  'transformacao',
  'traducao',
  'producao_livre',
] as const;
