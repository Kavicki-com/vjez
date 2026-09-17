/**
 * Quem responde pelo Vjez, num lugar só.
 *
 * Fica aqui, e não no banco, porque documento legal não é conteúdo de
 * curadoria: ele muda com o CNPJ da empresa, não com a trilha do aluno.
 *
 * Colchete no lugar de dado real acende o aviso no topo dos dois documentos
 * — é melhor a falta aparecer na tela do que passar despercebida até a
 * revisão da loja.
 *
 * Os textos ainda não passaram por revisão jurídica. Quando passarem, vale
 * atualizar VIGENCIA junto com o que o advogado mudar.
 */
export const RESPONSAVEL = {
  razaoSocial: 'Kavicki.com',
  cnpj: '45.625.800/0001-36',
  /**
   * Vazio de propósito: a empresa não tem endereço para publicar. Vazio faz
   * a oração "com sede em…" sumir dos dois documentos, em vez de deixar
   * frase pela metade. Basta preencher para ela voltar.
   */
  endereco: '',
  email: 'design@kavicki.com',
} as const;

/** A oração da sede, ou nada. */
export const SEDE = RESPONSAVEL.endereco
  ? `, com sede em ${RESPONSAVEL.endereco}`
  : '';

/** Data em que esta redação passou a valer. Atualize junto com o texto. */
export const VIGENCIA = '17 de setembro de 2026';

/** Ainda tem colchete no lugar de dado real? */
export const faltaPreencher = Object.values(RESPONSAVEL).some((valor) =>
  valor.startsWith('['),
);
