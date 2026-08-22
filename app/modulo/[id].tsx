import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Botao } from '@/components/Botao';
import { Carregando, Erro } from '@/components/Estados';
import { Sahovnica } from '@/components/Sahovnica';
import { useTrilhaMontada } from '@/features/trilha/useTrilhaMontada';
import { voltarPara } from '@/lib/navegacao';
import { etiquetaDoCaso } from '@/lib/padez';
import {
  CHECKPOINT_NOTA_MINIMA,
  NOTA_MAXIMA_LICAO,
} from '@/lib/regras';
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

export default function TelaModulo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { trilha, isPending, isError, notasDoServidor, notasLocais } =
    useTrilhaMontada();

  const modulo = trilha.find((m) => m.id === id);

  // Nota da unidade: média das lições já feitas, sobre 10.
  const notasDoModulo = useMemo(() => {
    if (!modulo) return [];
    const doServidor = new Map(notasDoServidor.map((p) => [p.licaoId, p.nota]));
    return modulo.licoes
      .map((l) => notasLocais[l.id] ?? doServidor.get(l.id))
      .filter((n): n is number => typeof n === 'number');
  }, [modulo, notasLocais, notasDoServidor]);

  if (isPending) return <Carregando />;
  if (isError || !modulo)
    return (
      <Erro mensagem="Unidade não encontrada." aoVoltar={() => voltarPara('/')} />
    );

  const media =
    notasDoModulo.length > 0
      ? notasDoModulo.reduce((a, b) => a + b, 0) / notasDoModulo.length
      : null;

  const fracao = modulo.total ? modulo.concluidas / modulo.total : 0;
  const tudoFeito = modulo.total > 0 && modulo.concluidas === modulo.total;
  const icone = (modulo.icone ?? 'ellipse') as keyof typeof Ionicons.glyphMap;

  // Módulo bloqueado abre para consulta, mas as lições não.
  const trancado = modulo.estado === 'bloqueado';
  const podeFazerCheckpoint = !trancado && modulo.checkpointLiberado;

  const notaDaLicao = (licaoId: string) =>
    notasLocais[licaoId] ??
    notasDoServidor.find((p) => p.licaoId === licaoId)?.nota;

  // Onde o aluno parou: a primeira lição ainda não feita — e, quando todas
  // estão feitas, a prova, que é o passo seguinte de verdade. Sem isto ele
  // volta à unidade e tem que varrer a lista para achar onde continuar,
  // que é exatamente o atrito que faz a ofensiva morrer.
  const proximaLicao = trancado
    ? undefined
    : modulo.licoes.find((l) => typeof notaDaLicao(l.id) !== 'number');

  const proximoPasso = proximaLicao
    ? {
        rotulo: modulo.concluidas === 0 ? 'Começar a unidade' : 'Continuar',
        detalhe: `Lição ${proximaLicao.ordem} · ${proximaLicao.titulo_pt}`,
        ir: () => router.push(`/licao/${proximaLicao.id}`),
      }
    : tudoFeito && podeFazerCheckpoint && !modulo.checkpointPassado
      ? {
          rotulo: 'Fazer a prova da unidade',
          detalhe: 'Todas as lições concluídas',
          ir: () => router.push(`/checkpoint/${modulo.id}`),
        }
      : null;

  return (
    <View style={styles.tela}>
      <Sahovnica altura={6} />

      <View style={[styles.cabecalho, { paddingTop: espaco.sm }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar para a trilha"
          hitSlop={espaco.sm}
          onPress={() => voltarPara('/')}
        >
          <Ionicons name="arrow-back" size={24} color={cores.texto} />
        </Pressable>
        <Text style={styles.cabecalhoTitulo} numberOfLines={1}>
          Unidade {modulo.ordem}
        </Text>
        <View style={styles.espacador} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.conteudo,
          { paddingBottom: insets.bottom + espaco.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coluna}>
          <View style={styles.capa}>
            <View style={styles.capaIcone}>
              <Ionicons name={icone} size={44} color={cores.superficie} />
            </View>
            {modulo.padez && (
              <View style={styles.selo}>
                <Text style={styles.seloTexto}>
                  {etiquetaDoCaso(modulo.padez)}
                </Text>
              </View>
            )}
            <Text style={styles.tema}>{modulo.tema_pt}</Text>

            <View style={styles.barra}>
              <View style={[styles.barraCheia, { width: `${fracao * 100}%` }]} />
            </View>
            <Text style={styles.progressoTexto}>
              {modulo.total === 0
                ? 'Lições em preparação'
                : `${modulo.concluidas} de ${modulo.total} lições concluídas`}
            </Text>
          </View>

          <View style={styles.bento}>
            <View style={styles.celula}>
              <Text style={styles.celulaValor}>
                {media === null ? '—' : media.toFixed(1).replace('.', ',')}
              </Text>
              <Text style={styles.celulaRotulo}>
                nota média de {NOTA_MAXIMA_LICAO}
              </Text>
            </View>
            <View style={styles.celula}>
              <Text style={styles.celulaValor}>
                {Math.round(fracao * 100)}%
              </Text>
              <Text style={styles.celulaRotulo}>da unidade</Text>
            </View>
          </View>

          {proximoPasso && (
            <View style={styles.proximo}>
              <View style={styles.proximoTexto}>
                <Text style={styles.proximoRotulo}>Próximo passo</Text>
                <Text style={styles.proximoTitulo} numberOfLines={2}>
                  {proximoPasso.detalhe}
                </Text>
              </View>
              <Botao rotulo={proximoPasso.rotulo} aoTocar={proximoPasso.ir} />
            </View>
          )}

          <Text style={styles.secao}>Lições</Text>

          {trancado && modulo.licoes.length > 0 && (
            <View style={styles.aviso}>
              <Ionicons name="lock-closed" size={18} color={cores.textoSuave} />
              <Text style={styles.avisoTexto}>
                Termine a unidade anterior para abrir estas lições.
              </Text>
            </View>
          )}

          {modulo.licoes.length === 0 ? (
            <View style={styles.vazio}>
              <Text style={styles.vazioTexto}>
                A curadoria ainda está preparando as lições desta unidade.
              </Text>
            </View>
          ) : (
            <View style={styles.lista}>
              {modulo.licoes.map((licao) => {
                const nota = notaDaLicao(licao.id);
                const feita = typeof nota === 'number';
                return (
                  <Pressable
                    key={licao.id}
                    accessibilityRole="button"
                    accessibilityLabel={
                      trancado
                        ? `${licao.titulo_pt}, bloqueada`
                        : feita
                          ? `Refazer ${licao.titulo_pt}`
                          : `Começar ${licao.titulo_pt}`
                    }
                    accessibilityState={{ disabled: trancado }}
                    disabled={trancado}
                    onPress={() => router.push(`/licao/${licao.id}`)}
                    style={({ pressed }) => [
                      styles.linha,
                      feita && styles.linhaFeita,
                      trancado && styles.linhaTrancada,
                      pressed && !trancado && styles.linhaPressionada,
                    ]}
                  >
                    <View
                      style={[
                        styles.marcador,
                        feita && styles.marcadorFeito,
                      ]}
                    >
                      <Ionicons
                        name={
                          trancado ? 'lock-closed' : feita ? 'checkmark' : 'play'
                        }
                        size={18}
                        color={feita ? cores.superficie : cores.primaria}
                      />
                    </View>

                    <View style={styles.linhaTexto}>
                      <Text style={styles.linhaOrdem}>Lição {licao.ordem}</Text>
                      <Text style={styles.linhaTitulo}>{licao.titulo_pt}</Text>
                    </View>

                    <View style={styles.linhaFim}>
                      {feita && (
                        <Text style={styles.linhaNota}>
                          {nota.toFixed(1).replace('.', ',')}
                        </Text>
                      )}
                      <Text style={styles.linhaAcao}>
                        {trancado ? '' : feita ? 'Refazer' : 'Começar'}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Text style={styles.secao}>Checkpoint</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fazer o checkpoint da unidade"
            accessibilityState={{ disabled: !podeFazerCheckpoint }}
            disabled={!podeFazerCheckpoint}
            onPress={() => router.push(`/checkpoint/${modulo.id}`)}
            style={({ pressed }) => [
              styles.checkpoint,
              modulo.checkpointPassado && styles.checkpointFeito,
              !podeFazerCheckpoint && styles.checkpointTrancado,
              pressed && podeFazerCheckpoint && styles.linhaPressionada,
            ]}
          >
            <Ionicons
              name={
                modulo.checkpointPassado
                  ? 'ribbon'
                  : podeFazerCheckpoint
                    ? 'flag'
                    : 'lock-closed'
              }
              size={22}
              color={
                modulo.checkpointPassado
                  ? cores.acerto
                  : podeFazerCheckpoint
                    ? cores.primaria
                    : cores.contorno
              }
            />
            <View style={styles.linhaTexto}>
              <Text style={styles.checkpointTitulo}>Prova da unidade</Text>
              <Text style={styles.checkpointTexto}>
                {modulo.checkpointPassado
                  ? 'Você já passou. Dá para refazer quando quiser.'
                  : podeFazerCheckpoint
                    ? `Sorteia exercícios desta unidade, priorizando os que você errou. Precisa de ${Math.round(CHECKPOINT_NOTA_MINIMA * 100)}% para passar e liberar a próxima unidade.`
                    : 'Abre quando todas as lições da unidade estiverem concluídas.'}
              </Text>
            </View>
            {podeFazerCheckpoint && (
              <Text style={styles.linhaAcao}>
                {modulo.checkpointPassado ? 'Refazer' : 'Fazer'}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
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

  capa: {
    alignItems: 'center',
    gap: espaco.sm,
    padding: espaco.lg,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  capaIcone: {
    width: 88,
    height: 88,
    borderRadius: raio.pill,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selo: {
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.xs,
    borderRadius: raio.pill,
    backgroundColor: cores.secundariaSuave,
  },
  seloTexto: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.forte,
    color: cores.sobreSecundariaContainer,
    letterSpacing: tracking.rotulo,
  },
  tema: {
    fontSize: fonte.titulo,
    lineHeight: linha.titulo,
    letterSpacing: tracking.titulo,
    fontFamily: familia.extraForte,
    color: cores.texto,
    textAlign: 'center',
  },
  barra: {
    width: '100%',
    height: 10,
    borderRadius: raio.pill,
    backgroundColor: cores.superficieVariante,
    overflow: 'hidden',
    marginTop: espaco.xs,
  },
  barraCheia: { height: '100%', backgroundColor: cores.secundaria },
  progressoTexto: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.textoSuave,
  },

  bento: { flexDirection: 'row', gap: espaco.md },
  celula: {
    flex: 1,
    alignItems: 'center',
    gap: espaco.xs,
    padding: espaco.md,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  celulaValor: {
    fontSize: fonte.tituloGrande,
    lineHeight: linha.tituloGrande,
    fontFamily: familia.extraForte,
    color: cores.texto,
  },
  celulaRotulo: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.textoSuave,
    textAlign: 'center',
  },

  // Cartão do próximo passo: fica acima da lista porque é a resposta para
  // "e agora?", que é a pergunta com que o aluno abre esta tela.
  proximo: {
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  proximoTexto: { gap: 2 },
  proximoRotulo: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.forte,
    color: cores.textoSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  proximoTitulo: {
    fontSize: fonte.subtitulo,
    lineHeight: linha.subtitulo,
    fontFamily: familia.forte,
    color: cores.texto,
  },

  secao: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.forte,
    color: cores.textoSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: espaco.sm,
  },
  lista: { gap: espaco.sm },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  // Borda verde = concluída. Cinza (a padrão) = ainda não feita.
  linhaFeita: { borderColor: cores.acerto },
  linhaPressionada: { backgroundColor: cores.primariaSuave },
  linhaTrancada: { opacity: 0.55 },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    padding: espaco.md,
    borderRadius: raio.lg,
    backgroundColor: cores.superficieAlta,
  },
  avisoTexto: {
    flex: 1,
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.textoSuave,
  },
  marcador: {
    width: 40,
    height: 40,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.primariaSuave,
  },
  marcadorFeito: { backgroundColor: cores.acerto },
  linhaTexto: { flex: 1, gap: 2 },
  linhaOrdem: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },
  linhaTitulo: {
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.medio,
    color: cores.texto,
  },
  linhaFim: { alignItems: 'flex-end', gap: 2 },
  linhaNota: {
    fontSize: fonte.subtitulo,
    lineHeight: linha.subtitulo,
    fontFamily: familia.extraForte,
    color: cores.acerto,
  },
  linhaAcao: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.forte,
    color: cores.primaria,
  },

  vazio: {
    padding: espaco.md,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: cores.borda,
  },
  vazioTexto: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },

  checkpoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  checkpointTrancado: { opacity: 0.7 },
  checkpointFeito: { borderColor: cores.acerto },
  checkpointTitulo: {
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.forte,
    color: cores.texto,
  },
  checkpointTexto: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },
});
