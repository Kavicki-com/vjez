import type { Padez } from '@/types/schema';

/**
 * Nome do caso em HR (regra 1: só o alvo fica em croata) e a posição dele
 * na ordem canônica croata — que NÃO é alfabética nem a ordem em que o app
 * ensina. Gramática croata numera sempre assim, e é o número que aparece
 * em livro e em aula.
 */
const CASOS: Record<Padez, { nome: string; numero: number }> = {
  nominativ: { nome: 'Nominativ', numero: 1 },
  genitiv: { nome: 'Genitiv', numero: 2 },
  dativ: { nome: 'Dativ', numero: 3 },
  akuzativ: { nome: 'Akuzativ', numero: 4 },
  vokativ: { nome: 'Vokativ', numero: 5 },
  lokativ: { nome: 'Lokativ', numero: 6 },
  instrumental: { nome: 'Instrumental', numero: 7 },
};

export function nomeDoCaso(padez: Padez): string {
  return CASOS[padez].nome;
}

/** Ex.: "Lokativ · Padež 6" */
export function etiquetaDoCaso(padez: Padez): string {
  const { nome, numero } = CASOS[padez];
  return `${nome} · Padež ${numero}`;
}
