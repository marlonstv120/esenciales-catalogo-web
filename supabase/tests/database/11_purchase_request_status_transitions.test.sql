begin;
set local search_path = public, extensions;

select plan(20);

select has_function('public', 'confirmar_solicitud_compra', array['integer']::text[], 'Existe la RPC para confirmar solicitudes');
select has_function('public', 'entregar_solicitud_compra', array['integer']::text[], 'Existe la RPC para entregar solicitudes');
select has_function('public', 'cancelar_solicitud_compra', array['integer']::text[], 'Existe la RPC para cancelar solicitudes');
select ok(not has_function_privilege('anon', 'public.confirmar_solicitud_compra(integer)', 'EXECUTE'), 'anon no confirma solicitudes');
select ok(has_function_privilege('authenticated', 'public.confirmar_solicitud_compra(integer)', 'EXECUTE'), 'authenticated puede intentar confirmar bajo autorizacion interna');

set local role postgres;
insert into public.categorias (nombre) values ('Transiciones solicitud prueba');
insert into public.productos (categoria_id, nombre, descripcion)
select id, 'Producto transiciones solicitud', 'Producto para probar transiciones de solicitudes'
from public.categorias where nombre = 'Transiciones solicitud prueba';
insert into public.presentaciones (producto_id, etiqueta, precio_normal, stock, modo_disponibilidad)
select id, 'Inmediata transicion', 100000, 5, 'venta_inmediata' from public.productos where nombre = 'Producto transiciones solicitud'
union all
select id, 'Bajo pedido transicion', 80000, 0, 'bajo_pedido' from public.productos where nombre = 'Producto transiciones solicitud'
union all
select id, 'Sin stock transicion', 70000, 0, 'venta_inmediata' from public.productos where nombre = 'Producto transiciones solicitud';

insert into public.solicitudes (codigo, identificador_intento, nombre_cliente, telefono, terminos_version, politica_datos_version, aceptado_en)
values
  ('ES-11001', '11111111-1111-1111-1111-111111111111', 'Cliente mixta', '3000000001', 'terminos-v1', 'politica-datos-v1', now()),
  ('ES-11002', '22222222-2222-2222-2222-222222222222', 'Cliente nueva', '3000000002', 'terminos-v1', 'politica-datos-v1', now()),
  ('ES-11003', '33333333-3333-3333-3333-333333333333', 'Cliente sin stock', '3000000003', 'terminos-v1', 'politica-datos-v1', now()),
  ('ES-11004', '44444444-4444-4444-4444-444444444444', 'Cliente entrega', '3000000004', 'terminos-v1', 'politica-datos-v1', now());

insert into public.detalles_solicitud (solicitud_id, presentacion_id, cantidad, precio_unitario)
select s.id, p.id, case when p.etiqueta = 'Inmediata transicion' then 2 else 3 end, p.precio_normal
from public.solicitudes s
join public.presentaciones p on p.etiqueta in ('Inmediata transicion', 'Bajo pedido transicion')
where s.codigo = 'ES-11001'
union all
select s.id, p.id, 1, p.precio_normal from public.solicitudes s join public.presentaciones p on p.etiqueta = 'Inmediata transicion' where s.codigo in ('ES-11002', 'ES-11004')
union all
select s.id, p.id, 1, p.precio_normal from public.solicitudes s join public.presentaciones p on p.etiqueta = 'Sin stock transicion' where s.codigo = 'ES-11003';

select set_config('test.mixta', (select id::text from public.solicitudes where codigo = 'ES-11001'), true);
select set_config('test.nueva', (select id::text from public.solicitudes where codigo = 'ES-11002'), true);
select set_config('test.sin_stock', (select id::text from public.solicitudes where codigo = 'ES-11003'), true);
select set_config('test.entrega', (select id::text from public.solicitudes where codigo = 'ES-11004'), true);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('77777777-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'transiciones@prueba.local', '', now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now());
insert into public.usuarios_administrativos (id, activo) values ('77777777-7777-7777-7777-777777777777', true);

set local role authenticated;
select set_config('request.jwt.claim.sub', '77777777-7777-7777-7777-777777777777', true);
select lives_ok($$select public.confirmar_solicitud_compra(current_setting('test.mixta')::integer)$$, 'Un administrador confirma una solicitud mixta');

set local role postgres;
select results_eq(
  $$select estado, confirmado_en is not null from public.solicitudes where id = current_setting('test.mixta')::integer$$,
  $$values ('confirmada'::text, true)$$,
  'La confirmacion registra el estado y su fecha'
);
select results_eq(
  $$select p.etiqueta, p.stock, d.cantidad_descontada from public.detalles_solicitud d join public.presentaciones p on p.id = d.presentacion_id where d.solicitud_id = current_setting('test.mixta')::integer order by p.etiqueta$$,
  $$values ('Bajo pedido transicion'::text, 0::integer, 0::integer), ('Inmediata transicion'::text, 3::integer, 2::integer)$$,
  'Confirmar descuenta solo venta inmediata y registra exactamente la cantidad descontada'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '77777777-7777-7777-7777-777777777777', true);
select lives_ok($$select public.cancelar_solicitud_compra(current_setting('test.mixta')::integer)$$, 'Un administrador cancela una solicitud Confirmada');

set local role postgres;
select results_eq(
  $$select estado, cancelado_en is not null from public.solicitudes where id = current_setting('test.mixta')::integer$$,
  $$values ('cancelada'::text, true)$$,
  'La cancelacion registra el estado y su fecha'
);
select is((select stock from public.presentaciones where etiqueta = 'Inmediata transicion'), 5, 'Cancelar restituye exactamente el inventario descontado');
select is((select cantidad_descontada from public.detalles_solicitud d join public.presentaciones p on p.id = d.presentacion_id where d.solicitud_id = current_setting('test.mixta')::integer and p.etiqueta = 'Inmediata transicion'), 2, 'La evidencia de la deduccion se conserva tras cancelar');

set local role authenticated;
select set_config('request.jwt.claim.sub', '77777777-7777-7777-7777-777777777777', true);
select lives_ok($$select public.cancelar_solicitud_compra(current_setting('test.nueva')::integer)$$, 'Una solicitud Nueva puede cancelarse sin descontar stock');
select throws_ok($$select public.confirmar_solicitud_compra(current_setting('test.sin_stock')::integer)$$, '22023', null, 'No se confirma una solicitud sin stock inmediato');
select lives_ok($$select public.confirmar_solicitud_compra(current_setting('test.entrega')::integer)$$, 'Una solicitud Nueva puede confirmarse antes de entregar');
select lives_ok($$select public.entregar_solicitud_compra(current_setting('test.entrega')::integer)$$, 'Una solicitud Confirmada puede entregarse');

set local role postgres;
select results_eq(
  $$select estado, entregado_en is not null from public.solicitudes where id = current_setting('test.entrega')::integer$$,
  $$values ('entregada'::text, true)$$,
  'La entrega registra el estado terminal y su fecha'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '77777777-7777-7777-7777-777777777777', true);
select throws_ok($$select public.confirmar_solicitud_compra(current_setting('test.entrega')::integer)$$, '22023', null, 'No se confirma dos veces una solicitud');
select throws_ok($$select public.cancelar_solicitud_compra(current_setting('test.entrega')::integer)$$, '22023', null, 'No se cancela una solicitud Entregada');
select throws_ok($$select public.entregar_solicitud_compra(current_setting('test.nueva')::integer)$$, '22023', null, 'No se entrega una solicitud Nueva');

set local role postgres;
select * from finish();
rollback;
