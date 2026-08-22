import { StyleSheet, Text, View } from 'react-native';

import { cores, espaco, familia, fonte, linha } from '@/theme/tokens';

import { useAudioDeTexto } from './useAudioDeTexto';
import { BotaoAudio } from './BotaoAudio';

type Props = {
  /** O croata a ser falado, exatamente como está no conteúdo. */
  texto: string;
  rotulo?: string;
  tamanho?: 'pequeno' | 'grande';
  /**
   * Texto ao lado do botão, na tela. Some junto com o botão quando não há
   * faixa — rótulo sozinho seria um convite para ouvir o que não toca.
   */
  chamada?: string;
};

/**
 * Botão de ouvir para qualquer texto croata da tela.
 *
 * A diferença para o `BotaoAudio` é de onde vem a URL: ali ela é uma coluna
 * do item (`lex_items.audio_url`); aqui ela é procurada em `audio_hr` pelo
 * próprio texto. É o que permite dar voz a forma flexionada — `kavu`,
 * `školi`, `ženom` — que não existe como verbete e por isso não tem coluna
 * de áudio em lugar nenhum.
 *
 * Some sozinho quando não há faixa: exercício sem áudio não ganha botão
 * morto.
 */
export function BotaoFalarTexto({ texto, rotulo, tamanho, chamada }: Props) {
  const { data: audios } = useAudioDeTexto();
  const url = audios?.get(texto);
  if (!url) return null;

  const botao = <BotaoAudio url={url} rotulo={rotulo ?? texto} tamanho={tamanho} />;
  if (!chamada) return botao;

  return (
    <View style={styles.linha}>
      <Text style={styles.chamada}>{chamada}</Text>
      {botao}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  chamada: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },
});
