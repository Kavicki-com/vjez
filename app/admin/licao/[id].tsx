import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Carregando, Erro } from '@/components/Estados';
import { Sahovnica } from '@/components/Sahovnica';
import { dadosDeEscolherForma, type ExercicioDoCms } from '@/features/admin/api';
import { EditorEscolherForma } from '@/features/admin/EditorEscolherForma';
import { useEscritaDeExercicio, useLicaoDoCms } from '@/features/admin/hooks';
import { voltarPara } from '@/lib/navegacao';
import { NOTA_MAXIMA_LICAO } from '@/lib/regras';
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

const NOME_DA_ATIVIDADE = {
  transformacao: 'Transformação',
  traducao: 'Tradução',
  producao_livre: 'Produção livre',
} as const;

/** Editor de uma lição: as três atividades e os exercícios de cada uma. */
export default function EditorDeLicao() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: licao, isPending, isError } = useLicaoDoCms(id);
  const { criar } = useEscritaDeExercicio(id);
  const [aberto, setAberto] = useState<string | null>(null);

  if (isPending) return <Carregando />;
  if (isError || !licao)
    return (
      <Erro
        mensagem="Lição não encontrada."
        aoVoltar={() => voltarPara('/admin')}
      />
    );

  const exercicios = licao.atividades.flatMap((a) => a.exercicios);
  const noAr = exercicios.filter((e) => e.publicado);
  const rascunhos = exercicios.length - noAr.length;
  // Só o que está publicado conta: a nota do aluno é a soma dos pesos dos
  // exercícios que ele de fato recebe. Somar rascunho aqui daria um "10"
  // falso e a lição não fecharia na trilha.
  const somaDosPesos = noAr.reduce((n, e) => n + Number(e.peso), 0);
  const pesoBate = Math.abs(somaDosPesos - NOTA_MAXIMA_LICAO) < 0.01;

  const novoExercicio = (atividadeId: string, ultimaOrdem: number) => {
    criar.mutate(
      {
        atividade_id: atividadeId,
        tipo: 'escolher_forma',
        ordem: ultimaOrdem + 1,
        peso: 1,
        enunciado_pt: 'Qual é a forma certa?',
        dados: dadosDeEscolherForma(['', ''], '', false),
        // Nasce rascunho: um exercício em branco não pode aparecer na
        // trilha entre o "criar" e o primeiro salvamento.
        publicado: false,
      },
      { onSuccess: (criado) => setAberto(criado.id) },
    );
  };

  return (
    <View style={styles.tela}>
      <Sahovnica altura={6} />

      <View style={styles.cabecalho}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar para a lista"
          hitSlop={espaco.sm}
          onPress={() => voltarPara('/admin')}
        >
          <Ionicons name="arrow-back" size={24} color={cores.texto} />
        </Pressable>
        <Text style={styles.cabecalhoTitulo} numberOfLines={1}>
          {licao.titulo_pt}
        </Text>
        <View style={styles.espacador} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.conteudo,
          { paddingBottom: insets.bottom + espaco.xxl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.coluna}>
          <Text style={styles.caminho}>
            Unidade {licao.modulo?.ordem} · {licao.modulo?.tema_pt} · Lição{' '}
            {licao.ordem}
          </Text>

          <View style={[styles.somaDosPesos, !pesoBate && styles.somaTorta]}>
            <Ionicons
              name={pesoBate ? 'checkmark-circle' : 'warning'}
              size={18}
              color={pesoBate ? cores.acerto : cores.erro}
            />
            <Text style={styles.somaTexto}>
              {noAr.length} no ar
              {rascunhos > 0
                ? ` e ${rascunhos} em rascunho`
                : ''}, pesos somando{' '}
              {somaDosPesos.toFixed(1).replace('.', ',')} de {NOTA_MAXIMA_LICAO}
              {pesoBate ? '.' : ' — a lição não fecha a nota.'}
            </Text>
          </View>

          <View style={styles.avisoAoVivo}>
            <Ionicons name="eye" size={18} color={cores.textoSuave} />
            <Text style={styles.avisoTexto}>
              Exercício publicado vale para o aluno na próxima vez que ele
              abrir a lição — não há fila de aprovação. O que nasce aqui nasce
              rascunho; publicar é um passo à parte, dentro do exercício.
            </Text>
          </View>

          {licao.atividades.map((atividade) => (
            <View key={atividade.id} style={styles.atividade}>
              <View style={styles.atividadeTopo}>
                <Text style={styles.atividadeTipo}>
                  {NOME_DA_ATIVIDADE[atividade.tipo]}
                </Text>
                <Text style={styles.atividadeTitulo}>
                  {atividade.titulo_pt}
                </Text>
              </View>

              {atividade.exercicios.map((exercicio) => (
                <Exercicio
                  key={exercicio.id}
                  exercicio={exercicio}
                  licaoId={id}
                  aberto={aberto === exercicio.id}
                  aoAlternar={() =>
                    setAberto((atual) =>
                      atual === exercicio.id ? null : exercicio.id,
                    )
                  }
                />
              ))}

              <Pressable
                accessibilityRole="button"
                disabled={criar.isPending}
                onPress={() =>
                  novoExercicio(
                    atividade.id,
                    atividade.exercicios.at(-1)?.ordem ?? 0,
                  )
                }
                style={styles.adicionar}
              >
                <Ionicons name="add-circle" size={20} color={cores.primaria} />
                <Text style={styles.adicionarTexto}>
                  Novo exercício de escolher forma
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Exercicio({
  exercicio,
  licaoId,
  aberto,
  aoAlternar,
}: {
  exercicio: ExercicioDoCms;
  licaoId: string;
  aberto: boolean;
  aoAlternar: () => void;
}) {
  // Um tipo por vez: `escolher_forma` é o que está pronto. Os outros cinco
  // aparecem em leitura, com o recado explícito — melhor um editor
  // faltando e visível do que um editor que salva errado.
  const editavel = exercicio.tipo === 'escolher_forma';

  return (
    <View style={styles.exercicio}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: aberto, disabled: !editavel }}
        disabled={!editavel}
        onPress={aoAlternar}
        style={({ pressed }) => [
          styles.linha,
          pressed && editavel && styles.linhaPressionada,
        ]}
      >
        <View style={styles.selo}>
          <Text style={styles.seloTexto}>{exercicio.tipo}</Text>
        </View>
        {!exercicio.publicado && (
          <View style={[styles.selo, styles.seloRascunho]}>
            <Text style={[styles.seloTexto, styles.seloRascunhoTexto]}>
              rascunho
            </Text>
          </View>
        )}
        <Text style={styles.enunciado} numberOfLines={aberto ? undefined : 2}>
          {exercicio.enunciado_pt}
        </Text>
        <Text style={styles.peso}>
          {Number(exercicio.peso).toFixed(1).replace('.', ',')}
        </Text>
        <Ionicons
          name={
            editavel ? (aberto ? 'chevron-up' : 'chevron-down') : 'lock-closed'
          }
          size={18}
          color={cores.contorno}
        />
      </Pressable>

      {aberto && editavel && (
        <EditorEscolherForma
          exercicio={exercicio}
          licaoId={licaoId}
          aoFechar={aoAlternar}
        />
      )}
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
  cabecalhoTitulo: {
    flex: 1,
    fontSize: fonte.subtitulo,
    lineHeight: linha.subtitulo,
    fontFamily: familia.forte,
    color: cores.texto,
  },
  espacador: { width: 24 },

  conteudo: { padding: espaco.md, alignItems: 'center' },
  coluna: { width: '100%', maxWidth: larguraMaximaConteudo, gap: espaco.md },
  caminho: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },

  somaDosPesos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    padding: espaco.sm + espaco.xs,
    borderRadius: raio.md,
    backgroundColor: cores.acertoSuave,
  },
  somaTorta: { backgroundColor: cores.erroSuave },
  somaTexto: {
    flex: 1,
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.texto,
  },
  avisoAoVivo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    padding: espaco.sm + espaco.xs,
    borderRadius: raio.md,
    backgroundColor: cores.superficieAlta,
  },
  avisoTexto: {
    flex: 1,
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },

  atividade: {
    gap: espaco.sm,
    padding: espaco.md,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  atividadeTopo: { gap: 2 },
  atividadeTipo: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.forte,
    color: cores.textoSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  atividadeTitulo: {
    fontSize: fonte.subtitulo,
    lineHeight: linha.subtitulo,
    letterSpacing: tracking.titulo,
    fontFamily: familia.forte,
    color: cores.texto,
  },

  exercicio: { gap: espaco.sm },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    padding: espaco.sm,
    borderRadius: raio.md,
    backgroundColor: cores.fundoSuave,
  },
  linhaPressionada: { backgroundColor: cores.primariaSuave },
  selo: {
    paddingHorizontal: espaco.sm,
    paddingVertical: 2,
    borderRadius: raio.sm,
    backgroundColor: cores.superficieVariante,
  },
  seloTexto: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.textoSuave,
  },
  seloRascunho: { backgroundColor: cores.primariaSuave },
  seloRascunhoTexto: { color: cores.primaria, fontFamily: familia.forte },
  enunciado: {
    flex: 1,
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.texto,
  },
  peso: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.forte,
    color: cores.textoSuave,
  },

  adicionar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
    alignSelf: 'flex-start',
    paddingVertical: espaco.xs,
  },
  adicionarTexto: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.forte,
    color: cores.primaria,
  },
});
