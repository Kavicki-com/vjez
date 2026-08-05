import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { cores, familia, raio } from '@/theme/tokens';

type Props = {
  /** Foto do provedor. Sem ela (ou se falhar), cai na inicial do nome. */
  fotoUrl?: string;
  nome?: string;
  tamanho?: number;
};

export function Avatar({ fotoUrl, nome, tamanho = 96 }: Props) {
  // Uma URL do Google pode expirar ou vir bloqueada; nesse caso a inicial
  // assume em vez de deixar um quadrado vazio.
  const [falhou, setFalhou] = useState(false);
  const mostraFoto = Boolean(fotoUrl) && !falhou;

  const estiloBase = {
    width: tamanho,
    height: tamanho,
    borderRadius: raio.pill,
  };

  if (mostraFoto) {
    return (
      <Image
        source={{ uri: fotoUrl }}
        onError={() => setFalhou(true)}
        accessibilityIgnoresInvertColors
        accessibilityLabel={nome ? `Foto de ${nome}` : 'Foto do perfil'}
        style={[estiloBase, styles.foto]}
      />
    );
  }

  return (
    <View style={[estiloBase, styles.inicial]}>
      <Text style={[styles.letra, { fontSize: tamanho * 0.4 }]}>
        {(nome ?? 'V').charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  foto: { backgroundColor: cores.superficieVariante },
  inicial: {
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letra: { fontFamily: familia.extraForte, color: cores.superficie },
});
