import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';

import { cores, raio } from '@/theme/tokens';

const CORES = [
  cores.primaria,
  cores.secundaria,
  cores.terciaria,
  cores.primariaContainer,
  cores.secundariaContainer,
];

type Peca = {
  x: number;
  tamanho: number;
  cor: string;
  redondo: boolean;
  atraso: number;
  duracao: number;
  giro: number;
};

/**
 * Chuva de confete da tela de conclusão.
 *
 * Feito com o Animated nativo e `useNativeDriver`, então a animação roda
 * fora da thread de JS e não engasga enquanto a tela monta.
 * Cai uma vez só — laço infinito aqui viraria distração, não comemoração.
 */
export function Confete({ quantidade = 28 }: { quantidade?: number }) {
  const { height, width } = useWindowDimensions();

  const pecas = useMemo<Peca[]>(
    () =>
      Array.from({ length: quantidade }, () => ({
        x: Math.random() * width,
        tamanho: 6 + Math.random() * 8,
        cor: CORES[Math.floor(Math.random() * CORES.length)],
        redondo: Math.random() > 0.5,
        atraso: Math.random() * 900,
        duracao: 2200 + Math.random() * 1600,
        giro: Math.random() > 0.5 ? 1 : -1,
      })),
    [quantidade, width],
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pecas.map((peca, i) => (
        <Peca key={i} peca={peca} altura={height} />
      ))}
    </View>
  );
}

function Peca({ peca, altura }: { peca: Peca; altura: number }) {
  const progresso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animacao = Animated.timing(progresso, {
      toValue: 1,
      duration: peca.duracao,
      delay: peca.atraso,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    animacao.start();
    return () => animacao.stop();
  }, [progresso, peca.duracao, peca.atraso]);

  const y = progresso.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, altura + 40],
  });
  const rotacao = progresso.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${peca.giro * 720}deg`],
  });
  // Some no último terço da queda, para não sumir de repente.
  const opacidade = progresso.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 1, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: peca.x,
        width: peca.tamanho,
        height: peca.tamanho,
        backgroundColor: peca.cor,
        borderRadius: peca.redondo ? raio.pill : 1,
        opacity: opacidade,
        transform: [{ translateY: y }, { rotate: rotacao }],
      }}
    />
  );
}
