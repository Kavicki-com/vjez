import { StyleSheet, TextInput, View } from 'react-native';

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
  valor: string;
  aoMudar: (valor: string) => void;
  travado: boolean;
  acertou?: boolean;
  placeholder?: string;
  rotuloAcessivel: string;
};

/** Campo de resposta livre, compartilhado por preencher_lacuna e traducao. */
export function RespostaTexto({
  valor,
  aoMudar,
  travado,
  acertou,
  placeholder,
  rotuloAcessivel,
}: Props) {
  const { propsDoCampo, teclado } = useTecladoCroata({
    valor,
    aoMudar,
    ativo: !travado,
  });

  return (
    <View style={styles.bloco}>
      <TextInput
        {...propsDoCampo}
        value={valor}
        onChangeText={aoMudar}
        editable={!travado}
        placeholder={placeholder}
        placeholderTextColor={cores.textoSuave}
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel={rotuloAcessivel}
        style={[
          styles.campo,
          travado && acertou === true && styles.certo,
          travado && acertou === false && styles.errado,
        ]}
      />
      {teclado}
    </View>
  );
}

const styles = StyleSheet.create({
  bloco: { gap: espaco.sm },
  campo: {
    minHeight: 56,
    paddingHorizontal: espaco.md,
    fontSize: fonte.subtitulo, lineHeight: linha.subtitulo,
    fontFamily: familia.medio,
    color: cores.texto,
    borderRadius: raio.md,
    borderWidth: 2,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  certo: { borderColor: cores.acerto, backgroundColor: cores.acertoSuave },
  errado: { borderColor: cores.erro, backgroundColor: cores.erroSuave },
});
