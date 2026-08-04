-- Enums espelhando as uniões do contrato TS (src/types/schema.ts)

create type public.nivel as enum ('basico', 'intermediario', 'avancado');

create type public.fase as enum ('demo', 'paralelo', 'evolucao');

create type public.padez as enum (
  'nominativ', 'genitiv', 'dativ', 'akuzativ',
  'vokativ', 'lokativ', 'instrumental'
);

create type public.tipo_exercicio as enum (
  'preencher_lacuna', 'escolher_forma', 'montar_frase',
  'ligar_pares', 'traducao', 'producao_livre'
);

create type public.tipo_atividade as enum (
  'transformacao', 'traducao', 'producao_livre'
);

create type public.genero_gramatical as enum ('m', 'f', 'n');

create type public.estado_conta as enum ('convidado', 'autenticado');

create type public.provedor as enum ('google', 'apple');

create type public.status_ofensiva as enum ('ativa', 'em_recuperacao', 'zerada');

create type public.status_submissao as enum (
  'aguardando', 'corrigida_ia', 'revisada_nativo', 'falha'
);

-- Marca atualizado_em; usado pelo cache local para saber o que rebaixar.
create or replace function public.set_atualizado_em()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;
