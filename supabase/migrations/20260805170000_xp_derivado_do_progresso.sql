-- XP = nota × 10, ou seja, lição perfeita vale 100.
--
-- Calculado a partir de progresso_licao em vez de somado a cada conclusão:
-- contador incremental erra quando a lição é refeita, quando uma gravação
-- falha e repete, ou quando o progresso do convidado é migrado. Derivando,
-- não há como dessincronizar — e refazer melhorando a nota já sobe o XP
-- sozinho, porque progresso_licao guarda a melhor nota.

create or replace function public.recalcular_xp()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := coalesce(new.usuario_id, old.usuario_id);
begin
  update public.usuarios u
  set xp = coalesce((
    select round(sum(p.nota) * 10)
    from public.progresso_licao p
    where p.usuario_id = v_usuario
      and p.concluida
  ), 0)
  where u.id = v_usuario;
  return coalesce(new, old);
end;
$$;

revoke execute on function public.recalcular_xp() from anon, authenticated, public;

create trigger progresso_licao_recalcula_xp
  after insert or update or delete on public.progresso_licao
  for each row execute function public.recalcular_xp();

-- Preenche o XP de quem já estudou antes do gatilho existir.
update public.usuarios u
set xp = coalesce((
  select round(sum(p.nota) * 10)
  from public.progresso_licao p
  where p.usuario_id = u.id and p.concluida
), 0);
