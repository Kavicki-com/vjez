-- Fundação do CMS: quem pode escrever conteúdo.
-- 'aluno' é o padrão; 'curador' é o professor/nativo que alimenta o app;
-- 'admin' também mexe em papéis.
--
-- ATENÇÃO: as duas policies criadas no fim deste arquivo consultavam
-- public.usuarios dentro de policies de public.usuarios e causavam
-- "infinite recursion detected in policy". A migration seguinte
-- (corrige_recursao_rls_usuarios) desfaz as duas. Mantido aqui só para
-- o histórico bater com o que foi aplicado no banco.
create type public.papel as enum ('aluno', 'curador', 'admin');

alter table public.usuarios
  add column papel public.papel not null default 'aluno';

-- security invoker de propósito: a policy "le o proprio perfil" já deixa o
-- usuário ver a própria linha, então não precisa de SECURITY DEFINER
-- (que viraria uma função privilegiada exposta em /rest/v1/rpc).
create or replace function public.e_curador()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.usuarios u
    where u.id = (select auth.uid())
      and u.papel in ('curador', 'admin')
  );
$$;

grant execute on function public.e_curador() to authenticated;

drop policy "edita o proprio perfil" on public.usuarios;

create policy "edita o proprio perfil" on public.usuarios
  for update to authenticated
  using ((select auth.uid()) = id)
  with check (
    (select auth.uid()) = id
    and papel = (select u.papel from public.usuarios u where u.id = (select auth.uid()))
  );

create policy "admin le todos os perfis" on public.usuarios
  for select to authenticated
  using (
    exists (
      select 1 from public.usuarios u
      where u.id = (select auth.uid()) and u.papel = 'admin'
    )
  );
