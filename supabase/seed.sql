-- Seed data para VEHIMARCAS: Categorías de vehículos e inventario inicial reproducibles.

insert into public.categorias (nombre)
select categoria.nombre
from (
  values
    ('SUV & Camionetas'::text),
    ('Automóviles'::text),
    ('Pick-ups & 4x4'::text)
) as categoria(nombre)
where not exists (
  select 1
  from public.categorias existente
  where lower(existente.nombre) = lower(categoria.nombre)
);

drop table if exists pg_temp.importacion_vehiculos;
create temporary table importacion_vehiculos as
with fichas(nombre, descripcion, marca, genero, clasificacion, modelo) as (
  values
    ('Toyota Hilux SRX 4x4', 'Camioneta Pick-up robusta con motor 2.8L Diesel Turbo, tracción 4x4 con reductora, cojinería en cuero y pantalla táctil.', 'Toyota', '2024', 'seminuevo', 'Hilux SRX 2.8L'),
    ('Chevrolet Onix Premier 1.0T', 'Sedán moderno y eficiente con motor 1.0L Turbo, 6 airbags, asistente de parqueo semiautónomo y conectividad Wi-Fi.', 'Chevrolet', '2023', 'usado', 'Onix Premier 1.0T'),
    ('Mazda CX-5 Grand Touring LX', 'SUV premium con sistema i-Activ AWD, motor 2.5L Skyactiv-G, sonido Bose de 10 parlantes y sunroof eléctrico.', 'Mazda', '2024', 'seminuevo', 'CX-5 GT LX 2.5L'),
    ('Ford Ranger Wildtrak V6 4x4', 'Pick-up de alta gama con motor 3.0L V6 Turbo Diesel, transmisión automática de 10 velocidades y tracción 4WD inteligente.', 'Ford', '2025', 'nuevo', 'Ranger Wildtrak V6'),
    ('BMW X5 xDrive40i M Sport', 'SUV ejecutivo de lujo con motor 3.0L TwinPower Turbo de 6 cilindros, paquete deportivo M y suspensión neumática adaptativa.', 'BMW', '2023', 'usado', 'X5 xDrive40i M Sport'),
    ('Mercedes-Benz C200 Exclusive', 'Sedán de lujo refinado con motor 1.5L Turbo Mild-Hybrid EQ Boost, paquete de luces ambiente de 64 colores y MBUX de última generación.', 'Mercedes-Benz', '2023', 'seminuevo', 'C200 Exclusive'),
    ('Renault Duster Iconic 1.3T 4x4', 'Camioneta SUV 4x4 eficiente con motor 1.3L Turbo desarrollado con Mercedes-Benz, caja mecánica de 6 marchas y control de descenso.', 'Renault', '2024', 'usado', 'Duster Iconic 1.3T')
), datos(nombre, clasificacion, precio_normal, stock, etiqueta) as (
  values
    ('Toyota Hilux SRX 4x4', 'seminuevo', 185000000, 1, 'Automática 6 Vel 4x4'),
    ('Chevrolet Onix Premier 1.0T', 'usado', 68000000, 1, 'Automática 6 Vel'),
    ('Mazda CX-5 Grand Touring LX', 'seminuevo', 135000000, 1, 'Automática AWD 6 Vel'),
    ('Ford Ranger Wildtrak V6 4x4', 'nuevo', 215000000, 1, 'Automática 10 Vel 4x4'),
    ('BMW X5 xDrive40i M Sport', 'usado', 340000000, 1, 'Steptronic 8 Vel AWD'),
    ('Mercedes-Benz C200 Exclusive', 'seminuevo', 210000000, 1, '9G-TRONIC 9 Vel'),
    ('Renault Duster Iconic 1.3T 4x4', 'usado', 89000000, 1, 'Mecánica 6 Vel 4x4')
)
select c.id as categoria_id, f.*, d.precio_normal, d.stock, d.etiqueta
from fichas f
join public.categorias c on lower(c.nombre) = lower(
  case 
    when f.marca in ('Toyota', 'Ford') and f.nombre like '%Hilux%' or f.nombre like '%Ranger%' then 'Pick-ups & 4x4'
    when f.marca in ('Chevrolet', 'Mercedes-Benz') then 'Automóviles'
    else 'SUV & Camionetas'
  end
)
join datos d on lower(d.nombre) = lower(f.nombre);

insert into public.productos (categoria_id, nombre, descripcion, marca, genero, clasificacion, modelo, destacado, activo)
select f.categoria_id, f.nombre, f.descripcion, f.marca, f.genero, f.clasificacion, f.modelo, true, true
from importacion_vehiculos f
where not exists (
  select 1 from public.productos p
  where lower(btrim(p.nombre)) = lower(btrim(f.nombre))
);

insert into public.presentaciones (producto_id, etiqueta, precio_normal, stock, modo_disponibilidad, activo)
select p.id, f.etiqueta, f.precio_normal, f.stock, 'venta_inmediata', true
from importacion_vehiculos f
join public.productos p on lower(btrim(p.nombre)) = lower(btrim(f.nombre))
where not exists (
  select 1 from public.presentaciones pr
  where pr.producto_id = p.id and lower(btrim(pr.etiqueta)) = lower(btrim(f.etiqueta))
);

drop table importacion_vehiculos;
