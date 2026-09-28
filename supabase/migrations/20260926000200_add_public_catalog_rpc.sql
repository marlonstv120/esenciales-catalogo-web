create function public.obtener_catalogo_publico()
returns table (
  categoria_id integer,
  categoria_nombre text,
  producto_id integer,
  nombre text,
  descripcion text,
  marca text,
  genero text,
  familia_olfativa text,
  referencia text,
  clasificacion text,
  destacado boolean,
  imagen_url text,
  texto_alternativo text,
  precio_referencia integer,
  precio_desde boolean,
  disponibilidad text
)
language sql
stable
security definer
set search_path = ''
as $$
  with publicables as (
    select
      p.id,
      p.categoria_id,
      c.nombre as categoria_nombre,
      p.nombre,
      p.descripcion,
      p.marca,
      p.genero,
      p.familia_olfativa,
      p.referencia,
      p.clasificacion,
      p.destacado,
      imagen.url as imagen_url,
      coalesce(imagen.texto_alternativo, p.nombre) as texto_alternativo,
      precios.precio_referencia,
      precios.precio_desde,
      case
        when exists (
          select 1 from public.presentaciones pr
          where pr.producto_id = p.id and pr.activo
            and pr.modo_disponibilidad = 'venta_inmediata' and pr.stock > 0
        ) then 'Disponible'
        when exists (
          select 1 from public.presentaciones pr
          where pr.producto_id = p.id and pr.activo and pr.modo_disponibilidad = 'bajo_pedido'
        ) then 'Bajo pedido'
        when exists (
          select 1 from public.presentaciones pr
          where pr.producto_id = p.id and pr.activo
            and pr.modo_disponibilidad = 'venta_inmediata' and pr.stock = 0
        ) then 'Agotado'
        else 'No disponible'
      end as disponibilidad
    from public.productos p
    join public.categorias c on c.id = p.categoria_id and c.activo
    join lateral (
      select i.url, i.texto_alternativo
      from public.imagenes_producto i
      where i.producto_id = p.id
      order by i.posicion, i.id
      limit 1
    ) imagen on true
    cross join lateral (
      select
      coalesce(
        min(coalesce(pr.precio_promocional, pr.precio_normal)) filter (
            where pr.modo_disponibilidad = 'bajo_pedido'
              or (pr.modo_disponibilidad = 'venta_inmediata' and pr.stock > 0)
          ),
          min(coalesce(pr.precio_promocional, pr.precio_normal))
        )::integer as precio_referencia,
        case
          when count(distinct coalesce(pr.precio_promocional, pr.precio_normal)) filter (
            where pr.modo_disponibilidad = 'bajo_pedido'
              or (pr.modo_disponibilidad = 'venta_inmediata' and pr.stock > 0)
          ) > 0
          then count(distinct coalesce(pr.precio_promocional, pr.precio_normal)) filter (
            where pr.modo_disponibilidad = 'bajo_pedido'
              or (pr.modo_disponibilidad = 'venta_inmediata' and pr.stock > 0)
          ) > 1
          else count(distinct coalesce(pr.precio_promocional, pr.precio_normal)) > 1
        end as precio_desde
      from public.presentaciones pr
      where pr.producto_id = p.id and pr.activo
    ) precios
    where p.activo
      and p.nombre <> ''
      and p.descripcion <> ''
      and exists (
        select 1 from public.presentaciones pr
        where pr.producto_id = p.id and pr.activo and pr.precio_normal > 0
      )
  )
  select
    c.id,
    c.nombre,
    publicables.id,
    publicables.nombre,
    publicables.descripcion,
    publicables.marca,
    publicables.genero,
    publicables.familia_olfativa,
    publicables.referencia,
    publicables.clasificacion,
    publicables.destacado,
    publicables.imagen_url,
    publicables.texto_alternativo,
    publicables.precio_referencia,
    publicables.precio_desde,
    publicables.disponibilidad
  from public.categorias c
  left join publicables on publicables.categoria_id = c.id
  where c.activo
  order by c.id, publicables.nombre;
$$;

revoke all on function public.obtener_catalogo_publico() from public, anon, authenticated;
grant execute on function public.obtener_catalogo_publico() to anon, authenticated;

create function public.obtener_producto_publico(producto_id integer)
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
    'referencia', catalogo.referencia,
    'clasificacion', catalogo.clasificacion,
    'destacado', catalogo.destacado,
    'imagen_url', catalogo.imagen_url,
    'texto_alternativo', catalogo.texto_alternativo,
    'precio_referencia', catalogo.precio_referencia,
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
