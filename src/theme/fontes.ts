/**
 * Carregamento da Nunito Sans — versão WEB.
 *
 * Na web não há nada a carregar em tempo de execução: as quatro famílias
 * são declaradas em `@font-face` dentro do `<head>`, em `app/+html.tsx`,
 * e o navegador começa a baixar o woff2 enquanto ainda está lendo o HTML —
 * em paralelo com o bundle, não depois dele.
 *
 * Era o contrário até aqui: o `useFonts` do expo-font só roda depois que o
 * JavaScript inteiro chega e executa, e a splash ficava presa esperando.
 * Além do atraso, as quatro TTF (448 KB) viajavam DENTRO do bundle; os
 * woff2 equivalentes somam 59 KB e ficam em `public/fontes/`, fora dele.
 *
 * O par nativo deste arquivo é `fontes.native.ts`, que o Metro escolhe no
 * iOS e no Android — lá `@font-face` não existe e o expo-font continua
 * sendo o caminho.
 */
export function useFontesDaMarca(): boolean {
  return true;
}
