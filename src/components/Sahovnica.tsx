import { StyleSheet, View } from 'react-native';

import { cores } from '@/theme/tokens';

type Props = {
  /** Altura da faixa. O quadriculado usa metade disso por quadrado. */
  altura?: number;
  cor?: string;
  /** Faixa de topo de cartão: arredonda os cantos de cima. */
  noTopo?: boolean;
};

/**
 * Faixa quadriculada da bandeira croata (šahovnica), o motivo gráfico da
 * marca — o mesmo do splash.
 *
 * Feita com Views em vez de imagem para escalar em qualquer largura sem
 * borrar e sem custar um asset. Duas fileiras deslocadas formam o xadrez.
 */
export function Sahovnica({ altura = 8, cor = cores.primaria, noTopo }: Props) {
  const lado = altura / 2;
  // Quadrados suficientes para cobrir telas largas; o excedente é cortado.
  const colunas = 64;

  return (
    <View
      style={[
        styles.faixa,
        { height: altura },
        noTopo && styles.noTopo,
      ]}
    >
      {[0, 1].map((fileira) => (
        <View key={fileira} style={styles.fileira}>
          {Array.from({ length: colunas }, (_, i) => (
            <View
              key={i}
              style={{
                width: lado,
                height: lado,
                backgroundColor:
                  (i + fileira) % 2 === 0 ? cor : 'transparent',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  faixa: { width: '100%', overflow: 'hidden' },
  noTopo: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  fileira: { flexDirection: 'row' },
});
