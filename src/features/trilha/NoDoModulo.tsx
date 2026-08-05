import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, espaco, fonte, peso, raio } from '@/theme/tokens';

import type { ModuloNaTrilha } from './estado';

type Props = {
  modulo: ModuloNaTrilha;
  /** Deslocamento horizontal que dá o serpenteado do caminho. */
  desvio: number;
  aoTocar: () => void;
};

const TAMANHO = 84;

export function NoDoModulo({ modulo, desvio, aoTocar }: Props) {
  const { estado, concluidas, total } = modulo;
  const concluido = estado === 'concluido';
  const atual = estado === 'atual';
  const bloqueado = estado === 'bloqueado';
  const semConteudo = total === 0;

  const icone = (modulo.icone ?? 'ellipse') as keyof typeof Ionicons.glyphMap;

  return (
    <View style={[styles.bloco, { transform: [{ translateX: desvio }] }]}>
      {atual && (
        <View style={styles.selo}>
          <Text style={styles.seloTexto}>Atual</Text>
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${modulo.tema_pt}, ${concluidas} de ${total} lições`}
        accessibilityState={{ disabled: bloqueado || semConteudo }}
        disabled={bloqueado || semConteudo}
        onPress={aoTocar}
        style={({ pressed }) => [
          styles.circulo,
          concluido && styles.circuloConcluido,
          atual && styles.circuloAtual,
          bloqueado && styles.circuloBloqueado,
          pressed && !bloqueado && styles.pressionado,
        ]}
      >
        <Ionicons
          name={concluido ? 'star' : semConteudo ? 'time-outline' : icone}
          size={34}
          color={
            concluido || atual
              ? cores.superficie
              : bloqueado
                ? cores.textoSuave
                : cores.primaria
          }
        />
      </Pressable>

      <Text
        style={[styles.tema, bloqueado && styles.temaBloqueado]}
        numberOfLines={2}
      >
        {modulo.tema_pt}
      </Text>

      <View
        style={[
          styles.contador,
          concluido && styles.contadorConcluido,
          atual && styles.contadorAtual,
        ]}
      >
        <Text
          style={[
            styles.contadorTexto,
            (concluido || atual) && styles.contadorTextoForte,
          ]}
        >
          {semConteudo ? 'em preparação' : `${concluidas}/${total} lições`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bloco: { alignItems: 'center', gap: espaco.xs, maxWidth: 200 },
  selo: {
    paddingHorizontal: espaco.sm,
    paddingVertical: 2,
    borderRadius: raio.sm,
    backgroundColor: cores.secundaria,
  },
  seloTexto: {
    fontSize: fonte.pequena - 1,
    fontWeight: peso.forte,
    color: cores.superficie,
  },
  circulo: {
    width: TAMANHO,
    height: TAMANHO,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.primariaSuave,
  },
  circuloConcluido: { backgroundColor: cores.primaria },
  circuloAtual: {
    backgroundColor: cores.secundaria,
    borderWidth: 6,
    borderColor: cores.secundariaSuave,
  },
  circuloBloqueado: { backgroundColor: cores.fundoSuave },
  pressionado: { opacity: 0.85 },
  tema: {
    fontSize: fonte.subtitulo,
    fontWeight: peso.forte,
    color: cores.texto,
    textAlign: 'center',
  },
  temaBloqueado: { color: cores.textoSuave },
  contador: {
    paddingHorizontal: espaco.sm,
    paddingVertical: 2,
    borderRadius: raio.sm,
    backgroundColor: cores.fundoSuave,
  },
  contadorConcluido: { backgroundColor: cores.primaria },
  contadorAtual: { backgroundColor: cores.secundaria },
  contadorTexto: { fontSize: fonte.pequena - 1, color: cores.textoSuave },
  contadorTextoForte: { color: cores.superficie, fontWeight: peso.medio },
});
