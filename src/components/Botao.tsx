import { Pressable, StyleSheet, Text } from 'react-native';

import {
  cores,
  espaco,
  familia,
  fonte,
  linha,
  raio,
  relevo,
  sombraSolida,
} from '@/theme/tokens';

type Props = {
  rotulo: string;
  aoTocar: () => void;
  desabilitado?: boolean;
  variante?: 'primaria' | 'secundaria' | 'acerto' | 'erro';
};

const TONS = {
  primaria: { fundo: cores.primaria, baixo: sombraSolida.primaria, texto: cores.superficie },
  acerto: { fundo: cores.acerto, baixo: sombraSolida.acerto, texto: cores.superficie },
  erro: { fundo: cores.erro, baixo: sombraSolida.erro, texto: cores.superficie },
  secundaria: { fundo: cores.superficie, baixo: sombraSolida.neutra, texto: cores.texto },
} as const;

/**
 * Botão com relevo sólido: a borda inferior escura some ao pressionar e o
 * botão desce, dando a sensação de afundar. A margem compensa a borda
 * perdida para o bloco não pular de altura.
 */
export function Botao({
  rotulo,
  aoTocar,
  desabilitado,
  variante = 'primaria',
}: Props) {
  const tom = TONS[variante];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado }}
      disabled={desabilitado}
      onPress={aoTocar}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: tom.fundo,
          borderBottomColor: tom.baixo,
          borderColor: variante === 'secundaria' ? cores.borda : tom.fundo,
          borderBottomWidth: relevo,
        },
        variante === 'secundaria' && styles.secundaria,
        pressed && !desabilitado && styles.pressionado,
        desabilitado && styles.desabilitado,
      ]}
    >
      <Text
        style={[
          styles.rotulo,
          { color: desabilitado ? cores.textoSuave : tom.texto },
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
  secundaria: { borderWidth: 1 },
  pressionado: {
    transform: [{ translateY: relevo }],
    borderBottomWidth: 0,
    marginBottom: relevo,
  },
  desabilitado: {
    backgroundColor: cores.fundoSuave,
    borderColor: cores.borda,
    borderBottomColor: cores.borda,
  },
  rotulo: {
    fontSize: fonte.corpo, lineHeight: linha.corpo,
    fontFamily: familia.forte,
    letterSpacing: 0.3,
  },
});
