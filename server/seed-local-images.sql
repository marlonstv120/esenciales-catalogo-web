-- Imágenes iniciales para el inventario sembrado.
--
-- Las fichas de supabase/seed.sql no traen fotos, y el catálogo público solo
-- muestra vehículos con al menos una imagen. Se asigna una foto de categoría a
-- cada vehículo sembrado para que el catálogo no quede vacío; el administrador
-- puede reemplazarlas desde la galería del panel.

insert into public.imagenes_producto (producto_id, url, identificador_externo, texto_alternativo, posicion)
select p.id, v.url, v.url, p.nombre, 0
from public.productos p
join public.categorias c on c.id = p.categoria_id
join (values
  ('suv & camionetas', '/assets/categories/categoria-suv.jpg'),
  ('sedanes', '/assets/categories/categoria-sedan.jpg'),
  ('pick-ups & 4x4', '/assets/categories/categoria-pickup.jpg'),
  ('hatchbacks & deportivos', '/assets/categories/categoria-sedan.jpg')
) as v(categoria, url) on lower(c.nombre) = v.categoria
where not exists (
  select 1 from public.imagenes_producto i where i.producto_id = p.id
);
