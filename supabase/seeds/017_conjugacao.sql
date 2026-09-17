-- Quadro das pessoas e dos tempos (Konjugacija).
--
-- PRECISA DE REVISÃO NATIVA antes de publicar. São paradigmas de livro —
-- alta confiança — mas conjugação é onde erro de conteúdo custa mais caro,
-- e um app de idioma que ensina forma errada é pior do que um que não ensina.
--
-- Escolha dos quatro verbos-modelo: `biti` porque é irregular e é o mais
-- usado da língua; e um de cada padrão de presente, que é o que o aluno
-- precisa reconhecer para conjugar qualquer outro verbo:
--   -am  imati   (a maior parte dos verbos em -ati)
--   -im  raditi  (a maior parte dos verbos em -iti)
--   -em  pisati  (o padrão que muda a raiz: pisati → pišem)
--
-- Passado e futuro não têm "terminação de pessoa": o passado é clítico de
-- `biti` + particípio, e o particípio concorda em gênero e número
-- (radio / radila / radili / radile). O futuro é clítico de `htjeti` +
-- infinitivo. Por isso a célula guarda a forma inteira, e não um sufixo.

-- ---------- as seis pessoas ----------

insert into public.lica (lice, numero, pronomes_hr, pronome_pt, uso_pt, exemplo_hr, exemplo_pt, nota_pt) values
  ('1s', 1, array['ja'], 'eu',
   'O pronome quase sempre some: a terminação do verbo já diz quem fala. "Radim" basta; "ja radim" só quando você quer marcar que foi VOCÊ.',
   'Radim u Zagrebu.', 'Trabalho em Zagreb.',
   'Mesmo hábito do português falado — "trabalho" sem o "eu" na frente.'),

  ('2s', 2, array['ti'], 'tu / você',
   'É o "você" de intimidade: amigo, criança, colega próximo. Com quem você não conhece, use "vi" — em croata tratar por "ti" cedo demais soa invasivo.',
   'Gdje ti radiš?', 'Onde você trabalha?',
   'Croata separa o tratamento informal do formal, o que o português do Brasil perdeu.'),

  ('3s', 3, array['on', 'ona', 'ono'], 'ele / ela',
   'Três pronomes porque o croata tem três gêneros: on (masculino), ona (feminino), ono (neutro). O verbo é o mesmo para os três no presente — quem muda é o particípio, no passado.',
   'Ona radi u školi.', 'Ela trabalha na escola.',
   'O neutro "ono" quase não aparece falando de gente; ele acompanha palavras neutras como "dijete" (criança).'),

  ('1p', 4, array['mi'], 'nós',
   'Vivo no croata falado, ao contrário do "nós" brasileiro que virou "a gente". Aqui "radimo" é o normal, não o formal.',
   'Mi smo iz Brazila.', 'Nós somos do Brasil.',
   null),

  ('2p', 5, array['vi'], 'vocês / o senhor, a senhora',
   'Faz dois trabalhos: é o plural de "ti" E é o tratamento formal no singular. "Kako ste?" para uma pessoa é respeito; para duas, é só plural.',
   'Vi radite u banci.', 'O senhor trabalha no banco.',
   'No tratamento formal escrito, "Vi" vai com maiúscula — é o equivalente de escrever "o Senhor".'),

  ('3p', 6, array['oni', 'one', 'ona'], 'eles / elas',
   'Três de novo: "oni" para grupo masculino ou misto, "one" para grupo só de mulheres, "ona" para coisas neutras. Um homem num grupo de dez mulheres já puxa tudo para "oni".',
   'Oni rade zajedno.', 'Eles trabalham juntos.',
   'Mesma regra do português para o plural misto, só que aqui ela também muda o particípio do passado.');

-- ---------- as quatro colunas ----------

insert into public.verbos_modelo (infinitivo_hr, ordem, traducao_pt, padrao_pt, nota_pt) values
  ('biti', 1, 'ser / estar', 'irregular',
   'O verbo mais usado da língua e o único que você tem mesmo que decorar. As formas curtas (sam, si, je) são átonas: nunca começam frase.'),
  ('imati', 2, 'ter', 'presente em -am',
   'O padrão da maioria dos verbos terminados em -ati.'),
  ('raditi', 3, 'trabalhar / fazer', 'presente em -im',
   'O padrão da maioria dos verbos terminados em -iti.'),
  ('pisati', 4, 'escrever', 'presente em -em',
   'O padrão que mexe na raiz: pisati vira pišem, não "pisam". É o que mais pega o iniciante.');

-- ---------- as 72 células ----------
-- Presente: a única linha em que a terminação sozinha identifica a pessoa.

insert into public.lice_formas (lice, tempo, infinitivo_hr, formas_hr) values
  ('1s', 'prezent', 'biti',   array['sam']),
  ('2s', 'prezent', 'biti',   array['si']),
  ('3s', 'prezent', 'biti',   array['je']),
  ('1p', 'prezent', 'biti',   array['smo']),
  ('2p', 'prezent', 'biti',   array['ste']),
  ('3p', 'prezent', 'biti',   array['su']),

  ('1s', 'prezent', 'imati',  array['imam']),
  ('2s', 'prezent', 'imati',  array['imaš']),
  ('3s', 'prezent', 'imati',  array['ima']),
  ('1p', 'prezent', 'imati',  array['imamo']),
  ('2p', 'prezent', 'imati',  array['imate']),
  ('3p', 'prezent', 'imati',  array['imaju']),

  ('1s', 'prezent', 'raditi', array['radim']),
  ('2s', 'prezent', 'raditi', array['radiš']),
  ('3s', 'prezent', 'raditi', array['radi']),
  ('1p', 'prezent', 'raditi', array['radimo']),
  ('2p', 'prezent', 'raditi', array['radite']),
  ('3p', 'prezent', 'raditi', array['rade']),

  ('1s', 'prezent', 'pisati', array['pišem']),
  ('2s', 'prezent', 'pisati', array['pišeš']),
  ('3s', 'prezent', 'pisati', array['piše']),
  ('1p', 'prezent', 'pisati', array['pišemo']),
  ('2p', 'prezent', 'pisati', array['pišete']),
  ('3p', 'prezent', 'pisati', array['pišu']),

-- Passado: clítico de `biti` + particípio, e o particípio concorda em gênero.
-- Duas formas no singular (masculino, feminino) e duas no plural — o neutro
-- do singular entra só onde o aluno vai encontrar ("ono je bilo").

  ('1s', 'perfekt', 'biti',   array['bio sam', 'bila sam']),
  ('2s', 'perfekt', 'biti',   array['bio si', 'bila si']),
  ('3s', 'perfekt', 'biti',   array['bio je', 'bila je', 'bilo je']),
  ('1p', 'perfekt', 'biti',   array['bili smo', 'bile smo']),
  ('2p', 'perfekt', 'biti',   array['bili ste', 'bile ste']),
  ('3p', 'perfekt', 'biti',   array['bili su', 'bile su']),

  ('1s', 'perfekt', 'imati',  array['imao sam', 'imala sam']),
  ('2s', 'perfekt', 'imati',  array['imao si', 'imala si']),
  ('3s', 'perfekt', 'imati',  array['imao je', 'imala je', 'imalo je']),
  ('1p', 'perfekt', 'imati',  array['imali smo', 'imale smo']),
  ('2p', 'perfekt', 'imati',  array['imali ste', 'imale ste']),
  ('3p', 'perfekt', 'imati',  array['imali su', 'imale su']),

  ('1s', 'perfekt', 'raditi', array['radio sam', 'radila sam']),
  ('2s', 'perfekt', 'raditi', array['radio si', 'radila si']),
  ('3s', 'perfekt', 'raditi', array['radio je', 'radila je', 'radilo je']),
  ('1p', 'perfekt', 'raditi', array['radili smo', 'radile smo']),
  ('2p', 'perfekt', 'raditi', array['radili ste', 'radile ste']),
  ('3p', 'perfekt', 'raditi', array['radili su', 'radile su']),

  ('1s', 'perfekt', 'pisati', array['pisao sam', 'pisala sam']),
  ('2s', 'perfekt', 'pisati', array['pisao si', 'pisala si']),
  ('3s', 'perfekt', 'pisati', array['pisao je', 'pisala je', 'pisalo je']),
  ('1p', 'perfekt', 'pisati', array['pisali smo', 'pisale smo']),
  ('2p', 'perfekt', 'pisati', array['pisali ste', 'pisale ste']),
  ('3p', 'perfekt', 'pisati', array['pisali su', 'pisale su']),

-- Futuro: clítico de `htjeti` + infinitivo. Não muda por gênero — é o tempo
-- mais fácil dos três, e vale dizer isso ao aluno.

  ('1s', 'futur', 'biti',   array['bit ću']),
  ('2s', 'futur', 'biti',   array['bit ćeš']),
  ('3s', 'futur', 'biti',   array['bit će']),
  ('1p', 'futur', 'biti',   array['bit ćemo']),
  ('2p', 'futur', 'biti',   array['bit ćete']),
  ('3p', 'futur', 'biti',   array['bit će']),

  ('1s', 'futur', 'imati',  array['imat ću']),
  ('2s', 'futur', 'imati',  array['imat ćeš']),
  ('3s', 'futur', 'imati',  array['imat će']),
  ('1p', 'futur', 'imati',  array['imat ćemo']),
  ('2p', 'futur', 'imati',  array['imat ćete']),
  ('3p', 'futur', 'imati',  array['imat će']),

  ('1s', 'futur', 'raditi', array['radit ću']),
  ('2s', 'futur', 'raditi', array['radit ćeš']),
  ('3s', 'futur', 'raditi', array['radit će']),
  ('1p', 'futur', 'raditi', array['radit ćemo']),
  ('2p', 'futur', 'raditi', array['radit ćete']),
  ('3p', 'futur', 'raditi', array['radit će']),

  ('1s', 'futur', 'pisati', array['pisat ću']),
  ('2s', 'futur', 'pisati', array['pisat ćeš']),
  ('3s', 'futur', 'pisati', array['pisat će']),
  ('1p', 'futur', 'pisati', array['pisat ćemo']),
  ('2p', 'futur', 'pisati', array['pisat ćete']),
  ('3p', 'futur', 'pisati', array['pisat će']);
