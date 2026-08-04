import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Carregando, Erro } from '@/components/Estados';
import { cores, espaco, fonte, peso, raio } from '@/theme/tokens';

import { useLetras } from './hooks';

export function ListaAlfabeto() {
  const { data, isPending, isError } = useLetras();

  if (isPending) return <Carregando />;
  if (isError) return <Erro />;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.lista}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={styles.linha}>
          <View style={styles.selo}>
            <Text style={styles.letra}>{item.letra}</Text>
          </View>
          <View style={styles.texto}>
            <Text style={styles.som}>{item.som_pt}</Text>
            {item.exemplo_hr && (
              <Text style={styles.exemplo}>{item.exemplo_hr}</Text>
            )}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  lista: { gap: espaco.sm, paddingVertical: espaco.md },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.md,
    backgroundColor: cores.superficie,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  selo: {
    minWidth: 64,
    paddingHorizontal: espaco.sm,
    paddingVertical: espaco.xs,
    borderRadius: raio.sm,
    backgroundColor: cores.primariaSuave,
    alignItems: 'center',
  },
  letra: {
    fontSize: fonte.subtitulo,
    fontWeight: peso.forte,
    color: cores.primaria,
  },
  texto: { flex: 1, gap: 2 },
  som: { fontSize: fonte.corpo, color: cores.texto },
  exemplo: {
    fontSize: fonte.pequena,
    color: cores.textoSuave,
    fontStyle: 'italic',
  },
});
