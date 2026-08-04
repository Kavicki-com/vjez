-- Funções de trigger não devem ser chamáveis via /rest/v1/rpc.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.set_atualizado_em() from anon, authenticated, public;
