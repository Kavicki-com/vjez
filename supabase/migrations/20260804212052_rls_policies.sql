-- RLS em tudo. Conteúdo curado: leitura pública, escrita só por service_role
-- (curadoria roda fora do cliente). Dados do usuário: só o dono.

alter table public.letras enable row level security;
alter table public.numeros enable row level security;
alter table public.lex_items enable row level security;
alter table public.frases enable row level security;
alter table public.modulos enable row level security;
alter table public.licoes enable row level security;
alter table public.atividades enable row level security;
alter table public.exercicios enable row level security;
alter table public.checkpoints enable row level security;
alter table public.revisoes_gerais enable row level security;
alter table public.usuarios enable row level security;
alter table public.progresso_licao enable row level security;
alter table public.tentativas_exercicio enable row level security;
alter table public.progresso_modulo enable row level security;
alter table public.submissoes_livres enable row level security;

-- Conteúdo: legível inclusive por convidado (Lição 1 sem login).
create policy "conteudo legivel por todos" on public.letras
  for select to anon, authenticated using (true);
create policy "conteudo legivel por todos" on public.numeros
  for select to anon, authenticated using (true);
create policy "conteudo legivel por todos" on public.lex_items
  for select to anon, authenticated using (true);
create policy "conteudo legivel por todos" on public.frases
  for select to anon, authenticated using (true);
create policy "conteudo legivel por todos" on public.modulos
  for select to anon, authenticated using (true);
create policy "conteudo legivel por todos" on public.licoes
  for select to anon, authenticated using (true);
create policy "conteudo legivel por todos" on public.atividades
  for select to anon, authenticated using (true);
create policy "conteudo legivel por todos" on public.exercicios
  for select to anon, authenticated using (true);
create policy "conteudo legivel por todos" on public.checkpoints
  for select to anon, authenticated using (true);
create policy "conteudo legivel por todos" on public.revisoes_gerais
  for select to anon, authenticated using (true);

-- Perfil próprio. Delete permitido: exigência da App Store.
create policy "le o proprio perfil" on public.usuarios
  for select to authenticated using ((select auth.uid()) = id);
create policy "cria o proprio perfil" on public.usuarios
  for insert to authenticated with check ((select auth.uid()) = id);
create policy "edita o proprio perfil" on public.usuarios
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
create policy "apaga o proprio perfil" on public.usuarios
  for delete to authenticated using ((select auth.uid()) = id);

create policy "le o proprio progresso" on public.progresso_licao
  for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "grava o proprio progresso" on public.progresso_licao
  for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "atualiza o proprio progresso" on public.progresso_licao
  for update to authenticated using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);

create policy "le as proprias tentativas" on public.tentativas_exercicio
  for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "grava as proprias tentativas" on public.tentativas_exercicio
  for insert to authenticated with check ((select auth.uid()) = usuario_id);

create policy "le o proprio progresso de modulo" on public.progresso_modulo
  for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "grava o proprio progresso de modulo" on public.progresso_modulo
  for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "atualiza o proprio progresso de modulo" on public.progresso_modulo
  for update to authenticated using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);

-- Submissão: o usuário cria e lê. A correção é escrita pela Edge Function
-- (service_role), nunca pelo cliente — por isso não há policy de update.
create policy "le as proprias submissoes" on public.submissoes_livres
  for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "cria as proprias submissoes" on public.submissoes_livres
  for insert to authenticated with check ((select auth.uid()) = usuario_id);
