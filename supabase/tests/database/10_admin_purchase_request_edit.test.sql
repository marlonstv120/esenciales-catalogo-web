begin;
set local search_path = public, extensions;

select plan(14);

select has_function(
  'public', 'actualizar_solicitud_nueva',
  array['integer', 'text', 'text', 'text', 'text', 'jsonb']::text[],
  'Existe la RPC administrativa de edicion de solicitudes Nuevas'
);
select ok(
  not has_function_privilege('anon', 'public.actualizar_solicitud_nueva(integer, text, text, text, text, jsonb)', 'EXECUTE'),
  'anon no ejecuta la RPC de edicion'
);
select ok(
  has_function_privilege('authenticated', 'public.actualizar_solicitud_nueva(integer, text, text, text, text, jsonb)', 'EXECUTE'),
  'authenticated puede intentar ejecutar la RPC bajo su autorizacion interna'
);

set local role postgres;

insert into public.categorias (nombre) values ('Edicion solicitud prueba');
insert into public.productos (categoria_id, nombre, descripcion)
select id, 'Producto edicion solicitud', 'Producto para probar edicion de solicitudes'
from public.categorias where nombre = 'Edicion solicitud prueba';
insert into public.presentaciones (producto_id, etiqueta, precio_normal, stock, modo_disponibilidad)
select id, 'Unidad inmediata', 100000, 5, 'venta_inmediata'
from public.productos where nombre = 'Producto edicion solicitud'
union all
select id, 'Unidad bajo pedido', 80000, 0, 'bajo_pedido'
from public.productos where nombre = 'Producto edicion solicitud';

insert into public.solicitudes (
  codigo, identificador_intento, nombre_cliente, telefono, terminos_version, politica_datos_version, aceptado_en
) values (
  'ES-10001', '10101010-1010-1010-1010-101010101010', 'Cliente inicial', '3000000000', 'terminos-v1', 'politica-datos-v1', now()
), (
  'ES-10002', '20202020-2020-2020-2020-202020202020', 'Cliente ajeno', '3000000001', 'terminos-v1', 'politica-datos-v1', now()
), (
  'ES-10003', '30303030-3030-3030-3030-303030303030', 'Cliente confirmado', '3000000002', 'terminos-v1', 'politica-datos-v1', now()
);
update public.solicitudes set estado = 'confirmada' where codigo = 'ES-10003';

insert into public.detalles_solicitud (solicitud_id, presentacion_id, cantidad, precio_unitario)
select s.id, p.id, 2, 100000
from public.solicitudes s cross join public.presentaciones p
where s.codigo = 'ES-10001' and p.etiqueta = 'Unidad inmediata';
insert into public.detalles_solicitud (solicitud_id, presentacion_id, cantidad, precio_unitario)
select s.id, p.id, 3, 80000
from public.solicitudes s cross join public.presentaciones p
where s.codigo = 'ES-10001' and p.etiqueta = 'Unidad bajo pedido';
insert into public.detalles_solicitud (solicitud_id, presentacion_id, cantidad, precio_unitario)
select s.id, p.id, 1, 100000
from public.solicitudes s cross join public.presentaciones p
where s.codigo in ('ES-10002', 'ES-10003') and p.etiqueta = 'Unidad inmediata';

select set_config('test.solicitud_nueva', (select id::text from public.solicitudes where codigo = 'ES-10001'), true);
select set_config('test.solicitud_ajena', (select id::text from public.solicitudes where codigo = 'ES-10002'), true);
select set_config('test.solicitud_confirmada', (select id::text from public.solicitudes where codigo = 'ES-10003'), true);
select set_config('test.detalle_inmediato', (select d.id::text from public.detalles_solicitud d join public.solicitudes s on s.id = d.solicitud_id join public.presentaciones p on p.id = d.presentacion_id where s.codigo = 'ES-10001' and p.etiqueta = 'Unidad inmediata'), true);
select set_config('test.detalle_bajo_pedido', (select d.id::text from public.detalles_solicitud d join public.solicitudes s on s.id = d.solicitud_id join public.presentaciones p on p.id = d.presentacion_id where s.codigo = 'ES-10001' and p.etiqueta = 'Unidad bajo pedido'), true);
select set_config('test.detalle_ajeno', (select d.id::text from public.detalles_solicitud d join public.solicitudes s on s.id = d.solicitud_id where s.codigo = 'ES-10002'), true);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '99999999-9999-9999-9999-999999999999', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'editor-solicitudes@prueba.local', '', now(), '{"provider": "email", "providers": ["email"]}'::jsonb, '{}'::jsonb, now(), now()
);
insert into public.usuarios_administrativos (id, activo) values ('99999999-9999-9999-9999-999999999999', true);

set local role authenticated;
select set_config('request.jwt.claim.sub', '99999999-9999-9999-9999-999999999999', true);
select lives_ok(
  $$select public.actualizar_solicitud_nueva(current_setting('test.solicitud_nueva')::integer, 'Cliente corregido', '+57 (300) 000-0000', 'Cali', 'Entregar en horario laboral', jsonb_build_array(jsonb_build_object('detalle_id', current_setting('test.detalle_inmediato')::integer, 'cantidad', 3)))$$,
  'El administrador corrige datos, cantidad y retira una linea existente'
);

set local role postgres;
select results_eq(
  $$select nombre_cliente, telefono, ciudad, observaciones from public.solicitudes where id = current_setting('test.solicitud_nueva')::integer$$,
  $$values ('Cliente corregido'::text, '+57 (300) 000-0000'::text, 'Cali'::text, 'Entregar en horario laboral'::text)$$,
  'La edicion conserva solo los datos de cliente permitidos'
);
select results_eq(
  $$select cantidad, precio_unitario, subtotal, cantidad_descontada from public.detalles_solicitud where id = current_setting('test.detalle_inmediato')::integer$$,
  $$values (3::integer, 100000::integer, 300000::integer, 0::integer)$$,
  'La cantidad cambia, el subtotal se recalcula y el precio historico se conserva'
);
select is_empty(
  $$select * from public.detalles_solicitud where id = current_setting('test.detalle_bajo_pedido')::integer$$,
  'La linea retirada deja de pertenecer a la solicitud Nueva'
);
select is(
  (select stock from public.presentaciones where etiqueta = 'Unidad inmediata'),
  5,
  'Editar una solicitud Nueva no descuenta inventario'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '99999999-9999-9999-9999-999999999999', true);
select throws_ok(
  $$select public.actualizar_solicitud_nueva(current_setting('test.solicitud_nueva')::integer, 'Cliente corregido', '3000000000', null, null, '[]'::jsonb)$$,
  '22023', null, 'No se permite vaciar una solicitud Nueva'
);
select throws_ok(
  $$select public.actualizar_solicitud_nueva(current_setting('test.solicitud_nueva')::integer, 'Cliente corregido', '3000000000', null, null, jsonb_build_array(jsonb_build_object('detalle_id', current_setting('test.detalle_inmediato')::integer, 'cantidad', 1), jsonb_build_object('detalle_id', current_setting('test.detalle_inmediato')::integer, 'cantidad', 2)))$$,
  '22023', null, 'No se permite duplicar una linea existente'
);
select throws_ok(
  $$select public.actualizar_solicitud_nueva(current_setting('test.solicitud_nueva')::integer, 'Cliente corregido', '3000000000', null, null, jsonb_build_array(jsonb_build_object('detalle_id', current_setting('test.detalle_ajeno')::integer, 'cantidad', 1)))$$,
  '22023', null, 'No se permite agregar una linea de otra solicitud'
);
select throws_ok(
  $$select public.actualizar_solicitud_nueva(current_setting('test.solicitud_nueva')::integer, 'Cliente corregido', '3000000000', null, null, jsonb_build_array(jsonb_build_object('detalle_id', current_setting('test.detalle_inmediato')::integer, 'cantidad', 6)))$$,
  '22023', null, 'La cantidad editada no supera el stock inmediato'
);
select throws_ok(
  $$select public.actualizar_solicitud_nueva(current_setting('test.solicitud_confirmada')::integer, 'Cliente confirmado', '3000000002', null, null, jsonb_build_array(jsonb_build_object('detalle_id', (select id from public.detalles_solicitud where solicitud_id = current_setting('test.solicitud_confirmada')::integer), 'cantidad', 1)))$$,
  '22023', null, 'Una solicitud Confirmada no puede editarse'
);

set local role postgres;
set local role authenticated;
select set_config('request.jwt.claim.sub', '88888888-8888-8888-8888-888888888888', true);
select throws_ok(
  $$select public.actualizar_solicitud_nueva(current_setting('test.solicitud_nueva')::integer, 'Cliente corregido', '3000000000', null, null, jsonb_build_array(jsonb_build_object('detalle_id', current_setting('test.detalle_inmediato')::integer, 'cantidad', 1)))$$,
  '42501', null, 'Un usuario autenticado no autorizado no edita solicitudes'
);

select * from finish();
rollback;
