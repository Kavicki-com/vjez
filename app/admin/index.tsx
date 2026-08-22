import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Carregando, Erro } from '@/components/Estados';
import { Sahovnica } from '@/components/Sahovnica';
import { useModulosDoCms } from '@/features/admin/hooks';
import { voltarPara } from '@/lib/navegacao';
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

/**
 * Índice do CMS: a trilha inteira numa tela.
 *
 * Módulos com as lições aninhadas, e não uma tela por nível: o currículo
 * tem dezenas de lições, não milhares, e quem cadastra precisa justamente
 * da visão do todo — onde há buraco, onde a ordem pulou. Dois toques
 * separando o curador do exercício, em vez de três.
 */
export default function IndiceDoCms() {
  const insets = useSafeAreaInsets();
  const { data: modulos, isPending, isError } = useModulosDoCms();

  if (isPending) return <Carregando />;
  if (isError || !modulos)
    return (
      <Erro
        mensagem="Não deu para carregar o conteúdo."
        aoVoltar={() => voltarPara('/')}
      />
    );

  return (
    <View style={styles.tela}>
      <Sahovnica altura={6} />

      <View style={styles.cabecalho}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sair da curadoria"
          hitSlop={espaco.sm}
          onPress={() => voltarPara('/')}
        >
          <Ionicons name="arrow-back" size={24} color={cores.texto} />
        </Pressable>
        <Text style={styles.cabecalhoTitulo}>Curadoria</Text>
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
          <Text style={styles.intro}>
            {modulos.length} unidades ·{' '}
            {modulos.reduce((n, m) => n + m.licoes.length, 0)} lições. Toque
            numa lição para editar os exercícios dela.
          </Text>

          {modulos.map((modulo) => (
            <View key={modulo.id} style={styles.modulo}>
              <View style={styles.moduloTopo}>
                <View style={styles.ordem}>
                  <Text style={styles.ordemTexto}>{modulo.ordem}</Text>
                </View>
                <View style={styles.moduloTexto}>
                  <Text style={styles.moduloTema}>{modulo.tema_pt}</Text>
                  <Text style={styles.moduloMeta}>
                    {modulo.nivel} · {modulo.fase}
                    {modulo.padez ? ` · ${modulo.padez}` : ''}
                  </Text>
                </View>
              </View>

              {modulo.licoes.length === 0 ? (
                <Text style={styles.semLicoes}>
                  Nenhuma lição cadastrada nesta unidade.
                </Text>
              ) : (
                <View style={styles.licoes}>
                  {modulo.licoes.map((licao) => (
                    <Pressable
                      key={licao.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Editar ${licao.titulo_pt}`}
                      onPress={() => router.push(`/admin/licao/${licao.id}`)}
                      style={({ pressed }) => [
                        styles.licao,
                        pressed && styles.licaoPressionada,
                      ]}
                    >
                      <Text style={styles.licaoOrdem}>{licao.ordem}</Text>
                      <Text style={styles.licaoTitulo} numberOfLines={1}>
                        {licao.titulo_pt}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={cores.contorno}
                      />
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          ))}
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
  intro: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },

  modulo: {
    gap: espaco.sm,
    padding: espaco.md,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  moduloTopo: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  ordem: {
    width: 36,
    height: 36,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.primariaSuave,
  },
  ordemTexto: {
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.extraForte,
    color: cores.primaria,
  },
  moduloTexto: { flex: 1, gap: 2 },
  moduloTema: {
    fontSize: fonte.subtitulo,
    lineHeight: linha.subtitulo,
    letterSpacing: tracking.titulo,
    fontFamily: familia.forte,
    color: cores.texto,
  },
  moduloMeta: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },
  semLicoes: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
    fontStyle: 'italic',
  },
  licoes: { gap: espaco.xs },
  licao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    paddingVertical: espaco.sm,
    paddingHorizontal: espaco.sm,
    borderRadius: raio.md,
    backgroundColor: cores.fundoSuave,
  },
  licaoPressionada: { backgroundColor: cores.primariaSuave },
  licaoOrdem: {
    width: 20,
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.forte,
    color: cores.textoSuave,
  },
  licaoTitulo: {
    flex: 1,
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.medio,
    color: cores.texto,
  },
});
