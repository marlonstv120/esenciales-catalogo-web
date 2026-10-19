begin;
set local search_path = public, extensions;

select plan(24);

select ok(to_regclass('public.solicitudes') is not null, 'Existe la tabla solicitudes');
select ok(to_regclass('public.detalles_solicitud') is not null, 'Existe la tabla detalles_solicitud');
select ok(to_regclass('public.solicitudes_codigo_seq') is not null, 'Existe la secuencia de codigos de solicitud');
select ok((select relrowsecurity from pg_class where oid = 'public.solicitudes'::regclass), 'RLS esta activo en solicitudes');
select ok((select relrowsecurity from pg_class where oid = 'public.detalles_solicitud'::regclass), 'RLS esta activo en detalles_solicitud');
select ok(not has_table_privilege('anon', 'public.solicitudes', 'SELECT'), 'anon no lee solicitudes');
select ok(not has_table_privilege('anon', 'public.solicitudes', 'INSERT'), 'anon no inserta solicitudes directamente');
select ok(not has_table_privilege('anon', 'public.detalles_solicitud', 'SELECT'), 'anon no lee detalles de solicitudes');
select ok(not has_table_privilege('authenticated', 'public.solicitudes', 'INSERT'), 'authenticated no inserta solicitudes directamente');
select ok(not has_table_privilege('authenticated', 'public.detalles_solicitud', 'INSERT'), 'authenticated no inserta detalles directamente');
select ok(has_table_privilege('authenticated', 'public.solicitudes', 'SELECT'), 'authenticated puede intentar consultar solicitudes bajo RLS');
select ok(has_table_privilege('authenticated', 'public.detalles_solicitud', 'SELECT'), 'authenticated puede intentar consultar detalles bajo RLS');

set local role postgres;

insert into public.categorias (nombre) values ('Solicitud estructura prueba');
insert into public.productos (categoria_id, nombre, descripcion)
select id, 'Producto solicitud prueba', 'Producto para probar solicitudes'
from public.categorias where nombre = 'Solicitud estructura prueba';
insert into public.presentaciones (producto_id, etiqueta, precio_normal, stock, modo_disponibilidad)
select id, 'Unidad solicitud', 100000, 5, 'venta_inmediata'
from public.productos where nombre = 'Producto solicitud prueba';

insert into public.solicitudes (
  codigo, identificador_intento, nombre_cliente, telefono, ciudad, observaciones,
  terminos_version, politica_datos_version, aceptado_en
) values (
  'ES-00001', '44444444-4444-4444-4444-444444444444', 'Cliente de prueba', '+57 300 0000000', 'Cali', 'Sin observaciones',
  'terminos-v1', 'politica-datos-v1', now()
);
insert into public.detalles_solicitud (solicitud_id, presentacion_id, cantidad, precio_unitario)
select s.id, p.id, 2, 100000
from public.solicitudes s
cross join public.presentaciones p
where s.codigo = 'ES-00001' and p.etiqueta = 'Unidad solicitud';

select results_eq(
  $$select subtotal from public.detalles_solicitud$$,
  $$values (200000::integer)$$,
  'El subtotal se calcula desde cantidad y precio unitario'
);
select throws_ok(
  $$insert into public.solicitudes (codigo, identificador_intento, nombre_cliente, telefono, terminos_version, politica_datos_version, aceptado_en) values ('ES-00002', '55555555-5555-5555-5555-555555555555', '', '3000000000', 'terminos-v1', 'politica-datos-v1', now())$$,
  '23514', null, 'Una solicitud exige nombre no vacio'
);
select throws_ok(
  $$insert into public.solicitudes (codigo, identificador_intento, nombre_cliente, telefono, terminos_version, politica_datos_version, aceptado_en) values ('Solicitud-2', '55555555-5555-5555-5555-555555555555', 'Cliente', '3000000000', 'terminos-v1', 'politica-datos-v1', now())$$,
  '23514', null, 'El codigo conserva el formato ES-numerico'
);
select throws_ok(
  $$insert into public.solicitudes (codigo, identificador_intento, nombre_cliente, telefono, terminos_version, politica_datos_version, aceptado_en) values ('ES-00002', '44444444-4444-4444-4444-444444444444', 'Cliente', '3000000000', 'terminos-v1', 'politica-datos-v1', now())$$,
  '23505', null, 'El identificador de intento es unico'
);
select throws_ok(
  $$update public.solicitudes set estado = 'pendiente' where codigo = 'ES-00001'$$,
  '23514', null, 'El estado de solicitud esta controlado'
);
select throws_ok(
  $$insert into public.detalles_solicitud (solicitud_id, presentacion_id, cantidad, precio_unitario) select s.id, p.id, 0, 100000 from public.solicitudes s cross join public.presentaciones p where s.codigo = 'ES-00001' and p.etiqueta = 'Unidad solicitud'$$,
  '23514', null, 'La cantidad debe estar entre uno y noventa y nueve'
);
select throws_ok(
  $$insert into public.detalles_solicitud (solicitud_id, presentacion_id, cantidad, precio_unitario, cantidad_descontada) select s.id, p.id, 2, 100000, 3 from public.solicitudes s cross join public.presentaciones p where s.codigo = 'ES-00001' and p.etiqueta = 'Unidad solicitud'$$,
  '23514', null, 'La cantidad descontada no supera la solicitada'
);
select throws_ok(
  $$insert into public.detalles_solicitud (solicitud_id, presentacion_id, cantidad, precio_unitario) select s.id, p.id, 1, 100000 from public.solicitudes s cross join public.presentaciones p where s.codigo = 'ES-00001' and p.etiqueta = 'Unidad solicitud'$$,
  '23505', null, 'No se repite una presentacion dentro de la solicitud'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '77777777-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'administrador-solicitudes@prueba.local', '', now(), '{"provider": "email", "providers": ["email"]}'::jsonb, '{}'::jsonb, now(), now()
);
insert into public.usuarios_administrativos (id, activo) values ('77777777-7777-7777-7777-777777777777', true);

set local role authenticated;
select set_config('request.jwt.claim.sub', '77777777-7777-7777-7777-777777777777', true);
select results_eq(
  $$select codigo from public.solicitudes$$,
  $$values ('ES-00001'::text)$$,
  'El administrador activo consulta solicitudes'
);
select results_eq(
  $$select cantidad from public.detalles_solicitud$$,
  $$values (2::integer)$$,
  'El administrador activo consulta detalles'
);

set local role postgres;
set local role authenticated;
select set_config('request.jwt.claim.sub', '88888888-8888-8888-8888-888888888888', true);
select is_empty($$select * from public.solicitudes$$, 'Un usuario autenticado no autorizado no consulta solicitudes');
select is_empty($$select * from public.detalles_solicitud$$, 'Un usuario autenticado no autorizado no consulta detalles');

select * from finish();
rollback;
