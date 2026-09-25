begin;

select plan(20);

select ok((select relrowsecurity from pg_class where oid = 'public.usuarios_administrativos'::regclass), 'RLS activo en usuarios_administrativos');
select ok((select relrowsecurity from pg_class where oid = 'public.categorias'::regclass), 'RLS activo en categorias');
select ok((select relrowsecurity from pg_class where oid = 'public.productos'::regclass), 'RLS activo en productos');
select ok((select relrowsecurity from pg_class where oid = 'public.presentaciones'::regclass), 'RLS activo en presentaciones');
select ok((select relrowsecurity from pg_class where oid = 'public.imagenes_producto'::regclass), 'RLS activo en imagenes_producto');

select ok(not has_table_privilege('anon', 'public.usuarios_administrativos', 'SELECT'), 'anon no lee administradores');
select ok(not has_table_privilege('anon', 'public.categorias', 'SELECT'), 'anon no lee categorias');
select ok(not has_table_privilege('anon', 'public.productos', 'SELECT'), 'anon no lee productos');
select ok(not has_table_privilege('anon', 'public.presentaciones', 'SELECT'), 'anon no lee presentaciones');
select ok(not has_table_privilege('anon', 'public.imagenes_producto', 'SELECT'), 'anon no lee imagenes');

select ok(not has_table_privilege('authenticated', 'public.usuarios_administrativos', 'SELECT'), 'authenticated no lee administradores por defecto');
select ok(not has_table_privilege('authenticated', 'public.categorias', 'SELECT'), 'authenticated no lee categorias por defecto');
select ok(not has_table_privilege('authenticated', 'public.productos', 'SELECT'), 'authenticated no lee productos por defecto');
select ok(not has_table_privilege('authenticated', 'public.presentaciones', 'SELECT'), 'authenticated no lee presentaciones por defecto');
select ok(not has_table_privilege('authenticated', 'public.imagenes_producto', 'SELECT'), 'authenticated no lee imagenes por defecto');

select ok(not has_table_privilege('anon', 'public.categorias', 'INSERT'), 'anon no crea categorias');
select ok(not has_table_privilege('anon', 'public.productos', 'UPDATE'), 'anon no modifica productos');
select ok(not has_table_privilege('authenticated', 'public.categorias', 'INSERT'), 'authenticated no crea categorias por defecto');
select ok(not has_table_privilege('authenticated', 'public.productos', 'UPDATE'), 'authenticated no modifica productos por defecto');
select ok(not has_table_privilege('authenticated', 'public.imagenes_producto', 'DELETE'), 'authenticated no elimina imagenes por defecto');

select * from finish();
rollback;
