-- Busca do dicionário ignorando acentos nos dois idiomas:
-- "agua" acha "água", "zena" acha "žena", "cokolada" acha "čokolada".
create extension if not exists unaccent with schema extensions;

create or replace function public.buscar_lex_items(termo text)
returns setof public.lex_items
language sql
stable
security invoker
set search_path = ''
as $$
  with entrada as (
    select case
      when termo is null then ''
      -- Neutraliza os curingas do LIKE digitados pelo usuário.
      else replace(replace(btrim(termo), '%', '\%'), '_', '\_')
    end as t
  )
  select l.*
  from public.lex_items l, entrada e
  where e.t = ''
     or extensions.unaccent(l.hr) ilike '%' || extensions.unaccent(e.t) || '%'
     or extensions.unaccent(l.pt) ilike '%' || extensions.unaccent(e.t) || '%'
  order by l.hr;
$$;

grant execute on function public.buscar_lex_items(text) to anon, authenticated;
