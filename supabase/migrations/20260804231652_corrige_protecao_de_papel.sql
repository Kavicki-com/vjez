-- A versão anterior só liberava para o role literal 'service_role', o que
-- barrava também postgres/supabase_admin — ou seja, promover um curador pelo
-- SQL editor ou por migration falhava em silêncio.
-- A regra certa é o inverso: bloquear só os roles do cliente.
create or replace function public.protege_papel()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.papel is distinct from old.papel
     and current_user in ('authenticated', 'anon') then
    new.papel := old.papel;
  end if;
  return new;
end;
$$;
