import { StyleSheet, Text, TextInput, View } from 'react-native';

import { MAX_CARACTERES_PRODUCAO_LIVRE } from '@/lib/regras';
import { cores, espaco, fonte, raio } from '@/theme/tokens';
import type { ExProducaoLivre } from '@/types/schema';

import type { PropsExercicio } from './tipos';

export function ProducaoLivre({
  exercicio,
  resposta,
  aoResponder,
  travado,
}: PropsExercicio<ExProducaoLivre>) {
  const texto = resposta?.tipo === 'envio' ? resposta.valor : '';
  const restam = MAX_CARACTERES_PRODUCAO_LIVRE - texto.length;

  return (
    <View style={styles.caixa}>
      <TextInput
        value={texto}
        onChangeText={(v) =>
          aoResponder({
            tipo: 'envio',
            valor: v.slice(0, MAX_CARACTERES_PRODUCAO_LIVRE),
          })
        }
        editable={!travado}
        multiline
        textAlignVertical="top"
        placeholder="Escreva em croata..."
        placeholderTextColor={cores.textoSuave}
        accessibilityLabel={exercicio.prompt_pt}
        style={styles.campo}
      />
      <Text style={[styles.contador, restam < 40 && styles.contadorAlerta]}>
        {restam} caracteres restantes
      </Text>
      {travado && (
        <Text style={styles.nota}>
          Enviado. A correção da IA chega depois — esta atividade pontua por
          participação.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: { gap: espaco.xs },
  campo: {
    minHeight: 160,
    padding: espaco.md,
    fontSize: fonte.corpo,
    color: cores.texto,
    borderRadius: raio.md,
    borderWidth: 2,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  contador: { fontSize: fonte.pequena, color: cores.textoSuave, textAlign: 'right' },
  contadorAlerta: { color: cores.erro },
  nota: { fontSize: fonte.pequena, color: cores.textoSuave },
});
