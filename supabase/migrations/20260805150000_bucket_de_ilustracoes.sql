-- Ilustrações de abertura das lições. Mesma lógica do bucket de áudio:
-- leitura pública, escrita só por quem cura o conteúdo.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ilustracoes', 'ilustracoes', true, 2097152,
        array['image/png', 'image/svg+xml', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Curador sobe e troca ilustração pelo próprio app, sem service_role.
create policy "curador sobe ilustracao" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'ilustracoes' and public.e_curador());

create policy "curador troca ilustracao" on storage.objects
  for update to authenticated
  using (bucket_id = 'ilustracoes' and public.e_curador())
  with check (bucket_id = 'ilustracoes' and public.e_curador());

create policy "curador apaga ilustracao" on storage.objects
  for delete to authenticated
  using (bucket_id = 'ilustracoes' and public.e_curador());
