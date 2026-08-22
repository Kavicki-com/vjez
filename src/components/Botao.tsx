import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import {
  cores,
  espaco,
  familia,
  fonte,
  linha,
  raio,
  sombra,
} from '@/theme/tokens';

type Props = {
  rotulo: string;
  aoTocar: () => void;
  desabilitado?: boolean;
  variante?: 'primaria' | 'secundaria' | 'acerto' | 'erro';
  /**
   * Espera visível. O botão fica do tamanho que estava — trocar o rótulo
   * por um giro menor faria o rodapé inteiro pular no meio da espera.
   */
  carregando?: boolean;
};

const TONS = {
  primaria: { fundo: cores.primaria, texto: cores.superficie },
  acerto: { fundo: cores.acerto, texto: cores.superficie },
  erro: { fundo: cores.erro, texto: cores.superficie },
  secundaria: { fundo: cores.superficie, texto: cores.texto },
} as const;

/**
 * Botão pílula com drop shadow.
 *
 * O relevo sólido (borda inferior escura que sumia ao pressionar) saiu:
 * quem dá a elevação agora é a sombra, e o toque é ela encolhendo com o
 * botão descendo 1px. Sem borda de baixo não há altura para compensar,
 * então o bloco não pula mais — o `translateY` é só visual.
 */
export function Botao({
  rotulo,
  aoTocar,
  desabilitado,
  variante = 'primaria',
  carregando,
}: Props) {
  const tom = TONS[variante];
  const inerte = desabilitado || carregando;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inerte, busy: carregando }}
      disabled={inerte}
      onPress={aoTocar}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: tom.fundo,
          borderColor: variante === 'secundaria' ? cores.borda : tom.fundo,
        },
        // Desabilitado não é elevado: nada a tocar, nada acima da tela.
        !inerte && (pressed ? sombra.pressionada : sombra.elevada),
        pressed && !inerte && styles.pressionado,
        desabilitado && styles.desabilitado,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={tom.texto} />
      ) : (
        <Text
          style={[
            styles.rotulo,
            { color: desabilitado ? cores.textoSuave : tom.texto },
          ]}
        >
          {rotulo}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espaco.lg,
    borderRadius: raio.pill,
    borderWidth: 1,
  },
  pressionado: { transform: [{ translateY: 1 }] },
  desabilitado: {
    backgroundColor: cores.fundoSuave,
    borderColor: cores.borda,
  },
  rotulo: {
    fontSize: fonte.corpo, lineHeight: linha.corpo,
    fontFamily: familia.forte,
    letterSpacing: 0.3,
  },
});
