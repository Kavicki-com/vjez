-- Espinha do currículo: currículo híbrido (decidido com o dono).
-- Base temática curta, depois um módulo por caso, cada um ancorado num tema.
-- Módulos 1-3 são a fase 'demo'; do 4 em diante é a trilha 'paralelo',
-- curada por nativos sobre o mesmo schema.

insert into public.modulos (tema_pt, nivel, fase, ordem) values
  ('Alfabeto e sons',                  'basico',        'demo',     1),
  ('Números',                          'basico',        'demo',     2),
  ('Saudações e apresentações',        'basico',        'demo',     3),
  ('Nominativ — pessoas e família',    'basico',        'paralelo', 4),
  ('Akuzativ — comida e compras',      'basico',        'paralelo', 5),
  ('Genitiv — posse e quantidade',     'intermediario', 'paralelo', 6),
  ('Dativ — dar e receber',            'intermediario', 'paralelo', 7),
  ('Lokativ — casa e lugares',         'intermediario', 'paralelo', 8),
  ('Instrumental — companhia e meio',  'intermediario', 'paralelo', 9),
  ('Vokativ — chamar e cumprimentar',  'intermediario', 'paralelo', 10)
on conflict (ordem) do nothing;

-- Cada módulo destranca com o anterior; o primeiro nasce aberto (guest-first).
update public.modulos m
set bloqueado_por = anterior.id
from public.modulos anterior
where anterior.ordem = m.ordem - 1;

-- Checkpoint 1:1 com o módulo. Nota mínima 70%, 10 itens sorteados em runtime.
insert into public.checkpoints (modulo_id, nota_minima, tamanho)
select id, 0.70, 10 from public.modulos
on conflict (modulo_id) do nothing;

-- Revisão geral a cada 3 módulos, puxando de tudo que já foi concluído.
insert into public.revisoes_gerais (apos_modulo_ordem, tamanho) values
  (3, 15), (6, 15), (9, 15)
on conflict (apos_modulo_ordem) do nothing;
