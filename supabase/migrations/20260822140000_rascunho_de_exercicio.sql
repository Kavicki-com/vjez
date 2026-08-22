-- Rascunho de exercício.
--
-- O CMS escreve direto na tabela que o aluno lê: sem esta coluna, um
-- exercício meio cadastrado — opções em branco, resposta ainda não
-- escolhida — entra na lição no instante em que é criado, e alguém pode
-- topar com ele no meio de uma trilha.
--
-- `default true` porque todo o conteúdo que já existe está no ar e tem que
-- continuar. Quem nasce como rascunho é o que o CMS cria daqui em diante,
-- e isso é decisão do cliente (features/admin/api.ts), não do banco.

alter table public.exercicios
  add column publicado boolean not null default true;

comment on column public.exercicios.publicado is
  'false = rascunho: existe para a curadoria, invisível para o aluno. Quem esconde é a policy de select, não o cliente.';

-- Esconder na POLICY, e não em cada consulta.
--
-- A regra tem que valer para a lição, para o checkpoint, para a revisão
-- geral e para qualquer consulta que ainda não foi escrita. Um `.eq()`
-- espalhado pelo cliente é uma regra que alguém esquece; aqui não há como
-- esquecer, porque a linha simplesmente não vem.
--
-- O curador enxerga os rascunhos — e isso é a pré-visualização: ele abre a
-- lição pelo app e vê exatamente o que escreveu, no lugar onde vai cair.
drop policy "conteudo legivel por todos" on public.exercicios;

create policy "exercicio publicado legivel por todos" on public.exercicios
  for select to anon, authenticated
  -- select em volta de e_curador() para o Postgres avaliar uma vez por
  -- consulta (initplan) em vez de uma vez por linha, como as outras
  -- policies fazem com auth.uid().
  using (publicado or (select public.e_curador()));
