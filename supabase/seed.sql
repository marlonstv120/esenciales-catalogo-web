insert into public.categorias (nombre)
select categoria.nombre
from (
  values
    ('Perfumes / Lociones'::text),
    ('Splash'::text),
    ('Cremas'::text),
    ('Humidificadores'::text),
    ('Otros productos'::text)
) as categoria(nombre)
where not exists (
  select 1
  from public.categorias existente
  where lower(existente.nombre) = lower(categoria.nombre)
);

-- Fichas candidatas: precios COP y stock ficticio aportados para desarrollo.
-- Todas las fichas y presentaciones permanecen inactivas hasta su validación.
drop table if exists pg_temp.importacion_lociones;
create temporary table importacion_lociones as
with fichas(nombre, descripcion, marca, genero, clasificacion) as (
  values
    ('212 CH', 'Fragancia masculina de perfil almizclado, amaderado y floral, con apertura verde y cítrica, corazón especiado y fondo de almizcle, sándalo e incienso.', 'Carolina Herrera', 'hombre', 'uno_a_uno'),
    ('212 Men', 'Fragancia masculina fresca y urbana, con matices verdes y cítricos, un corazón aromático y especiado y un fondo amaderado y almizclado.', 'Carolina Herrera', 'hombre', 'original'),
    ('212 Sexy', 'Fragancia masculina de carácter especiado y cálido, descrita con cítricos, pimienta y cardamomo sobre vainilla, maderas, almizcle y ámbar.', 'Carolina Herrera', 'hombre', 'uno_a_uno'),
    ('212 VIP Black Carolina Herrera', 'Fragancia masculina aromática, con absenta, anís e hinojo, un corazón de lavanda y un fondo cálido de vainilla oscura y almizcle.', 'Carolina Herrera', 'hombre', 'uno_a_uno'),
    ('212 VIP Rosé', 'Fragancia femenina floral y frutal, con champagne rosé y pimienta rosa, corazón de rosa y flor de durazno y fondo de almizcle y maderas.', 'Carolina Herrera', 'mujer', 'original'),
    ('273', 'Fragancia femenina oriental y floral, con una salida de flores y frutas, corazón de chabacano e ylang-ylang y fondo ambarado, especiado y amaderado.', 'Fred Hayman', 'mujer', 'uno_a_uno'),
    ('360', 'Fragancia masculina fresca y aromática, con matices cítricos y frutales, acompañados de lavanda, sándalo, maderas y almizcle.', 'Perry Ellis', 'hombre', 'uno_a_uno'),
    ('360° Red for Men', 'Fragancia masculina cítrica, limpia y acuática, con matices especiados, aromáticos, amaderados y almizclados.', 'Perry Ellis', 'hombre', 'uno_a_uno'),
    ('9 Pm', 'Fragancia masculina de perfil especiado y frutal, con manzana, canela, lavanda y bergamota sobre vainilla, haba tonka, ámbar y pachulí.', 'Afnan', 'hombre', 'uno_a_uno'),
    ('9 pm Night out', 'Fragancia unisex de perfil especiado, ambarado y frutal, con pitahaya, manzana y bergamota, corazón de toffee, gamuza y cardamomo y fondo cálido y amaderado.', 'Afnan', 'unisex', 'uno_a_uno'),
    ('9am Dive', 'Fragancia unisex fresca y aromática, con limón, menta, grosellas negras y pimienta rosa, seguida de manzana, cedro, incienso, jengibre y maderas.', 'Afnan', 'unisex', 'uno_a_uno'),
    ('9Pm', 'Fragancia masculina especiada y frutal, con manzana, canela, lavanda y bergamota, corazón floral y fondo de vainilla, haba tonka, ámbar y pachulí.', 'Afnan', 'hombre', 'original'),
    ('9PM Rebel', 'Fragancia unisex de perfil frutal y amaderado, con piña, manzana y mandarina, corazón de musgo, cedro y vainilla y fondo de ámbar, caramelo y almizcle.', 'Afnan', 'unisex', 'uno_a_uno'),
    ('Acqua di Gio Profondo', 'Fragancia masculina fresca y acuática, con notas marinas, mandarina verde y bergamota, corazón de romero, lavanda y ciprés y fondo de pachulí y almizcle.', 'Giorgio Armani', 'hombre', 'uno_a_uno'),
    ('Acqua di Giò Profumo', 'Fragancia masculina aromática y acuática, con notas marinas y bergamota, corazón de romero, salvia y geranio y fondo de incienso y pachulí.', 'Giorgio Armani', 'hombre', 'uno_a_uno'),
    ('Afnan 9 PM Night', 'Fragancia unisex especiada, ambarada y frutal, con pitahaya, lavanda, manzana y bergamota, corazón de toffee, gamuza y cardamomo y fondo cálido y amaderado.', 'Afnan', 'unisex', 'original'),
    ('Amber Oud Aqua Dubai', 'Fragancia unisex aromática y frutal, con bergamota, notas verdes y mandarina, corazón de melón, piña, ámbar y grosellas negras y fondo almizclado y avainillado.', 'Al Haramain Perfumes', 'unisex', 'original'),
    ('Amor Amor', 'Fragancia femenina floral y frutal, con grosellas negras y cítricos, corazón de rosa, jazmín y flores blancas y fondo de vainilla, tonka, almizcle, ámbar y cedro.', 'Cacharel', 'mujer', 'uno_a_uno'),
    ('Ange ou démon', 'Fragancia femenina floral y ambarada, con tomillo blanco, mandarina y azafrán, corazón de lirio e ylang-ylang y fondo de madera de roble y haba tonka.', 'Givenchy', 'mujer', 'uno_a_uno'),
    ('Ari', 'Fragancia femenina floral, frutal y gourmand, con pera, toronja y frambuesa, corazón de rosa y orquídea de vainilla y fondo de malvavisco, almizcle y maderas.', 'Ariana Grande', 'mujer', 'uno_a_uno'),
    ('Arrurú', 'Colonia de perfil dulce, suave y fresco, propuesta para acompañar el uso cotidiano con un aroma delicado.', 'Arrurrú Naturals', 'unisex', 'original'),
    ('Art Of Universe', 'Fragancia unisex cítrica y aromática, con mandarina, jengibre, bergamota y menta, corazón de pera y flor de azahar y fondo de almizcle, ámbar y cedro.', 'Lattafa Pride', 'unisex', 'original')
), datos(nombre, clasificacion, familia_olfativa, precio_normal, stock) as (
  values
    ('212 CH', 'uno_a_uno', 'Almizcle Amaderado Floral', 100000, 7),
    ('212 Men', 'original', 'Almizcle Amaderado Floral', 302562, 3),
    ('212 Sexy', 'uno_a_uno', 'Ambarada Especiada', 100000, 11),
    ('212 VIP Black Carolina Herrera', 'uno_a_uno', 'Aromática Fougère', 100000, 5),
    ('212 VIP Rosé', 'original', 'Floral Frutal', 80000, 9),
    ('273', 'uno_a_uno', 'Oriental Floral', 80000, 6),
    ('360', 'uno_a_uno', 'Aromática', 100000, 12),
    ('360° Red for Men', 'uno_a_uno', 'Oriental Especiada', 80000, 8),
    ('9 Pm', 'uno_a_uno', 'Oriental Vainilla', 90000, 4),
    ('9 pm Night out', 'uno_a_uno', 'Oriental Especiada', 130000, 10),
    ('9am Dive', 'uno_a_uno', 'Aromática Acuática', 90000, 13),
    ('9Pm', 'original', 'Oriental Vainilla', 196000, 2),
    ('9PM Rebel', 'uno_a_uno', 'Aromática Frutal', 90000, 14),
    ('Acqua di Gio Profondo', 'uno_a_uno', 'Aromática Fougère', 90000, 7),
    ('Acqua di Giò Profumo', 'uno_a_uno', 'Aromática Acuática', 100000, 5),
    ('Afnan 9 PM Night', 'original', 'Oriental Especiada', 276000, 9),
    ('Amber Oud Aqua Dubai', 'original', 'Aromática Frutal', 328571, 6),
    ('Amor Amor', 'uno_a_uno', 'Floral Frutal', 100000, 11),
    ('Ange ou démon', 'uno_a_uno', 'Floral Ambarada', 100000, 8),
    ('Ari', 'uno_a_uno', 'Floral Frutal Gourmand', 108000, 12),
    ('Arrurú', 'original', 'Floral Fresca', 15000, 5),
    ('Art Of Universe', 'original', 'Cítrica Aromática', 271429, 10)
)
select c.id as categoria_id, f.*, d.familia_olfativa, d.precio_normal, d.stock
from fichas f
join public.categorias c on lower(c.nombre) = lower('Perfumes / Lociones')
join datos d on lower(d.nombre) = lower(f.nombre) and d.clasificacion = f.clasificacion;

-- Match on normalized name, brand and classification; abort on ambiguous matches.
do $$
begin
  if exists (
    select 1 from importacion_lociones f
    join public.productos p on lower(btrim(p.nombre)) = lower(btrim(f.nombre))
      and lower(btrim(p.marca)) = lower(btrim(f.marca)) and p.clasificacion = f.clasificacion
    group by f.nombre, f.marca, f.clasificacion having count(*) > 1
  ) then
    raise exception 'Coincidencias ambiguas en la importación de lociones';
  end if;
end;
$$;

update public.productos p
set categoria_id = f.categoria_id, nombre = f.nombre, descripcion = f.descripcion,
    marca = f.marca, genero = f.genero, clasificacion = f.clasificacion,
    familia_olfativa = f.familia_olfativa, destacado = false, activo = false
from importacion_lociones f
where lower(btrim(p.nombre)) = lower(btrim(f.nombre))
  and lower(btrim(p.marca)) = lower(btrim(f.marca)) and p.clasificacion = f.clasificacion
  and (p.categoria_id, p.nombre, p.descripcion, p.marca, p.genero, p.familia_olfativa, p.destacado, p.activo)
    is distinct from (f.categoria_id, f.nombre, f.descripcion, f.marca, f.genero, f.familia_olfativa, false, false);

insert into public.productos (categoria_id, nombre, descripcion, marca, genero, clasificacion, familia_olfativa, destacado, activo)
select f.categoria_id, f.nombre, f.descripcion, f.marca, f.genero, f.clasificacion, f.familia_olfativa, false, false
from importacion_lociones f
where not exists (
  select 1 from public.productos p
  where lower(btrim(p.nombre)) = lower(btrim(f.nombre))
    and lower(btrim(p.marca)) = lower(btrim(f.marca)) and p.clasificacion = f.clasificacion
);

create temporary table importacion_presentaciones as
select p.id as producto_id,
  case when f.nombre = 'Arrurú' then '1 onza' else 'Tamaño por confirmar' end as etiqueta,
  f.precio_normal, f.stock
from importacion_lociones f
join public.productos p on lower(btrim(p.nombre)) = lower(btrim(f.nombre))
  and lower(btrim(p.marca)) = lower(btrim(f.marca)) and p.clasificacion = f.clasificacion
union all
select p.id, '2 onzas', 28000, 9
from public.productos p
join importacion_lociones f on f.nombre = 'Arrurú' and p.nombre = f.nombre and p.marca = f.marca and p.clasificacion = f.clasificacion;

update public.presentaciones pr
set precio_normal = f.precio_normal, precio_promocional = null, stock = f.stock,
    modo_disponibilidad = 'venta_inmediata', activo = false
from importacion_presentaciones f
where pr.producto_id = f.producto_id and lower(btrim(pr.etiqueta)) = lower(btrim(f.etiqueta))
  and (pr.precio_normal, pr.precio_promocional, pr.stock, pr.modo_disponibilidad, pr.activo)
    is distinct from (f.precio_normal, null::integer, f.stock, 'venta_inmediata', false);

insert into public.presentaciones (producto_id, etiqueta, precio_normal, stock, modo_disponibilidad, activo)
select f.producto_id, f.etiqueta, f.precio_normal, f.stock, 'venta_inmediata', false
from importacion_presentaciones f
where not exists (
  select 1 from public.presentaciones pr
  where pr.producto_id = f.producto_id and lower(btrim(pr.etiqueta)) = lower(btrim(f.etiqueta))
);

drop table importacion_presentaciones;
drop table importacion_lociones;
