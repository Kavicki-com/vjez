import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import {
  cores,
  espaco,
  familia,
  fonte,
  raio,
} from '@/theme/tokens';

type Props = {
  nome?: string;
  diasDeOfensiva: number;
};

/**
 * Saudação da trilha. "Bok" é conteúdo-alvo (fica em HR, regra 1);
 * o resto da interface é PT-BR.
 */
export function CabecalhoTrilha({ nome, diasDeOfensiva }: Props) {
  return (
    <View style={styles.cartao}>
      <View style={styles.texto}>
        <Text style={styles.saudacao}>Bok{nome ? `, ${nome}` : ''}!</Text>
        <Text style={styles.pergunta}>Pronto para aprender?</Text>
      </View>

      <View style={styles.ofensiva}>
        <Ionicons name="flame" size={20} color={cores.destaque} />
        <Text style={styles.ofensivaNumero}>{diasDeOfensiva}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.lg,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  texto: { flex: 1, gap: 2 },
  saudacao: {
    fontSize: fonte.titulo,
    fontFamily: familia.forte,
    color: cores.texto,
  },
  pergunta: { fontSize: fonte.corpo, fontFamily: familia.normal, color: cores.textoSuave },
  ofensiva: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.xs,
    paddingHorizontal: espaco.sm + espaco.xs,
    paddingVertical: espaco.sm,
    borderRadius: raio.pill,
    backgroundColor: cores.fundoSuave,
  },
  ofensivaNumero: {
    fontSize: fonte.subtitulo,
    fontFamily: familia.forte,
    color: cores.texto,
  },
});
