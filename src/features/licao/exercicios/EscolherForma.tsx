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

  return (
    <View style={styles.grupo}>
      {exercicio.opcoes.map((opcao) => {
        const selecionada = escolhida === opcao;
        const eCerta = opcao === exercicio.resposta;
        // Depois de verificar: marca a certa em verde e a escolha errada em vermelho.
        const revelaCerta = travado && eCerta;
        const revelaErro = travado && selecionada && !eCerta;

        return (
          <Opcao
            key={opcao}
            opcao={opcao}
            url={audios?.get(opcao)}
            travado={travado}
            selecionada={selecionada}
            revelaCerta={revelaCerta}
            revelaErro={revelaErro}
            aoEscolher={() => aoResponder({ tipo: 'opcao', valor: opcao })}
          />
        );
      })}
      {/* A forma certa quem anuncia é o <Feedback>; aqui só a cor das opções.
          Repetir os dois vira a mesma frase duas vezes na tela. */}
    </View>
  );
}

type PropsOpcao = {
  opcao: string;
  /** Sem faixa, a opção não fala e não mostra o alto-falante. */
  url?: string;
  travado: boolean;
  selecionada: boolean;
  revelaCerta: boolean;
  revelaErro: boolean;
  aoEscolher: () => void;
};

/**
 * Uma opção, com o próprio player.
 *
 * Player por opção, e não um compartilhado trocando de faixa: `replace()`
 * destrói o elemento de áudio e chama `pause()` nele, e se o `play()`
 * anterior ainda não tinha resolvido — o que é a regra quando o arquivo
 * acabou de ser criado e ainda está baixando — o navegador rejeita a
 * promessa com `AbortError`. Com um player por opção, cada MP3 chega
 * pré-carregado no `<audio>` e tocar é instantâneo; nada é destruído no
 * meio do caminho.
 */
function Opcao({
  opcao,
  url,
  travado,
  selecionada,
  revelaCerta,
  revelaErro,
  aoEscolher,
}: PropsOpcao) {
  const player = useAudioPlayer(url ? { uri: url } : null);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selecionada, disabled: travado }}
      disabled={travado}
      onPress={() => {
        // Ouvir a forma faz parte de escolhê-la: é a pronúncia da flexão
        // que o exercício está ensinando.
        if (url) {
          player.seekTo(0);
          player.play();
        }
        aoEscolher();
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
      {url && (
        <Ionicons
          name="volume-medium"
          size={18}
          color={
            revelaCerta
              ? cores.acerto
              : revelaErro
                ? cores.erro
                : selecionada
                  ? cores.secundaria
                  : cores.contorno
          }
        />
      )}
    </Pressable>
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
    borderColor: cores.secundaria,
    backgroundColor: cores.secundariaSuave,
  },
  certa: { borderColor: cores.acerto, backgroundColor: cores.acertoSuave },
  errada: { borderColor: cores.erro, backgroundColor: cores.erroSuave },
  pressionada: { opacity: 0.85 },
  texto: { fontSize: fonte.subtitulo, lineHeight: linha.subtitulo, fontFamily: familia.normal, color: cores.texto },
  textoSelecionado: { color: cores.secundaria, fontFamily: familia.forte },
  textoCerta: { color: cores.acerto, fontFamily: familia.forte },
  textoErrada: { color: cores.erro, fontFamily: familia.forte },
});
