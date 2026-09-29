begin;
set local search_path = public, extensions;

select plan(26);

select ok((select relrowsecurity from pg_class where oid = 'public.categorias'::regclass), 'RLS sigue activo en categorias');
select ok((select relrowsecurity from pg_class where oid = 'public.productos'::regclass), 'RLS sigue activo en productos');
select ok(not has_table_privilege('anon', 'public.categorias', 'SELECT'), 'anon no lee categorias directamente');
select ok(not has_table_privilege('anon', 'public.productos', 'SELECT'), 'anon no lee productos directamente');
select ok(not has_table_privilege('anon', 'public.presentaciones', 'SELECT'), 'anon no lee presentaciones directamente');
select ok(not has_table_privilege('anon', 'public.imagenes_producto', 'SELECT'), 'anon no lee imagenes directamente');
select ok(not has_table_privilege('anon', 'public.categorias', 'INSERT'), 'anon no inserta categorias');
select ok(not has_table_privilege('anon', 'public.productos', 'UPDATE'), 'anon no actualiza productos');
select ok(not has_table_privilege('anon', 'public.presentaciones', 'DELETE'), 'anon no elimina presentaciones');
select has_function('public', 'obtener_catalogo_publico', array[]::text[], 'Existe la RPC del catalogo');
select has_function('public', 'obtener_producto_publico', array['integer']::text[], 'Existe la RPC del detalle');
select ok(has_function_privilege('anon', 'public.obtener_catalogo_publico()', 'EXECUTE'), 'anon ejecuta la RPC del catalogo');
select ok(has_function_privilege('anon', 'public.obtener_producto_publico(integer)', 'EXECUTE'), 'anon ejecuta la RPC del detalle');

set local role postgres;

insert into public.categorias (nombre) values ('Publica activa'), ('Publica inactiva');
update public.categorias set activo = false where nombre = 'Publica inactiva';

insert into public.productos (categoria_id, nombre, descripcion, destacado)
select id, 'Aroma publico', 'Descripcion publica', true from public.categorias where nombre = 'Publica activa';

insert into public.productos (categoria_id, nombre, descripcion)
select id, 'Solo no disponible', 'Sin presentaciones solicitables' from public.categorias where nombre = 'Publica activa';

insert into public.productos (categoria_id, nombre, descripcion)
select id, 'Categoria oculta', 'Categoria inactiva' from public.categorias where nombre = 'Publica inactiva';

insert into public.productos (categoria_id, nombre, descripcion)
select id, 'Producto sin imagen', 'No publicable' from public.categorias where nombre = 'Publica activa';

insert into public.productos (categoria_id, nombre, descripcion, activo)
select id, 'Producto inactivo', 'No publicable', false from public.categorias where nombre = 'Publica activa';

insert into public.productos (categoria_id, nombre, descripcion)
select id, 'Producto sin presentacion', 'No publicable' from public.categorias where nombre = 'Publica activa';

insert into public.presentaciones (producto_id, etiqueta, precio_normal, precio_promocional, stock, modo_disponibilidad, activo)
select id, '100 ml disponible', 70000, 60000, 3, 'venta_inmediata', true from public.productos where nombre = 'Aroma publico'
union all
select id, '50 ml pedido', 80000, 50000, 0, 'bajo_pedido', true from public.productos where nombre = 'Aroma publico'
union all
select id, '30 ml agotado', 40000, null, 0, 'venta_inmediata', true from public.productos where nombre = 'Aroma publico'
union all
select id, '20 ml inactiva', 10000, null, 1, 'venta_inmediata', false from public.productos where nombre = 'Aroma publico'
union all
select id, 'Unica activa', 90000, null, 0, 'no_disponible', true from public.productos where nombre = 'Solo no disponible'
union all
select id, 'Sin imagen', 25000, null, 1, 'venta_inmediata', true from public.productos where nombre = 'Producto sin imagen'
union all
select id, 'Inactivo', 25000, null, 1, 'venta_inmediata', true from public.productos where nombre = 'Producto inactivo';

insert into public.imagenes_producto (producto_id, url, identificador_externo, texto_alternativo, posicion)
select id, 'https://example.test/aroma.webp', 'productos/prueba/aroma.webp', null, 0 from public.productos where nombre = 'Aroma publico'
union all
select id, 'https://example.test/no-disponible.webp', 'productos/prueba/no-disponible.webp', 'Producto sin disponibilidad', 0 from public.productos where nombre = 'Solo no disponible'
union all
select id, 'https://example.test/oculto.webp', 'productos/prueba/oculto.webp', null, 0 from public.productos where nombre = 'Categoria oculta'
union all
select id, 'https://example.test/inactivo.webp', 'productos/prueba/inactivo.webp', null, 0 from public.productos where nombre = 'Producto inactivo';

select set_config('test.public_product_id', (select id::text from public.productos where nombre = 'Aroma publico'), true);
set local role anon;

select throws_ok($$select * from public.productos$$, '42501', null, 'anon recibe rechazo al leer tablas directamente');
select results_eq(
  $$select nombre from public.obtener_catalogo_publico() where nombre in ('Aroma publico', 'Solo no disponible') order by nombre$$,
  $$values ('Aroma publico'::text), ('Solo no disponible'::text)$$,
  'solo aparecen productos publicables de categorias activas'
);
select results_eq(
  $$select disponibilidad from public.obtener_catalogo_publico() where nombre = 'Aroma publico'$$,
  $$values ('Disponible'::text)$$,
  'la disponibilidad disponible tiene precedencia'
);
select results_eq(
  $$select precio_referencia from public.obtener_catalogo_publico() where nombre = 'Aroma publico'$$,
  $$values (50000::integer)$$,
  'el precio minimo solicitable usa precio promocional efectivo'
);
select results_eq(
  $$select precio_normal_referencia from public.obtener_catalogo_publico() where nombre = 'Aroma publico'$$,
  $$values (80000::integer)$$,
  'el catalogo conserva el precio normal de la presentacion que fija el precio promocional de referencia'
);
select results_eq(
  $$select precio_desde from public.obtener_catalogo_publico() where nombre = 'Aroma publico'$$,
  $$values (true)$$,
  'marca desde cuando hay precios solicitables distintos'
);
select results_eq(
  $$select disponibilidad from public.obtener_catalogo_publico() where nombre = 'Solo no disponible'$$,
  $$values ('No disponible'::text)$$,
  'el producto sin presentaciones solicitables sigue publicable'
);
select results_eq(
  $$select precio_referencia from public.obtener_catalogo_publico() where nombre = 'Solo no disponible'$$,
  $$values (90000::integer)$$,
  'usa el menor precio activo como alternativa cuando ninguna presentacion admite solicitud'
);
select results_eq(
  $$select destacado from public.obtener_catalogo_publico() where nombre = 'Aroma publico'$$,
  $$values (true)$$,
  'devuelve seleccion manual de destacado solo para producto publicable'
);
select is(
  public.obtener_producto_publico(999999), null::jsonb,
  'el detalle no devuelve productos desconocidos'
);
select results_eq(
  $$select jsonb_array_length(public.obtener_producto_publico(current_setting('test.public_product_id')::integer)->'presentaciones')$$,
  $$values (3)$$,
  'el detalle devuelve presentaciones activas y excluye las inactivas'
);
select ok(
  not (public.obtener_producto_publico(current_setting('test.public_product_id')::integer) ? 'stock')
    and not ((public.obtener_producto_publico(current_setting('test.public_product_id')::integer)->'presentaciones'->0) ? 'stock'),
  'no expone el stock numerico del producto ni de sus presentaciones'
);
select ok(
  not (public.obtener_producto_publico(current_setting('test.public_product_id')::integer) ? 'referencia'),
  'el detalle publico no devuelve referencia interna'
);

select * from finish();
rollback;
