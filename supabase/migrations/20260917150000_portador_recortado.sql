-- Quando o ajuste de pronúncia é um PORTADOR, e não uma troca de palavra.
--
-- A voz do croata não fonatiza texto curtíssimo: "a", "e", "o", "u", "od" e
-- "do" saem com a duração certa e silêncio dentro. Baixar a velocidade não
-- resolve — medido de 0,9 a 0,25, o arquivo cresce e o silêncio cresce
-- junto. O que resolve é dar mais TEXTO: "Slovo a." sai falado sempre.
--
-- Só que o aluno não pode ouvir "slovo". Então o gerador sintetiza a frase
-- inteira, acha o vale de energia entre o portador e o alvo, e descarta os
-- quadros de MP3 do começo — o arquivo que sobe tem só o "a", com os mesmos
-- bytes que o sintetizador produziu, sem recodificação.
--
-- Esta coluna é o que liga esse comportamento. Sem ela, `texto_falado`
-- continua sendo o que sempre foi: uma troca simples, falada por inteiro.
alter table public.audio_ajustes
  add column if not exists cortar_portador boolean not null default false;

comment on column public.audio_ajustes.cortar_portador is
  'true: sintetiza texto_falado inteiro e sobe só o trecho final, depois do '
  'último vale de energia. Para som que a voz só produz com palavra em volta.';
