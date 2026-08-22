/**
 * Correção da produção livre pela IA.
 *
 * Quem fala com o Gemini é a Edge Function `corrigir-producao-livre` — a
 * chave nunca chega ao cliente (regra 3 do CLAUDE.md), e o teto de uso só
 * vale alguma coisa decidido no servidor.
 */

import { supabase } from '@/lib/supabase';
import type { Correcao } from '@/types/schema';

/**
 * Resultado da tentativa. É união, e não exceção, porque falhar aqui é
 * normal e previsto — sem rede, sem conta, teto batido — e nenhum desses
 * casos pode derrubar a lição: o ponto de participação já foi dado.
 */
export type ResultadoCorrecao =
  | { estado: 'ok'; correcao: Correcao }
  | { estado: 'erro'; mensagem: string };

/** A função devolve snake_case (formato do banco); o app fala camelCase. */
type CorrecaoDoServidor = {
  autor: 'ia' | 'nativo';
  texto_corrigido_hr?: string;
  comentario_pt: string;
  criado_em: string;
};

const SEM_CONTA = 'Entre na sua conta para receber a correção.';
const GENERICO = 'Não deu para corrigir agora. Seu texto foi guardado.';

export async function corrigirProducaoLivre(params: {
  exercicioId: string;
  texto: string;
}): Promise<ResultadoCorrecao> {
  // Sem sessão nem tenta: o servidor recusaria de qualquer jeito, e a ida
  // até lá só adiaria a mensagem que o aluno já poderia estar lendo.
  const { data: sessao } = await supabase.auth.getSession();
  if (!sessao.session) return { estado: 'erro', mensagem: SEM_CONTA };

  const { data, error } = await supabase.functions.invoke<{
    correcao?: CorrecaoDoServidor;
    erro?: string;
  }>('corrigir-producao-livre', {
    body: { exercicioId: params.exercicioId, texto: params.texto.trim() },
  });

  if (error) {
    // O supabase-js embrulha status != 2xx em FunctionsHttpError e joga o
    // corpo para dentro de `context`. É de lá que sai a frase que o
    // servidor escreveu — "você já usou as correções de hoje" é bem mais
    // útil que "erro 429".
    const doServidor = await extrairMensagem(error);
    return { estado: 'erro', mensagem: doServidor ?? GENERICO };
  }

  if (!data?.correcao) {
    return { estado: 'erro', mensagem: data?.erro ?? GENERICO };
  }

  const bruta = data.correcao;
  return {
    estado: 'ok',
    correcao: {
      autor: bruta.autor,
      texto_corrigido_hr: bruta.texto_corrigido_hr,
      comentario_pt: bruta.comentario_pt,
      criadoEm: bruta.criado_em,
    },
  };
}

async function extrairMensagem(error: unknown): Promise<string | null> {
  const contexto = (error as { context?: unknown }).context;
  if (!(contexto instanceof Response)) return null;
  try {
    const corpo = await contexto.json();
    return typeof corpo?.erro === 'string' ? corpo.erro : null;
  } catch {
    return null;
  }
}
