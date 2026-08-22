import { type Href, router } from 'expo-router';

/**
 * Voltar sem beco sem saída.
 *
 * `router.back()` sozinho só funciona quando existe histórico. Não existe
 * quando a tela foi aberta por link direto, por refresh na web, ou pelo
 * drawer (que navega por substituição, não empilhando) — nesses casos o
 * toque no "voltar" não faz nada e o aluno fica preso na tela, sem saída
 * nenhuma, porque a tela de erro também não tem botão.
 *
 * Então: volta se der, e se não der vai para o destino que faz sentido
 * naquele ponto da hierarquia (lição → unidade, unidade → trilha).
 */
export function voltarPara(destino: Href) {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(destino);
}
