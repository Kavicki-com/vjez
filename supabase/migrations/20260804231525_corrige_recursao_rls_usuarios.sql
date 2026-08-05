-- A policy anterior consultava public.usuarios dentro de uma policy de
-- public.usuarios: o Postgres acusa "infinite recursion detected in policy".
-- Quem protege o papel agora é um trigger, e a leitura de admin sai de cena
-- até o CMS precisar dela (aí virá por função SECURITY DEFINER).

drop policy if exists "admin le todos os perfis" on public.usuarios;
drop policy if exists "edita o proprio perfil" on public.usuarios;

create policy "edita o proprio perfil" on public.usuarios
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Promoção a curador/admin só por service_role (painel de curadoria,
-- fora do cliente). Se vier do cliente, o papel antigo é mantido.
create or replace function public.protege_papel()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.papel is distinct from old.papel and current_user <> 'service_role' then
    new.papel := old.papel;
  end if;
  return new;
end;
$$;

revoke execute on function public.protege_papel() from anon, authenticated, public;

create trigger usuarios_protege_papel
  before update on public.usuarios
  for each row execute function public.protege_papel();
