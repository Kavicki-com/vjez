import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  cores,
  espaco,
  familia,
  fonte,
  raio,
} from '@/theme/tokens';
import type { ExMontarFrase } from '@/types/schema';

import type { PropsExercicio } from './tipos';

export function MontarFrase({
  exercicio,
  resposta,
  aoResponder,
  travado,
}: PropsExercicio<ExMontarFrase>) {
  const escolhidos = resposta?.tipo === 'tokens' ? resposta.valor : [];

  // Índices ainda disponíveis: permite token repetido na mesma frase.
  const disponiveis = useMemo(() => {
    const restantes = [...exercicio.tokens];
    for (const t of escolhidos) {
      const i = restantes.indexOf(t);
      if (i >= 0) restantes.splice(i, 1);
    }
    return restantes;
  }, [exercicio.tokens, escolhidos]);

  return (
    <View style={styles.caixa}>
      <View style={styles.linhaMontada}>
        {escolhidos.length === 0 ? (
          <Text style={styles.vazio}>Toque nas palavras para montar a frase</Text>
        ) : (
          escolhidos.map((token, i) => (
            <Pressable
              key={`${token}-${i}`}
              accessibilityRole="button"
              accessibilityLabel={`Remover ${token}`}
              disabled={travado}
              onPress={() =>
                aoResponder({
                  tipo: 'tokens',
                  valor: escolhidos.filter((_, j) => j !== i),
                })
              }
              style={[styles.ficha, styles.fichaMontada]}
            >
              <Text style={styles.textoMontado}>{token}</Text>
            </Pressable>
          ))
        )}
      </View>

      <View style={styles.banco}>
        {disponiveis.map((token, i) => (
          <Pressable
            key={`${token}-${i}`}
            accessibilityRole="button"
            accessibilityLabel={`Adicionar ${token}`}
            disabled={travado}
            onPress={() =>
              aoResponder({ tipo: 'tokens', valor: [...escolhidos, token] })
            }
            style={({ pressed }) => [
              styles.ficha,
              pressed && !travado && styles.pressionada,
            ]}
          >
            <Text style={styles.texto}>{token}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: { gap: espaco.lg },
  linhaMontada: {
    minHeight: 64,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaco.sm,
    alignItems: 'center',
    paddingBottom: espaco.sm,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  banco: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  ficha: {
    paddingVertical: espaco.sm + espaco.xs,
    paddingHorizontal: espaco.md,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  fichaMontada: {
    borderColor: cores.primaria,
    backgroundColor: cores.primariaSuave,
  },
  pressionada: { opacity: 0.85 },
  texto: { fontSize: fonte.corpo, fontFamily: familia.normal, color: cores.texto },
  textoMontado: { fontSize: fonte.corpo, color: cores.primaria, fontFamily: familia.medio },
  vazio: { fontSize: fonte.pequena, fontFamily: familia.normal, color: cores.textoSuave },
});
