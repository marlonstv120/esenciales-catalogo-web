begin;

select plan(24);

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

select has_function('public', 'es_administrador_activo', array[]::text[], 'Existe la funcion de autorizacion');
select ok(not has_function_privilege('anon', 'public.es_administrador_activo()', 'EXECUTE'), 'anon no ejecuta la funcion');
select ok(has_function_privilege('authenticated', 'public.es_administrador_activo()', 'EXECUTE'), 'authenticated ejecuta la funcion');

select ok(not has_table_privilege('authenticated', 'public.usuarios_administrativos', 'SELECT'), 'authenticated no lee autorizaciones');
select ok(has_table_privilege('authenticated', 'public.categorias', 'SELECT'), 'authenticated consulta categorias sujeto a RLS');
select ok(has_table_privilege('authenticated', 'public.productos', 'SELECT'), 'authenticated consulta productos sujeto a RLS');
select ok(has_table_privilege('authenticated', 'public.presentaciones', 'SELECT'), 'authenticated consulta presentaciones sujeto a RLS');
select ok(has_table_privilege('authenticated', 'public.imagenes_producto', 'SELECT'), 'authenticated consulta imagenes sujeto a RLS');

select ok(not has_table_privilege('anon', 'public.categorias', 'INSERT'), 'anon no crea categorias');
select ok(not has_table_privilege('anon', 'public.productos', 'UPDATE'), 'anon no modifica productos');
select ok(has_table_privilege('authenticated', 'public.categorias', 'INSERT'), 'authenticated crea categorias sujeto a RLS');
select ok(has_table_privilege('authenticated', 'public.productos', 'UPDATE'), 'authenticated modifica productos sujeto a RLS');
select ok(has_table_privilege('authenticated', 'public.presentaciones', 'INSERT'), 'authenticated crea presentaciones sujeto a RLS');
select ok(has_table_privilege('authenticated', 'public.imagenes_producto', 'DELETE'), 'authenticated elimina imagenes sujeto a RLS');

select * from finish();
rollback;
