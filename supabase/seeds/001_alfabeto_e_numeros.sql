-- Camada basal: alfabeto (gajica, 30 letras) e números.
-- Conteúdo inicial para a aba Dicionário ter o que renderizar.
-- PRECISA DE REVISÃO NATIVA antes de publicar: as descrições de som são
-- aproximações para ouvido brasileiro, não transcrição fonética.

insert into public.letras (letra, som_pt, exemplo_hr, ordem) values
  ('A a',  'como o "a" de "casa"',                                        'auto',       1),
  ('B b',  'como o "b" de "bola"',                                        'baka',       2),
  ('C c',  'sempre "ts", como o final de "pizza" em italiano',            'cipela',     3),
  ('Č č',  '"tch" duro, língua puxada para trás',                         'čokolada',   4),
  ('Ć ć',  '"tch" suave, quase "tchi" — mais leve que Č',                 'kuća',       5),
  ('D d',  'como o "d" de "dado" (nunca "dji")',                          'dan',        6),
  ('Dž dž','"dj" duro, como o "j" de "jeans" em inglês',                  'džem',       7),
  ('Đ đ',  '"dj" suave, como o "di" carioca de "dia"',                    'đak',        8),
  ('E e',  'como o "é" de "pé"',                                          'more',       9),
  ('F f',  'como o "f" de "faca"',                                        'film',      10),
  ('G g',  'sempre duro, como o "g" de "gato"',                           'grad',      11),
  ('H h',  'aspirado, como o "rr" leve de "carro" no interior paulista',  'hvala',     12),
  ('I i',  'como o "i" de "vida"',                                        'ime',       13),
  ('J j',  'como o "i" curto de "pai"',                                   'jabuka',    14),
  ('K k',  'como o "c" de "casa"',                                        'knjiga',    15),
  ('L l',  'como o "l" de "lua" — nunca vira "u" no fim da sílaba',       'limun',     16),
  ('Lj lj','como o "lh" de "filho"',                                      'ljubav',    17),
  ('M m',  'como o "m" de "mão"',                                         'majka',     18),
  ('N n',  'como o "n" de "nada"',                                        'noć',       19),
  ('Nj nj','como o "nh" de "banho"',                                      'konj',      20),
  ('O o',  'como o "ó" de "avó"',                                         'oko',       21),
  ('P p',  'como o "p" de "pato"',                                        'pas',       22),
  ('R r',  'vibrante, de ponta de língua, como o "r" de "caro"',          'riba',      23),
  ('S s',  'sempre "ss", como em "sapo" — nunca vira "z"',                'sunce',     24),
  ('Š š',  'como o "ch" de "chave"',                                      'šuma',      25),
  ('T t',  'como o "t" de "tato" (nunca "tchi")',                         'tata',      26),
  ('U u',  'como o "u" de "uva"',                                         'ulica',     27),
  ('V v',  'como o "v" de "vaca"',                                        'voda',      28),
  ('Z z',  'como o "z" de "casa"',                                        'zima',      29),
  ('Ž ž',  'como o "j" de "janela"',                                      'žena',      30);

insert into public.numeros (valor, hr) values
  (0,'nula'), (1,'jedan'), (2,'dva'), (3,'tri'), (4,'četiri'),
  (5,'pet'), (6,'šest'), (7,'sedam'), (8,'osam'), (9,'devet'),
  (10,'deset'), (11,'jedanaest'), (12,'dvanaest'), (13,'trinaest'),
  (14,'četrnaest'), (15,'petnaest'), (16,'šesnaest'), (17,'sedamnaest'),
  (18,'osamnaest'), (19,'devetnaest'), (20,'dvadeset'),
  (30,'trideset'), (40,'četrdeset'), (50,'pedeset'), (60,'šezdeset'),
  (70,'sedamdeset'), (80,'osamdeset'), (90,'devedeset'),
  (100,'sto'), (1000,'tisuća');
