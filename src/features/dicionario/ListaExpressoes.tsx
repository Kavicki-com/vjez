import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Carregando, Erro } from '@/components/Estados';
import { BotaoAudio } from '@/features/audio/BotaoAudio';
import {
  cores,
  espaco,
  familia,
  fonte,
  linha,
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
          <View style={styles.linhaHr}>
            <Text style={styles.hr}>{item.hr}</Text>
            {item.audioUrl && (
              <BotaoAudio url={item.audioUrl} rotulo={item.hr} />
            )}
          </View>
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
  linhaHr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaco.sm,
  },
  hr: {
    flex: 1,
    fontSize: fonte.subtitulo, lineHeight: linha.subtitulo,
    fontFamily: familia.forte,
    color: cores.primaria,
  },
  pt: { fontSize: fonte.corpo, lineHeight: linha.corpo, fontFamily: familia.normal, color: cores.texto },
  contexto: { fontSize: fonte.pequena, lineHeight: linha.pequena, fontFamily: familia.normal, color: cores.textoSuave },
});
