-- Exercícios de `escolher_forma` cujas quatro opções são croatas.
--
-- O gerador de áudio só fala uma opção quando ela é verbete do dicionário ou
-- quando a curadoria marcou `falar_opcoes` — ver `supabase/audio/gerar.mjs`.
-- As lições 4 e 5 (seed 014) e as do cotidiano (012) entraram sem essa marca,
-- e ficaram mudas mesmo onde a opção é uma forma flexionada — que é
-- justamente o que o exercício está ensinando a pronunciar.
--
-- Aqui ficam os 14 em que TODAS as opções são croatas. Os outros 20
-- continuam mudos de propósito: opções em português ("fumar", "feminino"),
-- nome de caso ("Genitiv", "Nominativ"), transcrição de som ("ts", "tch") ou
-- mistura das duas línguas ("mlijeko, igual ao Nominativ"). Voz croata lendo
-- português é pior do que silêncio.
--
-- Em nenhum deles o som entrega a resposta: a pergunta é sempre de forma
-- gramatical (qual Vokativ, qual Instrumental, qual particípio), e ouvir as
-- quatro não diz qual é a certa.
--
-- Casa por enunciado porque os ids dos exercícios são gerados pelo
-- `criar_licao`. Idempotente: rodar de novo não muda nada.

update public.exercicios
set dados = dados || '{"falar_opcoes": true}'::jsonb
where tipo = 'escolher_forma'
  and enunciado_pt in (
    'Como se pergunta como vai? para um amigo?',
    'Como se diz a primeira lição? (lekcija é feminino)',
    'O plural de prijatelj (amigo) é:',
    'Para começar um e-mail formal em croata, você escreve:',
    'Complete: Moram ići ___ (preciso ir ao médico).',
    'Você levanta o copo num jantar. O que diz?',
    'Complete: Pišem ___ (escrevo com a caneta).',
    'Como se pergunta que horas são?',
    'Complete: Živim u ___ (moro no Brasil).',
    'Complete: Volim ___ (eu gosto de música).',
    'Complete: Idem s ___ (vou com os amigos).',
    'E para chamar uma mulher que você não conhece?',
    'No passado o croata junta o verbo biti com o particípio. Qual está certo para uma mulher?',
    'Você quer chamar um homem que não conhece. Como se dirige a ele?'
  );
