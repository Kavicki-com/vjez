# CLAUDE.md — App de Croata (spec de construção)

App para **falantes de PT-BR aprenderem croata** (iniciantes). Este arquivo é o contrato. Construa o app como **renderizador sobre o schema**; conteúdo entra como **dados curados** no backend — não faça hardcode de conteúdo.

## Situação do projeto

Fatos conferidos nos arquivos e no git em 2026-11-04. Repositório público: nunca versionar segredos. A spec original continua abaixo desta seção.

### 1. O que é

Vjez: curso de croata para falantes de português do Brasil, iniciantes, com trilha de lições, dicionário, tabelas de consulta (Padezi e Konjugacija), ofensiva e correção de produção livre por IA. Web, iOS e Android no mesmo código; o personagem das telas é o Zef.

### 2. Stack

- Expo `~57.0.10`, React Native `0.86.2`, React `19.2.3`, Expo Router `~57.0.10` (`baseUrl` `/app`), TypeScript `~6.0.3`, `react-native-web` `^0.21.2`.
- `@supabase/supabase-js` `^2.112.0`, TanStack Query `^5.101.4`, `expo-audio` `~57.0.3`.
- Edge Function versionada: `corrigir-producao-livre`.
- Web: PWA (`public/sw.js`) e landing estática sem build (`web/`).
- Versão em `app.json`: `1.0.0`.
- Comandos: `npm start`, `npm run typecheck`, `npm run preview:web`, `npm run publicar`. Publicação web: `PUBLICAR.md`.

### 3. Situação real

**Em desenvolvimento** para as lojas; publicação web atual não determinada pelos arquivos.

| Afirmação | Evidência |
| --- | --- |
| Sem preparo de build de loja: não há `eas.json` e `extra.eas` está vazio | `app.json`, conferido em 2026-11-04 |
| Login no celular ainda não configurado | `src/features/conta/api.ts` |
| Login com Apple depende de conta de desenvolvedor ativa | `src/features/conta/PortaoDeLogin.tsx` |
| Destino web definido: landing e app em `vjez.kavicki.com` | `PUBLICAR.md`, conferido nele em 2026-08-13 |
| Pacote web montado localmente, com 107 arquivos e `sw` v4, ainda não commitada | `publicar/` (ignorada pelo git), arquivos de 2026-09-17 |

Não determinado pelos arquivos: se `publicar/` subiu e qual versão está no ar em `vjez.kavicki.com`. Falta registro do deploy ou conferência recente.

### 4. Em andamento

- Branch `main`, igual a `origin/main`, em `9a9362b` (2026-09-17). Sem commits há 48 dias.
- **Não commitado:** 9 arquivos modificados (190 inserções, 118 remoções), com o Zef nas telas de feedback, fim de lição, checkpoint e erro; novos estados `espanta` e `resmunga`; `sw` v4; atualização de `assets/personagem/LEIA-ME.md`.
- Últimas entregas: Konjugacija (`dcb478b`), varredura de áudio (`7afb7ad`, `38070e3`), 5 lições por unidade (`51975ec`), Zef (`a45b79e`).
- `acumulado-ate-2026-08-22`: sem commits à frente de `main`.

### 5. Pendências

- Commitar os 9 arquivos modificados.
- Web (`PUBLICAR.md`, estado de 2026-08-13; estado atual não determinado): certificado do domínio, `try_files` no Nginx e URLs de redirect no Supabase.
- Lojas: login móvel, login com Apple, `eas.json`, assets de loja e itens de "Compliance" abaixo.
- `excluirConta` chama a função `excluir-conta`, que não está em `supabase/functions/`. Se está implantada: não determinado pelos arquivos.
- `src/features/conta/travessia.ts` usa `sessionStorage` de propósito; é exceção à regra 5, a confirmar com o dono.
- `web/LEIA-ME.md`: fontes em WOFF2 e consentimento do Clarity, quando o analytics entrar.
- `assets/personagem/LEIA-ME.md`: piscar, boné e poses próprias para `errou`, `espanta`, `resmunga` e `pensa`.
- Sem TODO/FIXME/HACK/XXX no código.

---

## Stack (fixa)

- **React Native + React Native Web via Expo** — um código para web + iOS + Android.
- **Supabase**: Auth (Google/Apple), Postgres, Storage (áudio), Edge Functions.
- **TypeScript** em tudo. O schema abaixo é a fonte da verdade.
- **Microsoft Clarity** (analytics) desde o início. *(Obsoleto em 2026-11-04: não integrado; não há Clarity em `src/`, `app/` ou `package.json`, e `app/(drawer)/privacidade.tsx` declara que o app não usa.)*
- Áudio: **MP3 pré-gerado** (Cloud TTS), servido do Storage.

## Regras invioláveis

1. **Idioma:** toda interface/instrução/dica/tradução em **PT-BR**. Só o conteúdo-alvo (palavras, formas, frases croatas) e os nomes dos casos (Nominativ, Genitiv…) em **HR**.
2. **Conteúdo mora no backend** (Supabase), nunca embutido no bundle. Cache local para offline/velocidade.
3. **Chave do Gemini só no servidor** (Edge Function). Nunca no cliente.
4. **Mobile-first e responsivo** por composição (flex, %, unidades relativas — sem posição fixa em px). Referência = 390px; expandir por breakpoints.
5. Sem localStorage/browser storage em lógica de produção — usar estado do app + Supabase.
6. Nasce **publicável nas lojas** (ícones, splash, bundle IDs, permissões, build de release).

## Arquitetura

- Front universal (Expo). Bottom nav no mobile → navegação lateral/topo em web larga.
- Supabase Auth: **Google + Apple** (Apple obrigatório junto do Google para a App Store).
- Edge Function `corrigir-producao-livre`: recebe texto (≤400 chars) → chama Gemini → retorna `Correcao`.
- Storage: um MP3 por item de conteúdo com áudio.

## Navegação

- **3 abas:** **Início** (trilha + ofensiva) · **Dicionário** (alfabeto, números, dicionário PT↔HR pesquisável, expressões) · **Perfil** (progresso, XP, conquistas) — *portão de login*.
- **Drawer:** Configurações, conta (entrar/sair, convidado→conta), idioma, áudio, notificações, privacidade/termos.

## Modelo de conteúdo

Hierarquia: `Modulo` (tema) → `Licao` ("diário") → 3 `Atividades` → `Exercicios`.
As 3 atividades, em escada de dificuldade: `transformacao` → `traducao` → `producao_livre`.
Um tema pode ter várias lições.

## Schema (contrato — TypeScript)

```ts
// ---------- BASE ----------
type Nivel = 'basico' | 'intermediario' | 'avancado';
type Fase  = 'demo' | 'paralelo' | 'evolucao';
type Padez = 'nominativ' | 'genitiv' | 'dativ' | 'akuzativ'
           | 'vokativ' | 'lokativ' | 'instrumental';

// ---------- CAMADA BASAL (aba Dicionário) ----------
interface LexItem { id: string; hr: string; pt: string; categoria: string;
  genero?: 'm'|'f'|'n'; audioUrl?: string; nota_pt?: string; }
interface Frase   { id: string; hr: string; pt: string; contexto?: string; audioUrl?: string; }
interface Letra   { id: string; letra: string; som_pt: string; exemplo_hr?: string; audioUrl?: string; }
interface Numero  { id: string; valor: number; hr: string; audioUrl?: string; }

// ---------- EXERCÍCIOS (templates) ----------
type TipoExercicio =
  | 'preencher_lacuna' | 'escolher_forma' | 'montar_frase'
  | 'ligar_pares' | 'traducao' | 'producao_livre';

interface ExercicioBase {
  id: string; tipo: TipoExercicio;
  enunciado_pt: string;      // instrução SEMPRE em PT
  dica_pt?: string;
  peso: number;              // fração da nota /10
  padez?: Padez;
  audioUrl?: string;
}

interface ExPreencherLacuna extends ExercicioBase { tipo:'preencher_lacuna';
  frase_hr: string; base_hr: string; resposta: string; }               // auto-corrigível
interface ExEscolherForma  extends ExercicioBase { tipo:'escolher_forma';
  opcoes: string[]; resposta: string; }                                // auto-corrigível
interface ExMontarFrase    extends ExercicioBase { tipo:'montar_frase';
  alvo_hr: string; tokens: string[]; }                                 // auto-corrigível
interface ExLigarPares     extends ExercicioBase { tipo:'ligar_pares';
  pares: { hr: string; pt: string }[]; }                               // auto-corrigível
interface ExTraducao       extends ExercicioBase { tipo:'traducao';
  origem_pt: string; respostas_aceitas: string[]; }                    // checagem tolerante
interface ExProducaoLivre  extends ExercicioBase { tipo:'producao_livre';
  prompt_pt: string; maxCaracteres: 400; }                             // pontua por envio

type Exercicio = ExPreencherLacuna | ExEscolherForma | ExMontarFrase
  | ExLigarPares | ExTraducao | ExProducaoLivre;

// ---------- ESTRUTURA DE APRENDIZADO ----------
type TipoAtividade = 'transformacao' | 'traducao' | 'producao_livre';

interface Atividade { id: string; tipo: TipoAtividade; titulo_pt: string; exercicios: Exercicio[]; }
interface Licao { id: string; titulo_pt: string; ordem: number; atividades: Atividade[]; }

interface Checkpoint {       // gerado em runtime; sem lista fixa
  id: string; moduloId: string; notaMinima: number; tamanho: number;
  // amostra dos exercícios do módulo, priorizando erros (TentativaExercicio)
}

interface RevisaoGeral {     // a cada 3 módulos
  id: string; aposModuloOrdem: number; tamanho: number;
  // puxa de TODOS os módulos concluídos, peso extra nos mais antigos
}

interface Modulo {
  id: string; tema_pt: string; nivel: Nivel; fase: Fase; ordem: number;
  licoes: Licao[]; checkpoint: Checkpoint; bloqueadoPor?: string;
}

// ---------- USUÁRIO & PROGRESSO ----------
type EstadoConta = 'convidado' | 'autenticado';
type Provedor    = 'google' | 'apple';

interface Ofensiva {
  diasSeguidos: number; ultimoDiaAtivo: string;
  status: 'ativa' | 'em_recuperacao' | 'zerada';
  // faltou 1 dia → em_recuperacao (salva fazendo pendente + hoje); 2 dias sem atividade → zerada
  // gatilho diário = concluir ≥1 lição
}

interface Usuario {
  id: string; estado: EstadoConta; provedor?: Provedor; nome?: string;
  nivel: Nivel; xp: number; ofensiva: Ofensiva; criadoEm: string;
}

interface ProgressoLicao { usuarioId: string; licaoId: string; nota: number; concluida: boolean; data: string; }
interface TentativaExercicio { usuarioId: string; exercicioId: string; moduloId: string;
  acertou: boolean; tentativas: number; data: string; }              // alimenta checkpoint + analytics
interface ProgressoModulo { usuarioId: string; moduloId: string; checkpointPassado: boolean; desbloqueado: boolean; }

// ---------- PRODUÇÃO LIVRE + CORREÇÃO ----------
type StatusSubmissao = 'aguardando' | 'corrigida_ia' | 'revisada_nativo' | 'falha';

interface SubmissaoLivre {
  id: string; usuarioId: string; exercicioId: string; texto_hr: string;
  status: StatusSubmissao; correcaoIa?: Correcao; correcaoNativo?: Correcao; criadoEm: string;
}

interface Correcao { autor: 'ia' | 'nativo'; texto_corrigido_hr?: string; comentario_pt: string; criadoEm: string; }
```

## Mecânicas

- **Nota:** lição vale **/10** (soma dos `peso` acertados). Erro tira ponto, **não bloqueia**. Feedback de erro mostra a **forma certa + o porquê do caso**.
- **Progressão:** dentro do módulo **sempre avança**. Fim do módulo = **checkpoint** (runtime, prioriza erros; nota mínima **70%**; não passou → refaz só o checkpoint).
- **Revisão geral:** a cada **3 módulos**, puxa do **todo acumulado** (peso nos antigos).
- **Ofensiva:** gatilho = ≥1 lição/dia. Faltou 1 dia → `em_recuperacao` (salva fazendo pendente + hoje). **2 dias sem atividade → `zerada`**.
- **Login guest-first:** **Lição 1 sem login**. Portão no **fim da Lição 1**. Login Google/Apple → **migra** progresso local para a conta.
- **Produção livre:** ≤**400 chars**, pontua por participação. Corrigida pelo **Gemini** (Edge Function → `correcaoIa`). Nativo revisa por cima (`correcaoNativo`).

## Escopo — construir nesta ordem (MVP / Demo)

1. Scaffold Expo (RN + RN Web) + TS + estrutura de pastas.
2. Tipos do schema como módulo TS compartilhado.
3. Supabase: projeto, tabelas espelhando o schema, Auth Google/Apple.
4. Navegação (3 abas + drawer) + tema visual, com telas placeholder.
5. Camada basal (Dicionário: alfabeto, números, dicionário, expressões) — navegável.
6. Um template de exercício ponta-a-ponta (ex.: `preencher_lacuna`) lendo do Supabase.
7. Loop de lição (3 atividades) + nota /10 + feedback de erro + `TentativaExercicio`.
8. Checkpoint (runtime) e desbloqueio de módulo.
9. Ofensiva (recuperação/zerada).
10. Login guest-first (Lição 1 aberta) + migração de progresso.
11. Edge Function `corrigir-producao-livre` (Gemini) + fluxo de produção livre.
12. Áudio pré-gerado tocando nos 3 alvos.
13. Clarity + assets de loja.

**Paralelo:** trilha completa (todos os módulos / 7 casos), curada por nativos, sobre o mesmo schema.

## Fora de escopo agora

- **Ranking / placar social** + anti-trapaça → *future feature*.
- **Chat ao vivo** pareado por nível (Fase 3). Antes dele: revisão nativa por cima da IA.
- **Sync/offline avançado** (conflito multi-dispositivo) → visão registrada, não prioridade.

## Compliance (antes de publicar, não bloqueia o scaffold)

Menores (classificação etária / coleta <13); **LGPD** (dados + envio ao Gemini + Clarity → base legal e aviso); **Apple** (Sign in with Apple, exclusão de conta no app). Consentimento do Clarity no 1º uso.

## Em aberto (aguardando o dono — usar placeholder, não travar)

- **Nome do app** (Vjez).
- **Personagem** das telas: definir papel — **NÃO é mascote**.
- **Sequência dos módulos** do currículo (alfabeto → números → saudações → vocabulário → … → 7 casos).
- ~~**Rate limit / teto de gasto** do Gemini.~~ Decidido: **30 correções por
  conta a cada 24h** e **1.000 no total a cada 24h**. Ambos em variável de
  ambiente da Edge Function (`CORRECOES_POR_CONTA_24H`, `CORRECOES_GLOBAIS_24H`),
  ajustáveis sem deploy. Convidado não é corrigido — só conta autenticada.

## Referência de design

Figma: https://www.figma.com/design/pjQUqzY73TGFJ4Y4MjGXKA/Vjez — 11 telas a 390px.

Telas existentes: Trilha de Aprendizado · Lição Interativa · Lista de Exercícios: Padeži · Ranking Semanal · Perfil e Progresso · Exercício por caso (Genitiv, Dativ, Vokativ, Lokativ, Instrumental, Akuzativ).

Divergências conhecidas entre Figma e spec:
- Figma tem **Ranking Semanal**, mas a spec põe ranking **fora de escopo** → não construir agora.
- Figma **não tem** telas de **Dicionário**, que a spec exige como uma das 3 abas → desenhar a partir da spec.
