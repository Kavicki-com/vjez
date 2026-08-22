import { Platform } from 'react-native';

import { diaLocal } from '@/features/ofensiva/regras';

/**
 * O progresso do convidado atravessando o login.
 *
 * POR QUE ISTO EXISTE — e por que dobra a regra 5 do CLAUDE.md.
 *
 * `signInWithOAuth` na web não abre modal: ele troca a página inteira pelo
 * Google e volta num carregamento novo, em `/app/`. O `ProgressoLocal` vive
 * em memória (justamente por causa da regra 5), então nesse ida-e-volta o
 * React remonta zerado: `temProgresso` vira `false`, a `MigracaoDeProgresso`
 * não acha nada para levar, e o convidado que acabou de fazer a Lição 1
 * chega na conta sem nota, sem tentativas e — o sintoma que aparece na
 * trilha — sem ofensiva.
 *
 * A regra 5 proíbe storage do navegador na LÓGICA DE PRODUÇÃO: o estado do
 * app não pode morar no navegador, tem que morar no app e no Supabase. Isso
 * continua valendo. O que fica aqui não é estado: é uma encomenda de mão
 * única, escrita no instante em que o aluno toca em "Entrar" e apagada no
 * instante em que o Supabase confirma o recebimento. Vive segundos, some
 * quando a aba fecha, e nada no app lê daqui para desenhar tela.
 *
 * `sessionStorage` e não `localStorage` de propósito: se a migração falhar
 * de um jeito que nem o `finally` alcance, a sobra morre com a aba em vez
 * de assombrar a próxima visita.
 */

const CHAVE = 'vjez:travessia-do-convidado';

export type Travessia = {
  notas: Record<string, number>;
  tentativas: Record<string, { acertou: boolean; moduloId: string }>;
  checkpoints: Record<string, boolean>;
  /**
   * O dia em que o convidado estudou, carimbado na IDA.
   *
   * Se fosse lido na volta, um login começado às 23h59 e concluído às 00h01
   * registraria a ofensiva no dia seguinte — o aluno perderia o dia que
   * acabou de cumprir.
   */
  dia: string;
};

/** sessionStorage não existe no nativo e explode em Safari privado. */
function cofre(): Storage | null {
  if (Platform.OS !== 'web') return null;
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null;
  }
}

/** Chamado logo antes de sair para o Google. */
export function guardarTravessia(
  carga: Omit<Travessia, 'dia'>,
): void {
  const s = cofre();
  if (!s) return;
  try {
    s.setItem(CHAVE, JSON.stringify({ ...carga, dia: diaLocal() }));
  } catch {
    // Cota cheia ou storage bloqueado: o login segue mesmo assim. Perder a
    // travessia é ruim; travar o login por causa dela seria pior.
  }
}

/** Chamado quando a sessão aparece, do outro lado do redirect. */
export function lerTravessia(): Travessia | null {
  const s = cofre();
  if (!s) return null;
  try {
    const bruto = s.getItem(CHAVE);
    if (!bruto) return null;
    const dado = JSON.parse(bruto) as Travessia;
    // Guarda contra lixo de uma versão anterior do formato.
    if (!dado || typeof dado !== 'object' || typeof dado.dia !== 'string') {
      return null;
    }
    return {
      notas: dado.notas ?? {},
      tentativas: dado.tentativas ?? {},
      checkpoints: dado.checkpoints ?? {},
      dia: dado.dia,
    };
  } catch {
    return null;
  }
}

export function limparTravessia(): void {
  const s = cofre();
  if (!s) return;
  try {
    s.removeItem(CHAVE);
  } catch {
    // Nada a fazer: a aba fechando resolve.
  }
}
