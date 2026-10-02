begin;
set local search_path = public, extensions;

select plan(25);

select ok(to_regclass('public.pagos_solicitud') is not null, 'Existe la tabla de pagos de solicitud');
select ok((select relrowsecurity from pg_class where oid = 'public.pagos_solicitud'::regclass), 'RLS esta activo en pagos');
select ok(not has_table_privilege('anon', 'public.pagos_solicitud', 'select'), 'anon no consulta pagos directamente');
select is_empty($$select * from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'administrador_activo_gestiona_comprobantes_pago' and 'anon' = any(roles)$$, 'No existe politica anon para comprobantes');
select is((select public from storage.buckets where id = 'comprobantes-pago'), false, 'El bucket de comprobantes es privado');
select has_function('public', 'obtener_solicitud_publica_segura', array['text', 'uuid']::text[], 'Existe la consulta publica limitada');
select has_function('public', 'rechazar_comprobante_pago', array['integer', 'text']::text[], 'Existe la RPC para rechazar comprobantes');
select has_function('public', 'verificar_pago_y_confirmar_solicitud', array['integer']::text[], 'Existe la RPC atomica de verificar y confirmar');

set local role postgres;
insert into public.categorias (nombre) values ('Pago Bre-B prueba');
insert into public.productos (categoria_id, nombre, descripcion) select id, 'Producto pago Bre-B', 'Producto para pruebas de pagos' from public.categorias where nombre = 'Pago Bre-B prueba';
insert into public.presentaciones (producto_id, etiqueta, precio_normal, stock, modo_disponibilidad) select id, 'Unidad pago Bre-B', 100000, 2, 'venta_inmediata' from public.productos where nombre = 'Producto pago Bre-B';
insert into public.solicitudes (codigo, identificador_intento, nombre_cliente, telefono, terminos_version, politica_datos_version, aceptado_en) values
  ('ES-12001', '12121212-0000-0000-0000-000000000001', 'Cliente pago uno', '3000000001', 'terminos-v1', 'politica-datos-v1', now()),
  ('ES-12002', '12121212-0000-0000-0000-000000000002', 'Cliente pago dos', '3000000002', 'terminos-v1', 'politica-datos-v1', now());
insert into public.detalles_solicitud (solicitud_id, presentacion_id, cantidad, precio_unitario)
select s.id, p.id, 1, 100000 from public.solicitudes s cross join public.presentaciones p where s.codigo in ('ES-12001', 'ES-12002') and p.etiqueta = 'Unidad pago Bre-B';
insert into public.pagos_solicitud (solicitud_id, monto) select s.id, 100000 from public.solicitudes s where s.codigo in ('ES-12001', 'ES-12002');
select set_config('test.solicitud_pago_uno', (select id::text from public.solicitudes where codigo = 'ES-12001'), true);
select set_config('test.solicitud_pago_dos', (select id::text from public.solicitudes where codigo = 'ES-12002'), true);
select set_config('test.token_pago_uno', (select token_cliente::text from public.solicitudes where codigo = 'ES-12001'), true);

select is((select estado from public.pagos_solicitud where solicitud_id = current_setting('test.solicitud_pago_uno')::integer), 'pendiente', 'El pago inicia pendiente');
select ok((select token_cliente is not null from public.solicitudes where id = current_setting('test.solicitud_pago_uno')::integer), 'La solicitud recibe token de cliente');
select isnt((select token_cliente from public.solicitudes where id = current_setting('test.solicitud_pago_uno')::integer), (select token_cliente from public.solicitudes where id = current_setting('test.solicitud_pago_dos')::integer), 'Los tokens de cliente son unicos');

set local role anon;
select is((public.obtener_solicitud_publica_segura('ES-12001', current_setting('test.token_pago_uno')::uuid)->>'codigo'), 'ES-12001', 'Codigo y token autorizan la consulta limitada');
select ok((public.obtener_solicitud_publica_segura('ES-12001', current_setting('test.token_pago_uno')::uuid) ? 'lineas'), 'La consulta publica devuelve lineas y montos historicos');
select ok(not (public.obtener_solicitud_publica_segura('ES-12001', current_setting('test.token_pago_uno')::uuid) ? 'token_cliente'), 'La consulta publica no devuelve la credencial ni metadata privada');
select is((public.obtener_solicitud_publica_segura('ES-12001', current_setting('test.token_pago_uno')::uuid)->>'elegible_pago')::boolean, true, 'Una solicitud de venta inmediata es elegible para pago');
select throws_ok($$select public.obtener_solicitud_publica_segura('ES-12001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')$$, '22023', null, 'Un token incorrecto no permite consulta publica');

set local role postgres;
update public.presentaciones set modo_disponibilidad = 'bajo_pedido', stock = 0 where etiqueta = 'Unidad pago Bre-B';
set local role anon;
select is((public.obtener_solicitud_publica_segura('ES-12001', current_setting('test.token_pago_uno')::uuid)->>'elegible_pago')::boolean, false, 'Una solicitud con Bajo pedido no es elegible para pago');
set local role postgres;
update public.presentaciones set modo_disponibilidad = 'venta_inmediata', stock = 2 where etiqueta = 'Unidad pago Bre-B';

set local role postgres;
update public.pagos_solicitud set estado = 'comprobante_enviado', comprobante_path = 'solicitudes/1/11111111-1111-1111-1111-111111111111.png', comprobante_mime = 'image/png', comprobante_bytes = 100, enviado_en = now() where solicitud_id = current_setting('test.solicitud_pago_uno')::integer;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values ('12121212-1212-1212-1212-121212121212', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pago-admin@prueba.local', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());
insert into public.usuarios_administrativos (id, activo) values ('12121212-1212-1212-1212-121212121212', true);

set local role authenticated;
select set_config('request.jwt.claim.sub', '12121212-1212-1212-1212-121212121212', true);
select throws_ok($$select public.rechazar_comprobante_pago(current_setting('test.solicitud_pago_uno')::integer, '')$$, '22023', null, 'Rechazar exige una razon');
select lives_ok($$select public.rechazar_comprobante_pago(current_setting('test.solicitud_pago_uno')::integer, 'Comprobante ilegible')$$, 'El administrador rechaza el comprobante');

set local role postgres;
select results_eq($$select estado, observacion_revision from public.pagos_solicitud where solicitud_id = current_setting('test.solicitud_pago_uno')::integer$$, $$values ('rechazado'::text, 'Comprobante ilegible'::text)$$, 'El rechazo conserva el motivo');
update public.pagos_solicitud set estado = 'comprobante_enviado', comprobante_path = 'solicitudes/1/22222222-2222-2222-2222-222222222222.png', comprobante_mime = 'image/png', comprobante_bytes = 100, enviado_en = now(), observacion_revision = null where solicitud_id = current_setting('test.solicitud_pago_uno')::integer;

set local role authenticated;
select set_config('request.jwt.claim.sub', '12121212-1212-1212-1212-121212121212', true);
select throws_ok($$select public.confirmar_solicitud_compra(current_setting('test.solicitud_pago_uno')::integer)$$, '22023', null, 'No se confirma manualmente una solicitud con comprobante enviado');
select lives_ok($$select public.verificar_pago_y_confirmar_solicitud(current_setting('test.solicitud_pago_uno')::integer)$$, 'Verificar pago y confirmar es una operacion administrativa');

set local role postgres;
select results_eq($$select s.estado, ps.estado, p.stock from public.solicitudes s join public.pagos_solicitud ps on ps.solicitud_id = s.id cross join public.presentaciones p where s.id = current_setting('test.solicitud_pago_uno')::integer and p.etiqueta = 'Unidad pago Bre-B'$$, $$values ('confirmada'::text, 'verificado'::text, 1::integer)$$, 'La verificacion confirma y descuenta inventario');
update public.pagos_solicitud set estado = 'comprobante_enviado', comprobante_path = 'solicitudes/1/33333333-3333-3333-3333-333333333333.png', comprobante_mime = 'image/png', comprobante_bytes = 100, enviado_en = now() where solicitud_id = current_setting('test.solicitud_pago_dos')::integer;
update public.presentaciones set stock = 0 where etiqueta = 'Unidad pago Bre-B';

set local role authenticated;
select set_config('request.jwt.claim.sub', '12121212-1212-1212-1212-121212121212', true);
select throws_ok($$select public.verificar_pago_y_confirmar_solicitud(current_setting('test.solicitud_pago_dos')::integer)$$, '22023', null, 'No se verifica ni confirma si falta inventario');

set local role postgres;
select results_eq($$select s.estado, ps.estado from public.solicitudes s join public.pagos_solicitud ps on ps.solicitud_id = s.id where s.id = current_setting('test.solicitud_pago_dos')::integer$$, $$values ('nueva'::text, 'comprobante_enviado'::text)$$, 'El fallo de stock no cambia solicitud ni pago');

select * from finish();
rollback;
