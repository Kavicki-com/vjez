import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import {
  cores,
  espaco,
  familia,
  fonte,
  linha,
} from '@/theme/tokens';

export function Carregando() {
  return (
    <View style={styles.centro}>
      <ActivityIndicator color={cores.primaria} />
    </View>
  );
}

/**
 * `aoVoltar` é o que impede o beco sem saída: quando o erro toma a tela
 * inteira (lição sem exercícios, módulo que não carregou), sem ele o
 * aluno fica preso — não há cabeçalho, não há botão, e o "voltar" do
 * sistema não tem para onde ir se a tela veio de link direto.
 */
export function Erro({
  mensagem,
  aoVoltar,
}: {
  mensagem?: string;
  aoVoltar?: () => void;
}) {
  return (
    <View style={styles.centro}>
      <Text style={styles.titulo}>Não deu para carregar</Text>
      <Text style={styles.texto}>
        {mensagem ?? 'Verifique sua conexão e tente de novo.'}
      </Text>
      {aoVoltar && (
        <View style={styles.saida}>
          <Botao rotulo="Voltar" aoTocar={aoVoltar} variante="secundaria" />
        </View>
      )}
    </View>
  );
}

export function Vazio({ texto }: { texto: string }) {
  return (
    <View style={styles.centro}>
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaco.xl,
    gap: espaco.xs,
  },
  titulo: { fontSize: fonte.subtitulo, lineHeight: linha.subtitulo, fontFamily: familia.forte, color: cores.texto },
  texto: {
    fontSize: fonte.corpo, lineHeight: linha.corpo, fontFamily: familia.normal,
    color: cores.textoSuave,
    textAlign: 'center',
  },
  saida: { marginTop: espaco.md, alignSelf: 'stretch' },
});
