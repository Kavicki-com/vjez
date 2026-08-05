import { StyleSheet, Text, View } from 'react-native';

import { cores, espaco, fonte, peso, raio } from '@/theme/tokens';
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
 * Errar tira ponto, mas nunca bloqueia — daí não existir estado de "trave aqui".
 */
export function Feedback({ exercicio, veredito }: Props) {
  const certo = veredito.acertou;

  return (
    <View style={[styles.caixa, certo ? styles.caixaCerta : styles.caixaErrada]}>
      <Text style={[styles.titulo, certo ? styles.tituloCerto : styles.tituloErrado]}>
        {certo ? 'Isso!' : 'Ainda não'}
      </Text>

      {!certo && veredito.esperado && (
        <Text style={styles.esperado}>
          Forma certa: <Text style={styles.formaCerta}>{veredito.esperado}</Text>
        </Text>
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
  caixa: {
    padding: espaco.md,
    borderRadius: raio.md,
    borderWidth: 1,
    gap: espaco.xs,
  },
  caixaCerta: {
    backgroundColor: cores.acertoSuave,
    borderColor: cores.acerto,
  },
  caixaErrada: { backgroundColor: cores.erroSuave, borderColor: cores.erro },
  titulo: { fontSize: fonte.subtitulo, fontWeight: peso.forte },
  tituloCerto: { color: cores.acerto },
  tituloErrado: { color: cores.erro },
  esperado: { fontSize: fonte.corpo, color: cores.texto },
  formaCerta: { fontWeight: peso.forte },
  motivo: { fontSize: fonte.pequena, color: cores.textoSuave },
});
