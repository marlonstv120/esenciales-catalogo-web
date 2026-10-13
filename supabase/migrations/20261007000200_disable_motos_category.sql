-- Migration: 20261007000200_disable_motos_category.sql
-- VEHIMARCAS no comercializa motocicletas: se desactiva la categoria "Motos"
-- y sus productos y presentaciones para ocultarlos del catalogo publico.
-- Se desactiva (no se elimina) para conservar el historial de solicitudes existente.

update public.categorias
set activo = false
where lower(nombre) = 'motos' and activo;

update public.productos
set activo = false
where categoria_id in (
  select id from public.categorias where lower(nombre) = 'motos'
) and activo;

update public.presentaciones
set activo = false
where producto_id in (
  select p.id
  from public.productos p
  join public.categorias c on c.id = p.categoria_id
  where lower(c.nombre) = 'motos'
) and activo;