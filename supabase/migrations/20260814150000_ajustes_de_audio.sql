-- O texto que a VOZ recebe, quando ele precisa ser diferente do que a TELA
-- mostra.
--
-- A voz do croata no Google (hr-HR-Chirp3-HD) é generativa: cada chamada
-- gera a fala do zero, e em algumas palavras ela erra sempre, não às vezes.
-- `pas` sai truncada em 0,3s em toda tentativa; com um ponto no fim
-- (`pas.`) sai inteira. O ponto não é conteúdo — o aluno nunca vê — é
-- instrução de prosódia para o sintetizador.
--
-- Fica em tabela, e não numa constante do gerador, porque é decisão de
-- curadoria e se ajusta de ouvido: quem descobre que uma palavra saiu torta
-- conserta aqui e roda o gerador de novo, sem deploy.
create table if not exists public.audio_ajustes (
  -- O texto exato como aparece no conteúdo (lex_items.hr, numeros.hr,
  -- letras.exemplo_hr, ou a chave de audio_hr).
  texto text primary key,
  -- O que vai para o TTS no lugar dele.
  texto_falado text not null,
  -- Por que precisou de ajuste — para o próximo não refazer o teste.
  motivo text,
  criado_em timestamptz not null default now()
);

-- Sem policy de leitura: quem lê esta tabela é o gerador em lote, com
-- service_role. O app nunca a consulta — ele recebe o MP3 já pronto.
alter table public.audio_ajustes enable row level security;

comment on table public.audio_ajustes is
  'Texto alternativo enviado ao TTS quando a voz erra a palavra exibida.';
