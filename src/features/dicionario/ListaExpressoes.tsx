import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Carregando, Erro } from '@/components/Estados';
import {
  cores,
  espaco,
  familia,
  fonte,
  raio,
} from '@/theme/tokens';

import { useExpressoes } from './hooks';

export function ListaExpressoes() {
  const { data, isPending, isError } = useExpressoes();

  if (isPending) return <Carregando />;
  if (isError) return <Erro />;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.lista}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={styles.cartao}>
          <Text style={styles.hr}>{item.hr}</Text>
          <Text style={styles.pt}>{item.pt}</Text>
          {item.contexto && (
            <Text style={styles.contexto}>{item.contexto}</Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  lista: { gap: espaco.sm, paddingVertical: espaco.md },
  cartao: {
    padding: espaco.md,
    backgroundColor: cores.superficie,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    gap: espaco.xs,
  },
  hr: {
    fontSize: fonte.subtitulo,
    fontFamily: familia.forte,
    color: cores.primaria,
  },
  pt: { fontSize: fonte.corpo, fontFamily: familia.normal, color: cores.texto },
  contexto: { fontSize: fonte.pequena, fontFamily: familia.normal, color: cores.textoSuave },
});
