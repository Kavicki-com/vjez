-- Cinco exercícios por lição (decidido com o dono).
--
-- Os seeds 004, 005, 008 e 012 criam lições de 6 exercícios: transformacao 3
-- (peso 5), traducao 2 (peso 3), producao_livre 1 (peso 2). Este arquivo corta
-- um exercício da atividade de transformacao de cada lição e redistribui:
-- os 2 que ficam passam a valer 2.5, então a atividade segue valendo 5 e a
-- lição segue valendo 10.
--
-- Rodar DEPOIS do 012. É idempotente: se a lição já tem 2 exercícios de
-- transformacao, o delete não acha nada e o update de peso não muda nada.
--
-- Critério do corte, lição a lição: saiu o exercício mais redundante com os
-- outros da MESMA lição. Em 9 das 30 havia duplicata literal com a atividade
-- de tradução (ex.: M5 L1 pedia "eu como pão" na transformacao e de novo na
-- traducao). Nas demais saiu o reconhecimento passivo, mantendo o exercício
-- que carrega o conceito do título da lição.

create temp table a_remover (mod int, lic int, ord int, porque text);
insert into a_remover values
  (1,1,2,  'Š = ch já sai do ligar_pares da mesma lição'),
  (1,2,1,  'Nj = nh já sai do ligar_pares da mesma lição'),
  (1,3,1,  'o final já sai do ligar_pares das vogais'),
  (2,1,3,  'devet ≈ deset, que já está na traducao'),
  (2,2,2,  'jedanaest é instância da regra -naest do exercício 1'),
  (2,3,1,  'a regra do 5+ já aparece em "trideset godina" na traducao'),
  (3,1,1,  'reconhecimento simples; o ligar_pares cobre as saudações'),
  (3,2,2,  'duplicata literal: "eu sou do Brasil" está na traducao'),
  (3,3,2,  'Dobra večer já sai do ligar_pares da mesma lição'),
  (4,1,2,  'irmã/mãe/irmão se repetem na traducao da lição'),
  (4,2,3,  'duplicata literal: "minha casa" está na traducao'),
  (4,3,2,  'drill de ordem de palavras; o exercício 3 ensina o Nominativ'),
  (5,1,2,  'duplicata literal: "eu como pão" está na traducao'),
  (5,2,1,  'duplicata literal: "para a escola" está na traducao'),
  (5,3,3,  'preserva o par animado/inanimado, que é o miolo da lição'),
  (6,1,3,  'ligar_pares passivo; os outros dois produzem a forma'),
  (6,2,3,  'terceiro "nema + X" seguido; os outros dois bastam'),
  (6,3,2,  'duplicata literal: "sopa sem carne" está na traducao'),
  (7,1,3,  'ligar_pares passivo; os outros dois produzem o Dativ'),
  (7,2,3,  'duplicata literal: "eu gosto do mar" está na traducao'),
  (7,3,2,  'mesma construção de "boli me oko", que está na traducao'),
  (8,1,3,  'ligar_pares passivo; a traducao cobre o vocabulário'),
  (8,2,3,  'o contraste u/na está nos exercícios 1 e 2'),
  (8,3,2,  'duplicata literal: "eu estou no hotel" está na traducao'),
  (9,1,3,  'ligar_pares passivo; a traducao cobre as formas'),
  (9,2,3,  'duplicata literal: "de ônibus" está na traducao'),
  (9,3,2,  'versão masculina do exercício 1, que ensina čitao/čitala'),
  (10,1,3, 'ligar_pares passivo; a traducao cobre mãe e amigo'),
  (10,2,2, 'duplicata literal: "obrigado, amigo!" está na traducao'),
  (10,3,3, 'Gospodine já é a resposta do exercício 1');

-- A guarda do count = 3 é o que torna o arquivo idempotente. Sem ela, numa
-- segunda execução os `ordem` já estariam renumerados para 1 e 2 e a lista
-- apagaria sobreviventes.
delete from public.exercicios e
using a_remover r, public.modulos m, public.licoes l, public.atividades a
where m.ordem = r.mod
  and l.modulo_id = m.id and l.ordem = r.lic
  and a.licao_id = l.id and a.tipo = 'transformacao'
  and e.atividade_id = a.id and e.ordem = r.ord
  and (select count(*) from public.exercicios x where x.atividade_id = a.id) = 3;

-- Os 2 que sobram passam a valer 2.5; a atividade segue valendo 5.
update public.exercicios e
set peso = 2.5, atualizado_em = now()
from public.atividades a
where a.id = e.atividade_id and a.tipo = 'transformacao' and e.peso <> 2.5;

-- Renumera 1,2 para não sobrar buraco na ordem.
update public.exercicios e
set ordem = nova.rn
from (
  select e2.id, row_number() over (partition by e2.atividade_id order by e2.ordem) as rn
  from public.exercicios e2
  join public.atividades a2 on a2.id = e2.atividade_id and a2.tipo = 'transformacao'
) nova
where nova.id = e.id and e.ordem <> nova.rn;

-- A regra do 5+ saía do exercício removido em M2 L3; passa para a dica do que ficou.
update public.exercicios e
set dica_pt = 'De 2 a 4 a palavra vira godine; de 5 em diante volta para godina.'
from public.atividades a, public.licoes l, public.modulos m
where a.id = e.atividade_id and l.id = a.licao_id and m.id = l.modulo_id
  and m.ordem = 2 and l.ordem = 3 and e.tipo = 'preencher_lacuna';

drop table a_remover;

-- Conferência: as 30 lições precisam ficar com 5 exercícios e nota 10.
do $$
declare v_fora int;
begin
  select count(*) into v_fora from (
    select l.id from public.licoes l
    join public.atividades a on a.licao_id = l.id
    join public.exercicios e on e.atividade_id = a.id
    group by l.id having count(e.id) <> 5 or sum(e.peso) <> 10
  ) x;
  if v_fora > 0 then
    raise exception '% lição(ões) ficaram fora do padrão 5 exercícios / nota 10', v_fora;
  end if;
end $$;
