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
        'texto_alternativo', imagen.texto_alternativo
      ) order by imagen.posicion)
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
