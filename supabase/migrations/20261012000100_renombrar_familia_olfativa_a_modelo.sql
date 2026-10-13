-- Renombra la columna heredada de la era de perfumes `productos.familia_olfativa`
-- a `modelo`, alineando su nombre con el catálogo de vehículos.
--
-- No se edita la migración original que la creó (ni las que la referencian) para
-- preservar la reproducibilidad del historial. Como la vista y las funciones
-- públicas dependen del nombre anterior, aquí se recrean con la definición
-- vigente, incluida la portada del catálogo que prioriza imágenes sobre videos
-- (aportada por 20261011000100).

alter table public.productos rename column familia_olfativa to modelo;
alter table public.productos rename constraint productos_familia_olfativa_valida to productos_modelo_valido;

-- Las funciones que declaran una columna de salida con nombre cambian al
-- renombrar el campo, por lo que se recrean (no basta con `create or replace`).
drop function if exists public.buscar_catalogo_publico(text, integer, text[], text[], integer, integer);
drop function if exists public.obtener_producto_publico(integer);
drop function if exists public.obtener_catalogo_publico();

create function public.obtener_catalogo_publico()
returns table (
  categoria_id integer,
  categoria_nombre text,
  producto_id integer,
  nombre text,
  descripcion text,
  marca text,
  genero text,
  modelo text,
  clasificacion text,
  destacado boolean,
  imagen_url text,
  texto_alternativo text,
  precio_referencia integer,
  precio_normal_referencia integer,
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
      p.modelo,
      p.clasificacion,
      p.destacado,
      imagen.url as imagen_url,
      coalesce(imagen.texto_alternativo, p.nombre) as texto_alternativo,
      precios.precio_referencia,
      precios.precio_normal_referencia,
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
      order by (i.tipo = 'video'), i.posicion, i.id
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
        coalesce(
          (array_agg(pr.precio_normal order by coalesce(pr.precio_promocional, pr.precio_normal), pr.id) filter (
            where pr.modo_disponibilidad = 'bajo_pedido'
              or (pr.modo_disponibilidad = 'venta_inmediata' and pr.stock > 0)
          ))[1],
          (array_agg(pr.precio_normal order by coalesce(pr.precio_promocional, pr.precio_normal), pr.id))[1]
        )::integer as precio_normal_referencia,
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
      and not (
        exists (
          select 1 from public.presentaciones pr
          where pr.producto_id = p.id and pr.activo and pr.modo_disponibilidad = 'vendido'
        )
        and not exists (
          select 1 from public.presentaciones pr
          where pr.producto_id = p.id and pr.activo
            and (pr.modo_disponibilidad = 'bajo_pedido'
              or (pr.modo_disponibilidad = 'venta_inmediata' and pr.stock > 0))
        )
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
    publicables.modelo,
    publicables.clasificacion,
    publicables.destacado,
    publicables.imagen_url,
    publicables.texto_alternativo,
    publicables.precio_referencia,
    publicables.precio_normal_referencia,
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
    'modelo', catalogo.modelo,
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

create function public.buscar_catalogo_publico(
  busqueda text default null, categoria integer default null,
  generos text[] default null, clasificaciones text[] default null,
  precio_minimo integer default null, precio_maximo integer default null
)
returns table (
  categoria_id integer,
  categoria_nombre text,
  producto_id integer,
  nombre text,
  descripcion text,
  marca text,
  genero text,
  modelo text,
  clasificacion text,
  destacado boolean,
  imagen_url text,
  texto_alternativo text,
  precio_referencia integer,
  precio_normal_referencia integer,
  precio_desde boolean,
  disponibilidad text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (categoria is not null and categoria < 1)
    or (precio_minimo is not null and precio_minimo < 1)
    or (precio_maximo is not null and precio_maximo < 1)
    or (precio_minimo is not null and precio_maximo is not null and precio_minimo > precio_maximo)
    or (generos is not null and exists (select 1 from unnest(generos) g where g is null or btrim(g) = ''))
    or (clasificaciones is not null and exists (select 1 from unnest(clasificaciones) c where c is null or btrim(c) = ''))
  then
    raise exception 'Filtros invalidos' using errcode = '22023';
  end if;

  return query
  select catalogo.*
  from public.obtener_catalogo_publico() catalogo
  where (categoria is null or catalogo.categoria_id = categoria)
    and (nullif(btrim(busqueda), '') is null or
      translate(lower(catalogo.nombre), 'áéíóúüñ', 'aeiouun') like
      '%' || replace(replace(replace(translate(lower(btrim(busqueda)), 'áéíóúüñ', 'aeiouun'), '\', '\\'), '%', '\%'), '_', '\_') || '%' escape '\')
    and (generos is null or cardinality(generos) = 0 or catalogo.genero = any(generos))
    and (clasificaciones is null or cardinality(clasificaciones) = 0 or catalogo.clasificacion = any(clasificaciones))
    and ((precio_minimo is null and precio_maximo is null) or catalogo.producto_id is not null and exists (
      select 1 from public.presentaciones pr
      where pr.producto_id = catalogo.producto_id and pr.activo
        and (pr.modo_disponibilidad = 'bajo_pedido' or (pr.modo_disponibilidad = 'venta_inmediata' and pr.stock > 0))
        and (precio_minimo is null or coalesce(pr.precio_promocional, pr.precio_normal) >= precio_minimo)
        and (precio_maximo is null or coalesce(pr.precio_promocional, pr.precio_normal) <= precio_maximo)
    ));
end;
$$;

revoke all on function public.buscar_catalogo_publico(text,integer,text[],text[],integer,integer) from public, anon, authenticated;
grant execute on function public.buscar_catalogo_publico(text,integer,text[],text[],integer,integer) to anon, authenticated;

-- Vista de compatibilidad para el entorno local. PostgreSQL actualiza la vista al
-- renombrar la columna, pero se recrea de forma explícita con el nombre nuevo.
create or replace view public.vehiculos as
select
  p.id,
  coalesce(p.marca, 'VEHIMARCAS del Valle') as marca,
  coalesce(p.modelo, p.nombre) as modelo,
  cast(coalesce(nullif(regexp_replace(p.genero, '\D', '', 'g'), ''), '2024') as integer) as anio,
  coalesce(precios.precio, 50000000) as precio,
  0 as kilometraje,
  coalesce(pr.etiqueta, 'Automática') as transmision,
  'Gasolina'::text as combustible,
  coalesce(img.urls, array[]::text[]) as imagenes_url,
  coalesce(p.clasificacion, 'usado') as estado,
  p.creado_en as created_at
from public.productos p
left join lateral (
  select precio_normal as precio, etiqueta
  from public.presentaciones
  where producto_id = p.id and activo
  order by id limit 1
) pr on true
left join lateral (
  select min(precio_normal) as precio from public.presentaciones where producto_id = p.id and activo
) precios on true
left join lateral (
  select array_agg(url order by posicion, id) as urls
  from public.imagenes_producto
  where producto_id = p.id
) img on true;

grant select on public.vehiculos to anon, authenticated;
