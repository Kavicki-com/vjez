#!/usr/bin/env node
/**
 * Serve o site do jeito que ele vai ficar publicado: a landing (`web/`) na
 * raiz e o export do app (`dist/`) dentro de /app.
 *
 * Existe porque o `expo start` não dá para testar PWA: lá o app é servido
 * da raiz, sem service worker, com bundle de desenvolvimento. Aqui é o
 * arquivo real que vai para o servidor.
 *
 * localhost conta como origem segura, então o navegador registra o worker
 * e oferece instalar exatamente como faria em https.
 *
 *   node scripts/servir-preview.mjs [porta]
 */

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const PORTA = Number(process.argv[2] ?? 8080);
const RAIZ = resolve(import.meta.dirname, '..');
const LANDING = join(RAIZ, 'web');
const APP = join(RAIZ, 'dist');

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
};

if (!existsSync(APP)) {
  console.error('Não achei dist/. Rode `npm run build:web` antes.');
  process.exit(1);
}

/** Arquivo se existir; nulo se for pasta sem index ou se não existir. */
function arquivo(caminho) {
  if (!existsSync(caminho)) return null;
  if (statSync(caminho).isDirectory()) {
    const indice = join(caminho, 'index.html');
    return existsSync(indice) ? indice : null;
  }
  return caminho;
}

const servidor = createServer((req, resposta) => {
  // normalize corta os ".." antes de virar caminho de disco.
  const pedido = normalize(decodeURIComponent(req.url.split('?')[0]));

  // /app sem barra final fica FORA do escopo do manifest ("/app/"), e aí o
  // navegador recusa instalar dizendo que a página não pertence ao app.
  // O servidor de verdade redireciona sozinho por ser diretório; aqui não.
  if (pedido === '/app') {
    resposta.writeHead(301, { Location: '/app/' });
    resposta.end();
    return;
  }

  // Página de diagnóstico: mora dentro do escopo do app de propósito, para
  // poder olhar o service worker que controla estas rotas. Não vai para o
  // dist — é ferramenta de conferência, não parte do app.
  if (pedido === '/app/diagnostico' || pedido === '/app/diagnostico/') {
    resposta.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    createReadStream(join(RAIZ, 'scripts', 'diagnostico-pwa.html')).pipe(resposta);
    return;
  }

  let alvo;
  if (pedido.startsWith('/app/')) {
    const relativo = pedido.slice('/app'.length) || '/';
    alvo =
      arquivo(join(APP, relativo)) ??
      arquivo(join(APP, `${relativo}.html`)) ??
      // O mesmo fallback do servidor: rota dinâmica não tem arquivo, quem
      // responde é a casca e o roteador resolve no cliente.
      join(APP, 'index.html');
  } else {
    alvo = arquivo(join(LANDING, pedido));
  }

  if (!alvo) {
    resposta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    resposta.end('404');
    return;
  }

  resposta.writeHead(200, {
    'Content-Type': TIPOS[extname(alvo)] ?? 'application/octet-stream',
    // Sem cache: é preview, e cache aqui só atrapalha quem está conferindo.
    'Cache-Control': 'no-store',
  });
  createReadStream(alvo).pipe(resposta);
});

servidor.listen(PORTA, () => {
  console.log(`\n  Landing  http://localhost:${PORTA}/`);
  console.log(`  App      http://localhost:${PORTA}/app/\n`);
  console.log('  Para instalar: abra o app no Chrome e use o ícone de');
  console.log('  instalar na barra de endereço (ou Menu > Transmitir,');
  console.log('  salvar e compartilhar > Instalar).\n');
});
