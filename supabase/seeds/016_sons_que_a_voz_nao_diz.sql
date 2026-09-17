-- Todos os sons que a voz se recusa a dizer, e o portador de cada um.
--
-- Achados varrendo as 521 faixas da biblioteca inteira — alfabeto, números,
-- dicionário, expressões, exercícios e o quadro dos casos — decodificadas e
-- medidas uma a uma. Cinco eram anteriores ao dia em que a conferência de
-- som passou a existir e nunca tinham sido ouvidas por ninguém.
--
-- O padrão: LETRA SOLTA e PALAVRA DE DUAS OU TRÊS LETRAS saem com a duração
-- certa e silêncio dentro. Pico abaixo de 0,05, contra 0,27 a 1,00 das
-- faixas boas. Não é linha tênue, é abismo.
--
-- Baixar a velocidade NÃO resolve: medido de 0,9 a 0,25, três sorteios cada.
-- A 0,25 o "a" dura 1,03s e continua mudo. O arquivo cresce e o silêncio
-- cresce junto — ela não está correndo demais, ela não gera fonação para
-- entrada curtíssima.
--
-- E não é monossílabo: "krv", "trg", "prst" e "sin" saem bem em qualquer
-- velocidade. "dan" é a fronteira — funciona a 0,9, colapsa a 0,7 e 0,5,
-- volta a funcionar a 0,35. Sorteio, não curva.
--
-- O que resolve é mais TEXTO, não mais tempo. O gerador sintetiza a frase
-- inteira, acha o vale de energia entre o portador e o alvo, e descarta os
-- quadros de MP3 anteriores a ele — daí `cortar_portador`. Ver
-- `supabase/audio/mp3.mjs` e `supabase/audio/som.mjs`.
--
-- Escolha do portador, aprendida a duro:
--   * "Slovo x."  para letra — é o que um croata diz: "a letra x".
--   * "Riječ x."  para palavra — "a palavra x".
--   * "x, x."     quando o "Riječ" gruda no alvo e não sobra vale para
--                 cortar, que é o caso de "do" e de "pet".
--   * "pas."      NÃO serve, apesar de a migração 20260814150000 sugerir:
--                 sai num bloco só, sem vale, e não há onde cortar.

insert into public.audio_ajustes (texto, texto_falado, cortar_portador, motivo) values
  -- Vogais da lição "As vogais e o sotaque brasileiro".
  ('a',  'Slovo a.', true, 'Vogal solta muda em qualquer velocidade (pico 0,004). Com portador, 0,94.'),
  ('e',  'Slovo e.', true, 'Vogal solta muda (0,005). Maiúscula é loteria: 0,504 numa rodada, 0,003 na seguinte.'),
  ('o',  'Slovo o.', true, 'Vogal solta muda (0,004), inclusive a 0,25 de velocidade.'),
  ('u',  'Slovo u.', true, 'Mesma produção das outras vogais: a lição compara as quatro, e voz diferente em uma denunciaria o remendo.'),

  -- Preposições da lição "As preposições do Genitiv".
  ('od', 'od, od.',  true, 'Duas letras: mudo (0,0045). Repetida, a segunda sai inteira e é ela que sobe.'),
  ('do', 'do, do.',  true, '"Riječ do." sai grudado — a voz emenda riječ+do e não há vale para cortar.'),

  -- Encontradas na varredura da biblioteca antiga.
  ('pas', 'Riječ pas.', true, 'Pico 0,144 no dicionário e 0,038 como exemplo do P no alfabeto. Uma linha conserta os dois lugares.'),
  ('pet', 'pet, pet.',  true, 'Número cinco: 0,018, zero audível. "Riječ pet." corta dentro da palavra, na oclusiva do /t/.'),
  ('je',  'Riječ je.',  true, 'Pico 0,006, zero audível.'),
  ('ja',  'Riječ ja.',  true, 'Pico 0,007, zero audível.'),
  ('ti',  'Riječ ti.',  true, 'Pico 0,067, no fundo do audível.'),
  ('Đ',   'Slovo đ.',   true, 'Letra solta: 0,049. O alfabeto fala a palavra de exemplo, mas esta faixa é a letra em si.')
on conflict (texto) do update set
  texto_falado    = excluded.texto_falado,
  cortar_portador = excluded.cortar_portador,
  motivo          = excluded.motivo;
