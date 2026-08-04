/**
 * Schema do Vjez — fonte da verdade (ver CLAUDE.md).
 * Todo o conteúdo vem do Supabase; nada de conteúdo hardcoded aqui.
 * Interface/instruções em PT-BR; só o conteúdo-alvo e nomes de casos em HR.
 */

// ---------- BASE ----------
export type Nivel = 'basico' | 'intermediario' | 'avancado';
export type Fase = 'demo' | 'paralelo' | 'evolucao';
export type Padez =
  | 'nominativ'
  | 'genitiv'
  | 'dativ'
  | 'akuzativ'
  | 'vokativ'
  | 'lokativ'
  | 'instrumental';

// ---------- CAMADA BASAL (aba Dicionário) ----------
export interface LexItem {
  id: string;
  hr: string;
  pt: string;
  categoria: string;
  genero?: 'm' | 'f' | 'n';
  audioUrl?: string;
  nota_pt?: string;
}

export interface Frase {
  id: string;
  hr: string;
  pt: string;
  contexto?: string;
  audioUrl?: string;
}

export interface Letra {
  id: string;
  letra: string;
  som_pt: string;
  exemplo_hr?: string;
  audioUrl?: string;
}

export interface Numero {
  id: string;
  valor: number;
  hr: string;
  audioUrl?: string;
}

// ---------- EXERCÍCIOS (templates) ----------
export type TipoExercicio =
  | 'preencher_lacuna'
  | 'escolher_forma'
  | 'montar_frase'
  | 'ligar_pares'
  | 'traducao'
  | 'producao_livre';

export interface ExercicioBase {
  id: string;
  tipo: TipoExercicio;
  /** Instrução SEMPRE em PT-BR. */
  enunciado_pt: string;
  dica_pt?: string;
  /** Fração da nota /10. */
  peso: number;
  padez?: Padez;
  audioUrl?: string;
}

/** Auto-corrigível. */
export interface ExPreencherLacuna extends ExercicioBase {
  tipo: 'preencher_lacuna';
  frase_hr: string;
  base_hr: string;
  resposta: string;
}

/** Auto-corrigível. */
export interface ExEscolherForma extends ExercicioBase {
  tipo: 'escolher_forma';
  opcoes: string[];
  resposta: string;
}

/** Auto-corrigível. */
export interface ExMontarFrase extends ExercicioBase {
  tipo: 'montar_frase';
  alvo_hr: string;
  tokens: string[];
}

/** Auto-corrigível. */
export interface ExLigarPares extends ExercicioBase {
  tipo: 'ligar_pares';
  pares: { hr: string; pt: string }[];
}

/** Checagem tolerante. */
export interface ExTraducao extends ExercicioBase {
  tipo: 'traducao';
  origem_pt: string;
  respostas_aceitas: string[];
}

/** Pontua por envio. */
export interface ExProducaoLivre extends ExercicioBase {
  tipo: 'producao_livre';
  prompt_pt: string;
  maxCaracteres: 400;
}

export type Exercicio =
  | ExPreencherLacuna
  | ExEscolherForma
  | ExMontarFrase
  | ExLigarPares
  | ExTraducao
  | ExProducaoLivre;

// ---------- ESTRUTURA DE APRENDIZADO ----------
export type TipoAtividade = 'transformacao' | 'traducao' | 'producao_livre';

export interface Atividade {
  id: string;
  tipo: TipoAtividade;
  titulo_pt: string;
  exercicios: Exercicio[];
}

export interface Licao {
  id: string;
  titulo_pt: string;
  ordem: number;
  atividades: Atividade[];
}

/**
 * Gerado em runtime; sem lista fixa.
 * Amostra dos exercícios do módulo, priorizando erros (TentativaExercicio).
 */
export interface Checkpoint {
  id: string;
  moduloId: string;
  notaMinima: number;
  tamanho: number;
}

/**
 * A cada 3 módulos. Puxa de TODOS os módulos concluídos,
 * com peso extra nos mais antigos.
 */
export interface RevisaoGeral {
  id: string;
  aposModuloOrdem: number;
  tamanho: number;
}

export interface Modulo {
  id: string;
  tema_pt: string;
  nivel: Nivel;
  fase: Fase;
  ordem: number;
  licoes: Licao[];
  checkpoint: Checkpoint;
  bloqueadoPor?: string;
}

// ---------- USUÁRIO & PROGRESSO ----------
export type EstadoConta = 'convidado' | 'autenticado';
export type Provedor = 'google' | 'apple';

/**
 * Gatilho diário = concluir ≥1 lição.
 * Faltou 1 dia → em_recuperacao (salva fazendo a pendente + hoje).
 * 2 dias sem atividade → zerada.
 */
export interface Ofensiva {
  diasSeguidos: number;
  ultimoDiaAtivo: string;
  status: 'ativa' | 'em_recuperacao' | 'zerada';
}

export interface Usuario {
  id: string;
  estado: EstadoConta;
  provedor?: Provedor;
  nome?: string;
  nivel: Nivel;
  xp: number;
  ofensiva: Ofensiva;
  criadoEm: string;
}

export interface ProgressoLicao {
  usuarioId: string;
  licaoId: string;
  nota: number;
  concluida: boolean;
  data: string;
}

/** Alimenta checkpoint + analytics. */
export interface TentativaExercicio {
  usuarioId: string;
  exercicioId: string;
  moduloId: string;
  acertou: boolean;
  tentativas: number;
  data: string;
}

export interface ProgressoModulo {
  usuarioId: string;
  moduloId: string;
  checkpointPassado: boolean;
  desbloqueado: boolean;
}

// ---------- PRODUÇÃO LIVRE + CORREÇÃO ----------
export type StatusSubmissao =
  | 'aguardando'
  | 'corrigida_ia'
  | 'revisada_nativo'
  | 'falha';

export interface SubmissaoLivre {
  id: string;
  usuarioId: string;
  exercicioId: string;
  texto_hr: string;
  status: StatusSubmissao;
  correcaoIa?: Correcao;
  correcaoNativo?: Correcao;
  criadoEm: string;
}

export interface Correcao {
  autor: 'ia' | 'nativo';
  texto_corrigido_hr?: string;
  comentario_pt: string;
  criadoEm: string;
}
