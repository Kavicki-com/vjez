import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
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
import { BotaoAudio } from '@/features/audio/BotaoAudio';
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
import { corrigirProducaoLivre } from '@/features/licao/producaoLivre';
import { registrarNota, registrarTentativa } from '@/features/licao/progresso';
import { registrarDiaAtivo } from '@/features/ofensiva/api';
import { useSomDeResposta } from '@/features/audio/sons';
import { useSessao } from '@/features/conta/hooks';
import { useProgressoLocal } from '@/features/perfil/ProgressoLocal';
import { voltarPara } from '@/lib/navegacao';
import { ORDEM_LICAO_PORTAO_LOGIN } from '@/lib/regras';
import type { Correcao } from '@/types/schema';
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
  const { concluirLicao, registrarTentativa: registrarTentativaLocal } =
    useProgressoLocal();
  const cliente = useQueryClient();
  const { autenticado } = useSessao();
  const tocarVeredito = useSomDeResposta();

  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, Resposta>>({});
  const [vereditos, setVereditos] = useState<Record<string, Veredito>>({});
  const [terminou, setTerminou] = useState(false);
  // A abertura é o passo zero: some assim que o aluno começa.
  const [naAbertura, setNaAbertura] = useState(true);
  // Produção livre: a IA responde depois do ponto, então tem estado próprio.
  const [correcoes, setCorrecoes] = useState<Record<string, Correcao>>({});
  const [avisos, setAvisos] = useState<Record<string, string>>({});
  const [corrigindo, setCorrigindo] = useState(false);

  const exercicios = licao?.exercicios ?? [];
  const exercicio = exercicios[indice];
  const veredito = exercicio ? vereditos[exercicio.id] : undefined;
  const resposta = exercicio ? (respostas[exercicio.id] ?? null) : null;
  const correcao = exercicio ? correcoes[exercicio.id] : undefined;
  const aviso = exercicio ? avisos[exercicio.id] : undefined;

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
  // Sem a lição não dá para saber a unidade dela: a saída é a trilha.
  if (isError || !licao) return <Erro aoVoltar={() => voltarPara('/')} />;

  if (terminou) {
    return (
      <TelaFim
        titulo={licao.titulo_pt}
        nota={nota}
        acertos={Object.values(vereditos).filter((v) => v.acertou).length}
        total={exercicios.length}
        // Guest-first: a Lição 1 é aberta, e o portão aparece no fim dela —
        // no momento em que o progresso passa a valer alguma coisa.
        ofereceConta={!autenticado && licao.ordem === ORDEM_LICAO_PORTAO_LOGIN}
        aoSair={() => voltarPara(`/modulo/${licao.moduloId}`)}
      />
    );
  }

  if (!exercicio)
    return (
      <Erro
        mensagem="Esta lição ainda não tem exercícios."
        aoVoltar={() => voltarPara(`/modulo/${licao.moduloId}`)}
      />
    );

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

  /**
   * Manda o texto para a IA. Roda DEPOIS de o ponto estar dado: correção é
   * conteúdo de aprendizado, não nota — se a rede cair, o aluno não perde
   * ponto nenhum, só a explicação.
   */
  const pedirCorrecao = async (id: string, texto: string) => {
    if (!autenticado) {
      setAvisos((atual) => ({
        ...atual,
        [id]: 'Entre na sua conta para um professor de IA corrigir o que você escreveu.',
      }));
      return;
    }

    setCorrigindo(true);
    const resultado = await corrigirProducaoLivre({ exercicioId: id, texto });
    setCorrigindo(false);

    if (resultado.estado === 'ok') {
      setCorrecoes((atual) => ({ ...atual, [id]: resultado.correcao }));
    } else {
      setAvisos((atual) => ({ ...atual, [id]: resultado.mensagem }));
    }
  };

  const verificar = () => {
    if (!resposta) return;
    const resultado = corrigir(exercicio, resposta);
    setVereditos((atual) => ({ ...atual, [exercicio.id]: resultado }));
    // No mesmo quadro em que o rodapé muda de cor: o som é a mesma
    // informação por outro canal, não um aviso que chega depois.
    tocarVeredito(resultado.acertou);

    if (exercicio.tipo === 'producao_livre' && resposta.tipo === 'envio') {
      void pedirCorrecao(exercicio.id, resposta.valor);
    }
    // O checkpoint prioriza erros: sem isso, convidado faria uma prova sem
    // priorização nenhuma, porque nada dele é gravado no servidor.
    registrarTentativaLocal(exercicio.id, resultado.acertou, licao.moduloId);
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
      // O XP é recalculado no banco por trigger; sem invalidar, o Perfil só
      // mostraria o valor novo depois de recarregar o app.
      // Ofensiva depois da nota: as duas alimentam o perfil, e uma
      // invalidação só no fim evita o Perfil piscar dois valores.
      void registrarNota({ licaoId: licao.id, nota })
        .then(registrarDiaAtivo)
        .then(() => {
          void cliente.invalidateQueries({ queryKey: ['perfil'] });
          void cliente.invalidateQueries({ queryKey: ['progresso-licoes'] });
        });
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
          onPress={() => voltarPara(`/modulo/${licao.moduloId}`)}
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
          <View style={styles.linhaEnunciado}>
            <Text style={styles.enunciado}>{exercicio.enunciado_pt}</Text>
            {exercicio.audioUrl && (
              <BotaoAudio
                url={exercicio.audioUrl}
                rotulo="o enunciado"
                tamanho="grande"
                automatico
              />
            )}
          </View>

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
          {veredito && (
            <Feedback
              exercicio={exercicio}
              veredito={veredito}
              correcao={correcao}
              aviso={corrigindo ? undefined : aviso}
            />
          )}
          {corrigindo && (
            <Text style={styles.corrigindo}>Corrigindo o que você escreveu…</Text>
          )}
          <Botao
            rotulo={veredito ? (ultimo ? 'Ver resultado' : 'Continuar') : 'Verificar'}
            aoTocar={veredito ? continuar : verificar}
            desabilitado={!veredito && !podeVerificar}
            // Continuar durante a correção perderia a resposta da IA — o
            // exercício sai da tela junto com ela.
            carregando={corrigindo}
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
  corrigindo: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },
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
  barraCheia: { height: '100%', backgroundColor: cores.secundaria },
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
  linhaEnunciado: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espaco.md,
  },
  enunciado: {
    flex: 1,
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
