-- Quadro dos 7 casos + grade de terminações da declinação nominal.
--
-- Palavras-modelo: grad (m), žena (f), selo (n) — as três do padrão regular,
-- as mesmas que qualquer gramática croata usa como paradigma. Onde a
-- terminação alterna, entra a segunda modelo ao lado: prijatelj para o
-- masculino animado/palatal, polje para o neutro de tema mole.
--
-- PRECISA DE REVISÃO NATIVA antes de publicar: as terminações são as do
-- padrão regular, sem as exceções (palatais, -ov-/-ev-, substantivos em -ost,
-- masculinos animados). As notas em PT-BR avisam onde o padrão quebra, mas
-- quem decide o quanto simplificar para iniciante é a curadoria.

insert into public.padezi
  (padez, numero, pergunta_hr, pergunta_pt, uso_pt, preposicoes_hr,
   exemplo_hr, exemplo_pt, nota_pt)
values
  ('nominativ', 1,
   'tko? što?', 'quem? o quê?',
   'Sujeito da frase — quem faz a ação. É também a forma que aparece no dicionário, a palavra sem flexão nenhuma.',
   '{}',
   'Ovo je grad.', 'Isto é uma cidade.',
   null),

  ('genitiv', 2,
   'koga? čega?', 'de quem? de quê?',
   'Posse ("o livro da irmã"), origem e ausência. É também o caso que vem depois de números a partir de 5 e de palavras de quantidade.',
   '{od,do,iz,bez,kod,blizu,prije,poslije}',
   'Ovo je knjiga moje sestre.', 'Este é o livro da minha irmã.',
   'No plural masculino quase sempre entra o infixo -ov-/-ev- antes da terminação: grad → gradova.'),

  ('dativ', 3,
   'kome? čemu?', 'a quem? para quem?',
   'Quem recebe a ação — o objeto indireto. Também marca a direção quando se vai até alguém ou até um lugar.',
   '{k,ka,prema}',
   'Dajem knjigu prijatelju.', 'Dou o livro ao amigo.',
   'No singular, dativo e locativo têm a mesma forma; o que os separa é o uso.'),

  ('akuzativ', 4,
   'koga? što?', 'quem? o quê? (objeto direto)',
   'Objeto direto — quem sofre a ação. Também marca movimento em direção a um lugar, com u e na.',
   '{u,na,kroz,za,uz,niz}',
   'Vidim grad.', 'Vejo a cidade.',
   'No masculino singular a forma depende do substantivo: ser vivo copia o genitivo (prijatelja), coisa copia o nominativo (grad).'),

  ('vokativ', 5,
   'hej!', 'chamando alguém',
   'Serve para chamar alguém ou se dirigir a alguém. Não entra na estrutura da frase — vem sempre separado por vírgula.',
   '{}',
   'Dobar dan, prijatelju!', 'Bom dia, amigo!',
   'No plural o vocativo é igual ao nominativo, sempre.'),

  ('lokativ', 6,
   'o kome? o čemu? gdje?', 'sobre quem? sobre o quê? onde?',
   'Lugar sem movimento — onde algo está — e assunto, quando se fala sobre algo.',
   '{u,na,o,po,pri}',
   'Živim u gradu.', 'Moro na cidade.',
   'Nunca aparece sozinho: o locativo só existe depois de preposição.'),

  ('instrumental', 7,
   's kim? čime?', 'com quem? com o quê?',
   'Companhia — com alguém, sempre com s/sa — e meio ou instrumento: de ônibus, com a caneta. Como instrumento, vai sem preposição.',
   '{s,sa,među,nad,pod,pred,za}',
   'Putujem s prijateljem.', 'Viajo com um amigo.',
   'Companhia leva s/sa; meio de transporte e instrumento vão sem preposição: idem autobusom (vou de ônibus).');

insert into public.padez_terminacoes (padez, genero, plural, terminacao, exemplos_hr)
values
  -- Nominativ
  ('nominativ',    'm', false, '—',              array['grad']),
  ('nominativ',    'm', true,  '-i',             array['gradovi']),
  ('nominativ',    'f', false, '-a',             array['žena']),
  ('nominativ',    'f', true,  '-e',             array['žene']),
  ('nominativ',    'n', false, '-o / -e',        array['selo', 'polje']),
  ('nominativ',    'n', true,  '-a',             array['sela']),

  -- Genitiv
  ('genitiv',      'm', false, '-a',             array['grada']),
  ('genitiv',      'm', true,  '-a',             array['gradova']),
  ('genitiv',      'f', false, '-e',             array['žene']),
  ('genitiv',      'f', true,  '—',              array['žena']),
  ('genitiv',      'n', false, '-a',             array['sela']),
  ('genitiv',      'n', true,  '—',              array['sela']),

  -- Dativ
  ('dativ',        'm', false, '-u',             array['gradu']),
  ('dativ',        'm', true,  '-ima',           array['gradovima']),
  ('dativ',        'f', false, '-i',             array['ženi']),
  ('dativ',        'f', true,  '-ama',           array['ženama']),
  ('dativ',        'n', false, '-u',             array['selu']),
  ('dativ',        'n', true,  '-ima',           array['selima']),

  -- Akuzativ
  ('akuzativ',     'm', false, '— / -a',         array['grad', 'prijatelja']),
  ('akuzativ',     'm', true,  '-e',             array['gradove']),
  ('akuzativ',     'f', false, '-u',             array['ženu']),
  ('akuzativ',     'f', true,  '-e',             array['žene']),
  ('akuzativ',     'n', false, '-o / -e',        array['selo', 'polje']),
  ('akuzativ',     'n', true,  '-a',             array['sela']),

  -- Vokativ
  ('vokativ',      'm', false, '-e / -u',        array['grade', 'prijatelju']),
  ('vokativ',      'm', true,  '-i',             array['gradovi']),
  ('vokativ',      'f', false, '-o',             array['ženo']),
  ('vokativ',      'f', true,  '-e',             array['žene']),
  ('vokativ',      'n', false, '-o / -e',        array['selo', 'polje']),
  ('vokativ',      'n', true,  '-a',             array['sela']),

  -- Lokativ
  ('lokativ',      'm', false, '-u',             array['gradu']),
  ('lokativ',      'm', true,  '-ima',           array['gradovima']),
  ('lokativ',      'f', false, '-i',             array['ženi']),
  ('lokativ',      'f', true,  '-ama',           array['ženama']),
  ('lokativ',      'n', false, '-u',             array['selu']),
  ('lokativ',      'n', true,  '-ima',           array['selima']),

  -- Instrumental
  ('instrumental', 'm', false, '-om / -em',      array['gradom', 'prijateljem']),
  ('instrumental', 'm', true,  '-ima',           array['gradovima']),
  ('instrumental', 'f', false, '-om',            array['ženom']),
  ('instrumental', 'f', true,  '-ama',           array['ženama']),
  ('instrumental', 'n', false, '-om / -em',      array['selom', 'poljem']),
  ('instrumental', 'n', true,  '-ima',           array['selima']);
