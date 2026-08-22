import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Botao } from '@/components/Botao';
import { Confete } from '@/components/Confete';
import { Carregando, Erro } from '@/components/Estados';
import { Sahovnica } from '@/components/Sahovnica';
import { useSomDeResposta } from '@/features/audio/sons';
import { registrarCheckpoint } from '@/features/checkpoint/api';
import {
  useHistoricoDoModulo,
  useModuloParaCheckpoint,
} from '@/features/checkpoint/hooks';
import { montarCheckpoint, notaDoCheckpoint } from '@/features/checkpoint/montar';
import { Feedback } from '@/features/licao/Feedback';
import {
  corrigir,
  type Resposta,
  type Veredito,
} from '@/features/licao/correcao';
import { CampoDoExercicio } from '@/features/licao/exercicios';
import { registrarTentativa } from '@/features/licao/progresso';
import { useTrilha } from '@/features/licao/hooks';
import { useProgressoLocal } from '@/features/perfil/ProgressoLocal';
import { voltarPara } from '@/lib/navegacao';
import type { Exercicio } from '@/types/schema';
import {
  cores,
  espaco,
  familia,
  fonte,
  larguraMaximaConteudo,
  linha,
  raio,
  tracking,
} from '@/theme/tokens';

export default function TelaCheckpoint() {
  const { moduloId } = useLocalSearchParams<{ moduloId: string }>();
  const insets = useSafeAreaInsets();
  const cliente = useQueryClient();

  const { data: modulo, isPending, isError } = useModuloParaCheckpoint(moduloId);
  const { data: historico } = useHistoricoDoModulo(moduloId);
  const { data: trilha } = useTrilha();
  const {
    tentativas: tentativasLocais,
    registrarTentativa: registrarTentativaLocal,
    concluirCheckpoint,
  } = useProgressoLocal();

  const tocarVeredito = useSomDeResposta();

  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, Resposta>>({});
  const [vereditos, setVereditos] = useState<Record<string, Veredito>>({});
  const [terminou, setTerminou] = useState(false);

  /**
   * A prova fica congelada em estado, não em useMemo.
   *
   * Ela depende do histórico de erros, e esse histórico muda a cada resposta
   * — num useMemo o sorteio se refaria no meio do exame, trocando as questões
   * debaixo do aluno e recalculando a nota sobre outro conjunto.
   */
  const [prova, setProva] = useState<Exercicio[] | null>(null);

  useEffect(() => {
    if (!modulo || !historico || prova) return;
    // Servidor e sessão contam juntos: convidado não tem histórico gravado
    // e ficaria sem priorização nenhuma.
    const errados = new Set(historico.errados);
    const acertados = new Set(historico.acertados);
    for (const [id, { acertou }] of Object.entries(tentativasLocais)) {
      if (acertou) {
        errados.delete(id);
        acertados.add(id);
      } else {
        acertados.delete(id);
        errados.add(id);
      }
    }
    setProva(
      montarCheckpoint(modulo.exercicios, errados, acertados, modulo.tamanho),
    );
    // tentativasLocais de propósito fora das dependências: ele muda a cada
    // resposta e só deve valer no momento em que a prova é montada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modulo, historico, prova]);

  const exercicio = prova?.[indice];
  const veredito = exercicio ? vereditos[exercicio.id] : undefined;
  const resposta = exercicio ? (respostas[exercicio.id] ?? null) : null;

  const fracao = useMemo(
    () =>
      notaDoCheckpoint(
        prova ?? [],
        Object.fromEntries(
          Object.entries(vereditos).map(([k, v]) => [k, v.acertou]),
        ),
      ),
    [prova, vereditos],
  );

  if (isPending) return <Carregando />;
  if (isError || !modulo)
    return (
      <Erro
        mensagem="Checkpoint não encontrado."
        aoVoltar={() => voltarPara('/')}
      />
    );
  if (!prova) return <Carregando />;

  // A prova vazia tem que ser checada ANTES do guard do exercício: com
  // `prova.length === 0` não existe `prova[indice]`, então o guard antigo
  // (`!prova || !exercicio`) devolvia <Carregando /> para sempre e esta
  // mensagem nunca aparecia — a tela ficava girando sem saída.
  if (prova.length === 0) {
    return (
      <Erro
        mensagem="Este módulo ainda não tem exercícios suficientes para um checkpoint."
        aoVoltar={() => voltarPara(`/modulo/${modulo.id}`)}
      />
    );
  }

  if (!exercicio) return <Carregando />;

  const moduloSeguinte = trilha?.find((m) => m.ordem === modulo.ordem + 1);

  const recomecar = () => {
    // Zerar a prova faz o efeito sortear de novo: refazer não devolve
    // exatamente as mesmas questões.
    setProva(null);
    setIndice(0);
    setRespostas({});
    setVereditos({});
    setTerminou(false);
  };

  if (terminou) {
    const passou = fracao >= modulo.notaMinima;
    return (
      <Resultado
        passou={passou}
        percentual={Math.round(fracao * 100)}
        minimo={Math.round(modulo.notaMinima * 100)}
        tema={modulo.tema_pt}
        temProximo={Boolean(moduloSeguinte)}
        aoRefazer={recomecar}
        aoSair={() => voltarPara(`/modulo/${modulo.id}`)}
      />
    );
  }

  const ultimo = indice === prova.length - 1;
  const podeVerificar = resposta !== null && !veredito;

  const verificar = () => {
    if (!resposta) return;
    const resultado = corrigir(exercicio, resposta);
    setVereditos((atual) => ({ ...atual, [exercicio.id]: resultado }));
    tocarVeredito(resultado.acertou);
    registrarTentativaLocal(exercicio.id, resultado.acertou, modulo.id);
    void registrarTentativa({
      exercicio,
      moduloId: modulo.id,
      acertou: resultado.acertou,
      tentativas: 1,
    });
  };

  const continuar = () => {
    if (!ultimo) {
      setIndice((i) => i + 1);
      return;
    }
    const passou = fracao >= modulo.notaMinima;
    setTerminou(true);
    concluirCheckpoint(modulo.id, passou);
    void registrarCheckpoint({
      moduloId: modulo.id,
      passou,
      moduloSeguinteId: moduloSeguinte?.id,
    }).then(() => {
      void cliente.invalidateQueries({ queryKey: ['progresso-modulos'] });
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Sahovnica altura={6} />
      <View style={styles.cabecalho}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sair do checkpoint"
          hitSlop={espaco.sm}
          onPress={() => voltarPara(`/modulo/${modulo.id}`)}
        >
          <Ionicons name="close" size={26} color={cores.texto} />
        </Pressable>
        <View style={styles.barra}>
          <View
            style={[
              styles.barraCheia,
              { width: `${((indice + 1) / prova.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.contagem}>
          {indice + 1}/{prova.length}
        </Text>
      </View>

      <ScrollView
        style={styles.corpo}
        contentContainerStyle={styles.corpoConteudo}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.coluna}>
          <Text style={styles.etiqueta}>Checkpoint · {modulo.tema_pt}</Text>
          <Text style={styles.enunciado}>{exercicio.enunciado_pt}</Text>

          <CampoDoExercicio
            exercicio={exercicio}
            resposta={resposta}
            aoResponder={(r) =>
              setRespostas((atual) => ({ ...atual, [exercicio.id]: r }))
            }
            travado={Boolean(veredito)}
            acertou={veredito?.acertou}
          />
        </View>
      </ScrollView>

      <View
        style={[
          styles.rodape,
          veredito?.acertou === true && styles.rodapeCerto,
          veredito?.acertou === false && styles.rodapeErrado,
          { paddingBottom: insets.bottom + espaco.md },
        ]}
      >
        <View style={styles.coluna}>
          {veredito && <Feedback exercicio={exercicio} veredito={veredito} />}
          <Botao
            rotulo={veredito ? (ultimo ? 'Ver resultado' : 'Continuar') : 'Verificar'}
            aoTocar={veredito ? continuar : verificar}
            desabilitado={!veredito && !podeVerificar}
            variante={
              veredito?.acertou === true
                ? 'acerto'
                : veredito?.acertou === false
                  ? 'erro'
                  : 'primaria'
            }
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function Resultado({
  passou,
  percentual,
  minimo,
  tema,
  temProximo,
  aoRefazer,
  aoSair,
}: {
  passou: boolean;
  percentual: number;
  minimo: number;
  tema: string;
  temProximo: boolean;
  aoRefazer: () => void;
  aoSair: () => void;
}) {
  return (
    <View style={styles.fim}>
      {passou && <Confete />}
      <View style={styles.colunaFim}>
        <View style={[styles.medalha, !passou && styles.medalhaNeutra]}>
          <Ionicons
            name={passou ? 'ribbon' : 'refresh'}
            size={60}
            color={cores.superficie}
          />
        </View>

        <Text style={styles.fimTitulo}>
          {passou ? 'Checkpoint concluído!' : 'Quase lá'}
        </Text>
        <Text style={styles.fimTema}>{tema}</Text>

        <View style={styles.notaCaixa}>
          <Text style={[styles.notaValor, !passou && styles.notaValorNeutra]}>
            {percentual}%
          </Text>
          <Text style={styles.notaMinimo}>mínimo de {minimo}%</Text>
        </View>

        <Text style={styles.fimTexto}>
          {passou
            ? temProximo
              ? 'A próxima unidade está liberada.'
              : 'Você chegou ao fim da trilha por enquanto.'
            : 'Só o checkpoint precisa ser refeito — suas lições continuam concluídas. O sorteio muda a cada tentativa e prioriza o que você errou.'}
        </Text>

        {!passou && <Botao rotulo="Refazer checkpoint" aoTocar={aoRefazer} />}
        <Botao
          rotulo="Voltar para a unidade"
          variante={passou ? 'primaria' : 'secundaria'}
          aoTocar={aoSair}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    paddingHorizontal: espaco.md,
    paddingTop: espaco.sm,
    paddingBottom: espaco.sm,
    backgroundColor: cores.superficie,
    borderBottomWidth: 2,
    borderBottomColor: cores.borda,
    borderStyle: 'dashed',
  },
  barra: {
    flex: 1,
    height: 10,
    borderRadius: raio.pill,
    backgroundColor: cores.superficieVariante,
    overflow: 'hidden',
  },
  barraCheia: { height: '100%', backgroundColor: cores.secundaria },
  contagem: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.textoSuave,
  },

  corpo: { flex: 1 },
  corpoConteudo: { padding: espaco.md, alignItems: 'center' },
  coluna: { width: '100%', maxWidth: larguraMaximaConteudo, gap: espaco.md },
  etiqueta: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.forte,
    color: cores.secundaria,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  enunciado: {
    fontSize: fonte.titulo,
    lineHeight: linha.titulo,
    letterSpacing: tracking.titulo,
    fontFamily: familia.forte,
    color: cores.texto,
  },

  rodape: {
    paddingHorizontal: espaco.md,
    paddingTop: espaco.md,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    backgroundColor: cores.superficie,
    alignItems: 'center',
  },
  rodapeCerto: {
    backgroundColor: cores.acertoSuave,
    borderTopColor: cores.acerto,
  },
  rodapeErrado: { backgroundColor: cores.erroSuave, borderTopColor: cores.erro },

  fim: {
    flex: 1,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaco.md,
  },
  colunaFim: {
    width: '100%',
    maxWidth: larguraMaximaConteudo,
    gap: espaco.md,
    alignItems: 'center',
  },
  medalha: {
    width: 120,
    height: 120,
    borderRadius: raio.pill,
    backgroundColor: cores.secundaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalhaNeutra: { backgroundColor: cores.contorno },
  fimTitulo: {
    fontSize: fonte.gigante,
    lineHeight: linha.gigante,
    letterSpacing: tracking.titulo,
    fontFamily: familia.extraForte,
    color: cores.texto,
    textAlign: 'center',
  },
  fimTema: {
    fontSize: fonte.subtitulo,
    lineHeight: linha.subtitulo,
    fontFamily: familia.normal,
    color: cores.textoSuave,
    textAlign: 'center',
  },
  notaCaixa: {
    alignItems: 'center',
    gap: espaco.xs,
    paddingVertical: espaco.md,
    paddingHorizontal: espaco.xl,
    borderRadius: raio.lg,
    backgroundColor: cores.secundariaSuave,
  },
  notaValor: {
    fontSize: fonte.heroi,
    lineHeight: linha.heroi,
    letterSpacing: tracking.heroi,
    fontFamily: familia.extraForte,
    color: cores.secundaria,
  },
  notaValorNeutra: { color: cores.contorno },
  notaMinimo: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.sobreSecundariaContainer,
  },
  fimTexto: {
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.normal,
    color: cores.textoSuave,
    textAlign: 'center',
  },
});
