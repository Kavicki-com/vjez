import { Pressable, StyleSheet, Text } from 'react-native';

import { cores, espaco, fonte, peso, raio } from '@/theme/tokens';

type Props = {
  rotulo: string;
  aoTocar: () => void;
  desabilitado?: boolean;
  variante?: 'primaria' | 'secundaria';
};

export function Botao({
  rotulo,
  aoTocar,
  desabilitado,
  variante = 'primaria',
}: Props) {
  const secundaria = variante === 'secundaria';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado }}
      disabled={desabilitado}
      onPress={aoTocar}
      style={({ pressed }) => [
        styles.base,
        secundaria ? styles.secundaria : styles.primaria,
        pressed && !desabilitado && styles.pressionado,
        desabilitado && styles.desabilitado,
      ]}
    >
      <Text
        style={[
          styles.rotulo,
          secundaria ? styles.rotuloSecundario : styles.rotuloPrimario,
          desabilitado && styles.rotuloDesabilitado,
        ]}
      >
        {rotulo}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espaco.lg,
    borderRadius: raio.md,
    borderWidth: 1,
  },
  primaria: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  secundaria: { backgroundColor: cores.superficie, borderColor: cores.borda },
  pressionado: { opacity: 0.85 },
  desabilitado: {
    backgroundColor: cores.fundoSuave,
    borderColor: cores.borda,
  },
  rotulo: { fontSize: fonte.corpo, fontWeight: peso.forte },
  rotuloPrimario: { color: cores.superficie },
  rotuloSecundario: { color: cores.texto },
  rotuloDesabilitado: { color: cores.textoSuave },
});
