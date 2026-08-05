import { StyleSheet, TextInput, View } from 'react-native';

import {
  cores,
  espaco,
  familia,
  fonte,
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
  return (
    <View>
      <TextInput
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
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    minHeight: 56,
    paddingHorizontal: espaco.md,
    fontSize: fonte.subtitulo,
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
