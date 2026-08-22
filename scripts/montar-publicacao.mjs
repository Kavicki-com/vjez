#!/usr/bin/env node
/**
 * Monta `publicar/` com o site já no desenho final: a landing na raiz e o
 * export do app dentro de `app/`.
 *
 * Existe para tirar do SFTP a única decisão que dá errado calado — subir a
 * pasta `dist` em vez do conteúdo dela, e acabar com `/app/dist/`. Aqui é
 * arrastar `publicar/` inteiro para a raiz do site e pronto.
 */

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const RAIZ = resolve(import.meta.dirname, '..');
const DESTINO = join(RAIZ, 'publicar');
const LANDING = join(RAIZ, 'web');
const APP = join(RAIZ, 'dist');

/** Documentação da landing não é parte do site. */
const NAO_SOBE = new Set(['LEIA-ME.md', '.DS_Store']);

if (!existsSync(APP)) {
  console.error('Não achei dist/. Rode `npm run build:web` antes.');
  process.exit(1);
}

rmSync(DESTINO, { recursive: true, force: true });
mkdirSync(DESTINO, { recursive: true });

for (const nome of readdirSync(LANDING)) {
  if (NAO_SOBE.has(nome)) continue;
  cpSync(join(LANDING, nome), join(DESTINO, nome), { recursive: true });
}

// O CONTEÚDO do dist, não a pasta: é este passo que o arrasto manual erra.
cpSync(APP, join(DESTINO, 'app'), { recursive: true });

function medir(caminho) {
  let arquivos = 0;
  let bytes = 0;
  for (const nome of readdirSync(caminho)) {
    const alvo = join(caminho, nome);
    const info = statSync(alvo);
    if (info.isDirectory()) {
      const [a, b] = medir(alvo);
      arquivos += a;
      bytes += b;
    } else {
      arquivos++;
      bytes += info.size;
    }
  }
  return [arquivos, bytes];
}

const [arquivos, bytes] = medir(DESTINO);
console.log(`\n  publicar/  ${arquivos} arquivos, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
console.log(`  ${DESTINO}\n`);
console.log('  Suba o CONTEÚDO desta pasta para a raiz do site.');
console.log('  Ligue "mostrar arquivos ocultos" no FileZilla: o .htaccess vai junto.\n');
