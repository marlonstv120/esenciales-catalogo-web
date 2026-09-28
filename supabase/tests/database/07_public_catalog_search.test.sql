begin;
select plan(13);
select has_function('public', 'buscar_catalogo_publico', array['text','integer','text[]','text[]','integer','integer'], 'RPC filtrada existe');
select ok(has_function_privilege('anon', 'public.buscar_catalogo_publico(text,integer,text[],text[],integer,integer)', 'EXECUTE'), 'anon ejecuta búsqueda');
set local role postgres;
insert into public.categorias (nombre) values ('Filtros prueba');
insert into public.productos (categoria_id, nombre, descripcion, genero, clasificacion)
select id, 'Ámbar', 'Perfume', 'hombre', 'original' from public.categorias where nombre = 'Filtros prueba';
insert into public.productos (categoria_id, nombre, descripcion, genero, clasificacion)
select id, 'Luz', 'Perfume', 'mujer', 'uno_a_uno' from public.categorias where nombre = 'Filtros prueba';
insert into public.presentaciones (producto_id, etiqueta, precio_normal, precio_promocional, stock, modo_disponibilidad, activo)
select id, 'promo', 90000, 70000, 2, 'venta_inmediata', true from public.productos where nombre = 'Ámbar'
union all select id, 'agotado', 15000, null, 0, 'venta_inmediata', true from public.productos where nombre = 'Ámbar'
union all select id, 'inactivo', 10000, null, 2, 'venta_inmediata', false from public.productos where nombre = 'Ámbar'
union all select id, 'pedido', 80000, null, 0, 'bajo_pedido', true from public.productos where nombre = 'Luz';
insert into public.imagenes_producto (producto_id, url, identificador_externo, posicion)
select id, 'https://example.test/' || id || '.webp', 'productos/filtros/' || id || '.webp', 0 from public.productos where nombre in ('Ámbar', 'Luz');
set local role anon;
select results_eq($$select nombre from public.buscar_catalogo_publico('ambar', null, null, null, null, null) where producto_id is not null$$, $$values ('Ámbar'::text)$$, 'nombre sin tildes');
select is((select count(*) from public.buscar_catalogo_publico('%', null, null, null, null, null) where producto_id is not null), 0::bigint, 'comodines en entrada se tratan literalmente');
select results_eq($$select nombre from public.buscar_catalogo_publico(null, null, array['hombre'], array['original'], 70000, 70000) where producto_id is not null$$, $$values ('Ámbar'::text)$$, 'criterios y extremo inclusivo sobre promo');
select is((select count(*) from public.buscar_catalogo_publico(null, null, null, null, 10000, 15000) where producto_id is not null), 0::bigint, 'excluye precios agotados e inactivos');
select results_eq($$select nombre from public.buscar_catalogo_publico(null, null, array['hombre','mujer'], null, null, null) where nombre in ('Ámbar', 'Luz') order by nombre$$, $$values ('Ámbar'::text), ('Luz'::text)$$, 'selecciones múltiples de género');
select results_eq($$select nombre from public.buscar_catalogo_publico(null, (select categoria_id from public.obtener_catalogo_publico() where nombre = 'Luz'), null, null, null, null) where nombre in ('Ámbar', 'Luz') order by nombre$$, $$values ('Ámbar'::text), ('Luz'::text)$$, 'categoría filtra');
select throws_ok($$select * from public.buscar_catalogo_publico(null, null, array['desconocido'], null, null, null)$$, '22023', null, 'género inválido rechazado');
select throws_ok($$select * from public.buscar_catalogo_publico(null, null, null, array['falso'], null, null)$$, '22023', null, 'clasificación inválida rechazada');
select throws_ok($$select * from public.buscar_catalogo_publico(null, null, null, null, 80000, 70000)$$, '22023', null, 'intervalo inválido rechazado');
select throws_ok($$select * from public.buscar_catalogo_publico(null, -1, null, null, null, null)$$, '22023', null, 'categoría inválida rechazada');
select ok(not has_table_privilege('anon', 'public.presentaciones', 'SELECT'), 'anon no lee presentaciones');
select * from finish();
rollback;
