/**
 * Service worker do Vjež.
 *
 * Faz três coisas, e só três:
 *
 * 1. NAVEGAÇÃO — rede primeiro, casca em cache como rede de segurança.
 *    É o que faz o app abrir instalado e sem sinal, e é também o que salva
 *    o F5 numa rota dinâmica (/licao/[id]): o export estático não tem
 *    arquivo para esses ids, então quem responde é a casca em cache e o
 *    roteador resolve o resto no cliente.
 *
 * 2. ESTÁTICOS DO BUNDLE — cache primeiro. Os arquivos de /_expo/ têm hash
 *    no nome: quando o conteúdo muda, o nome muda. Cache eterno é seguro.
 *
 * 3. ÁUDIO — cache primeiro, com teto, porque o aluno repete a mesma faixa
 *    muitas vezes.
 *
 *    ATENÇÃO: o MP3 do Storage NÃO é imutável. O nome do arquivo vem do
 *    texto, então consertar a pronúncia de uma palavra reescreve a mesma
 *    URL — foi o que aconteceu com 14 faixas que subiram mudas. Cache
 *    primeiro entrega a versão velha para sempre, e o servidor manda
 *    `cache-control: no-cache` justamente para evitar isso; é este worker
 *    que passa por cima. Por isso: REGEROU ÁUDIO, SUBA A `VERSAO`.
 *
 * NÃO toca em /rest/v1/ nem em /auth/: progresso e sessão têm que ser a
 * verdade do servidor, e servir progresso velho de cache é pior do que
 * mostrar erro de rede.
 */

// Subir este número joga fora todo o cache antigo na próxima visita. Suba
// sempre que o deploy puder ter pegado o navegador no meio do caminho —
// tipo um SFTP que terminou depois de alguém já ter aberto o site — e
// SEMPRE que áudio tiver sido regerado, pelo motivo no item 3 acima.
//
// v3: 14 faixas mudas reescritas nas mesmas URLs (vogais soltas, `pas`,
// `pet`, `je`, `ja`, `ti`, `Đ`). Quem já tinha o PWA instalado carregava a
// versão silenciosa do cache.
const VERSAO = 'vjez-v3';
const CASCA = `${VERSAO}-casca`;
const ESTATICOS = `${VERSAO}-estaticos`;
const AUDIO = `${VERSAO}-audio`;

/** Onde o app está servido; o próprio escopo do worker resolve isso. */
const BASE = new URL('./', self.registration.scope).pathname;

/** Teto do cache de áudio, em faixas. Cada MP3 tem de 3 a 8 kB. */
const MAX_AUDIO = 300;

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CASCA).then((cache) => cache.add(BASE)),
  );
  // Sem isto, uma versão nova fica "waiting" até todas as abas fecharem —
  // e app instalado quase nunca fecha.
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    (async () => {
      const nomes = await caches.keys();
      await Promise.all(
        nomes
          .filter((nome) => !nome.startsWith(VERSAO))
          .map((nome) => caches.delete(nome)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (evento) => {
  const { request } = evento;

  // POST/PATCH e afins nunca entram em cache: a resposta depende do corpo,
  // e o Cache Storage indexa só por URL.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Dados e sessão: sempre rede, sem intermediário.
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/auth/v1/')) {
    return;
  }

  if (request.mode === 'navigate') {
    evento.respondWith(navegacao(request));
    return;
  }

  if (url.pathname.includes('/storage/v1/object/public/audio/')) {
    evento.respondWith(cachePrimeiro(request, AUDIO, MAX_AUDIO));
    return;
  }

  if (url.origin === self.location.origin) {
    evento.respondWith(cachePrimeiro(request, ESTATICOS));
  }
});

/** Rede primeiro; se cair, a casca guardada na instalação. */
async function navegacao(request) {
  try {
    const resposta = await fetch(request);
    // Guarda a casca sempre que ela vier boa, para a versão em cache
    // acompanhar os deploys em vez de congelar na do primeiro acesso.
    if (resposta.ok && new URL(request.url).pathname === BASE) {
      const cache = await caches.open(CASCA);
      cache.put(BASE, resposta.clone());
    }
    return resposta;
  } catch {
    const cache = await caches.open(CASCA);
    const casca = await cache.match(BASE);
    if (casca) return casca;
    return new Response(
      '<meta charset="utf-8"><p style="font:16px system-ui;padding:2rem">Sem conexão.</p>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }
}

async function cachePrimeiro(request, nomeDoCache, teto) {
  const cache = await caches.open(nomeDoCache);
  const guardado = await cache.match(request);
  if (guardado) return guardado;

  const resposta = await fetch(request);
  // Resposta opaca (no-cors) não dá para inspecionar: guardar é guardar
  // um erro em potencial para sempre.
  if (resposta.ok && resposta.type !== 'opaque') {
    await cache.put(request, resposta.clone());
    if (teto) await podar(cache, teto);
  }
  return resposta;
}

/** FIFO simples: o Cache Storage devolve as chaves na ordem de inserção. */
async function podar(cache, teto) {
  const chaves = await cache.keys();
  if (chaves.length <= teto) return;
  await Promise.all(
    chaves.slice(0, chaves.length - teto).map((chave) => cache.delete(chave)),
  );
}
