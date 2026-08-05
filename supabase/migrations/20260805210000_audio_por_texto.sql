-- Áudio avulso, indexado pelo texto croata.
--
-- A camada basal tem áudio por LINHA (uma palavra do dicionário, uma letra).
-- Mas as opções de exercício são formas flexionadas — "kavu", "školi",
-- "ženom" — que não existem como verbete. Guardar por texto deixa qualquer
-- string croata do app ganhar voz, e reaproveita quando a mesma forma
-- aparece em exercícios diferentes.
create table public.audio_hr (
  id uuid primary key default gen_random_uuid(),
  texto text not null unique,
  audio_url text not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create trigger audio_hr_atualizado_em before update on public.audio_hr
  for each row execute function public.set_atualizado_em();

alter table public.audio_hr enable row level security;

create policy "conteudo legivel por todos" on public.audio_hr
  for select to anon, authenticated using (true);
create policy "curador insere conteudo" on public.audio_hr
  for insert to authenticated with check (public.e_curador());
create policy "curador edita conteudo" on public.audio_hr
  for update to authenticated using (public.e_curador())
  with check (public.e_curador());
create policy "curador apaga conteudo" on public.audio_hr
  for delete to authenticated using (public.e_curador());
