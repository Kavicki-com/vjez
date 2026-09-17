/**
 * Quem responde pelo Vjez, num lugar só.
 *
 * Fica aqui, e não no banco, porque documento legal não é conteúdo de
 * curadoria: ele muda com o CNPJ da empresa, não com a trilha do aluno.
 *
 * Os colchetes são de propósito. Enquanto qualquer campo estiver assim, o
 * app mostra o aviso de pendência no topo dos dois documentos — é melhor a
 * falta aparecer na tela do que passar despercebida até a revisão da loja.
 */
export const RESPONSAVEL = {
  razaoSocial: '[RAZÃO SOCIAL]',
  cnpj: '[CNPJ]',
  endereco: '[ENDEREÇO COMPLETO]',
  email: 'design@kavicki.com',
} as const;

/** Data em que esta redação passou a valer. Atualize junto com o texto. */
export const VIGENCIA = '17 de setembro de 2026';

/** Ainda tem colchete no lugar de dado real? */
export const faltaPreencher = Object.values(RESPONSAVEL).some((valor) =>
  valor.startsWith('['),
);
