# Landing do Vjez

Página de entrada do site. Vive **fora** do bundle do Expo: HTML, CSS e um
JS, sem build, sem dependência. É só servir a pasta.

## Por que separada do app

O conceito é parallax, e parallax bom depende de `transform` amarrado ao
scroll do navegador. O React Native Web não expõe isso — teria que passar
por `ScrollView` + Reanimated, que engasga em rolagem rápida e ainda subiria
peso morto para o bundle das lojas. Aqui o efeito roda na GPU e o app fica
intocado: `app/(drawer)/(tabs)/index.tsx` continua sendo a rota `/` dele.

O preço é que os tokens visuais estão duplicados: as cores, os raios e os
espaçamentos no topo de `estilo.css` são cópia de `src/theme/tokens.ts`.
**Mudou a paleta lá, replique aqui** — não há nada que sincronize os dois.

## Rodar local

```sh
cd web && python3 -m http.server 4321
# abre http://localhost:4321
```

## Publicar

Sobe a pasta `web/` como raiz do site (Vercel, Netlify, Cloudflare Pages,
S3 — qualquer host estático serve) e o app Expo em `/app`.

### Para onde vão os CTAs

Os quatro `[data-cta]` — cabeçalho, herói, fecho e rodapé — apontam para
`/app/`, ou seja, o app publicado no mesmo domínio. Esse é o valor do
`href` no HTML e é o que vale mesmo sem JS.

Em `localhost` o `parallax.js` reaponta todos para `http://localhost:8081`,
que é onde o `expo start --web` sobe — assim o botão funciona enquanto se
mexe na página.

Se o app for para um domínio próprio, o lugar a mudar é a constante
`APP.PRODUCAO` no topo do `parallax.js`, e os `href="/app/"` do HTML para
casar. Não há outro.

## Estrutura

```
web/
├─ index.html        # conteúdo e marcação das 7 cenas + sprite de ícones
├─ estilo.css        # tokens (cópia), layout, camadas de parallax
├─ parallax.js       # URL do app; scroll → variáveis CSS; revelação; contadores
├─ favicon-32.png    # gerados de assets/icon.png — o escudo com o Ž
├─ favicon-180.png   # apple-touch-icon
├─ favicon-512.png
├─ fontes/           # Nunito Sans 400/700/800
└─ midia/
   ├─ marca.png          # o mesmo escudo, no cabeçalho e no rodapé
   ├─ bandeira-*.jpg     # herói
   ├─ dubrovnik-*.jpg    # cena do mar
   ├─ mapa-*.png         # cena da trilha
   └─ ilustracoes/*.svg  # unDraw recolorido (vem de supabase/ilustracoes)
```

## Como o parallax funciona

O JS **não escreve `transform`**. Ele escreve duas variáveis CSS e o CSS
decide o resto:

- `--y` em cada `[data-parallax]` — deslocamento vertical em px;
- `--saida` no herói — 0 no topo da página, 1 quando ele terminou de sair.

Vantagem: mudar o efeito é mexer só no CSS, e `prefers-reduced-motion`
desliga tudo sem o JS precisar saber.

**Velocidade.** `data-parallax="70"` desloca até ±70px; negativo anda ao
contrário do scroll (sobe enquanto a página desce), que é o que dá a
sensação de estar na frente. Abaixo de 720px de largura a amplitude cai
para 55% — o mesmo deslocamento em tela estreita vira tranco.

**Referência.** Cada camada anda em relação à cena que a contém
(`[data-cena]`). Camadas da mesma cena compartilham o progresso e só se
separam pela velocidade — é isso que dá profundidade. Fora de uma cena
(as ilustrações do método), a referência vira o próprio pai e cada peça
flutua sozinha ao passar.

**Custo.** Um `requestAnimationFrame` para a página toda, agendado pelo
scroll. As posições são medidas fora do laço e refeitas só quando o layout
muda (resize, chegada das fontes, imagens `lazy`). Nada de
`getBoundingClientRect()` por quadro.

## Mídia

As três fotos vieram do dono e foram redimensionadas e comprimidas com
`sips`. O mapa ficou em PNG quantizado em 96 cores (JPEG chia na borda de
arte chapada) e é montado com `mix-blend-mode: multiply`, que apaga o fundo
branco dele contra o off-white da página sem precisar recortar nada.

As ilustrações são cópia de `supabase/ilustracoes/` — unDraw já recolorido
para a paleta da bandeira pelo `tricolor.py`. Aqui elas entram como SVG
mesmo; a conversão para PNG só existe porque o app nativo não tem
`react-native-svg`.

Trocar uma ilustração é copiar outro SVG de lá e mudar o `src`.

O rodapé não credita o unDraw porque a licença deles não exige atribuição —
foi por isso que o unDraw foi escolhido no lugar do Storyset, que exige.
Se um dia entrar arte de outra fonte, confira a licença dela antes: pode
ser que o crédito volte a ser obrigatório.

## Ícones

Os ícones dos cartões são **Ionicons**, os mesmos glifos que o app usa via
`@expo/vector-icons` — `book-outline`, `volume-high-outline`,
`flame-outline`, `flag-outline`, `refresh-outline`, `lock-open-outline`.
Vivem num sprite inline no topo do `index.html`: nenhum pedido a mais, e
cada um herda a cor por `currentColor`.

Foram copiados do pacote `ionicons` (MIT), não redesenhados — traço
aproximado não bate com o do app. Para pegar mais algum:

```sh
npm install ionicons --no-save --prefix /tmp/ion
cat /tmp/ion/node_modules/ionicons/dist/svg/<nome>-outline.svg
```

Cole o conteúdo do `<path>` num `<g id="i-...">` no sprite. **Mantenha
`viewBox="0 0 512 512"` e `stroke-width="32"`** — são os valores do
original, e mexer num sem o outro engrossa ou afina o traço em relação
ao app.

O traço vai como atributo no `<g>`, não em regra de CSS: estilo aplicado a
conteúdo dentro de `<defs>` nem sempre atravessa o clone do `<use>`, e o
comportamento varia por navegador.

Os favicons e o selo da marca saem de `assets/icon.png` (o escudo com o Ž,
1024px). Para regerar depois de mudar o ícone do app:

```sh
python3 - <<'PY'
from PIL import Image
im = Image.open("assets/icon.png").convert("RGBA")
for caminho, lado in {"web/favicon-32.png": 32, "web/favicon-180.png": 180,
                      "web/favicon-512.png": 512, "web/midia/marca.png": 96}.items():
    im.resize((lado, lado), Image.LANCZOS).save(caminho, optimize=True)
PY
```

## Pendências conhecidas

- **Fontes em TTF.** É o formato que vem no `@expo-google-fonts`. Em WOFF2
  os três arquivos cairiam de ~340 KB para ~120 KB. Com `fonttools` +
  `brotli` instalados: `pyftsubset X.ttf --flavor=woff2 --unicodes="U+0000-00FF,U+0100-017F,U+2000-206F"`
  (o intervalo latin-ext é o que cobre č, ć, š, ž e đ).
- **Consentimento do Clarity.** A landing ainda não carrega analytics. Quando
  carregar, o aviso de consentimento tem que vir junto — é o mesmo
  compromisso de LGPD que está no CLAUDE.md.
