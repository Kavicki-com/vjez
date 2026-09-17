import { StyleSheet, View } from 'react-native';

import { TabelaConjugacao } from '@/features/conjugacao/TabelaConjugacao';
import { cores, espaco, larguraMaximaConteudo } from '@/theme/tokens';

export default function Konjugacija() {
  return (
    <View style={styles.tela}>
      <View style={styles.coluna}>
        <TabelaConjugacao />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, alignItems: 'center' },
  coluna: {
    flex: 1,
    width: '100%',
    maxWidth: larguraMaximaConteudo,
    paddingHorizontal: espaco.md,
  },
});
