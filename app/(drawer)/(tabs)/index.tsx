import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Carregando, Erro } from '@/components/Estados';
import { useTrilha } from '@/features/licao/hooks';
import {
  cores,
  espaco,
  fonte,
  larguraMaximaConteudo,
  peso,
  raio,
} from '@/theme/tokens';

export default function Inicio() {
  const { data, isPending, isError } = useTrilha();

  if (isPending) return <Carregando />;
  if (isError) return <Erro />;

  return (
    <View style={styles.tela}>
      <FlatList
        data={data}
        keyExtractor={(m) => m.id}
        style={styles.lista}
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: modulo }) => (
          <View style={styles.coluna}>
            <View style={styles.cabecalhoModulo}>
              <View style={styles.selo}>
                <Text style={styles.seloTexto}>{modulo.ordem}</Text>
              </View>
              <Text style={styles.tema}>{modulo.tema_pt}</Text>
            </View>

            {modulo.licoes.length === 0 ? (
              <View style={styles.emBreve}>
                <Text style={styles.emBreveTexto}>Lições em preparação</Text>
              </View>
            ) : (
              modulo.licoes.map((licao) => (
                <Pressable
                  key={licao.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir lição ${licao.titulo_pt}`}
                  onPress={() => router.push(`/licao/${licao.id}`)}
                  style={({ pressed }) => [
                    styles.licao,
                    pressed && styles.licaoPressionada,
                  ]}
                >
                  <View style={styles.licaoTexto}>
                    <Text style={styles.licaoOrdem}>Lição {licao.ordem}</Text>
                    <Text style={styles.licaoTitulo}>{licao.titulo_pt}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={cores.primaria}
                  />
                </Pressable>
              ))
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  lista: { flex: 1 },
  conteudo: { padding: espaco.md, alignItems: 'center', gap: espaco.lg },
  coluna: { width: '100%', maxWidth: larguraMaximaConteudo, gap: espaco.sm },
  cabecalhoModulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
  },
  selo: {
    width: 28,
    height: 28,
    borderRadius: raio.pill,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seloTexto: {
    fontSize: fonte.pequena,
    fontWeight: peso.forte,
    color: cores.superficie,
  },
  tema: {
    flex: 1,
    fontSize: fonte.subtitulo,
    fontWeight: peso.forte,
    color: cores.texto,
  },
  licao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  licaoPressionada: { backgroundColor: cores.primariaSuave },
  licaoTexto: { flex: 1, gap: 2 },
  licaoOrdem: { fontSize: fonte.pequena, color: cores.textoSuave },
  licaoTitulo: { fontSize: fonte.corpo, color: cores.texto, fontWeight: peso.medio },
  emBreve: {
    padding: espaco.md,
    borderRadius: raio.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: cores.borda,
  },
  emBreveTexto: { fontSize: fonte.pequena, color: cores.textoSuave },
});
