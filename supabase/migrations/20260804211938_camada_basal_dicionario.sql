-- Camada basal (aba Dicionário): conteúdo curado, leitura pública.

create table public.letras (
  id uuid primary key default gen_random_uuid(),
  letra text not null unique,
  som_pt text not null,
  exemplo_hr text,
  audio_url text,
  ordem integer not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.numeros (
  id uuid primary key default gen_random_uuid(),
  valor integer not null unique,
  hr text not null,
  audio_url text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.lex_items (
  id uuid primary key default gen_random_uuid(),
  hr text not null,
  pt text not null,
  categoria text not null,
  genero public.genero_gramatical,
  audio_url text,
  nota_pt text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.frases (
  id uuid primary key default gen_random_uuid(),
  hr text not null,
  pt text not null,
  contexto text,
  audio_url text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Busca PT <-> HR no dicionário e nas expressões.
create index lex_items_hr_idx on public.lex_items using gin (hr extensions.gin_trgm_ops);
create index lex_items_pt_idx on public.lex_items using gin (pt extensions.gin_trgm_ops);
create index lex_items_categoria_idx on public.lex_items (categoria);
create index frases_hr_idx on public.frases using gin (hr extensions.gin_trgm_ops);
create index frases_pt_idx on public.frases using gin (pt extensions.gin_trgm_ops);
create index letras_ordem_idx on public.letras (ordem);
create index numeros_valor_idx on public.numeros (valor);

create trigger letras_atualizado_em before update on public.letras
  for each row execute function public.set_atualizado_em();
create trigger numeros_atualizado_em before update on public.numeros
  for each row execute function public.set_atualizado_em();
create trigger lex_items_atualizado_em before update on public.lex_items
  for each row execute function public.set_atualizado_em();
create trigger frases_atualizado_em before update on public.frases
  for each row execute function public.set_atualizado_em();
