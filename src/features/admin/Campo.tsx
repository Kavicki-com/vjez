import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useTecladoCroata } from '@/components/TecladoCroata';
import {
  cores,
  espaco,
  familia,
  fonte,
  linha,
  raio,
} from '@/theme/tokens';

type Props = {
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  /**
   * Campo de conteúdo-alvo: abre a barra com č ć đ š ž e os dígrafos.
   * Sem ela, cadastrar croata num teclado ABNT é impossível — o caron não
   * existe nem como tecla morta (ver @/components/TecladoCroata).
   */
  croata?: boolean;
  multilinha?: boolean;
  placeholder?: string;
  dica?: string;
  numerico?: boolean;
};

/** Campo rotulado do CMS. */
export function Campo({
  rotulo,
  valor,
  aoMudar,
  croata,
  multilinha,
  placeholder,
  dica,
  numerico,
}: Props) {
  const { propsDoCampo, teclado } = useTecladoCroata({
    valor,
    aoMudar,
    ativo: Boolean(croata),
  });

  return (
    <View style={styles.bloco}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        {...(croata ? propsDoCampo : {})}
        value={valor}
        onChangeText={aoMudar}
        placeholder={placeholder}
        placeholderTextColor={cores.contorno}
        multiline={multilinha}
        keyboardType={numerico ? 'decimal-pad' : 'default'}
        // Conteúdo croata não pode passar por corretor nem por
        // maiúscula automática: os dois "consertam" a grafia certa.
        autoCorrect={!croata}
        autoCapitalize={croata ? 'none' : 'sentences'}
        accessibilityLabel={rotulo}
        style={[styles.campo, multilinha && styles.campoAlto]}
      />
      {croata && teclado}
      {dica && <Text style={styles.dica}>{dica}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  bloco: { gap: espaco.xs },
  rotulo: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.forte,
    color: cores.textoSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  campo: {
    minHeight: 48,
    paddingHorizontal: espaco.sm + espaco.xs,
    paddingVertical: espaco.sm,
    fontSize: fonte.corpo,
    lineHeight: linha.corpo,
    fontFamily: familia.normal,
    color: cores.texto,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  campoAlto: { minHeight: 96, textAlignVertical: 'top' },
  dica: {
    fontSize: fonte.pequena,
    lineHeight: linha.pequena,
    fontFamily: familia.normal,
    color: cores.textoSuave,
  },
});
