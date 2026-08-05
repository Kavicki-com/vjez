import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

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
  placeholder?: string;
};

export function CampoBusca({ valor, aoMudar, placeholder }: Props) {
  return (
    <View style={styles.caixa}>
      <Ionicons name="search" size={18} color={cores.textoSuave} />
      <TextInput
        value={valor}
        onChangeText={aoMudar}
        placeholder={placeholder}
        placeholderTextColor={cores.textoSuave}
        autoCorrect={false}
        autoCapitalize="none"
        style={styles.entrada}
        accessibilityLabel={placeholder}
      />
      {valor.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          hitSlop={espaco.sm}
          onPress={() => aoMudar('')}
        >
          <Ionicons name="close-circle" size={18} color={cores.textoSuave} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    paddingHorizontal: espaco.md,
    height: 44,
    borderRadius: raio.pill,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  // O anel de foco padrão do navegador fica: tirar ele quebraria a
  // navegação por teclado na web.
  entrada: {
    flex: 1,
    fontSize: fonte.corpo, fontFamily: familia.normal,
    color: cores.texto,
  },
});
