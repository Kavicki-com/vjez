/**
 * Onde o app mora dentro do domínio, na web.
 *
 * Publicado, ele é servido de `/app` (a landing ocupa a raiz) — é o
 * `experiments.baseUrl` do app.json. No `expo start` não: o servidor de
 * desenvolvimento serve tudo da raiz, mesmo com o baseUrl configurado.
 *
 * Fica num módulo só porque duas partes distantes precisam da mesma
 * resposta — a casca HTML e o retorno do login — e errar isso não dá erro
 * na tela, dá 404 no meio de um fluxo.
 */
export const BASE_WEB =
  process.env.NODE_ENV === 'production' ? (process.env.EXPO_BASE_URL ?? '') : '';

/**
 * Endereço da raiz do app, com barra no fim.
 *
 * A barra importa: `/app` sem ela fica fora do escopo declarado no manifest
 * e o navegador recusa instalar o PWA.
 */
export function urlDaRaizDoApp(): string {
  return `${window.location.origin}${BASE_WEB}/`;
}
