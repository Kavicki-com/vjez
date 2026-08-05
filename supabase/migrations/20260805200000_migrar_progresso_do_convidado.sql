-- Leva para a conta o que o convidado fez antes de entrar.
--
-- Numa chamada só, para o progresso não chegar pela metade se a rede cair no
-- meio. security invoker: a RLS continua valendo e o usuario_id vem sempre
-- de auth.uid(), então ninguém escreve no progresso de outra pessoa.
--
-- Nota usa GREATEST: entrar não pode piorar o que já estava na conta. É o
-- caso de quem já estudou logado no computador e depois faz a Lição 1 como
-- convidado no celular.
create or replace function public.migrar_progresso(
  licoes jsonb default '[]'::jsonb,
  tentativas jsonb default '[]'::jsonb,
  modulos jsonb default '[]'::jsonb,
  dia_local date default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid := (select auth.uid());
begin
  if v_id is null then
    raise exception 'Sem sessão: não há conta para receber o progresso';
  end if;

  insert into public.progresso_licao (usuario_id, licao_id, nota, concluida)
  select v_id, (item ->> 'licao_id')::uuid, (item ->> 'nota')::numeric, true
  from jsonb_array_elements(licoes) as item
  on conflict (usuario_id, licao_id) do update
    set nota = greatest(excluded.nota, public.progresso_licao.nota),
        concluida = true;

  -- Tentativa é registro histórico: acumula, não sobrescreve.
  insert into public.tentativas_exercicio
    (usuario_id, exercicio_id, modulo_id, acertou, tentativas)
  select v_id,
         (item ->> 'exercicio_id')::uuid,
         (item ->> 'modulo_id')::uuid,
         (item ->> 'acertou')::boolean,
         1
  from jsonb_array_elements(tentativas) as item;

  insert into public.progresso_modulo
    (usuario_id, modulo_id, checkpoint_passado, desbloqueado)
  select v_id, (item ->> 'modulo_id')::uuid,
         (item ->> 'checkpoint_passado')::boolean, true
  from jsonb_array_elements(modulos) as item
  on conflict (usuario_id, modulo_id) do update
    set checkpoint_passado =
          public.progresso_modulo.checkpoint_passado
          or excluded.checkpoint_passado,
        desbloqueado = true;

  -- Quem estudou como convidado hoje já cumpriu o gatilho da ofensiva.
  if dia_local is not null then
    perform public.registrar_dia_ativo(dia_local);
  end if;
end;
$$;

grant execute on function public.migrar_progresso(jsonb, jsonb, jsonb, date) to authenticated;
revoke execute on function public.migrar_progresso(jsonb, jsonb, jsonb, date) from anon;
