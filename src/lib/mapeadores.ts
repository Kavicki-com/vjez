/**
 * Traduz linhas do Postgres (snake_case, ver @/types/database)
 * para as formas do contrato (camelCase, ver @/types/schema).
 *
 * As colunas `dados` dos exercícios já têm o formato garantido por CHECK
 * no banco (constraint exercicios_dados_por_tipo), então aqui só estreitamos
 * a união — sem revalidar campo a campo.
 */

import type { Tables } from '@/types/database';
import type {
  Atividade,
  CasoPadez,
  Exercicio,
  FormaLice,
  Frase,
  Letra,
  Licao,
  LexItem,
  Modulo,
  Numero,
  Ofensiva,
  PessoaVerbal,
  ProgressoLicao,
  ProgressoModulo,
  TerminacaoPadez,
  Usuario,
  VerboModelo,
} from '@/types/schema';

/** Converte `null` do Postgres em `undefined` do TS. */
function ou<T>(valor: T | null): T | undefined {
  return valor ?? undefined;
}

// ---------- CAMADA BASAL ----------

export function paraLetra(linha: Tables<'letras'>): Letra {
  return {
    id: linha.id,
    letra: linha.letra,
    som_pt: linha.som_pt,
    exemplo_hr: ou(linha.exemplo_hr),
    audioUrl: ou(linha.audio_url),
  };
}

export function paraNumero(linha: Tables<'numeros'>): Numero {
  return {
    id: linha.id,
    valor: linha.valor,
    hr: linha.hr,
    audioUrl: ou(linha.audio_url),
    pronuncia_pt: ou(linha.pronuncia_pt),
  };
}

export function paraLexItem(linha: Tables<'lex_items'>): LexItem {
  return {
    id: linha.id,
    hr: linha.hr,
    pt: linha.pt,
    categoria: linha.categoria,
    genero: ou(linha.genero),
    audioUrl: ou(linha.audio_url),
    nota_pt: ou(linha.nota_pt),
    pronuncia_pt: ou(linha.pronuncia_pt),
  };
}

export function paraFrase(linha: Tables<'frases'>): Frase {
  return {
    id: linha.id,
    hr: linha.hr,
    pt: linha.pt,
    contexto: ou(linha.contexto),
    audioUrl: ou(linha.audio_url),
    pronuncia_pt: ou(linha.pronuncia_pt),
  };
}

export function paraTerminacaoPadez(
  linha: Tables<'padez_terminacoes'>,
): TerminacaoPadez {
  return {
    id: linha.id,
    padez: linha.padez,
    genero: linha.genero,
    plural: linha.plural,
    terminacao: linha.terminacao,
    exemplos_hr: linha.exemplos_hr,
  };
}

export function paraCasoPadez(
  linha: Tables<'padezi'>,
  terminacoes: TerminacaoPadez[],
): CasoPadez {
  return {
    id: linha.id,
    padez: linha.padez,
    numero: linha.numero,
    pergunta_hr: linha.pergunta_hr,
    pergunta_pt: linha.pergunta_pt,
    uso_pt: linha.uso_pt,
    preposicoes_hr: linha.preposicoes_hr,
    exemplo_hr: linha.exemplo_hr,
    exemplo_pt: linha.exemplo_pt,
    nota_pt: ou(linha.nota_pt),
    terminacoes,
  };
}

// ---------- CONJUGAÇÃO ----------

export function paraVerboModelo(linha: Tables<'verbos_modelo'>): VerboModelo {
  return {
    id: linha.id,
    infinitivo_hr: linha.infinitivo_hr,
    ordem: linha.ordem,
    traducao_pt: linha.traducao_pt,
    padrao_pt: linha.padrao_pt,
    nota_pt: ou(linha.nota_pt),
  };
}

export function paraFormaLice(linha: Tables<'lice_formas'>): FormaLice {
  return {
    id: linha.id,
    lice: linha.lice,
    tempo: linha.tempo,
    infinitivo_hr: linha.infinitivo_hr,
    formas_hr: linha.formas_hr,
  };
}

export function paraPessoaVerbal(
  linha: Tables<'lica'>,
  formas: FormaLice[],
): PessoaVerbal {
  return {
    id: linha.id,
    lice: linha.lice,
    numero: linha.numero,
    pronomes_hr: linha.pronomes_hr,
    pronome_pt: linha.pronome_pt,
    uso_pt: linha.uso_pt,
    exemplo_hr: linha.exemplo_hr,
    exemplo_pt: linha.exemplo_pt,
    nota_pt: ou(linha.nota_pt),
    formas,
  };
}

// ---------- EXERCÍCIOS ----------

export function paraExercicio(linha: Tables<'exercicios'>): Exercicio {
  const base = {
    id: linha.id,
    enunciado_pt: linha.enunciado_pt,
    dica_pt: ou(linha.dica_pt),
    peso: Number(linha.peso),
    padez: ou(linha.padez),
    audioUrl: ou(linha.audio_url),
  };
  const dados = linha.dados as Record<string, never>;

  switch (linha.tipo) {
    case 'preencher_lacuna':
      return {
        ...base,
        tipo: 'preencher_lacuna',
        frase_hr: dados.frase_hr,
        base_hr: dados.base_hr,
        resposta: dados.resposta,
      };
    case 'escolher_forma':
      return {
        ...base,
        tipo: 'escolher_forma',
        opcoes: dados.opcoes,
        resposta: dados.resposta,
        falarOpcoes: Boolean(dados.falar_opcoes),
      };
    case 'montar_frase':
      return {
        ...base,
        tipo: 'montar_frase',
        alvo_hr: dados.alvo_hr,
        tokens: dados.tokens,
      };
    case 'ligar_pares':
      return { ...base, tipo: 'ligar_pares', pares: dados.pares };
    case 'traducao':
      return {
        ...base,
        tipo: 'traducao',
        origem_pt: dados.origem_pt,
        respostas_aceitas: dados.respostas_aceitas,
      };
    case 'producao_livre':
      return {
        ...base,
        tipo: 'producao_livre',
        prompt_pt: dados.prompt_pt,
        maxCaracteres: 400,
      };
  }
}

// ---------- ESTRUTURA DE APRENDIZADO ----------

export function paraAtividade(
  linha: Tables<'atividades'>,
  exercicios: Exercicio[],
): Atividade {
  return {
    id: linha.id,
    tipo: linha.tipo,
    titulo_pt: linha.titulo_pt,
    exercicios,
  };
}

export function paraLicao(
  linha: Tables<'licoes'>,
  atividades: Atividade[],
): Licao {
  return {
    id: linha.id,
    titulo_pt: linha.titulo_pt,
    ordem: linha.ordem,
    atividades,
  };
}

export function paraModulo(
  linha: Tables<'modulos'>,
  licoes: Licao[],
  checkpoint: Tables<'checkpoints'>,
): Modulo {
  return {
    id: linha.id,
    tema_pt: linha.tema_pt,
    nivel: linha.nivel,
    fase: linha.fase,
    ordem: linha.ordem,
    licoes,
    checkpoint: {
      id: checkpoint.id,
      moduloId: checkpoint.modulo_id,
      notaMinima: Number(checkpoint.nota_minima),
      tamanho: checkpoint.tamanho,
    },
    bloqueadoPor: ou(linha.bloqueado_por),
  };
}

// ---------- USUÁRIO & PROGRESSO ----------

export function paraUsuario(linha: Tables<'usuarios'>): Usuario {
  const ofensiva: Ofensiva = {
    diasSeguidos: linha.ofensiva_dias_seguidos,
    ultimoDiaAtivo: linha.ofensiva_ultimo_dia_ativo ?? '',
    status: linha.ofensiva_status,
  };
  return {
    id: linha.id,
    estado: linha.estado,
    provedor: ou(linha.provedor),
    nome: ou(linha.nome),
    nivel: linha.nivel,
    papel: linha.papel,
    xp: linha.xp,
    ofensiva,
    criadoEm: linha.criado_em,
  };
}

export function paraProgressoLicao(
  linha: Tables<'progresso_licao'>,
): ProgressoLicao {
  return {
    usuarioId: linha.usuario_id,
    licaoId: linha.licao_id,
    nota: Number(linha.nota),
    concluida: linha.concluida,
    data: linha.data,
  };
}

export function paraProgressoModulo(
  linha: Tables<'progresso_modulo'>,
): ProgressoModulo {
  return {
    usuarioId: linha.usuario_id,
    moduloId: linha.modulo_id,
    checkpointPassado: linha.checkpoint_passado,
    desbloqueado: linha.desbloqueado,
  };
}
