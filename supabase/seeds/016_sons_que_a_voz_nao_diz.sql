-- As seis faixas que a voz se recusa a dizer, e o portador de cada uma.
--
-- "a", "e", "o", "u", "od" e "do" saíam com a duração certa e silêncio
-- dentro — pico abaixo de 0,022 e ZERO janelas audíveis, contra 0,27 e 31%
-- das faixas boas. Não é uma linha tênue, é um abismo.
--
-- Baixar a velocidade NÃO resolve: medido de 0,9 a 0,25, em três sorteios
-- cada. A 0,25 o "a" dura 1,03s e continua mudo. O arquivo cresce e o
-- silêncio cresce junto — ela não está correndo demais, ela não gera fonação
-- para entrada curtíssima.
--
-- E não é monossílabo: "krv", "trg", "prst" e "sin" saem bem em qualquer
-- velocidade. É LETRA SOLTA e palavra de duas letras. "dan" é a fronteira —
-- funciona a 0,9, colapsa a 0,7 e 0,5, volta a funcionar a 0,35. Sorteio.
--
-- O que resolve é mais TEXTO, não mais tempo: "Slovo a." ("a letra a") sai
-- falado em todas as tentativas. Como o aluno não pode ouvir "slovo", o
-- gerador recorta — daí `cortar_portador`. Ver `supabase/audio/mp3.mjs`.
--
-- As vogais estão em "As vogais e o sotaque brasileiro" e as preposições em
-- "As preposições do Genitiv", as duas em ligar_pares, um uso cada. Por isso
-- dá para escolher o portador por som sem quebrar outro lugar.

insert into public.audio_ajustes (texto, texto_falado, cortar_portador, motivo) values
  ('a',  'Slovo a.', true,
   'Vogal solta sai muda em qualquer velocidade (pico 0,004). Com portador, 0,94.'),
  ('e',  'Slovo e.', true,
   'Vogal solta sai muda (pico 0,005). Maiúscula é loteria: 0,504 numa rodada, 0,003 na seguinte.'),
  ('o',  'Slovo o.', true,
   'Vogal solta sai muda (pico 0,004), inclusive a 0,25 de velocidade.'),
  ('u',  'Slovo u.', true,
   'Mesma produção das outras vogais: a lição compara as quatro, e voz diferente em uma denunciaria o remendo.'),
  ('od', 'od, od.',  true,
   'Duas letras: sai mudo (pico 0,0045). Repetida, a segunda sai inteira e é ela que sobe.'),
  ('do', 'do, do.',  true,
   'Duas letras: saía em 31% audível, no limite. Repetida, sobe para 72%.')
on conflict (texto) do update set
  texto_falado    = excluded.texto_falado,
  cortar_portador = excluded.cortar_portador,
  motivo          = excluded.motivo;
