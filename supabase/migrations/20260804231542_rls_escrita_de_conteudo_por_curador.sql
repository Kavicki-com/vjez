-- Curadores (professores/nativos) escrevem conteúdo direto pelo app.
-- Sem isso, alimentar o Vjez exigiria service_role, ou seja, fora do cliente.
-- e_curador() é security invoker e lê a própria linha do usuário, então não
-- recorre nas policies de public.usuarios.

do $$
declare
  t text;
begin
  foreach t in array array[
    'letras', 'numeros', 'lex_items', 'frases',
    'modulos', 'licoes', 'atividades', 'exercicios',
    'checkpoints', 'revisoes_gerais'
  ]
  loop
    execute format(
      'create policy "curador insere conteudo" on public.%I
         for insert to authenticated with check (public.e_curador())', t);
    execute format(
      'create policy "curador edita conteudo" on public.%I
         for update to authenticated using (public.e_curador())
         with check (public.e_curador())', t);
    execute format(
      'create policy "curador apaga conteudo" on public.%I
         for delete to authenticated using (public.e_curador())', t);
  end loop;
end $$;
