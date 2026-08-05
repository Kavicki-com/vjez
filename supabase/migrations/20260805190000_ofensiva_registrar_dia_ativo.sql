-- Ofensiva: gatilho diário é concluir ≥1 lição.
--
-- O dia vem do CLIENTE, não do servidor: `now()` no Postgres é UTC, e quem
-- estuda às 22h no Brasil já está no dia seguinte em UTC — a ofensiva
-- pularia um dia sozinha. Quem sabe que dia é hoje é o aparelho do aluno.
--
-- A função é chamada uma vez por lição concluída, e é justamente isso que
-- permite implementar a recuperação sem contar nada: se o dia já foi
-- registrado (gap = 0) e o status é 'em_recuperacao', então esta é a
-- SEGUNDA lição do dia — a que salva a ofensiva.
create or replace function public.registrar_dia_ativo(dia_local date)
returns public.usuarios
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid := (select auth.uid());
  v_ultimo date;
  v_dias int;
  v_status public.status_ofensiva;
  v_gap int;
  v_linha public.usuarios;
begin
  if v_id is null then
    return null;
  end if;

  select ofensiva_ultimo_dia_ativo, ofensiva_dias_seguidos, ofensiva_status
    into v_ultimo, v_dias, v_status
  from public.usuarios
  where id = v_id
  for update;

  if not found then
    return null;
  end if;

  if v_ultimo is null then
    v_dias := 1;
    v_status := 'ativa';
  else
    v_gap := dia_local - v_ultimo;

    if v_gap < 0 then
      -- Relógio do aparelho atrasado: não mexe em nada, para não permitir
      -- inflar ofensiva mudando a data do celular para trás.
      select u.* into v_linha from public.usuarios u where u.id = v_id;
      return v_linha;

    elsif v_gap = 0 then
      -- O dia já contou. Se estava em recuperação, esta é a segunda lição
      -- de hoje: é ela que recupera o dia perdido.
      if v_status = 'em_recuperacao' then
        v_dias := v_dias + 1;
        v_status := 'ativa';
      end if;

    elsif v_gap = 1 then
      v_dias := v_dias + 1;
      v_status := 'ativa';

    elsif v_gap = 2 then
      -- Faltou exatamente um dia: dá para salvar fazendo outra lição hoje.
      v_dias := v_dias + 1;
      v_status := 'em_recuperacao';

    else
      -- Dois dias ou mais sem atividade: zera e recomeça em 1.
      v_dias := 1;
      v_status := 'ativa';
    end if;
  end if;

  update public.usuarios
  set ofensiva_ultimo_dia_ativo = greatest(coalesce(v_ultimo, dia_local), dia_local),
      ofensiva_dias_seguidos = v_dias,
      ofensiva_status = v_status
  where id = v_id
  returning * into v_linha;

  return v_linha;
end;
$$;

grant execute on function public.registrar_dia_ativo(date) to authenticated;
revoke execute on function public.registrar_dia_ativo(date) from anon;
