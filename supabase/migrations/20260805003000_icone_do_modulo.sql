-- Ícone do nó da trilha. Guarda o nome do glifo (Ionicons), não a imagem:
-- conteúdo continua no backend e a curadoria escolhe o ícone pelo CMS.
alter table public.modulos add column icone text;
