import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cores, familia, raio } from '@/theme/tokens';

import { Imagem } from './Imagem';

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

  if (fotoUrl && !falhou) {
    return (
      <Imagem
        url={fotoUrl}
        largura={tamanho}
        altura={tamanho}
        ajuste="cover"
        raio={raio.pill}
        rotuloAcessivel={nome ? `Foto de ${nome}` : 'Foto do perfil'}
        aoFalhar={() => setFalhou(true)}
      />
    );
  }

  return (
    <View
      style={[
        { width: tamanho, height: tamanho, borderRadius: raio.pill },
        styles.inicial,
      ]}
    >
      <Text style={[styles.letra, { fontSize: tamanho * 0.4 }]}>
        {(nome ?? 'V').charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  inicial: {
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letra: { fontFamily: familia.extraForte, color: cores.superficie },
});
