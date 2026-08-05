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

import { useNumeros } from './hooks';

export function ListaNumeros() {
  const { data, isPending, isError } = useNumeros();

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
          <Text style={styles.valor}>{item.valor}</Text>
          <View style={styles.textoNumero}>
            <Text style={styles.hr}>{item.hr}</Text>
            {item.pronuncia_pt && (
              <Text style={styles.pronuncia}>{item.pronuncia_pt}</Text>
            )}
          </View>
          {item.audioUrl && <BotaoAudio url={item.audioUrl} rotulo={item.hr} />}
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
    paddingVertical: espaco.sm + espaco.xs,
    paddingHorizontal: espaco.md,
    backgroundColor: cores.superficie,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  valor: {
    minWidth: 56,
    fontSize: fonte.subtitulo, lineHeight: linha.subtitulo,
    fontFamily: familia.forte,
    color: cores.secundaria,
  },
  textoNumero: { flex: 1, gap: 2 },
  hr: { fontSize: fonte.corpo, lineHeight: linha.corpo, fontFamily: familia.normal, color: cores.texto },
  pronuncia: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.medio,
    color: cores.secundaria,
    letterSpacing: 0.4,
  },
});
