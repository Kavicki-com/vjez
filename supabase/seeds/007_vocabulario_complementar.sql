-- Vocabulário que faltava: palavras usadas como exemplo no alfabeto
-- (cipela, čokolada, džem, đak, film, ime, limun, ljubav, oko, šuma, tata)
-- e as que as lições dos casos precisam (auto, autobus, knjiga, čaša).
-- Sem isso, o aluno vê a palavra no exercício e não a acha no Dicionário.
-- PRECISA DE REVISÃO NATIVA antes de publicar.

insert into public.lex_items (hr, pt, categoria, genero, nota_pt) values
  ('knjiga',    'livro',            'Casa',     'f', null),
  ('čaša',      'copo',             'Casa',     'f', null),
  ('cipela',    'sapato',           'Casa',     'f', 'Quase sempre no plural: cipele.'),
  ('oko',       'olho',             'Pessoas',  'n', 'Plural irregular: oči.'),
  ('ime',       'nome',             'Pessoas',  'n', null),
  ('tata',      'papai',            'Pessoas',  'm', 'Termina em -a mas é masculino.'),
  ('đak',       'aluno',            'Pessoas',  'm', null),
  ('ljubav',    'amor',             'Pessoas',  'f', null),
  ('auto',      'carro',            'Viagem',   'n', 'Também se diz automobil.'),
  ('autobus',   'ônibus',           'Viagem',   'm', null),
  ('put',       'viagem, caminho',  'Viagem',   'm', null),
  ('karta',     'passagem, bilhete','Viagem',   'f', null),
  ('novac',     'dinheiro',         'Cidade',   'm', 'Só no singular.'),
  ('film',      'filme',            'Cidade',   'm', null),
  ('šuma',      'floresta',         'Natureza', 'f', null),
  ('limun',     'limão',            'Comida',   'm', null),
  ('čokolada',  'chocolate',        'Comida',   'f', null),
  ('džem',      'geleia',           'Comida',   'm', null),
  ('sladoled',  'sorvete',          'Comida',   'm', null),
  ('šećer',     'açúcar',           'Comida',   'm', null),
  ('vrijeme',   'tempo',            'Natureza', 'n', 'Serve para o tempo que passa e para o clima.')
on conflict (hr) do nothing;
