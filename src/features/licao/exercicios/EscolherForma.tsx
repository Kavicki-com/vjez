import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  cores,
  espaco,
  familia,
  fonte,
  raio,
} from '@/theme/tokens';
import type { ExEscolherForma } from '@/types/schema';

import type { PropsExercicio } from './tipos';

export function EscolherForma({
  exercicio,
  resposta,
  aoResponder,
  travado,
}: PropsExercicio<ExEscolherForma>) {
  const escolhida = resposta?.tipo === 'opcao' ? resposta.valor : null;

  return (
    <View style={styles.grupo}>
      {exercicio.opcoes.map((opcao) => {
        const selecionada = escolhida === opcao;
        const eCerta = opcao === exercicio.resposta;
        // Depois de verificar: marca a certa em verde e a escolha errada em vermelho.
        const revelaCerta = travado && eCerta;
        const revelaErro = travado && selecionada && !eCerta;

        return (
          <Pressable
            key={opcao}
            accessibilityRole="radio"
            accessibilityState={{ checked: selecionada, disabled: travado }}
            disabled={travado}
            onPress={() => aoResponder({ tipo: 'opcao', valor: opcao })}
            style={({ pressed }) => [
              styles.opcao,
              selecionada && !travado && styles.selecionada,
              revelaCerta && styles.certa,
              revelaErro && styles.errada,
              pressed && !travado && styles.pressionada,
            ]}
          >
            <Text
              style={[
                styles.texto,
                selecionada && !travado && styles.textoSelecionado,
                revelaCerta && styles.textoCerta,
                revelaErro && styles.textoErrada,
              ]}
            >
              {opcao}
            </Text>
          </Pressable>
        );
      })}
      {/* A forma certa quem anuncia é o <Feedback>; aqui só a cor das opções.
          Repetir os dois vira a mesma frase duas vezes na tela. */}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { gap: espaco.sm },
  opcao: {
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: espaco.md,
    borderRadius: raio.md,
    borderWidth: 2,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  selecionada: {
    borderColor: cores.primaria,
    backgroundColor: cores.primariaSuave,
  },
  certa: { borderColor: cores.acerto, backgroundColor: cores.acertoSuave },
  errada: { borderColor: cores.erro, backgroundColor: cores.erroSuave },
  pressionada: { opacity: 0.85 },
  texto: { fontSize: fonte.subtitulo, fontFamily: familia.normal, color: cores.texto },
  textoSelecionado: { color: cores.primaria, fontFamily: familia.forte },
  textoCerta: { color: cores.acerto, fontFamily: familia.forte },
  textoErrada: { color: cores.erro, fontFamily: familia.forte },
});
