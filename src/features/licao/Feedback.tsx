import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Kuna } from '@/components/kuna';
import { BotaoAudio } from '@/features/audio/BotaoAudio';
import { useAudioDeTexto } from '@/features/audio/useAudioDeTexto';
import { cores, espaco, familia, fonte, linha } from '@/theme/tokens';
import type { Correcao, Exercicio, Padez } from '@/types/schema';

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
  /** Só na produção livre: o que a IA devolveu. */
  correcao?: Correcao;
  /**
   * Só na produção livre: por que não veio correção — sem conta, sem rede,
   * teto do dia. Aparece no lugar dela, nunca junto.
   */
  aviso?: string;
};

/**
 * Feedback do CLAUDE.md: erro mostra a forma certa e o porquê do caso.
 * Sai sem caixa própria — quem tinge o bloco é o rodapé da lição, para o
 * acerto e o erro ocuparem a mesma faixa e não empurrarem o conteúdo.
 *
 * O Zef reage ao lado do texto: `comemora` no acerto, `errou` no erro — e
 * ele é DECORATIVO de propósito, sem rótulo acessível. O leitor de tela já
 * ouve "Isso!" ou "Ainda não"; anunciar a cara dele de novo seria a mesma
 * informação duas vezes.
 */
export function Feedback({ exercicio, veredito, correcao, aviso }: Props) {
  const certo = veredito.acertou;
  const cor = certo ? cores.acerto : cores.erro;
  const { data: audios } = useAudioDeTexto();

  // O áudio da forma certa só aparece AQUI, depois de responder. Antes,
  // ouvir a resposta em croata seria o gabarito em voz alta.
  const audioDaForma = veredito.esperado
    ? audios?.get(veredito.esperado)
    : undefined;

  return (
    <View style={styles.linha}>
      <Kuna estado={certo ? 'comemora' : 'errou'} altura={84} />

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
              <BotaoAudio
                url={audioDaForma}
                rotulo={veredito.esperado}
                // No acerto a forma fala sozinha: é o instante em que a
                // pronúncia gruda, com a resposta ainda fresca. No erro não —
                // ali o aluno está lendo a correção, e som por cima de leitura
                // atrapalha os dois.
                automatico={certo}
              />
            )}
          </View>
        )}

        {/* Produção livre: o ponto é por participação, e o que ensina é isto —
            o texto do aluno reescrito, com o porquê em português. */}
        {correcao && (
          <View style={styles.correcao}>
            {correcao.texto_corrigido_hr && (
              <Text style={styles.esperado}>
                Como ficaria:{' '}
                <Text style={styles.formaCerta}>
                  {correcao.texto_corrigido_hr}
                </Text>
              </Text>
            )}
            <Text style={styles.comentario}>{correcao.comentario_pt}</Text>
          </View>
        )}

        {aviso && <Text style={styles.comentario}>{aviso}</Text>}

        {exercicio.padez && (
          <Text style={styles.motivo}>
            Este exercício pede o caso {NOME_DO_CASO[exercicio.padez]}.
          </Text>
        )}

        {!certo && exercicio.dica_pt && (
          <Text style={styles.motivo}>{exercicio.dica_pt}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // O boneco encosta no chão do bloco, não no meio dele: alinhado pelo topo
  // ele flutuaria sobre o texto quando o feedback tem três linhas.
  linha: { flexDirection: 'row', alignItems: 'flex-end', gap: espaco.sm },
  bloco: { flex: 1, gap: espaco.xs },
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
  correcao: { gap: espaco.xs, paddingVertical: espaco.xs },
  // Maior que `motivo`: são até três frases de explicação, e é o que o
  // aluno de fato lê depois de escrever.
  comentario: {
    fontSize: fonte.rotulo,
    lineHeight: linha.rotulo,
    fontFamily: familia.normal,
    color: cores.texto,
  },
  motivo: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },
});
