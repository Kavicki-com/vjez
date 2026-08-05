-- Abertura de cada lição: a ilustração e o parágrafo que explicam o caso.
-- O texto é conteúdo, então mora no banco; a tela de abertura não aparece
-- quando a lição não tem intro cadastrada.
-- PRECISA DE REVISÃO NATIVA antes de publicar.

update public.licoes l
set intro_pt = d.intro, ilustracao = d.icone
from (values
  -- Módulo 1 — Alfabeto
  (1, 1, 'text',
   'O croata se escreve com 30 letras e tem sons que o português não tem. A boa notícia: cada letra tem um som só, sempre o mesmo. Depois que você aprende, lê qualquer palavra sem adivinhar.'),
  (1, 2, 'ear',
   'Algumas letras andam em par e valem por um som só: LJ, NJ e DŽ. E o J croata não é o J do português — ele soa como o "i" de "pai".'),

  -- Módulo 2 — Números
  (2, 1, 'calculator',
   'Os números de 1 a 10 são a base de tudo: preço, hora, idade, endereço. Vale aprender de cor, porque eles reaparecem dentro dos números maiores.'),
  (2, 2, 'trending-up',
   'De 11 a 19 o croata repete um padrão: o número menor mais a terminação -naest. Reconhecendo esse pedaço, você destrava uma dezena inteira de uma vez.'),

  -- Módulo 3 — Saudações
  (3, 1, 'hand-left',
   'Em croata a saudação muda com a hora do dia, e "bok" serve tanto para chegar quanto para sair. Uma palavra sozinha, "molim", faz o trabalho de três em português.'),
  (3, 2, 'person-add',
   'Apresentar-se em croata usa uma construção que não existe em português: "zovem se" quer dizer, ao pé da letra, "eu me chamo". E há duas formas de perguntar — uma informal, outra respeitosa.'),

  -- Módulo 4 — Nominativ
  (4, 1, 'people',
   'O Nominativ é o caso de quem faz a ação — o sujeito. É também a forma que você encontra no dicionário, então serve de ponto de partida para todos os outros seis casos. Responde a: tko? (quem?) e što? (o quê?).'),
  (4, 2, 'git-compare',
   'Em croata o possessivo concorda com o gênero da coisa possuída, não com o dono. Por isso "meu" tem três formas: moj para masculino, moja para feminino e moje para neutro.'),

  -- Módulo 5 — Akuzativ
  (5, 1, 'restaurant',
   'O Akuzativ marca quem recebe a ação — o objeto direto. Femininos terminados em -a trocam para -u. Masculinos de coisa não mudam nada, o que torna metade do trabalho de graça.'),
  (5, 2, 'walk',
   'O mesmo Akuzativ marca movimento em direção a algum lugar. É a diferença entre "vou para a escola" e "estou na escola": mesma preposição u, casos diferentes.'),

  -- Módulo 6 — Genitiv
  (6, 1, 'link',
   'O Genitiv liga duas coisas: de quem é, de onde vem, de que é feito. Femininos em -a viram -e; masculinos e neutros ganham -a. As preposições iz, od, do e bez sempre o exigem.'),
  (6, 2, 'remove-circle',
   'Em croata, o que não existe fica no Genitiv. Por isso "nema" — não tem — nunca é seguido do Nominativ. É o caso da ausência e da quantidade.'),

  -- Módulo 7 — Dativ
  (7, 1, 'gift',
   'O Dativ marca para quem a ação vai — o objeto indireto. Femininos em -a viram -i, masculinos ganham -u. Responde a: kome? (para quem?).'),
  (7, 2, 'heart',
   'Gostar em croata funciona ao contrário do português: quem gosta não é o sujeito. Em "sviđa mi se", a coisa é que agrada, e você aparece no Dativ — como se dissesse "isso me agrada".'),

  -- Módulo 8 — Lokativ
  (8, 1, 'location',
   'O Lokativ marca lugar parado: onde algo está, sem movimento. Nunca aparece sozinho — vem sempre depois de uma preposição, quase sempre u ou na.'),
  (8, 2, 'layers',
   'u ou na? A regra prática: u para dentro de algo fechado (cidade, casa, escola) e na para superfícies e lugares abertos (praia, ilha, mesa). Há exceções, mas essa cobre a maioria.'),

  -- Módulo 9 — Instrumental
  (9, 1, 'people-circle',
   'O Instrumental responde a: com quem? e com o quê?. Para companhia, vem depois de s (ou sa, antes de palavras que começam com s e z). Femininos em -a viram -om.'),
  (9, 2, 'car',
   'Aqui mora uma armadilha: para meio de transporte, o Instrumental vai sozinho, sem preposição. Você viaja com a irmã, mas viaja de ônibus — e em croata essa diferença aparece na frase.'),

  -- Módulo 10 — Vokativ
  (10, 1, 'megaphone',
   'O Vokativ existe para uma coisa só: chamar alguém. Masculinos costumam ganhar -e (Ivan vira Ivane) e femininos em -a viram -o (Ana vira Ano).'),
  (10, 2, 'chatbubbles',
   'O Vokativ é o caso que você mais ouve e menos vê escrito. Ele aparece toda vez que alguém é chamado pelo nome — em saudações, agradecimentos e despedidas.')
) as d(mod_ordem, licao_ordem, icone, intro)
where l.ordem = d.licao_ordem
  and l.modulo_id = (select id from public.modulos where ordem = d.mod_ordem);

-- Depois da carga das ilustrações no Storage, o campo passa a guardar a URL
-- pública em vez do nome do glifo. A tela aceita os dois formatos.
update public.licoes l
set ilustracao = format(
  'https://cltclnrgtlififwvpfra.supabase.co/storage/v1/object/public/ilustracoes/%s-%s.png',
  m.ordem, l.ordem
)
from public.modulos m
where m.id = l.modulo_id;
