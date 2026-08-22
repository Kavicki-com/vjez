-- Quem entra já com papel de curadoria.
--
-- O papel NÃO pode ser dado pelo próprio usuário: a policy
-- "edita o proprio perfil" (migration papeis_e_curadoria) trava a coluna
-- `papel` no with check exatamente para isso. Então promover alguém tem
-- que acontecer fora do alcance do cliente — aqui.
--
-- Esta tabela é a lista de convidados da curadoria. Cadastrar ANTES do
-- primeiro login é o caso normal: a linha em public.usuarios só nasce
-- quando a pessoa entra pelo Google, e é o trigger handle_new_user que
-- consulta esta lista naquele instante.
--
-- Só e-mail, nunca senha: o Vjež autentica por Google e Apple (CLAUDE.md),
-- e não guarda credencial nenhuma. Quem prova a identidade é o provedor.

create table public.curadores_autorizados (
  email text primary key,
  papel public.papel not null default 'curador',
  nota text,
  criado_em timestamptz not null default now()
);

alter table public.curadores_autorizados enable row level security;

-- Sem policy de propósito: RLS ligada e nenhuma policy significa que nem
-- anon nem authenticated enxergam esta tabela. Quem a lê é o trigger, que
-- roda como security definer, e o service_role, que ignora RLS. Uma lista
-- de acesso legível pelo cliente seria um mapa de quem promover.
comment on table public.curadores_autorizados is
  'Lista de acesso da curadoria: e-mail que recebe papel no primeiro login. Sem policies — só o trigger handle_new_user e o service_role leem.';

-- Mesma função de antes, com um passo a mais: consultar a lista.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_papel public.papel;
begin
  -- lower() nos dois lados: o Google devolve o e-mail como a pessoa
  -- digitou, e a lista é escrita à mão.
  select c.papel into v_papel
  from public.curadores_autorizados c
  where lower(c.email) = lower(new.email);

  insert into public.usuarios (id, estado, provedor, nome, papel)
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
    ),
    coalesce(v_papel, 'aluno')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

insert into public.curadores_autorizados (email, papel, nota)
values ('jorgekavicki@gmail.com', 'admin', 'Dono do Vjež')
on conflict (email) do update set papel = excluded.papel;

-- Alcança quem já tinha conta antes da lista existir.
update public.usuarios u
set papel = c.papel
from public.curadores_autorizados c
join auth.users a on lower(a.email) = lower(c.email)
where u.id = a.id
  and u.papel is distinct from c.papel;
