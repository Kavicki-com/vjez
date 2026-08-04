-- Hierarquia: Modulo -> Licao -> 3 Atividades -> Exercicios.

create table public.modulos (
  id uuid primary key default gen_random_uuid(),
  tema_pt text not null,
  nivel public.nivel not null,
  fase public.fase not null,
  ordem integer not null unique,
  bloqueado_por uuid references public.modulos (id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint modulos_nao_bloqueia_a_si_mesmo check (bloqueado_por is distinct from id)
);

create table public.licoes (
  id uuid primary key default gen_random_uuid(),
  modulo_id uuid not null references public.modulos (id) on delete cascade,
  titulo_pt text not null,
  ordem integer not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (modulo_id, ordem)
);

create table public.atividades (
  id uuid primary key default gen_random_uuid(),
  licao_id uuid not null references public.licoes (id) on delete cascade,
  tipo public.tipo_atividade not null,
  titulo_pt text not null,
  ordem integer not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  -- Escada de dificuldade: cada tipo aparece uma vez por lição.
  unique (licao_id, tipo),
  unique (licao_id, ordem)
);

create table public.exercicios (
  id uuid primary key default gen_random_uuid(),
  atividade_id uuid not null references public.atividades (id) on delete cascade,
  tipo public.tipo_exercicio not null,
  enunciado_pt text not null,
  dica_pt text,
  -- Fração da nota /10; a soma dos pesos da lição deve fechar em 10.
  peso numeric(4, 2) not null check (peso > 0 and peso <= 10),
  padez public.padez,
  audio_url text,
  ordem integer not null,
  -- Campos específicos de cada template do contrato TS.
  dados jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (atividade_id, ordem),
  constraint exercicios_dados_por_tipo check (
    case tipo
      when 'preencher_lacuna' then
        jsonb_exists(dados, 'frase_hr')
        and jsonb_exists(dados, 'base_hr')
        and jsonb_exists(dados, 'resposta')
      when 'escolher_forma' then
        jsonb_typeof(dados -> 'opcoes') = 'array'
        and jsonb_exists(dados, 'resposta')
      when 'montar_frase' then
        jsonb_exists(dados, 'alvo_hr')
        and jsonb_typeof(dados -> 'tokens') = 'array'
      when 'ligar_pares' then
        jsonb_typeof(dados -> 'pares') = 'array'
      when 'traducao' then
        jsonb_exists(dados, 'origem_pt')
        and jsonb_typeof(dados -> 'respostas_aceitas') = 'array'
      when 'producao_livre' then
        jsonb_exists(dados, 'prompt_pt')
    end
  )
);

-- Checkpoint é 1:1 com o módulo; os itens são sorteados em runtime.
create table public.checkpoints (
  id uuid primary key default gen_random_uuid(),
  modulo_id uuid not null unique references public.modulos (id) on delete cascade,
  nota_minima numeric(3, 2) not null default 0.70 check (nota_minima > 0 and nota_minima <= 1),
  tamanho integer not null check (tamanho > 0),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Revisão geral a cada 3 módulos; puxa de todos os módulos concluídos.
create table public.revisoes_gerais (
  id uuid primary key default gen_random_uuid(),
  apos_modulo_ordem integer not null unique,
  tamanho integer not null check (tamanho > 0),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index licoes_modulo_idx on public.licoes (modulo_id, ordem);
create index atividades_licao_idx on public.atividades (licao_id, ordem);
create index exercicios_atividade_idx on public.exercicios (atividade_id, ordem);
create index exercicios_padez_idx on public.exercicios (padez) where padez is not null;
create index modulos_ordem_idx on public.modulos (ordem);

create trigger modulos_atualizado_em before update on public.modulos
  for each row execute function public.set_atualizado_em();
create trigger licoes_atualizado_em before update on public.licoes
  for each row execute function public.set_atualizado_em();
create trigger atividades_atualizado_em before update on public.atividades
  for each row execute function public.set_atualizado_em();
create trigger exercicios_atualizado_em before update on public.exercicios
  for each row execute function public.set_atualizado_em();
create trigger checkpoints_atualizado_em before update on public.checkpoints
  for each row execute function public.set_atualizado_em();
create trigger revisoes_gerais_atualizado_em before update on public.revisoes_gerais
  for each row execute function public.set_atualizado_em();
