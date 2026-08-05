-- Cria uma lição inteira (3 atividades + exercícios) validando as invariantes
-- do CLAUDE.md: a escada transformacao -> traducao -> producao_livre precisa
-- estar completa e os pesos precisam somar exatamente 10.
-- Serve para o seed e vai servir para o CMS.
create or replace function public.criar_licao(
  p_modulo_ordem int,
  p_titulo text,
  p_ordem int,
  p_atividades jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_modulo_id uuid;
  v_licao_id uuid;
  v_atividade_id uuid;
  v_atividade jsonb;
  v_exercicio jsonb;
  v_soma numeric := 0;
  v_tipos text[] := array[]::text[];
  v_i int := 0;
  v_j int;
begin
  select id into v_modulo_id from public.modulos where ordem = p_modulo_ordem;
  if v_modulo_id is null then
    raise exception 'Módulo de ordem % não existe', p_modulo_ordem;
  end if;

  -- Confere a nota /10 e a escada antes de gravar qualquer coisa.
  for v_atividade in select * from jsonb_array_elements(p_atividades) loop
    v_tipos := v_tipos || (v_atividade ->> 'tipo');
    for v_exercicio in select * from jsonb_array_elements(v_atividade -> 'exercicios') loop
      v_soma := v_soma + (v_exercicio ->> 'peso')::numeric;
    end loop;
  end loop;

  if v_soma <> 10 then
    raise exception 'Os pesos da lição "%" somam %, e precisam somar 10', p_titulo, v_soma;
  end if;
  if not (v_tipos @> array['transformacao', 'traducao', 'producao_livre']) then
    raise exception 'A lição "%" precisa das 3 atividades da escada; veio %', p_titulo, v_tipos;
  end if;

  insert into public.licoes (modulo_id, titulo_pt, ordem)
  values (v_modulo_id, p_titulo, p_ordem)
  returning id into v_licao_id;

  for v_atividade in select * from jsonb_array_elements(p_atividades) loop
    v_i := v_i + 1;
    insert into public.atividades (licao_id, tipo, titulo_pt, ordem)
    values (v_licao_id,
            (v_atividade ->> 'tipo')::public.tipo_atividade,
            v_atividade ->> 'titulo',
            v_i)
    returning id into v_atividade_id;

    v_j := 0;
    for v_exercicio in select * from jsonb_array_elements(v_atividade -> 'exercicios') loop
      v_j := v_j + 1;
      insert into public.exercicios
        (atividade_id, tipo, enunciado_pt, dica_pt, peso, padez, ordem, dados)
      values (
        v_atividade_id,
        (v_exercicio ->> 'tipo')::public.tipo_exercicio,
        v_exercicio ->> 'enunciado',
        v_exercicio ->> 'dica',
        (v_exercicio ->> 'peso')::numeric,
        (v_exercicio ->> 'padez')::public.padez,
        v_j,
        v_exercicio -> 'dados'
      );
    end loop;
  end loop;

  return v_licao_id;
end;
$$;

revoke execute on function public.criar_licao(int, text, int, jsonb) from anon;
grant execute on function public.criar_licao(int, text, int, jsonb) to authenticated;
