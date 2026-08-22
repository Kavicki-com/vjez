-- Respostas de exercício que já têm MP3 em outra tabela.
--
-- O feedback de acerto toca a forma certa lendo o `audio_hr`, indexado por
-- texto. Duas respostas de `escolher_forma` são palavras croatas que já
-- existem como conteúdo curado — "konj" no dicionário, "Dobro jutro!" nas
-- expressões — mas não estavam no índice por texto, então saíam mudas.
--
-- Aponta para o MESMO arquivo no Storage: nada de sintetizar de novo, nada
-- de dois MP3 da mesma palavra com vozes que podem divergir num --refazer.
--
-- As outras 14 respostas sem áudio são português ou metalinguagem ("para
-- onde?", "ts", "Genitiv", "não existe"). Continuam mudas de propósito:
-- voz croata lendo português é pior do que silêncio.

insert into public.audio_hr (texto, audio_url)
select l.hr, l.audio_url
from public.lex_items l
where l.hr = 'konj' and l.audio_url is not null
on conflict (texto) do nothing;

insert into public.audio_hr (texto, audio_url)
select f.hr, f.audio_url
from public.frases f
where f.hr = 'Dobro jutro!' and f.audio_url is not null
on conflict (texto) do nothing;
