import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useTecladoCroata } from '@/components/TecladoCroata';
import { MAX_CARACTERES_PRODUCAO_LIVRE } from '@/lib/regras';
import {
  cores,
  espaco,
  familia,
  fonte,
  linha,
  raio,
} from '@/theme/tokens';
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

  const escrever = (v: string) =>
    aoResponder({
      tipo: 'envio',
      valor: v.slice(0, MAX_CARACTERES_PRODUCAO_LIVRE),
    });

  const { propsDoCampo, teclado } = useTecladoCroata({
    valor: texto,
    aoMudar: escrever,
    ativo: !travado,
  });

  return (
    <View style={styles.caixa}>
      <TextInput
        {...propsDoCampo}
        value={texto}
        onChangeText={escrever}
        editable={!travado}
        multiline
        textAlignVertical="top"
        placeholder="Escreva em croata..."
        placeholderTextColor={cores.textoSuave}
        accessibilityLabel={exercicio.prompt_pt}
        style={styles.campo}
      />
      {teclado}
      <Text style={[styles.contador, restam < 40 && styles.contadorAlerta]}>
        {restam} caracteres restantes
      </Text>
      {/* O que acontece depois de enviar (correção, espera ou convite para
          entrar) aparece no rodapé, junto do botão — aqui embaixo do campo
          seria a segunda vez que a tela diz a mesma coisa. */}
      {!travado && (
        <Text style={styles.nota}>
          Esta atividade pontua por participação: escreva sem medo de errar.
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
    fontSize: fonte.corpo, lineHeight: linha.corpo, fontFamily: familia.normal,
    color: cores.texto,
    borderRadius: raio.md,
    borderWidth: 2,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  contador: { fontSize: fonte.pequena, lineHeight: linha.pequena, fontFamily: familia.normal, color: cores.textoSuave, textAlign: 'right' },
  contadorAlerta: { color: cores.erro },
  nota: { fontSize: fonte.pequena, lineHeight: linha.pequena, fontFamily: familia.normal, color: cores.textoSuave },
});
