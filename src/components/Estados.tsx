import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { cores, espaco, fonte } from '@/theme/tokens';

export function Carregando() {
  return (
    <View style={styles.centro}>
      <ActivityIndicator color={cores.primaria} />
    </View>
  );
}

export function Erro({ mensagem }: { mensagem?: string }) {
  return (
    <View style={styles.centro}>
      <Text style={styles.titulo}>Não deu para carregar</Text>
      <Text style={styles.texto}>
        {mensagem ?? 'Verifique sua conexão e tente de novo.'}
      </Text>
    </View>
  );
}

export function Vazio({ texto }: { texto: string }) {
  return (
    <View style={styles.centro}>
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaco.xl,
    gap: espaco.xs,
  },
  titulo: { fontSize: fonte.subtitulo, fontWeight: '700', color: cores.texto },
  texto: {
    fontSize: fonte.corpo,
    color: cores.textoSuave,
    textAlign: 'center',
  },
});
