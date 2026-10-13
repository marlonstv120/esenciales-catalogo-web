-- Migration: 20261007000100_create_vehiculos_schema.sql
-- Adaptación del modelo de catálogo a vista y tabla de vehículos para VEHIMARCAS.

create or replace view public.vehiculos as
select 
  p.id,
  coalesce(p.marca, 'VEHIMARCAS del Valle') as marca,
  coalesce(p.familia_olfativa, p.nombre) as modelo,
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
