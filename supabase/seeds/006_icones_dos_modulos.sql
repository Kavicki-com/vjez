-- Glifos Ionicons de cada nó da trilha.
update public.modulos set icone = dados.icone
from (values
  (1,  'language'),
  (2,  'calculator'),
  (3,  'hand-left'),
  (4,  'people'),
  (5,  'restaurant'),
  (6,  'cube'),
  (7,  'gift'),
  (8,  'home'),
  (9,  'car'),
  (10, 'megaphone')
) as dados(ordem, icone)
where public.modulos.ordem = dados.ordem;
