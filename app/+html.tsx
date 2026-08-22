import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import { BASE_WEB } from '@/lib/base';

/**
 * Casca HTML do export web. Só o navegador vê este arquivo — no iOS e no
 * Android ele não existe.
 *
 * É aqui que mora o que faz o app ser instalável: manifest, ícone de
 * tela inicial, cor da barra e o registro do service worker.
 */

const PRODUCAO = process.env.NODE_ENV === 'production';

/** Onde o app mora no domínio; ver a explicação em @/lib/base. */
const BASE = BASE_WEB;

/**
 * Registro do worker, só no build de produção.
 *
 * Service worker em desenvolvimento é armadilha: ele guarda o bundle e
 * passa a servir o guardado, então você edita um arquivo, recarrega e vê
 * a versão velha. Para testar o PWA inteiro — instalar, abrir sem barra
 * de endereço, funcionar offline — use `npm run preview:web`, que serve o
 * export real no mesmo desenho do servidor.
 *
 * Fora do `load` ele disputa banda com o bundle no primeiro acesso, que é
 * justamente quando a tela ainda está em branco.
 */
const REGISTRA_SW = !PRODUCAO
  ? ''
  : `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('${BASE}/sw.js', { scope: '${BASE}/' })
      .catch(function (erro) { console.warn('Service worker não registrado:', erro); });
  });
}
`;

/**
 * A Nunito Sans como WEBFONT, auto-hospedada em `public/fontes/`.
 *
 * Declarada aqui, e não pelo expo-font: no `<head>` o navegador enxerga o
 * `@font-face` enquanto ainda lê o HTML e baixa a fonte em paralelo com o
 * bundle. Pelo expo-font ela só começaria a carregar depois de o
 * JavaScript inteiro chegar e rodar — e a splash ficava esperando por isso.
 *
 * Auto-hospedada, e não pelo CDN do Google, por três motivos: o PWA precisa
 * funcionar offline e o service worker só guarda o que sai do nosso
 * domínio; um `fetch` ao gstatic.com entrega o IP de cada aluno ao Google,
 * que é exatamente o tipo de coleta que o aviso de LGPD teria que declarar;
 * e uma origem a menos é um handshake TLS a menos no primeiro acesso.
 *
 * Os arquivos são a fonte VARIÁVEL: um woff2 por subconjunto serve os
 * quatro pesos, e o peso de cada família sai do descritor `font-weight`
 * abaixo. Por isso são dois arquivos e não oito — 59 KB no total, contra
 * os 448 KB das quatro TTF que iam dentro do bundle.
 *
 * latin-ext não é opcional aqui: é onde moram Č, Ć, Đ, Š e Ž. Sem ele o
 * croata cairia na fonte do sistema justamente nas letras que o app
 * ensina.
 */
const SUBCONJUNTOS = [
  {
    arquivo: 'nunito-sans-latin.woff2',
    faixa:
      'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  {
    arquivo: 'nunito-sans-latin-ext.woff2',
    faixa:
      'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
  },
] as const;

/** Os nomes têm que bater com `familia` em @/theme/tokens, letra por letra. */
const PESOS = [
  ['NunitoSans_400Regular', 400],
  ['NunitoSans_600SemiBold', 600],
  ['NunitoSans_700Bold', 700],
  ['NunitoSans_800ExtraBold', 800],
] as const;

const CSS_DAS_FONTES = PESOS.flatMap(([nome, peso]) =>
  SUBCONJUNTOS.map(
    ({ arquivo, faixa }) => `@font-face {
  font-family: '${nome}';
  font-style: normal;
  font-weight: ${peso};
  font-stretch: 100%;
  font-display: swap;
  src: url('${BASE}/fontes/${arquivo}') format('woff2');
  unicode-range: ${faixa};
}`,
  ),
).join('\n');

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* viewport-fit=cover: sem isso o app instalado no iPhone deixa
            faixa branca na área do notch e do indicador de home. */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        {/* Título e descrição vêm do <Head> do _layout: navegador usa o
            PRIMEIRO <title> do documento, e o do <Head> é injetado antes
            de tudo que estiver escrito aqui. */}

        {/* Preload nos dois: o app mistura português e croata na mesma
            tela, então os dois subconjuntos são pedidos no primeiro quadro.
            `crossOrigin` é obrigatório em preload de fonte mesmo na mesma
            origem — sem ele o navegador baixa duas vezes. */}
        {SUBCONJUNTOS.map(({ arquivo }) => (
          <link
            key={arquivo}
            rel="preload"
            as="font"
            type="font/woff2"
            href={`${BASE}/fontes/${arquivo}`}
            crossOrigin=""
          />
        ))}
        <style dangerouslySetInnerHTML={{ __html: CSS_DAS_FONTES }} />

        <link rel="manifest" href={`${BASE}/manifest.webmanifest`} />
        <meta name="theme-color" content="#A30019" />

        {/* O iOS ignora o manifest: ícone, nome e modo tela cheia do
            "Adicionar à Tela de Início" vêm destas três. */}
        <link rel="apple-touch-icon" href={`${BASE}/icones/icone-192.png`} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Vjež" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Trava a rolagem no <body> e deixa a rolagem para os ScrollView
            do app — sem isto o web ganha duas barras de rolagem. */}
        <ScrollViewStyleReset />

        <script dangerouslySetInnerHTML={{ __html: REGISTRA_SW }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
