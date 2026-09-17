# Publicar por SFTP

**Domínio:** `vjez.kavicki.com` · **Host:** Cloudez (`50.116.54.157`) ·
**Servidor:** Nginx — conferido em 2026-08-13.

A landing e o app moram no mesmo domínio: **landing na raiz, app em `/app`**.
É o que o `index.html` da landing já espera — os botões "Comece agora" e o
link do rodapé apontam para `/app/`, e os dois links legais do rodapé para
`/app/privacidade` e `/app/termos` — que são também as duas URLs pedidas no
cadastro das lojas.

## Gerar

```bash
npm run build:web
```

Isso roda `expo export -p web` e escreve tudo em `dist/`. O `dist/` não vai
para o Git (é build), então gere na hora de publicar.

## Ver antes de subir

```bash
npm run preview:web
```

Gera e serve no mesmo desenho do servidor: landing em `localhost:8080/` e
app em `localhost:8080/app/`. É o único jeito de testar o PWA — o
`expo start` serve o app da raiz, com bundle de desenvolvimento e **sem**
service worker (worker em dev guarda o bundle e faz você editar arquivo e
ver a versão velha). Como `localhost` conta como origem segura, o navegador
oferece instalar exatamente como faria em https.

## O que sobe para onde

```
public_html/              <- a raiz do site no host
├── index.html            ]
├── estilo.css            ]  cópia de web/, sem alterar nada
├── parallax.js           ]
├── favicon-*.png         ]
├── fontes/               ]
├── midia/                ]
│
└── app/                  <- cópia do CONTEÚDO de dist/ (não da pasta dist)
    ├── .htaccess         <- vem junto; o FileZilla esconde arquivo oculto
    ├── index.html            por padrão, ligue "mostrar arquivos ocultos"
    ├── manifest.webmanifest
    ├── sw.js
    ├── icones/
    ├── _expo/
    ├── assets/
    └── ... (o resto do dist)
```

Cuidado ao arrastar: o que vai para `app/` é o **conteúdo** de `dist/`. Se
subir a pasta, vira `app/dist/` e nada funciona.

## Falta o certificado

Em 2026-08-13 o `vjez.kavicki.com` respondia com o certificado curinga do
host (`*.ip-50-116-54-157.cloudezapp.io`), que **não cobre este domínio** —
o navegador dá aviso de segurança.

Isso não é detalhe estético: service worker só roda em origem segura (a
exceção é `localhost`). Sem certificado válido, o app abre mas **não
instala e não funciona offline**. No painel da Cloudez, emitir o Let's
Encrypt para o domínio resolve.

## O fallback das rotas, em Nginx

`/licao/<id>`, `/modulo/<id>` e `/checkpoint/<id>` não existem como arquivo:
o export estático não conhece os ids. Quem não é arquivo tem que cair em
`/app/index.html`, e o roteador resolve no cliente. **Sem isso, dar F5 no
meio de uma lição devolve 404.**

O host é Nginx, então o `.htaccess` que sobe junto com o export **não é
lido** — ele fica ali só para o caso de o site mudar para Apache um dia. O
que vale é isto, na configuração do site (painel da Cloudez → configuração
do Nginx, ou suporte):

```nginx
location /app/ {
  try_files $uri $uri.html $uri/ /app/index.html;
}
```

Se não der para editar a config, o estrago é limitado: navegar dentro do
app funciona normalmente, e depois da primeira visita o service worker
passa a responder por essas rotas. Quebra só no F5 e em link direto para
uma lição antes de o worker existir — o que inclui link compartilhado.

## Depois de subir, no Supabase

Painel → Authentication → URL Configuration:

- **Site URL**: `https://vjez.kavicki.com/app/`
- **Redirect URLs**:
  - `https://vjez.kavicki.com/app/**` — produção
  - `http://localhost:8081/**` — `npm start` (web)
  - `http://localhost:8080/app/**` — `npm run preview:web`

Sem isso o login com Google/Apple vai embora e não volta. O app pede para
voltar para a tela em que o aluno estava (`window.location.href`), então a
lista precisa cobrir os caminhos, não só a origem — daí o `**`.

As portas são as do Expo (8081) e a do preview (8080); `localhost:3000` não
é usado por este projeto.

E no Google Cloud Console, no OAuth client do login com Google:

- **Origens JavaScript autorizadas**: `https://vjez.kavicki.com`
- **URI de redirecionamento**: `https://cltclnrgtlififwvpfra.supabase.co/auth/v1/callback`
  (é o Supabase que recebe o retorno, não o app)

## Conferir (5 minutos)

1. `https://vjez.kavicki.com/` — a landing abre e o "Comece agora" leva ao app.
2. `https://vjez.kavicki.com/app/` — a trilha carrega.
3. Entrar numa lição e **dar F5**. Se der 404, falta o `try_files` no Nginx.
4. No celular, menu do navegador → "Instalar app" / "Adicionar à Tela de
   Início". Tem que abrir sem barra de endereço, com o escudo como ícone.
5. Modo avião com o app já aberto uma vez: a casca ainda abre.

## Atualizar depois

Gere de novo e suba por cima. Duas coisas a lembrar:

- Os arquivos de `_expo/` têm hash no nome, então versões antigas ficam
  acumulando no servidor. De vez em quando, apagar `app/` inteiro antes de
  subir mantém a pasta limpa.
- Se mexer no `public/sw.js`, **suba a versão** na constante `VERSAO` dele.
  É o que faz o navegador jogar fora o cache antigo.
