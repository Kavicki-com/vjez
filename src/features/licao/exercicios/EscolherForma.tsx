import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAudioDeTexto } from '@/features/audio/useAudioDeTexto';

import {
  cores,
  espaco,
  familia,
  fonte,
  linha,
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
  const { data: audios } = useAudioDeTexto();
  // Um player só, trocando de faixa: são quatro opções e o aluno toca uma
  // de cada vez, então quatro players seriam desperdício.
  const player = useAudioPlayer();

  const falar = (opcao: string) => {
    if (!exercicio.falarOpcoes) return;
    const url = audios?.get(opcao);
    if (!url) return;
    player.replace({ uri: url });
    player.play();
  };

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
            onPress={() => {
              // Ouvir a forma faz parte de escolhê-la: é a pronúncia da
              // flexão que o exercício está ensinando.
              falar(opcao);
              aoResponder({ tipo: 'opcao', valor: opcao });
            }}
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
            {exercicio.falarOpcoes && audios?.get(opcao) && (
              <Ionicons
                name="volume-medium"
                size={18}
                color={
                  revelaCerta
                    ? cores.acerto
                    : revelaErro
                      ? cores.erro
                      : selecionada
                        ? cores.primaria
                        : cores.contorno
                }
              />
            )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaco.sm,
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
  texto: { fontSize: fonte.subtitulo, lineHeight: linha.subtitulo, fontFamily: familia.normal, color: cores.texto },
  textoSelecionado: { color: cores.primaria, fontFamily: familia.forte },
  textoCerta: { color: cores.acerto, fontFamily: familia.forte },
  textoErrada: { color: cores.erro, fontFamily: familia.forte },
});
