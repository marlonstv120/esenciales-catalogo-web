create function public.es_administrador_activo()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.usuarios_administrativos
    where id = (select auth.uid())
      and activo
  );
$$;

revoke all on function public.es_administrador_activo() from public, anon;
grant execute on function public.es_administrador_activo() to authenticated;

grant select, insert, update, delete on public.categorias to authenticated;
grant usage, select on sequence public.categorias_id_seq to authenticated;

create policy administrador_activo_gestiona_categorias
on public.categorias
for all to authenticated
using ((select public.es_administrador_activo()))
with check ((select public.es_administrador_activo()));

grant select, insert, update, delete on public.productos to authenticated;
grant usage, select on sequence public.productos_id_seq to authenticated;

create policy administrador_activo_gestiona_productos
on public.productos
for all to authenticated
using ((select public.es_administrador_activo()))
with check ((select public.es_administrador_activo()));

grant select, insert, update, delete on public.presentaciones to authenticated;
grant usage, select on sequence public.presentaciones_id_seq to authenticated;

create policy administrador_activo_gestiona_presentaciones
on public.presentaciones
for all to authenticated
using ((select public.es_administrador_activo()))
with check ((select public.es_administrador_activo()));

grant select, insert, update, delete on public.imagenes_producto to authenticated;
grant usage, select on sequence public.imagenes_producto_id_seq to authenticated;

create policy administrador_activo_gestiona_imagenes_producto
on public.imagenes_producto
for all to authenticated
using ((select public.es_administrador_activo()))
with check ((select public.es_administrador_activo()));
