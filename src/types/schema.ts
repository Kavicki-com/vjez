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
  /** Respelling silábico em PT-BR, tônica em MAIÚSCULA: "VÓ-da". */
  pronuncia_pt?: string;
}

export interface Frase {
  id: string;
  hr: string;
  pt: string;
  contexto?: string;
  audioUrl?: string;
  pronuncia_pt?: string;
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
  pronuncia_pt?: string;
}

/**
 * Uma terminação da grade de declinação: é gênero × número.
 * `terminacao` vem só com o sufixo ("-ima", "—" quando é vazio); as
 * palavras-modelo já flexionadas vêm em `exemplos_hr` — duas quando a
 * terminação alterna (grad / prijatelja), uma no resto.
 */
export interface TerminacaoPadez {
  id: string;
  padez: Padez;
  genero: 'm' | 'f' | 'n';
  plural: boolean;
  terminacao: string;
  exemplos_hr: string[];
}

/**
 * Linha do quadro dos casos (item Padeži do menu lateral). Material de consulta:
 * a pergunta que o caso responde, para que serve, as preposições que o
 * pedem, um exemplo e a grade de terminações.
 */
export interface CasoPadez {
  id: string;
  padez: Padez;
  /** Ordem canônica croata (N G D A V L I), 1 a 7. */
  numero: number;
  pergunta_hr: string;
  pergunta_pt: string;
  uso_pt: string;
  preposicoes_hr: string[];
  exemplo_hr: string;
  exemplo_pt: string;
  nota_pt?: string;
  terminacoes: TerminacaoPadez[];
}

// ---------- CONJUGAÇÃO (aba lateral: Konjugacija) ----------

/** 1ª, 2ª e 3ª pessoa, singular e plural. */
export type Lice = '1s' | '2s' | '3s' | '1p' | '2p' | '3p';

/** Os três tempos que o iniciante precisa: presente, passado, futuro. */
export type TempoVerbal = 'prezent' | 'perfekt' | 'futur';

/**
 * Um verbo-modelo — a coluna do quadro.
 *
 * São quatro: `biti`, que é irregular e o mais usado da língua, e um de cada
 * padrão de presente (-am, -im, -em). Reconhecer o padrão é o que deixa o
 * aluno conjugar os outros verbos sozinho.
 */
export interface VerboModelo {
  id: string;
  infinitivo_hr: string;
  ordem: number;
  traducao_pt: string;
  /** Rótulo da coluna, em PT: "presente em -am", "irregular". */
  padrao_pt: string;
  nota_pt?: string;
}

/**
 * Uma célula do quadro: pessoa × tempo × verbo.
 *
 * `formas_hr` guarda a forma INTEIRA, não um sufixo: em croata o passado é
 * clítico + particípio ("radio sam") e o futuro é clítico + infinitivo
 * ("radit ću"). Vêm duas ou três formas quando o gênero muda a palavra —
 * mesmo desenho do `exemplos_hr` da grade do Padeži, pelo mesmo motivo.
 */
export interface FormaLice {
  id: string;
  lice: Lice;
  tempo: TempoVerbal;
  infinitivo_hr: string;
  formas_hr: string[];
}

/**
 * Linha do quadro de conjugação (item Konjugacija do menu lateral).
 * Material de consulta: o pronome, onde o brasileiro tropeça nesta pessoa,
 * um exemplo, e as formas de cada verbo-modelo nos três tempos.
 */
export interface PessoaVerbal {
  id: string;
  lice: Lice;
  /** 1 a 6, na ordem de qualquer tabela de conjugação. */
  numero: number;
  /** Mais de um quando a pessoa tem gênero: on / ona / ono. */
  pronomes_hr: string[];
  pronome_pt: string;
  uso_pt: string;
  exemplo_hr: string;
  exemplo_pt: string;
  nota_pt?: string;
  formas: FormaLice[];
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
  /**
   * As opções estão em croata e podem ser faladas ao toque.
   * Fica a cargo da curadoria: metade das opções do app é português, e em
   * perguntas sobre o som ouvir seria entregar a resposta.
   */
  falarOpcoes?: boolean;
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

/**
 * Quem pode escrever conteúdo. `aluno` é todo mundo; `curador` é o
 * professor ou nativo que alimenta o app pelo CMS; `admin` também mexe em
 * papéis. Quem manda de verdade é a RLS do banco (`e_curador()`) — este
 * campo só decide o que a interface mostra.
 */
export type Papel = 'aluno' | 'curador' | 'admin';

export interface Usuario {
  id: string;
  estado: EstadoConta;
  provedor?: Provedor;
  nome?: string;
  nivel: Nivel;
  papel: Papel;
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
