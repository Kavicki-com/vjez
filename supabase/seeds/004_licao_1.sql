-- Lição 1 do Módulo 1: a lição aberta a convidado.
-- O portão de login aparece no fim dela (item 10 do escopo).
-- As 3 atividades seguem a escada obrigatória: transformacao -> traducao -> producao_livre.
-- Os pesos somam exatamente 10 (5 + 3 + 2).

with m as (select id from public.modulos where ordem = 1),
licao as (
  insert into public.licoes (modulo_id, titulo_pt, ordem)
  select m.id, 'As letras que não existem em português', 1 from m
  returning id
),
atv as (
  insert into public.atividades (licao_id, tipo, titulo_pt, ordem)
  select licao.id, t.tipo, t.titulo, t.ordem
  from licao, (values
    ('transformacao'::public.tipo_atividade, 'Letras e sons', 1),
    ('traducao'::public.tipo_atividade,      'Escreva em croata', 2),
    ('producao_livre'::public.tipo_atividade,'Agora é com você', 3)
  ) as t(tipo, titulo, ordem)
  returning id, tipo
)
insert into public.exercicios
  (atividade_id, tipo, enunciado_pt, dica_pt, peso, ordem, dados)
select a.id, e.tipo, e.enunciado, e.dica, e.peso, e.ordem, e.dados
from atv a
join (values
  ('transformacao', 'ligar_pares'::public.tipo_exercicio,
   'Ligue cada letra ao som que ela tem em português.',
   'Č e Ć são parecidos: o Č é mais duro, o Ć é mais suave.',
   2.0, 1,
   '{"pares":[{"hr":"Č","pt":"tch duro, como em tchau"},
              {"hr":"Ć","pt":"tch suave, quase tchi"},
              {"hr":"Š","pt":"ch, como em chave"},
              {"hr":"Ž","pt":"j, como em janela"}]}'::jsonb),

  ('transformacao', 'escolher_forma',
   'Qual letra tem o som de "ch" de "chave"?',
   null, 1.5, 2,
   '{"opcoes":["S","Š","C","Č"],"resposta":"Š"}'::jsonb),

  ('transformacao', 'escolher_forma',
   'Em croata, a letra C tem sempre o som de:',
   'Nunca é "k" nem "s". Pense no final de "pizza" em italiano.',
   1.5, 3,
   '{"opcoes":["k","s","ts","tch"],"resposta":"ts"}'::jsonb),

  ('traducao', 'traducao',
   'Escreva em croata: casa',
   'Tem um Ć no meio.', 1.5, 1,
   '{"origem_pt":"casa","respostas_aceitas":["kuća","kuca"]}'::jsonb),

  ('traducao', 'traducao',
   'Escreva em croata: água',
   null, 1.5, 2,
   '{"origem_pt":"água","respostas_aceitas":["voda"]}'::jsonb),

  ('producao_livre', 'producao_livre',
   'Escreva uma saudação em croata e diga seu nome.',
   'Você pode usar "Bok!" e "Zovem se...".', 2.0, 1,
   '{"prompt_pt":"Escreva uma saudação em croata e diga seu nome.","max_caracteres":400}'::jsonb)
) as e(atividade, tipo, enunciado, dica, peso, ordem, dados)
  on e.atividade = a.tipo::text;
