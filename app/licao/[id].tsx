import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { Carregando, Erro } from '@/components/Estados';
import { Sahovnica } from '@/components/Sahovnica';
import { AberturaLicao } from '@/features/licao/AberturaLicao';
import { Feedback } from '@/features/licao/Feedback';
import { TelaFim } from '@/features/licao/TelaFim';
import { CampoDoExercicio } from '@/features/licao/exercicios';
import {
  calcularNota,
  corrigir,
  type Resposta,
  type Veredito,
} from '@/features/licao/correcao';
import { useLicao } from '@/features/licao/hooks';
import { registrarNota, registrarTentativa } from '@/features/licao/progresso';
import { useProgressoLocal } from '@/features/perfil/ProgressoLocal';
import {
  cores,
  espaco,
  familia,
  fonte,
  larguraMaximaConteudo,
  linha,
  raio,
} from '@/theme/tokens';

export default function TelaLicao() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: licao, isPending, isError } = useLicao(id);
  const { concluirLicao } = useProgressoLocal();

  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, Resposta>>({});
  const [vereditos, setVereditos] = useState<Record<string, Veredito>>({});
  const [terminou, setTerminou] = useState(false);
  // A abertura é o passo zero: some assim que o aluno começa.
  const [naAbertura, setNaAbertura] = useState(true);

  const exercicios = licao?.exercicios ?? [];
  const exercicio = exercicios[indice];
  const veredito = exercicio ? vereditos[exercicio.id] : undefined;
  const resposta = exercicio ? (respostas[exercicio.id] ?? null) : null;

  const atividadeAtual = useMemo(
    () => licao?.atividades.find((a) => a.exercicios.some((e) => e.id === exercicio?.id)),
    [licao, exercicio],
  );

  const nota = useMemo(
    () =>
      calcularNota(
        exercicios,
        Object.fromEntries(
          Object.entries(vereditos).map(([k, v]) => [k, v.acertou]),
        ),
      ),
    [exercicios, vereditos],
  );

  if (isPending) return <Carregando />;
  if (isError || !licao) return <Erro />;

  if (terminou) {
    return (
      <TelaFim
        titulo={licao.titulo_pt}
        nota={nota}
        acertos={Object.values(vereditos).filter((v) => v.acertou).length}
        total={exercicios.length}
        aoSair={() => router.back()}
      />
    );
  }

  if (!exercicio) return <Erro mensagem="Esta lição ainda não tem exercícios." />;

  // Sem intro cadastrada a abertura não aparece: quem decide é o conteúdo.
  if (naAbertura && licao.intro_pt) {
    return (
      <AberturaLicao
        titulo={licao.titulo_pt}
        intro={licao.intro_pt}
        ilustracao={licao.ilustracao}
        padez={licao.padez}
        quantidadeDeExercicios={exercicios.length}
        aoComecar={() => setNaAbertura(false)}
      />
    );
  }

  const podeVerificar = resposta !== null && !veredito;
  const ultimo = indice === exercicios.length - 1;

  const verificar = () => {
    if (!resposta) return;
    const resultado = corrigir(exercicio, resposta);
    setVereditos((atual) => ({ ...atual, [exercicio.id]: resultado }));
    // Não bloqueia a lição se a gravação falhar (ou se for convidado).
    void registrarTentativa({
      exercicio,
      moduloId: licao.moduloId,
      acertou: resultado.acertou,
      tentativas: 1,
    });
  };

  const continuar = () => {
    if (ultimo) {
      setTerminou(true);
      // O estado local destrava a trilha na hora; o Supabase só grava se
      // houver conta (convidado migra no portão de login).
      concluirLicao(licao.id, nota);
      void registrarNota({ licaoId: licao.id, nota });
      return;
    }
    setIndice((i) => i + 1);
  };

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Sahovnica altura={6} />
      <View style={[styles.cabecalho, { paddingTop: espaco.sm }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sair da lição"
          hitSlop={espaco.sm}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={26} color={cores.texto} />
        </Pressable>
        <View style={styles.barra}>
          <View
            style={[
              styles.barraCheia,
              { width: `${((indice + 1) / exercicios.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.contagem}>
          {indice + 1}/{exercicios.length}
        </Text>
      </View>

      <ScrollView
        style={styles.corpo}
        contentContainerStyle={styles.corpoConteudo}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.coluna}>
          {atividadeAtual && (
            <Text style={styles.atividade}>{atividadeAtual.titulo_pt}</Text>
          )}
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

          {!veredito && exercicio.dica_pt && (
            <Text style={styles.dica}>{exercicio.dica_pt}</Text>
          )}
        </View>
      </ScrollView>

      {/* Rodapé se tinge com o resultado, como no Duolingo: o feedback
          aparece na mesma faixa do botão, sem empurrar o exercício. */}
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

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    paddingHorizontal: espaco.md,
    paddingBottom: espaco.sm,
    backgroundColor: cores.superficie,
    // Borda tracejada dos mockups, no lugar da linha cheia.
    borderBottomWidth: 2,
    borderBottomColor: cores.borda,
    borderStyle: 'dashed',
  },
  barra: {
    flex: 1,
    height: 10,
    borderRadius: raio.pill,
    backgroundColor: cores.fundoSuave,
    overflow: 'hidden',
  },
  barraCheia: { height: '100%', backgroundColor: cores.primaria },
  contagem: { fontSize: fonte.pequena, lineHeight: linha.pequena, fontFamily: familia.normal, color: cores.textoSuave },

  corpo: { flex: 1 },
  corpoConteudo: { padding: espaco.md, alignItems: 'center' },
  coluna: { width: '100%', maxWidth: larguraMaximaConteudo, gap: espaco.md },
  atividade: {
    fontSize: fonte.pequena, lineHeight: linha.pequena,
    fontFamily: familia.forte,
    color: cores.textoSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  enunciado: {
    fontSize: fonte.titulo, lineHeight: linha.titulo,
    fontFamily: familia.forte,
    color: cores.texto,
  },
  dica: { fontSize: fonte.pequena, lineHeight: linha.pequena, fontFamily: familia.normal, color: cores.textoSuave },

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
  rodapeErrado: {
    backgroundColor: cores.erroSuave,
    borderTopColor: cores.erro,
  },

});
