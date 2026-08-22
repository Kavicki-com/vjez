import {
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
  NunitoSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito-sans';

/**
 * Carregamento da Nunito Sans — versão NATIVA (iOS e Android).
 *
 * Aqui as TTF vêm no app mesmo, e é o expo-font que as registra. O Metro
 * escolhe este arquivo pela extensão `.native`; a web fica com `fontes.ts`,
 * onde a fonte já chega pronta pelo `@font-face` do HTML.
 *
 * Um arquivo por peso porque `fontWeight: '700'` sobre a família Regular
 * não engrossa nada no nativo — ver `familia` em ./tokens.
 */
export function useFontesDaMarca(): boolean {
  const [prontas] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
    NunitoSans_800ExtraBold,
  });
  return prontas;
}
