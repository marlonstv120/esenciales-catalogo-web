-- Soporte de fotos y videos en la galería de vehículos.
--
-- 1) `imagenes_producto.tipo` distingue una foto ('imagen') de un video ('video').
-- 2) El bucket `productos` admite los tipos de video (máx. 5 MiB por archivo,
--    igual que las imágenes).
-- 3) La portada del catálogo prioriza siempre una imagen; un video nunca se usa
--    como portada de las tarjetas.
-- 4) El detalle público vuelve a exponer la galería completa con su tipo para
--    poder mostrar fotos y videos.

alter table public.imagenes_producto
  add column if not exists tipo text not null default 'imagen';

alter table public.imagenes_producto
  drop constraint if exists imagenes_producto_tipo_valido;

alter table public.imagenes_producto
  add constraint imagenes_producto_tipo_valido check (tipo in ('imagen', 'video'));

update storage.buckets
set allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime'
    ],
    file_size_limit = 5242880
where id = 'productos';

-- 3) Portada del catálogo: primero las imágenes, luego la posición original.
do $$
declare
  definicion text;
begin
  definicion := pg_get_functiondef('public.obtener_catalogo_publico()'::regprocedure);

  if position('order by i.posicion, i.id' in definicion) = 0 then
    raise exception 'No se encontró el orden de portada esperado en obtener_catalogo_publico().';
  end if;

  definicion := replace(
    definicion,
    'order by i.posicion, i.id',
    'order by (i.tipo = ''video''), i.posicion, i.id'
  );

  execute definicion;
end $$;

-- 4) Detalle público: galería completa (fotos y videos) con su tipo.
create or replace function public.obtener_producto_publico(producto_id integer)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'categoria_id', catalogo.categoria_id,
    'categoria_nombre', catalogo.categoria_nombre,
    'producto_id', catalogo.producto_id,
    'nombre', catalogo.nombre,
    'descripcion', catalogo.descripcion,
    'marca', catalogo.marca,
    'genero', catalogo.genero,
    'familia_olfativa', catalogo.familia_olfativa,
    'clasificacion', catalogo.clasificacion,
    'destacado', catalogo.destacado,
    'imagen_url', catalogo.imagen_url,
    'texto_alternativo', catalogo.texto_alternativo,
    'imagenes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'url', imagen.url,
        'tipo', imagen.tipo,
        'texto_alternativo', imagen.texto_alternativo
      ) order by imagen.posicion, imagen.id)
      from public.imagenes_producto imagen
      where imagen.producto_id = catalogo.producto_id
    ), '[]'::jsonb),
    'precio_referencia', catalogo.precio_referencia,
    'precio_normal_referencia', catalogo.precio_normal_referencia,
    'precio_desde', catalogo.precio_desde,
    'disponibilidad', catalogo.disponibilidad,
    'presentaciones', (
      select jsonb_agg(jsonb_build_object(
        'id', pr.id,
        'etiqueta', pr.etiqueta,
        'precio_normal', pr.precio_normal,
        'precio_promocional', pr.precio_promocional,
        'estado', case
          when pr.modo_disponibilidad = 'bajo_pedido' then 'Bajo pedido'
          when pr.modo_disponibilidad = 'no_disponible' then 'No disponible'
          when pr.modo_disponibilidad = 'vendido' then 'Vendido'
          when pr.stock > 0 then 'Disponible'
          else 'Agotado'
        end,
        'maximo_solicitable', case
          when pr.modo_disponibilidad = 'bajo_pedido' then 99
          when pr.modo_disponibilidad = 'venta_inmediata' then least(pr.stock, 99)
          else 0
        end
      ) order by pr.id)
      from public.presentaciones pr
      where pr.producto_id = catalogo.producto_id and pr.activo
    )
  )
  from public.obtener_catalogo_publico() catalogo
  where catalogo.producto_id = obtener_producto_publico.producto_id;
$$;

revoke all on function public.obtener_producto_publico(integer) from public, anon, authenticated;
grant execute on function public.obtener_producto_publico(integer) to anon, authenticated;
