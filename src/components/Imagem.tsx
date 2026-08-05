import { useState } from 'react';
import { Image, Platform, type ImageStyle, type StyleProp } from 'react-native';

type Props = {
  url: string;
  largura?: number | `${number}%`;
  altura: number;
  /** contain preserva a ilustração inteira; cover preenche e corta. */
  ajuste?: 'contain' | 'cover';
  rotuloAcessivel: string;
  raio?: number;
  /** Chamado quando a imagem não carrega, para a tela mostrar um plano B. */
  aoFalhar?: () => void;
};

/**
 * Imagem remota que funciona na web e no nativo.
 *
 * Na web sai uma <img> de verdade: o Image do React Native Web não emite
 * <img>, ele pré-carrega a URL por um caminho próprio e monta um div com
 * background-image — e foi exatamente por aí que a foto do Google sumia.
 */
export function Imagem({
  url,
  largura = '100%',
  altura,
  ajuste = 'contain',
  rotuloAcessivel,
  raio,
  aoFalhar,
}: Props) {
  const [falhou, setFalhou] = useState(false);
  if (falhou) return null;

  const marcarFalha = () => {
    setFalhou(true);
    aoFalhar?.();
  };

  if (Platform.OS === 'web') {
    return (
      <img
        src={url}
        alt={rotuloAcessivel}
        referrerPolicy="no-referrer"
        onError={marcarFalha}
        style={{
          width: largura,
          height: altura,
          objectFit: ajuste,
          borderRadius: raio,
        }}
      />
    );
  }

  const estilo: StyleProp<ImageStyle> = {
    width: largura,
    height: altura,
    borderRadius: raio,
  };

  return (
    <Image
      source={{ uri: url }}
      onError={marcarFalha}
      resizeMode={ajuste}
      accessibilityIgnoresInvertColors
      accessibilityLabel={rotuloAcessivel}
      style={estilo}
    />
  );
}
