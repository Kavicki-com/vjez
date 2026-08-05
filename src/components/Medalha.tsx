import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { cores, ouro, raio } from '@/theme/tokens';

type Props = {
  icone: keyof typeof Ionicons.glyphMap;
  conquistada: boolean;
  tamanho?: number;
};

/**
 * Medalha da conquista: dourada quando ganha, apagada quando não.
 *
 * O dourado é feito com dois gradientes sobrepostos — um aro externo e um
 * miolo com a luz vindo do canto oposto. Um gradiente só vira um círculo
 * amarelo chapado; é o contraste entre aro e miolo que lê como metal.
 */
export function Medalha({ icone, conquistada, tamanho = 64 }: Props) {
  const dimensao = { width: tamanho, height: tamanho, borderRadius: raio.pill };
  const miolo = tamanho - tamanho * 0.18;

  if (!conquistada) {
    return (
      <View style={[dimensao, styles.apagada]}>
        <Ionicons name={icone} size={tamanho * 0.42} color={cores.contorno} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[ouro.claro, ouro.escuro]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={[dimensao, styles.aro]}
    >
      <LinearGradient
        colors={[ouro.brilho, ouro.medio, ouro.escuro]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.85, y: 0 }}
        end={{ x: 0.15, y: 1 }}
        style={{
          width: miolo,
          height: miolo,
          borderRadius: raio.pill,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons
          name={icone}
          size={tamanho * 0.4}
          color={ouro.borda}
        />
      </LinearGradient>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  aro: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ouro.borda,
  },
  apagada: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.superficieVariante,
    borderWidth: 1,
    borderColor: cores.borda,
  },
});
