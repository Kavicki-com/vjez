import type { Ofensiva } from '@/types/schema';

/** Data local do aparelho no formato YYYY-MM-DD, sem passar por UTC. */
export function diaLocal(data = new Date()): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function diasEntre(de: string, ate: string): number {
  // Meio-dia UTC evita que horário de verão empurre a conta para o dia
  // vizinho ao subtrair.
  const a = Date.parse(`${de}T12:00:00Z`);
  const b = Date.parse(`${ate}T12:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/**
 * Estado real da ofensiva no momento da leitura.
 *
 * Zerar por inatividade é uma transição que acontece com o TEMPO, não com
 * um evento — ninguém "faz" nada no dia em que a ofensiva morre. Então o
 * valor guardado no banco fica velho sozinho, e quem exibe precisa avaliar
 * a data em vez de confiar no status gravado.
 */
export function avaliarOfensiva(
  ofensiva: Ofensiva | undefined,
  hoje = diaLocal(),
): { dias: number; status: Ofensiva['status'] } {
  if (!ofensiva?.ultimoDiaAtivo) return { dias: 0, status: 'zerada' };

  const gap = diasEntre(ofensiva.ultimoDiaAtivo, hoje);

  // Relógio do aparelho atrasado: confia no que está gravado.
  if (gap < 0) return { dias: ofensiva.diasSeguidos, status: ofensiva.status };

  // Estudou hoje ou ontem: vale o que o banco diz.
  if (gap <= 1) return { dias: ofensiva.diasSeguidos, status: ofensiva.status };

  // Faltou exatamente um dia: ainda dá para salvar estudando hoje.
  if (gap === 2) {
    return { dias: ofensiva.diasSeguidos, status: 'em_recuperacao' };
  }

  // Dois dias ou mais sem atividade.
  return { dias: 0, status: 'zerada' };
}

export const TEXTO_DA_OFENSIVA: Record<Ofensiva['status'], string> = {
  ativa: 'dias seguidos',
  em_recuperacao: 'faça mais uma lição hoje para salvar',
  zerada: 'comece uma ofensiva hoje',
};
