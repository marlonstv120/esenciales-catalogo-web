begin;
set local search_path = public, extensions;
select plan(13);
select has_function('public', 'buscar_catalogo_publico', array['text','integer','text[]','text[]','integer','integer'], 'RPC filtrada existe');
select ok(has_function_privilege('anon', 'public.buscar_catalogo_publico(text,integer,text[],text[],integer,integer)', 'EXECUTE'), 'anon ejecuta búsqueda');
set local role postgres;
insert into public.categorias (nombre) values ('Filtros prueba');
insert into public.productos (categoria_id, nombre, descripcion, genero, clasificacion)
select id, 'Bóxer', 'Automovil urbano', '2024', 'seminuevo' from public.categorias where nombre = 'Filtros prueba';
insert into public.productos (categoria_id, nombre, descripcion, genero, clasificacion)
select id, 'Ranger Raptor', 'Pick-up 4x4', '2023', 'usado' from public.categorias where nombre = 'Filtros prueba';
insert into public.presentaciones (producto_id, etiqueta, precio_normal, precio_promocional, stock, modo_disponibilidad, activo)
select id, 'Automatica', 90000, 70000, 2, 'venta_inmediata', true from public.productos where nombre = 'Bóxer'
union all select id, 'Agotada', 15000, null, 0, 'venta_inmediata', true from public.productos where nombre = 'Bóxer'
union all select id, 'Inactiva', 10000, null, 2, 'venta_inmediata', false from public.productos where nombre = 'Bóxer'
union all select id, 'Mecanica', 80000, null, 0, 'bajo_pedido', true from public.productos where nombre = 'Ranger Raptor';
insert into public.imagenes_producto (producto_id, url, identificador_externo, posicion)
select id, 'https://example.test/' || id || '.webp', 'productos/filtros/' || id || '.webp', 0 from public.productos where nombre in ('Bóxer', 'Ranger Raptor');
set local role anon;
select results_eq($$select nombre from public.buscar_catalogo_publico('boxer', null, null, null, null, null) where producto_id is not null$$, $$values ('Bóxer'::text)$$, 'nombre sin tildes');
select is((select count(*) from public.buscar_catalogo_publico('%', null, null, null, null, null) where producto_id is not null), 0::bigint, 'comodines en entrada se tratan literalmente');
select results_eq($$select nombre from public.buscar_catalogo_publico(null, null, array['2024'], array['seminuevo'], 70000, 70000) where producto_id is not null$$, $$values ('Bóxer'::text)$$, 'criterios de anio y estado con extremo inclusivo sobre promo');
select is((select count(*) from public.buscar_catalogo_publico(null, null, null, null, 10000, 15000) where producto_id is not null), 0::bigint, 'excluye precios agotados e inactivos');
select results_eq($$select nombre from public.buscar_catalogo_publico(null, null, array['2024','2023'], null, null, null) where nombre in ('Bóxer', 'Ranger Raptor') order by nombre$$, $$values ('Bóxer'::text), ('Ranger Raptor'::text)$$, 'selecciones múltiples de anio');
select results_eq($$select nombre from public.buscar_catalogo_publico(null, (select categoria_id from public.obtener_catalogo_publico() where nombre = 'Ranger Raptor'), null, null, null, null) where nombre in ('Bóxer', 'Ranger Raptor') order by nombre$$, $$values ('Bóxer'::text), ('Ranger Raptor'::text)$$, 'categoría filtra');
select throws_ok($$select * from public.buscar_catalogo_publico(null, null, array[''], null, null, null)$$, '22023', null, 'anio vacío rechazado');
select throws_ok($$select * from public.buscar_catalogo_publico(null, null, null, array[''], null, null)$$, '22023', null, 'estado vacío rechazado');
select throws_ok($$select * from public.buscar_catalogo_publico(null, null, null, null, 80000, 70000)$$, '22023', null, 'intervalo inválido rechazado');
select throws_ok($$select * from public.buscar_catalogo_publico(null, -1, null, null, null, null)$$, '22023', null, 'categoría inválida rechazada');
select ok(not has_table_privilege('anon', 'public.presentaciones', 'SELECT'), 'anon no lee presentaciones');
select * from finish();
rollback;