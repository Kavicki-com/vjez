import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import {
  cores,
  espaco,
  familia,
  fonte,
  linha,
  raio,
} from '@/theme/tokens';

type Props<T extends string> = {
  opcoes: readonly { valor: T; rotulo: string }[];
  selecionado: T;
  aoSelecionar: (valor: T) => void;
};

/** Alternador de seções. Rola na horizontal quando não cabe. */
export function Segmentos<T extends string>({
  opcoes,
  selecionado,
  aoSelecionar,
}: Props<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // Sem isso o ScrollView é achatado pelo irmão flex:1 da coluna.
      style={styles.trilho}
      contentContainerStyle={styles.faixa}
    >
      {opcoes.map((opcao) => {
        const ativo = opcao.valor === selecionado;
        return (
          <Pressable
            key={opcao.valor}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativo }}
            onPress={() => aoSelecionar(opcao.valor)}
            style={({ pressed }) => [
              styles.pilula,
              ativo && styles.pilulaAtiva,
              pressed && !ativo && styles.pilulaPressionada,
            ]}
          >
            <Text style={[styles.rotulo, ativo && styles.rotuloAtivo]}>
              {opcao.rotulo}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  trilho: { flexGrow: 0, flexShrink: 0 },
  // Respiro maior em cima: as pílulas ficavam coladas na linha tracejada
  // do cabeçalho.
  faixa: { gap: espaco.sm, paddingTop: espaco.lg, paddingBottom: espaco.sm },
  pilula: {
    paddingVertical: espaco.sm,
    paddingHorizontal: espaco.md,
    borderRadius: raio.pill,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  pilulaAtiva: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  pilulaPressionada: { backgroundColor: cores.fundoSuave },
  rotulo: {
    fontSize: fonte.pequena, lineHeight: linha.pequena + 1,
    fontFamily: familia.medio,
    color: cores.textoSuave,
  },
  rotuloAtivo: { color: cores.superficie },
});
