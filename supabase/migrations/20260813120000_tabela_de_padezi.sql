-- Quadro dos 7 casos (item Padeži do menu lateral).
--
-- É material de consulta, não de exercício: o aluno abre no meio da lição
-- para lembrar "o genitivo responde a quê mesmo?". Por isso é conteúdo
-- curado como o resto da camada basal, e não `exercicios`.
--
-- Duas tabelas porque são dois recortes: a linha do caso (pergunta, uso,
-- preposições) e a grade de terminações, que é gênero × número. Guardar a
-- grade como jsonb economizaria uma consulta e tiraria da curadoria a
-- possibilidade de corrigir uma célula sozinha.

create table public.padezi (
  id uuid primary key default gen_random_uuid(),
  padez public.padez not null unique,
  -- Ordem canônica croata (N G D A V L I): é o número que o aluno vê em
  -- livro e em aula, e não bate com a ordem em que o app ensina.
  numero integer not null unique check (numero between 1 and 7),
  -- Pergunta que o caso responde: "koga? čega?" e o par em PT-BR.
  pergunta_hr text not null,
  pergunta_pt text not null,
  uso_pt text not null,
  preposicoes_hr text[] not null default '{}',
  exemplo_hr text not null,
  exemplo_pt text not null,
  nota_pt text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.padez_terminacoes (
  id uuid primary key default gen_random_uuid(),
  padez public.padez not null references public.padezi (padez) on delete cascade,
  genero public.genero_gramatical not null,
  plural boolean not null,
  -- Só a terminação ("-ima", "—" quando é vazia), com a palavra-modelo já
  -- flexionada ao lado: terminação solta não se lê.
  terminacao text not null,
  exemplo_hr text not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (padez, genero, plural)
);

create index padezi_numero_idx on public.padezi (numero);
create index padez_terminacoes_padez_idx on public.padez_terminacoes (padez);

create trigger padezi_atualizado_em before update on public.padezi
  for each row execute function public.set_atualizado_em();
create trigger padez_terminacoes_atualizado_em before update on public.padez_terminacoes
  for each row execute function public.set_atualizado_em();

-- Conteúdo curado: leitura pública (inclusive convidado), escrita por curador.
alter table public.padezi enable row level security;
alter table public.padez_terminacoes enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['padezi', 'padez_terminacoes']
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
