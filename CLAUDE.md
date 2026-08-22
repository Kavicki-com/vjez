# CLAUDE.md — App de Croata (spec de construção)

App para **falantes de PT-BR aprenderem croata** (iniciantes). Este arquivo é o contrato. Construa o app como **renderizador sobre o schema**; conteúdo entra como **dados curados** no backend — não faça hardcode de conteúdo.

## Stack (fixa)

- **React Native + React Native Web via Expo** — um código para web + iOS + Android.
- **Supabase**: Auth (Google/Apple), Postgres, Storage (áudio), Edge Functions.
- **TypeScript** em tudo. O schema abaixo é a fonte da verdade.
- **Microsoft Clarity** (analytics) desde o início.
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
