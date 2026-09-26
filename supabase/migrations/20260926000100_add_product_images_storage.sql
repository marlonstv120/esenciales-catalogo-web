insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'productos',
  'productos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy lectura_publica_imagenes_productos
on storage.objects
for select
to public
using (bucket_id = 'productos');

create policy administrador_activo_gestiona_imagenes_productos
on storage.objects
for all
to authenticated
using (
  bucket_id = 'productos'
  and (select public.es_administrador_activo())
)
with check (
  bucket_id = 'productos'
  and (select public.es_administrador_activo())
);
