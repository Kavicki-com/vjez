import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { cores, espaco, fonte, raio } from '@/theme/tokens';

type Props = {
  titulo: string;
  descricao: string;
  itens?: string[];
};

/** Tela provisória: marca o lugar de uma etapa ainda não construída. */
export function Placeholder({ titulo, descricao, itens }: Props) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.cartao}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.descricao}>{descricao}</Text>
        {itens?.map((item) => (
          <View key={item} style={styles.linha}>
            <View style={styles.marcador} />
            <Text style={styles.item}>{item}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: cores.fundoSuave },
  conteudo: {
    padding: espaco.md,
    alignItems: 'center',
  },
  cartao: {
    width: '100%',
    maxWidth: 720,
    backgroundColor: cores.fundo,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.lg,
    gap: espaco.sm,
  },
  titulo: { fontSize: fonte.titulo, fontWeight: '700', color: cores.texto },
  descricao: {
    fontSize: fonte.corpo,
    color: cores.textoSuave,
    marginBottom: espaco.sm,
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  marcador: {
    width: espaco.sm,
    height: espaco.sm,
    borderRadius: raio.pill,
    backgroundColor: cores.primaria,
  },
  item: { fontSize: fonte.corpo, color: cores.texto, flexShrink: 1 },
});
