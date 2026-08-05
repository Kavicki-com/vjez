import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Carregando, Erro } from '@/components/Estados';
import { Sahovnica } from '@/components/Sahovnica';
import { useTrilha } from '@/features/licao/hooks';
import { useProgressoLocal } from '@/features/perfil/ProgressoLocal';
import { usePerfil, useProgressoLicoes } from '@/features/perfil/hooks';
import { montarTrilha } from '@/features/trilha/estado';
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
import type { ProgressoLicao } from '@/types/schema';

export default function TelaModulo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: modulos, isPending, isError } = useTrilha();
  const { data: perfil } = usePerfil();
  const { data: progressoServidor } = useProgressoLicoes();
  const { notas } = useProgressoLocal();

  const trilha = useMemo(() => {
    if (!modulos) return [];
    const local: ProgressoLicao[] = Object.entries(notas).map(
      ([licaoId, nota]) => ({
        usuarioId: perfil?.id ?? 'convidado',
        licaoId,
        nota,
        concluida: true,
        data: '',
      }),
    );
    return montarTrilha(modulos, [...(progressoServidor ?? []), ...local]);
  }, [modulos, progressoServidor, notas, perfil?.id]);

  const modulo = trilha.find((m) => m.id === id);

  // Nota da unidade: média das lições já feitas, sobre 10.
  const notasDoModulo = useMemo(() => {
    if (!modulo) return [];
    const doServidor = new Map(
      (progressoServidor ?? []).map((p) => [p.licaoId, p.nota]),
    );
    return modulo.licoes
      .map((l) => notas[l.id] ?? doServidor.get(l.id))
      .filter((n): n is number => typeof n === 'number');
  }, [modulo, notas, progressoServidor]);

  if (isPending) return <Carregando />;
  if (isError || !modulo) return <Erro mensagem="Unidade não encontrada." />;

  const media =
    notasDoModulo.length > 0
      ? notasDoModulo.reduce((a, b) => a + b, 0) / notasDoModulo.length
      : null;

  const fracao = modulo.total ? modulo.concluidas / modulo.total : 0;
  const tudoFeito = modulo.total > 0 && modulo.concluidas === modulo.total;
  const icone = (modulo.icone ?? 'ellipse') as keyof typeof Ionicons.glyphMap;

  // Módulo bloqueado abre para consulta, mas as lições não.
  const trancado = modulo.estado === 'bloqueado';

  const notaDaLicao = (licaoId: string) =>
    notas[licaoId] ??
    (progressoServidor ?? []).find((p) => p.licaoId === licaoId)?.nota;

  return (
    <View style={styles.tela}>
      <Sahovnica altura={6} />

      <View style={[styles.cabecalho, { paddingTop: espaco.sm }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar para a trilha"
          hitSlop={espaco.sm}
          onPress={() => router.back()}
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
          <View style={[styles.checkpoint, !tudoFeito && styles.checkpointTrancado]}>
            <Ionicons
              name={tudoFeito ? 'flag' : 'lock-closed'}
              size={22}
              color={tudoFeito ? cores.primaria : cores.contorno}
            />
            <View style={styles.linhaTexto}>
              <Text style={styles.checkpointTitulo}>
                Prova da unidade
              </Text>
              <Text style={styles.checkpointTexto}>
                {tudoFeito
                  ? `Sorteia exercícios desta unidade, priorizando os que você errou. Precisa de ${Math.round(CHECKPOINT_NOTA_MINIMA * 100)}% para passar.`
                  : 'Abre quando todas as lições da unidade estiverem concluídas.'}
              </Text>
              <Text style={styles.checkpointAviso}>Ainda não disponível.</Text>
            </View>
          </View>
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
  barraCheia: { height: '100%', backgroundColor: cores.primaria },
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
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  checkpointTrancado: { opacity: 0.7 },
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
  checkpointAviso: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.contorno,
    marginTop: espaco.xs,
  },
});
