create index modulos_bloqueado_por_idx on public.modulos (bloqueado_por)
  where bloqueado_por is not null;
create index progresso_licao_licao_idx on public.progresso_licao (licao_id);
create index progresso_modulo_modulo_idx on public.progresso_modulo (modulo_id);
create index submissoes_exercicio_idx on public.submissoes_livres (exercicio_id);
create index tentativas_modulo_idx on public.tentativas_exercicio (modulo_id);
