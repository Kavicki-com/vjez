-- Usuário e progresso. Convidado vive só no estado do app (regra 5);
-- a linha em public.usuarios nasce no primeiro login e recebe a migração.

create table public.usuarios (
  id uuid primary key references auth.users (id) on delete cascade,
  estado public.estado_conta not null default 'autenticado',
  provedor public.provedor,
  nome text,
  nivel public.nivel not null default 'basico',
  xp integer not null default 0 check (xp >= 0),
  -- Ofensiva achatada em colunas: o update diário é atômico.
  ofensiva_dias_seguidos integer not null default 0 check (ofensiva_dias_seguidos >= 0),
  ofensiva_ultimo_dia_ativo date,
  ofensiva_status public.status_ofensiva not null default 'zerada',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.progresso_licao (
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  licao_id uuid not null references public.licoes (id) on delete cascade,
  nota numeric(4, 2) not null check (nota >= 0 and nota <= 10),
  concluida boolean not null default false,
  data timestamptz not null default now(),
  primary key (usuario_id, licao_id)
);

-- Alimenta a amostragem do checkpoint (prioriza erros) e a analytics.
create table public.tentativas_exercicio (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  exercicio_id uuid not null references public.exercicios (id) on delete cascade,
  modulo_id uuid not null references public.modulos (id) on delete cascade,
  acertou boolean not null,
  tentativas integer not null default 1 check (tentativas > 0),
  data timestamptz not null default now()
);

create table public.progresso_modulo (
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  modulo_id uuid not null references public.modulos (id) on delete cascade,
  checkpoint_passado boolean not null default false,
  desbloqueado boolean not null default false,
  atualizado_em timestamptz not null default now(),
  primary key (usuario_id, modulo_id)
);

create table public.submissoes_livres (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios (id) on delete cascade,
  exercicio_id uuid not null references public.exercicios (id) on delete cascade,
  texto_hr text not null check (char_length(texto_hr) between 1 and 400),
  status public.status_submissao not null default 'aguardando',
  correcao_ia jsonb,
  correcao_nativo jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index progresso_licao_usuario_idx on public.progresso_licao (usuario_id, data desc);
create index tentativas_usuario_modulo_idx
  on public.tentativas_exercicio (usuario_id, modulo_id, acertou);
create index tentativas_exercicio_idx on public.tentativas_exercicio (exercicio_id);
create index submissoes_usuario_idx on public.submissoes_livres (usuario_id, criado_em desc);
create index submissoes_status_idx on public.submissoes_livres (status)
  where status in ('aguardando', 'corrigida_ia');

create trigger usuarios_atualizado_em before update on public.usuarios
  for each row execute function public.set_atualizado_em();
create trigger progresso_modulo_atualizado_em before update on public.progresso_modulo
  for each row execute function public.set_atualizado_em();
create trigger submissoes_livres_atualizado_em before update on public.submissoes_livres
  for each row execute function public.set_atualizado_em();

-- Cria o perfil no primeiro login (Google ou Apple).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.usuarios (id, estado, provedor, nome)
  values (
    new.id,
    'autenticado',
    case new.raw_app_meta_data ->> 'provider'
      when 'google' then 'google'::public.provedor
      when 'apple' then 'apple'::public.provedor
      else null
    end,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
