-- Camada basal: dicionário PT <-> HR e expressões.
-- Conjunto inicial de iniciante. PRECISA DE REVISÃO NATIVA antes de publicar.
-- Gênero segue o croata (m/f/n) e é o que decide a declinação nos 7 casos.

insert into public.lex_items (hr, pt, categoria, genero, nota_pt) values
  -- Pessoas
  ('žena',         'mulher',            'Pessoas',  'f', null),
  ('muškarac',     'homem',             'Pessoas',  'm', null),
  ('dijete',       'criança',           'Pessoas',  'n', 'Plural irregular: djeca.'),
  ('majka',        'mãe',               'Pessoas',  'f', null),
  ('otac',         'pai',               'Pessoas',  'm', 'Perde o "a" ao declinar: oca, ocu.'),
  ('sin',          'filho',             'Pessoas',  'm', null),
  ('kći',          'filha',             'Pessoas',  'f', null),
  ('brat',         'irmão',             'Pessoas',  'm', null),
  ('sestra',       'irmã',              'Pessoas',  'f', null),
  ('prijatelj',    'amigo',             'Pessoas',  'm', null),
  ('prijateljica', 'amiga',             'Pessoas',  'f', null),
  ('baka',         'avó',               'Pessoas',  'f', null),
  ('djed',         'avô',               'Pessoas',  'm', null),

  -- Comida
  ('kruh',         'pão',               'Comida',   'm', null),
  ('sir',          'queijo',            'Comida',   'm', null),
  ('meso',         'carne',             'Comida',   'n', null),
  ('jabuka',       'maçã',              'Comida',   'f', null),
  ('povrće',       'legumes',           'Comida',   'n', 'Só no singular, como "verdura".'),
  ('voće',         'fruta',             'Comida',   'n', 'Só no singular, vale para "frutas" em geral.'),
  ('juha',         'sopa',              'Comida',   'f', null),
  ('kolač',        'bolo',              'Comida',   'm', null),
  ('sol',          'sal',               'Comida',   'f', 'Feminino em croata, apesar de "sal" ser masculino em português.'),

  -- Bebida
  ('voda',         'água',              'Bebida',   'f', null),
  ('kava',         'café',              'Bebida',   'f', null),
  ('čaj',          'chá',               'Bebida',   'm', null),
  ('vino',         'vinho',             'Bebida',   'n', null),
  ('pivo',         'cerveja',           'Bebida',   'n', null),
  ('mlijeko',      'leite',             'Bebida',   'n', null),

  -- Animais
  ('pas',          'cachorro',          'Animais',  'm', 'Perde o "a" ao declinar: psa, psu.'),
  ('mačka',        'gato',              'Animais',  'f', null),
  ('konj',         'cavalo',            'Animais',  'm', null),
  ('ptica',        'pássaro',           'Animais',  'f', null),
  ('krava',        'vaca',              'Animais',  'f', null),
  ('riba',         'peixe',             'Animais',  'f', 'Serve para o animal e para o prato.'),

  -- Casa
  ('kuća',         'casa',              'Casa',     'f', null),
  ('stan',         'apartamento',       'Casa',     'm', null),
  ('soba',         'quarto',            'Casa',     'f', null),
  ('kuhinja',      'cozinha',           'Casa',     'f', null),
  ('vrata',        'porta',             'Casa',     'n', 'Sempre no plural em croata, mesmo para uma porta só.'),
  ('stol',         'mesa',              'Casa',     'm', null),
  ('stolica',      'cadeira',           'Casa',     'f', null),
  ('krevet',       'cama',              'Casa',     'm', null),

  -- Cidade
  ('grad',         'cidade',            'Cidade',   'm', null),
  ('ulica',        'rua',               'Cidade',   'f', null),
  ('trg',          'praça',             'Cidade',   'm', null),
  ('plaža',        'praia',             'Cidade',   'f', null),
  ('kolodvor',     'estação',           'Cidade',   'm', 'Trem ou ônibus: željeznički / autobusni kolodvor.'),
  ('trgovina',     'loja',              'Cidade',   'f', null),
  ('škola',        'escola',            'Cidade',   'f', null),

  -- Natureza e tempo
  ('more',         'mar',               'Natureza', 'n', null),
  ('sunce',        'sol',               'Natureza', 'n', null),
  ('kiša',         'chuva',             'Natureza', 'f', null),
  ('snijeg',       'neve',              'Natureza', 'm', null),
  ('vjetar',       'vento',             'Natureza', 'm', null),
  ('zima',         'inverno',           'Natureza', 'f', 'Também significa "frio".'),
  ('ljeto',        'verão',             'Natureza', 'n', null),
  ('dan',          'dia',               'Natureza', 'm', null),
  ('noć',          'noite',             'Natureza', 'f', null),

  -- Cores
  ('crven',        'vermelho',          'Cores',    null, 'Adjetivo: muda com o gênero — crven / crvena / crveno.'),
  ('plav',         'azul',              'Cores',    null, 'Adjetivo: plav / plava / plavo. Também "loiro" para cabelo.'),
  ('bijel',        'branco',            'Cores',    null, 'Adjetivo: bijel / bijela / bijelo.'),
  ('crn',          'preto',             'Cores',    null, 'Adjetivo: crn / crna / crno.'),
  ('zelen',        'verde',             'Cores',    null, 'Adjetivo: zelen / zelena / zeleno.'),
  ('žut',          'amarelo',           'Cores',    null, 'Adjetivo: žut / žuta / žuto.'),

  -- Verbos
  ('biti',         'ser, estar',        'Verbos',   null, 'Irregular: ja sam, ti si, on je.'),
  ('imati',        'ter',               'Verbos',   null, 'ja imam, ti imaš, on ima.'),
  ('ići',          'ir',                'Verbos',   null, 'Irregular: ja idem, ti ideš.'),
  ('jesti',        'comer',             'Verbos',   null, 'ja jedem, ti jedeš.'),
  ('piti',         'beber',             'Verbos',   null, 'ja pijem, ti piješ.'),
  ('govoriti',     'falar',             'Verbos',   null, 'ja govorim, ti govoriš.'),
  ('učiti',        'aprender, estudar', 'Verbos',   null, 'ja učim, ti učiš.'),
  ('htjeti',       'querer',            'Verbos',   null, 'Irregular: ja hoću, ti hoćeš.');

insert into public.frases (hr, pt, contexto) values
  ('Bok!',                    'Oi! / Tchau!',                'Informal. Serve para chegar e para sair.'),
  ('Dobro jutro!',            'Bom dia!',                    'De manhã cedo, até umas 10h.'),
  ('Dobar dan!',              'Bom dia! / Boa tarde!',       'Saudação neutra do meio da manhã até o fim da tarde.'),
  ('Dobra večer!',            'Boa noite!',                  'Ao chegar, à noite.'),
  ('Laku noć!',               'Boa noite!',                  'Só na despedida, indo dormir.'),
  ('Doviđenja!',              'Até logo!',                   'Despedida formal.'),
  ('Hvala!',                  'Obrigado! / Obrigada!',       null),
  ('Hvala lijepa!',           'Muito obrigado!',             'Literalmente "obrigado bonito".'),
  ('Molim',                   'Por favor / De nada / Como?', 'Uma palavra, três usos: pedido, resposta a "hvala", e pedir para repetir.'),
  ('Oprostite',               'Desculpe / Com licença',      'Formal. Informal: oprosti.'),
  ('Kako se zoveš?',          'Como você se chama?',         'Informal.'),
  ('Kako se zovete?',         'Como o senhor se chama?',     'Formal ou para mais de uma pessoa.'),
  ('Zovem se...',             'Meu nome é...',               null),
  ('Drago mi je',             'Prazer em conhecer',          null),
  ('Kako si?',                'Como você está?',             'Informal.'),
  ('Kako ste?',               'Como o senhor está?',         'Formal.'),
  ('Dobro sam, hvala',        'Estou bem, obrigado',         null),
  ('Govorite li engleski?',   'O senhor fala inglês?',       null),
  ('Ne govorim hrvatski',     'Não falo croata',             null),
  ('Ne razumijem',            'Não entendo',                 null),
  ('Ne znam',                 'Não sei',                     null),
  ('Gdje je...?',             'Onde fica...?',               'Gdje je kolodvor? = Onde fica a estação?'),
  ('Koliko košta?',           'Quanto custa?',               null),
  ('Molim vas, račun',        'A conta, por favor',          'No restaurante.'),
  ('Živjeli!',                'Saúde!',                      'Brinde.'),
  ('Sretan put!',             'Boa viagem!',                 null),
  ('Ja sam iz Brazila',       'Eu sou do Brasil',            'Brazila está no genitivo, exigido por "iz".');
