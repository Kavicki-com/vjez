-- Abertura de cada lição: ilustração + explicação do caso, como nos mockups.
-- É conteúdo, então mora no banco e a curadoria edita pelo CMS.

-- O caso que o módulo ensina. Nulo nos módulos temáticos (alfabeto, números,
-- saudações), que não são sobre um caso.
alter table public.modulos add column padez public.padez;

alter table public.licoes
  -- Parágrafo de abertura, em PT-BR, explicando o que a lição ensina.
  add column intro_pt text,
  -- Glifo Ionicons da ilustração de abertura, no mesmo padrão de modulos.icone.
  add column ilustracao text;

update public.modulos set padez = dados.padez::public.padez
from (values
  (4,  'nominativ'),
  (5,  'akuzativ'),
  (6,  'genitiv'),
  (7,  'dativ'),
  (8,  'lokativ'),
  (9,  'instrumental'),
  (10, 'vokativ')
) as dados(ordem, padez)
where public.modulos.ordem = dados.ordem;
