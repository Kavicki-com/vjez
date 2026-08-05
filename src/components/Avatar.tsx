import { useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';

import { cores, familia, raio } from '@/theme/tokens';

type Props = {
  /** Foto do provedor. Sem ela (ou se falhar), cai na inicial do nome. */
  fotoUrl?: string;
  nome?: string;
  tamanho?: number;
};

export function Avatar({ fotoUrl, nome, tamanho = 96 }: Props) {
  // Uma URL do Google pode expirar ou vir bloqueada; nesse caso a inicial
  // assume em vez de deixar um buraco na tela.
  const [falhou, setFalhou] = useState(false);
  const mostraFoto = Boolean(fotoUrl) && !falhou;

  const dimensao = { width: tamanho, height: tamanho, borderRadius: raio.pill };

  if (mostraFoto) {
    // Na web vai uma <img> de verdade em vez do Image do React Native Web:
    // o loader dele pré-carrega a imagem por fora e, quando esse caminho
    // falha, o componente cai no onError sem a imagem nunca aparecer.
    if (Platform.OS === 'web') {
      return (
        <img
          src={fotoUrl}
          alt={nome ? `Foto de ${nome}` : 'Foto do perfil'}
          referrerPolicy="no-referrer"
          onError={() => setFalhou(true)}
          width={tamanho}
          height={tamanho}
          style={{
            width: tamanho,
            height: tamanho,
            borderRadius: raio.pill,
            objectFit: 'cover',
            backgroundColor: cores.superficieVariante,
          }}
        />
      );
    }

    return (
      <Image
        source={{ uri: fotoUrl }}
        onError={() => setFalhou(true)}
        accessibilityIgnoresInvertColors
        accessibilityLabel={nome ? `Foto de ${nome}` : 'Foto do perfil'}
        style={[dimensao, styles.foto]}
      />
    );
  }

  return (
    <View style={[dimensao, styles.inicial]}>
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
