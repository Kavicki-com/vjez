/**
 * Correção automática dos exercícios.
 *
 * Regra do CLAUDE.md: erro tira ponto, não bloqueia. A nota da lição é a
 * soma dos `peso` acertados, sobre 10.
 */

import type { Exercicio } from '@/types/schema';

/**
 * Normaliza para comparar resposta do aluno com a esperada.
 * Tira acento e diacrítico (kuca == kuća), caixa, pontuação de fim e
 * espaço repetido. O "đ" não se decompõe por NFD, então vai à mão.
 */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[.,!?;:]+$/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

/** O que o aluno respondeu, por tipo de exercício. */
export type Resposta =
  | { tipo: 'texto'; valor: string }
  | { tipo: 'opcao'; valor: string }
  | { tipo: 'tokens'; valor: string[] }
  | { tipo: 'pares'; valor: Record<string, string> }
  | { tipo: 'envio'; valor: string };

export type Veredito = {
  acertou: boolean;
  /** Forma certa, para o feedback de erro. */
  esperado?: string;
};

export function corrigir(exercicio: Exercicio, resposta: Resposta): Veredito {
  switch (exercicio.tipo) {
    case 'preencher_lacuna': {
      const dado = resposta.tipo === 'texto' ? resposta.valor : '';
      return {
        acertou: normalizar(dado) === normalizar(exercicio.resposta),
        esperado: exercicio.resposta,
      };
    }

    case 'escolher_forma': {
      const dado = resposta.tipo === 'opcao' ? resposta.valor : '';
      // Opção é escolhida numa lista, então a comparação é exata.
      return { acertou: dado === exercicio.resposta, esperado: exercicio.resposta };
    }

    case 'montar_frase': {
      const dado = resposta.tipo === 'tokens' ? resposta.valor.join(' ') : '';
      return {
        acertou: normalizar(dado) === normalizar(exercicio.alvo_hr),
        esperado: exercicio.alvo_hr,
      };
    }

    case 'ligar_pares': {
      const dado = resposta.tipo === 'pares' ? resposta.valor : {};
      const acertou = exercicio.pares.every((par) => dado[par.hr] === par.pt);
      return {
        acertou,
        esperado: exercicio.pares.map((p) => `${p.hr} → ${p.pt}`).join('\n'),
      };
    }

    case 'traducao': {
      // Checagem tolerante: acento e caixa não reprovam.
      const dado = resposta.tipo === 'texto' ? normalizar(resposta.valor) : '';
      const acertou = exercicio.respostas_aceitas.some(
        (aceita) => normalizar(aceita) === dado,
      );
      return { acertou, esperado: exercicio.respostas_aceitas[0] };
    }

    case 'producao_livre': {
      // Pontua por participação; a correção de conteúdo vem da IA depois.
      const dado = resposta.tipo === 'envio' ? resposta.valor.trim() : '';
      return { acertou: dado.length > 0 };
    }
  }
}

/** Nota da lição sobre 10: soma dos pesos acertados. */
export function calcularNota(
  exercicios: Exercicio[],
  acertos: Record<string, boolean>,
): number {
  const ganho = exercicios.reduce(
    (soma, ex) => soma + (acertos[ex.id] ? ex.peso : 0),
    0,
  );
  // Duas casas evitam ruído de ponto flutuante na soma dos pesos.
  return Math.round(ganho * 100) / 100;
}
