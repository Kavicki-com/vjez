import type { ReactElement } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { normalizar } from '@/features/licao/correcao';
import {
  cores,
  espaco,
  familia,
  fonte,
  linha,
} from '@/theme/tokens';
import type { Json } from '@/types/database';
import type { TipoExercicio } from '@/types/schema';

import { Campo } from './Campo';
import { ListaDePares, ListaEditavel } from './ListaEditavel';

/**
 * Um editor por tipo de exercício.
 *
 * O `dados` de cada tipo é um jsonb com forma própria, garantida no banco
 * pelo CHECK `exercicios_dados_por_tipo`. Aqui cada tipo diz três coisas:
 * como nasce vazio, o que conta como pronto para publicar, e que campos
 * mostrar. O resto — enunciado, dica, peso, caso, publicação — é igual em
 * todos e vive no `EditorDeExercicio`.
 *
 * A VALIDAÇÃO USA `normalizar`, a mesma função que corrige a resposta do
 * aluno. É de propósito: o único jeito de garantir que um exercício tem
 * solução é medir com a régua que vai medir a resposta. Foi assim que
 * apareceu a checagem do `montar_frase`, que pega o erro mais fácil de
 * cometer e mais difícil de ver — peças que não reproduzem a frase por
 * causa de uma vírgula.
 */

export type Dados = Record<string, unknown>;

export type TipoNoCms = {
  rotulo: string;
  /** Uma frase sobre o que o aluno vê. Aparece no topo do editor. */
  resumo: string;
  vazio: () => Dados;
  /** O problema em português, ou null se está pronto para publicar. */
  validar: (dados: Dados) => string | null;
  Corpo: (props: {
    dados: Dados;
    aoMudar: (dados: Dados) => void;
  }) => ReactElement;
};

// ---------- leitura tolerante do jsonb ----------

const texto = (v: unknown): string => (typeof v === 'string' ? v : '');
const lista = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => String(x)) : [];
const pares = (v: unknown): { hr: string; pt: string }[] =>
  Array.isArray(v)
    ? v.map((x) => {
        const p = (x ?? {}) as Record<string, unknown>;
        return { hr: texto(p.hr), pt: texto(p.pt) };
      })
    : [];

const semVazios = (itens: string[]) => itens.map((i) => i.trim()).filter(Boolean);

/** Primeiro item repetido depois de normalizar, ou null. */
function repetido(itens: string[]): string | null {
  const vistos = new Set<string>();
  for (const item of itens) {
    const chave = normalizar(item);
    if (vistos.has(chave)) return item;
    vistos.add(chave);
  }
  return null;
}

/**
 * As peças montam a frase?
 *
 * Refaz o que o aluno faria: pega as palavras do alvo, uma a uma, e procura
 * uma peça que sirva. Depois junta o que achou e compara com o alvo pela
 * régua do corretor. O segundo passo é o que pega a vírgula perdida — as
 * peças existem uma a uma, mas juntas dão outra frase.
 */
function problemaDasPecas(alvo: string, tokens: string[]): string | null {
  const restantes = semVazios(tokens);
  const usados: string[] = [];

  for (const palavra of alvo.trim().split(/\s+/).filter(Boolean)) {
    const i = restantes.findIndex((t) => normalizar(t) === normalizar(palavra));
    if (i < 0) return `Falta uma peça para "${palavra}".`;
    usados.push(restantes[i]);
    restantes.splice(i, 1);
  }

  if (normalizar(usados.join(' ')) !== normalizar(alvo)) {
    return 'As peças existem soltas, mas juntas não dão a frase — confira a pontuação de cada uma.';
  }
  return null;
}

// ---------- os seis tipos ----------

export const TIPOS: Record<TipoExercicio, TipoNoCms> = {
  escolher_forma: {
    rotulo: 'Escolher a forma',
    resumo: 'O aluno toca numa das opções. Comparação exata, sem tolerância.',
    vazio: () => ({ opcoes: ['', ''], resposta: '', falar_opcoes: false }),
    validar: (d) => {
      const opcoes = semVazios(lista(d.opcoes));
      const resposta = texto(d.resposta).trim();
      if (opcoes.length < 2) return 'Precisa de pelo menos duas opções.';
      const igual = repetido(opcoes);
      if (igual)
        return `A opção "${igual}" aparece duas vezes — o aluno veria a mesma resposta repetida.`;
      if (!resposta) return 'Marque qual opção é a certa.';
      if (!opcoes.includes(resposta))
        return 'A opção marcada como certa não está mais na lista.';
      return null;
    },
    Corpo: ({ dados, aoMudar }) => (
      <>
        <ListaEditavel
          rotulo="Opções (HR)"
          nomeDoItem="Opção"
          itens={lista(dados.opcoes)}
          aoMudar={(opcoes) => aoMudar({ ...dados, opcoes })}
          croata
          textoAdicionar="Mais uma opção"
          marcada={texto(dados.resposta)}
          aoMarcar={(resposta) => aoMudar({ ...dados, resposta })}
          dica="O círculo marca a certa. As opções aparecem na ordem cadastrada, sem embaralhar — evite deixar a certa sempre na primeira."
        />
        <Interruptor
          titulo="Gerar áudio das opções"
          detalhe="Marca estas opções para virarem MP3 na próxima rodada de supabase/audio/gerar.mjs. Ligue quando forem palavras de verdade; deixe desligado quando forem letras soltas."
          valor={Boolean(dados.falar_opcoes)}
          aoMudar={(falar_opcoes) => aoMudar({ ...dados, falar_opcoes })}
        />
      </>
    ),
  },

  preencher_lacuna: {
    rotulo: 'Preencher a lacuna',
    resumo:
      'O aluno digita a forma que completa a frase. Acento e caixa não reprovam.',
    vazio: () => ({ frase_hr: '', base_hr: '', resposta: '' }),
    validar: (d) => {
      const frase = texto(d.frase_hr).trim();
      if (!frase) return 'A frase em croata é obrigatória.';
      if (!frase.includes('___'))
        return 'A frase precisa de ___ (três sublinhados) marcando onde fica a lacuna.';
      if (!texto(d.base_hr).trim())
        return 'A forma base é obrigatória — é a dica que aparece embaixo da frase.';
      if (!texto(d.resposta).trim()) return 'A resposta é obrigatória.';
      return null;
    },
    Corpo: ({ dados, aoMudar }) => (
      <>
        <Campo
          rotulo="Frase (HR)"
          valor={texto(dados.frase_hr)}
          aoMudar={(frase_hr) => aoMudar({ ...dados, frase_hr })}
          croata
          placeholder="Knjiga je na ___."
          dica="Use ___ onde entra a resposta. É o que o aluno lê no cartão."
        />
        <Campo
          rotulo="Forma base (HR)"
          valor={texto(dados.base_hr)}
          aoMudar={(base_hr) => aoMudar({ ...dados, base_hr })}
          croata
          placeholder="stol"
          dica="Aparece como “forma base:” embaixo da frase — é o nominativo ou o infinitivo de onde a flexão sai."
        />
        <Campo
          rotulo="Resposta (HR)"
          valor={texto(dados.resposta)}
          aoMudar={(resposta) => aoMudar({ ...dados, resposta })}
          croata
          placeholder="stolu"
          dica="A forma flexionada. O app fala ela em voz alta de propósito: fixar a sonoridade vale mais que a adivinhação."
        />
      </>
    ),
  },

  montar_frase: {
    rotulo: 'Montar a frase',
    resumo:
      'O aluno toca nas peças até formar a frase. A ordem é o exercício.',
    vazio: () => ({ alvo_hr: '', tokens: ['', ''] }),
    validar: (d) => {
      const alvo = texto(d.alvo_hr).trim();
      const tokens = semVazios(lista(d.tokens));
      if (!alvo) return 'A frase alvo é obrigatória.';
      if (tokens.length < 2) return 'Precisa de pelo menos duas peças.';
      return problemaDasPecas(alvo, tokens);
    },
    Corpo: ({ dados, aoMudar }) => {
      const alvo = texto(dados.alvo_hr);
      const tokens = lista(dados.tokens);
      const sobrando = semVazios(tokens).length - alvo.trim().split(/\s+/).filter(Boolean).length;

      return (
        <>
          <Campo
            rotulo="Frase alvo (HR)"
            valor={alvo}
            aoMudar={(alvo_hr) => aoMudar({ ...dados, alvo_hr })}
            croata
            placeholder="Ovo je moja kuća"
            dica="A frase pronta. É ela que o app fala e que aparece no feedback."
          />
          <ListaEditavel
            rotulo="Peças"
            nomeDoItem="Peça"
            itens={tokens}
            aoMudar={(t) => aoMudar({ ...dados, tokens: t })}
            croata
            textoAdicionar="Mais uma peça"
            dica={
              sobrando > 0
                ? `${sobrando} peça(s) a mais que a frase: viram distratores, que o aluno tem de deixar de lado.`
                : 'Uma peça por palavra, com a pontuação que a palavra leva. A ordem aqui não importa — o app embaralha.'
            }
          />
          <Sugestao
            alvo={alvo}
            aoUsar={(t) => aoMudar({ ...dados, tokens: t })}
          />
        </>
      );
    },
  },

  ligar_pares: {
    rotulo: 'Ligar pares',
    resumo: 'O aluno liga cada croata ao seu par. Todos têm de bater.',
    vazio: () => ({
      pares: [
        { hr: '', pt: '' },
        { hr: '', pt: '' },
      ],
    }),
    validar: (d) => {
      const lista = pares(d.pares).filter((p) => p.hr.trim() || p.pt.trim());
      if (lista.length < 2) return 'Precisa de pelo menos dois pares.';
      if (lista.some((p) => !p.hr.trim() || !p.pt.trim()))
        return 'Todo par precisa dos dois lados preenchidos.';
      const hrIgual = repetido(lista.map((p) => p.hr));
      if (hrIgual) return `O croata "${hrIgual}" aparece em dois pares.`;
      const ptIgual = repetido(lista.map((p) => p.pt));
      if (ptIgual)
        return `O par "${ptIgual}" aparece dos dois lados — o aluno não teria como escolher entre eles.`;
      return null;
    },
    Corpo: ({ dados, aoMudar }) => (
      <ListaDePares
        pares={pares(dados.pares)}
        aoMudar={(p) => aoMudar({ ...dados, pares: p })}
      />
    ),
  },

  traducao: {
    rotulo: 'Tradução',
    resumo:
      'O aluno lê em português e escreve em croata. Acento e caixa não reprovam.',
    vazio: () => ({ origem_pt: '', respostas_aceitas: [''] }),
    validar: (d) => {
      const aceitas = semVazios(lista(d.respostas_aceitas));
      if (!texto(d.origem_pt).trim())
        return 'A frase em português é obrigatória.';
      if (aceitas.length < 1) return 'Precisa de pelo menos uma resposta aceita.';
      const igual = repetido(aceitas);
      if (igual)
        return `Duas respostas viram a mesma coisa na correção ("${igual}"). Acento e caixa já são ignorados — não precisa listar as variações.`;
      return null;
    },
    Corpo: ({ dados, aoMudar }) => (
      <>
        <Campo
          rotulo="Frase de origem (PT)"
          valor={texto(dados.origem_pt)}
          aoMudar={(origem_pt) => aoMudar({ ...dados, origem_pt })}
          multilinha
          placeholder="Esta é a minha casa"
          dica="O que o aluno lê, em português."
        />
        <ListaEditavel
          rotulo="Respostas aceitas (HR)"
          nomeDoItem="Resposta"
          itens={lista(dados.respostas_aceitas)}
          aoMudar={(respostas_aceitas) =>
            aoMudar({ ...dados, respostas_aceitas })
          }
          croata
          minimo={1}
          textoAdicionar="Mais uma resposta aceita"
          dica="A PRIMEIRA é a canônica: é ela que o app fala e que aparece como “forma certa” no feedback. As outras só valem para não reprovar quem escreveu diferente — não liste variação de acento, que a correção já ignora."
        />
      </>
    ),
  },

  producao_livre: {
    rotulo: 'Produção livre',
    resumo:
      'O aluno escreve até 400 caracteres e pontua por enviar. Quem corrige o conteúdo é a IA, depois.',
    vazio: () => ({ prompt_pt: '' }),
    validar: (d) =>
      texto(d.prompt_pt).trim() ? null : 'O comando em português é obrigatório.',
    Corpo: ({ dados, aoMudar }) => (
      <>
        <Campo
          rotulo="Comando (PT)"
          valor={texto(dados.prompt_pt)}
          aoMudar={(prompt_pt) => aoMudar({ ...dados, prompt_pt })}
          multilinha
          placeholder="Escreva três frases sobre a sua casa, usando o Lokativ."
          dica="O que o aluno tem de fazer. Quanto mais concreto, melhor a correção da IA — peça um caso, um número de frases, um assunto."
        />
        <Text style={styles.aviso}>
          O limite de 400 caracteres é fixo, do contrato do app. Convidado não
          recebe correção da IA — só conta autenticada, com teto de 30 por dia.
        </Text>
      </>
    ),
  },
};

/** Ordem em que os tipos aparecem: do mais usado ao mais raro. */
export const ORDEM_DOS_TIPOS: TipoExercicio[] = [
  'escolher_forma',
  'preencher_lacuna',
  'traducao',
  'montar_frase',
  'ligar_pares',
  'producao_livre',
];

/**
 * Quebra a frase alvo em peças, uma por palavra.
 *
 * Atalho para o caso comum — que é sempre o caso, no conteúdo que existe
 * hoje: as peças são exatamente as palavras da frase. Digitar de novo,
 * palavra por palavra, é onde nasce a vírgula que não bate.
 */
function Sugestao({
  alvo,
  aoUsar,
}: {
  alvo: string;
  aoUsar: (tokens: string[]) => void;
}) {
  const palavras = alvo.trim().split(/\s+/).filter(Boolean);
  if (palavras.length < 2) return <></>;

  return (
    <Text
      accessibilityRole="button"
      onPress={() => aoUsar(palavras)}
      style={styles.sugestao}
    >
      Quebrar a frase em {palavras.length} peças automaticamente
    </Text>
  );
}

function Interruptor({
  titulo,
  detalhe,
  valor,
  aoMudar,
}: {
  titulo: string;
  detalhe: string;
  valor: boolean;
  aoMudar: (valor: boolean) => void;
}) {
  return (
    <View style={styles.interruptor}>
      <View style={styles.interruptorTexto}>
        <Text style={styles.interruptorTitulo}>{titulo}</Text>
        <Text style={styles.aviso}>{detalhe}</Text>
      </View>
      <Switch
        value={valor}
        onValueChange={aoMudar}
        trackColor={{ true: cores.primaria, false: cores.borda }}
        accessibilityLabel={titulo}
      />
    </View>
  );
}

/** O jsonb do banco não é `Record<string, unknown>`; a ponte é aqui. */
export function comoJson(dados: Dados): Json {
  return dados as Json;
}

export function comoDados(json: Json | null | undefined): Dados {
  return (json ?? {}) as Dados;
}

const styles = StyleSheet.create({
  interruptor: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  interruptorTexto: { flex: 1, gap: 2 },
  interruptorTitulo: {
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.normal,
    color: cores.texto,
  },
  aviso: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },
  sugestao: {
    alignSelf: 'flex-start',
    paddingVertical: espaco.xs,
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.forte,
    color: cores.primaria,
  },
});
