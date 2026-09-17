-- Quadro das pessoas e dos tempos (item Konjugacija do menu lateral).
--
-- Mesmo papel do Padeži: material de CONSULTA, aberto no meio da lição para
-- lembrar "como é 'eu trabalhei' mesmo?". Conteúdo curado, como a camada
-- basal, e não `exercicios`.
--
-- Três tabelas porque são três recortes, e nenhum deles cabe dentro do
-- outro:
--
--   `lica`          a linha da pessoa: o pronome, quando ela confunde o
--                   brasileiro, um exemplo.
--   `verbos_modelo` a coluna: um verbo por padrão de conjugação, que é o que
--                   o aluno precisa reconhecer para conjugar os outros.
--   `lice_formas`   a célula: pessoa × tempo × verbo.
--
-- A célula guarda a forma INTEIRA ("radio sam"), não só o pedaço que muda.
-- Em croata o passado é clítico + particípio e o futuro é clítico +
-- infinitivo — mostrar só a terminação seria mostrar meia palavra, e o
-- Padeži já ensinou que terminação solta não se lê.

create type public.lice as enum ('1s', '2s', '3s', '1p', '2p', '3p');
create type public.tempo_verbal as enum ('prezent', 'perfekt', 'futur');

create table public.lica (
  id uuid primary key default gen_random_uuid(),
  lice public.lice not null unique,
  -- 1 a 6, na ordem de qualquer tabela de conjugação.
  numero integer not null unique check (numero between 1 and 6),
  -- Pode ter mais de um pronome na mesma pessoa: "on / ona / ono".
  pronomes_hr text[] not null,
  pronome_pt text not null,
  -- Onde o brasileiro tropeça nesta pessoa. É o que justifica a tabela
  -- existir em vez de uma lista de pronomes.
  uso_pt text not null,
  exemplo_hr text not null,
  exemplo_pt text not null,
  nota_pt text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.verbos_modelo (
  id uuid primary key default gen_random_uuid(),
  -- Único, e é por ele que a célula referencia: o infinitivo é como o verbo
  -- aparece no dicionário, e um uuid aqui só tornaria o seed ilegível.
  infinitivo_hr text not null unique,
  ordem integer not null unique,
  traducao_pt text not null,
  -- "termina em -am", "irregular": o rótulo da coluna, em PT.
  padrao_pt text not null,
  nota_pt text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.lice_formas (
  id uuid primary key default gen_random_uuid(),
  lice public.lice not null references public.lica (lice) on delete cascade,
  tempo public.tempo_verbal not null,
  infinitivo_hr text not null references public.verbos_modelo (infinitivo_hr) on delete cascade,
  -- Uma forma quando não varia; duas ou três quando o gênero muda a palavra
  -- ("radio sam" / "radila sam"). Mesmo desenho do `exemplos_hr` da grade do
  -- Padeži, pelo mesmo motivo: a célula é do tamanho que o croata pedir.
  formas_hr text[] not null check (cardinality(formas_hr) between 1 and 3),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (lice, tempo, infinitivo_hr)
);

create index lica_numero_idx on public.lica (numero);
create index lice_formas_lice_idx on public.lice_formas (lice);

create trigger lica_atualizado_em before update on public.lica
  for each row execute function public.set_atualizado_em();
create trigger verbos_modelo_atualizado_em before update on public.verbos_modelo
  for each row execute function public.set_atualizado_em();
create trigger lice_formas_atualizado_em before update on public.lice_formas
  for each row execute function public.set_atualizado_em();

-- Conteúdo curado: leitura pública (inclusive convidado), escrita por curador.
alter table public.lica enable row level security;
alter table public.verbos_modelo enable row level security;
alter table public.lice_formas enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['lica', 'verbos_modelo', 'lice_formas']
  loop
    execute format(
      'create policy "conteudo legivel por todos" on public.%I
         for select to anon, authenticated using (true)', t);
    execute format(
      'create policy "curador insere conteudo" on public.%I
         for insert to authenticated with check (public.e_curador())', t);
    execute format(
      'create policy "curador edita conteudo" on public.%I
         for update to authenticated using (public.e_curador())
         with check (public.e_curador())', t);
    execute format(
      'create policy "curador apaga conteudo" on public.%I
         for delete to authenticated using (public.e_curador())', t);
  end loop;
end $$;
