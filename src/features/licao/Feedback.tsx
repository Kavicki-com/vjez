import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { BotaoAudio } from '@/features/audio/BotaoAudio';
import { useAudioDeTexto } from '@/features/audio/useAudioDeTexto';
import { cores, espaco, familia, fonte, linha } from '@/theme/tokens';
import type { Exercicio, Padez } from '@/types/schema';

import type { Veredito } from './correcao';

/** Nome do caso em HR (regra 1: só o alvo fica em croata). */
const NOME_DO_CASO: Record<Padez, string> = {
  nominativ: 'Nominativ',
  genitiv: 'Genitiv',
  dativ: 'Dativ',
  akuzativ: 'Akuzativ',
  vokativ: 'Vokativ',
  lokativ: 'Lokativ',
  instrumental: 'Instrumental',
};

type Props = {
  exercicio: Exercicio;
  veredito: Veredito;
};

/**
 * Feedback do CLAUDE.md: erro mostra a forma certa e o porquê do caso.
 * Sai sem caixa própria — quem tinge o bloco é o rodapé da lição, para o
 * acerto e o erro ocuparem a mesma faixa e não empurrarem o conteúdo.
 */
export function Feedback({ exercicio, veredito }: Props) {
  const certo = veredito.acertou;
  const cor = certo ? cores.acerto : cores.erro;
  const { data: audios } = useAudioDeTexto();

  // O áudio da forma certa só aparece AQUI, depois de responder. Antes,
  // ouvir a resposta em croata seria o gabarito em voz alta.
  const audioDaForma = veredito.esperado
    ? audios?.get(veredito.esperado)
    : undefined;

  return (
    <View style={styles.bloco}>
      <View style={styles.linhaTitulo}>
        <Ionicons
          name={certo ? 'checkmark-circle' : 'close-circle'}
          size={24}
          color={cor}
        />
        <Text style={[styles.titulo, { color: cor }]}>
          {certo ? 'Isso!' : 'Ainda não'}
        </Text>
      </View>

      {veredito.esperado && (certo ? audioDaForma : true) && (
        <View style={styles.linhaForma}>
          <Text style={styles.esperado}>
            {certo ? 'Como se fala: ' : 'Forma certa: '}
            <Text style={styles.formaCerta}>{veredito.esperado}</Text>
          </Text>
          {audioDaForma && (
            <BotaoAudio url={audioDaForma} rotulo={veredito.esperado} />
          )}
        </View>
      )}

      {exercicio.padez && (
        <Text style={styles.motivo}>
          Este exercício pede o caso {NOME_DO_CASO[exercicio.padez]}.
        </Text>
      )}

      {!certo && exercicio.dica_pt && (
        <Text style={styles.motivo}>{exercicio.dica_pt}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bloco: { gap: espaco.xs },
  linhaTitulo: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  titulo: { fontSize: fonte.subtitulo, lineHeight: linha.subtitulo, fontFamily: familia.forte },
  linhaForma: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    paddingVertical: espaco.xs,
  },
  esperado: {
    flex: 1,
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.normal,
    color: cores.texto,
  },
  formaCerta: { fontFamily: familia.forte },
  motivo: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },
});
