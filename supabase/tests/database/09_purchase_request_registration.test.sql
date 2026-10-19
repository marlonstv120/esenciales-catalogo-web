begin;
set local search_path = public, extensions;

select plan(27);

select has_function(
  'public', 'registrar_solicitud_compra',
  array['uuid', 'text', 'text', 'text', 'text', 'jsonb', 'boolean', 'boolean']::text[],
  'Existe la RPC de registro de solicitudes'
);
select ok(
  has_function_privilege('anon', 'public.registrar_solicitud_compra(uuid, text, text, text, text, jsonb, boolean, boolean)', 'EXECUTE'),
  'anon ejecuta la RPC publica de registro'
);
select ok(
  not has_function_privilege('anon', 'public.versiones_legales_vigentes()', 'EXECUTE'),
  'anon no consulta directamente las versiones legales internas'
);
select ok(
  not has_function_privilege('anon', 'public.respuesta_registro_solicitud(integer)', 'EXECUTE'),
  'anon no consulta directamente respuestas de solicitudes'
);

set local role postgres;

insert into public.categorias (nombre) values ('Registro solicitud prueba');
insert into public.productos (categoria_id, nombre, descripcion)
select id, 'Producto registro prueba', 'Producto para registrar solicitudes'
from public.categorias where nombre = 'Registro solicitud prueba';
insert into public.presentaciones (producto_id, etiqueta, precio_normal, precio_promocional, stock, modo_disponibilidad)
select id, '100 ml inmediato', 100000, 90000, 3, 'venta_inmediata'
from public.productos where nombre = 'Producto registro prueba'
union all
select id, '50 ml bajo pedido', 80000, null, 0, 'bajo_pedido'
from public.productos where nombre = 'Producto registro prueba'
union all
select id, '30 ml no disponible', 60000, null, 0, 'no_disponible'
from public.productos where nombre = 'Producto registro prueba';
insert into public.imagenes_producto (producto_id, url, identificador_externo, posicion)
select id, 'https://example.test/registro.webp', 'productos/registro/imagen.webp', 0
from public.productos where nombre = 'Producto registro prueba';

select set_config('test.presentacion_inmediata', (select id::text from public.presentaciones where etiqueta = '100 ml inmediato'), true);
select set_config('test.presentacion_bajo_pedido', (select id::text from public.presentaciones where etiqueta = '50 ml bajo pedido'), true);
select set_config('test.presentacion_no_disponible', (select id::text from public.presentaciones where etiqueta = '30 ml no disponible'), true);

set local role anon;
select is(
  (public.registrar_solicitud_compra(
    '12121212-1212-1212-1212-121212121212', 'Cliente mixto', '3000000000', null, null,
    jsonb_build_array(
      jsonb_build_object('presentacion_id', current_setting('test.presentacion_inmediata')::integer, 'cantidad', 1, 'precio_esperado', 90000),
      jsonb_build_object('presentacion_id', current_setting('test.presentacion_bajo_pedido')::integer, 'cantidad', 2, 'precio_esperado', 80000)
    ),
    true, true
  ))->>'valor_total_productos',
  '250000',
  'La solicitud combina venta inmediata y bajo pedido'
);

select set_config(
  'test.respuesta_principal',
  public.registrar_solicitud_compra(
    '99999999-9999-9999-9999-999999999999', 'Cliente prueba', '+57 (300) 000-0000', 'Cali', null,
    jsonb_build_array(jsonb_build_object('presentacion_id', current_setting('test.presentacion_inmediata')::integer, 'cantidad', 2, 'precio_esperado', 100000)),
    true, true
  )::text,
  true
);

select is((current_setting('test.respuesta_principal')::jsonb)->>'requiere_revision_precio', 'true', 'Un precio diferente exige revision explicita');
set local role postgres;
select is(
  (select count(*) from public.solicitudes where identificador_intento = '99999999-9999-9999-9999-999999999999'),
  0::bigint,
  'La revision de precio no crea una solicitud'
);
set local role anon;

select set_config(
  'test.respuesta_principal',
  public.registrar_solicitud_compra(
    '99999999-9999-9999-9999-999999999999', 'Cliente prueba', '+57 (300) 000-0000', 'Cali', null,
    jsonb_build_array(jsonb_build_object('presentacion_id', current_setting('test.presentacion_inmediata')::integer, 'cantidad', 2, 'precio_esperado', 90000)),
    true, true
  )::text,
  true
);

select is((current_setting('test.respuesta_principal')::jsonb)->>'estado', 'nueva', 'El registro devuelve una solicitud Nueva');
select ok((current_setting('test.respuesta_principal')::jsonb)->>'codigo' ~ '^ES-[0-9]+$', 'El registro devuelve un codigo legible');
select is((current_setting('test.respuesta_principal')::jsonb)->>'valor_total_productos', '180000', 'El registro devuelve el total con precio promocional vigente');
select ok(not ((current_setting('test.respuesta_principal')::jsonb) ? 'telefono'), 'La respuesta publica no devuelve datos personales');
select ok((current_setting('test.respuesta_principal')::jsonb)->>'token_cliente' ~ '^[0-9a-f-]{36}$', 'El registro devuelve el token publico no predecible');
select is((current_setting('test.respuesta_principal')::jsonb)->>'elegible_pago', 'true', 'Una solicitud solo de venta inmediata es elegible para pago');
select is((public.registrar_solicitud_compra(
  '12121212-1212-1212-1212-121212121212', 'Cliente mixto', '3000000000', null, null,
  jsonb_build_array(
    jsonb_build_object('presentacion_id', current_setting('test.presentacion_inmediata')::integer, 'cantidad', 1, 'precio_esperado', 90000),
    jsonb_build_object('presentacion_id', current_setting('test.presentacion_bajo_pedido')::integer, 'cantidad', 2, 'precio_esperado', 80000)
  ),
  true, true
))->>'elegible_pago', 'false', 'Una solicitud mixta no es elegible para pago');

select set_config(
  'test.respuesta_reintento',
  public.registrar_solicitud_compra(
    '99999999-9999-9999-9999-999999999999', 'Cliente prueba', '+57 (300) 000-0000', 'Cali', null,
    jsonb_build_array(jsonb_build_object('presentacion_id', current_setting('test.presentacion_inmediata')::integer, 'cantidad', 2, 'precio_esperado', 90000)),
    true, true
  )::text,
  true
);
select is(
  (current_setting('test.respuesta_reintento')::jsonb)->>'codigo',
  (current_setting('test.respuesta_principal')::jsonb)->>'codigo',
  'El reintento con el mismo contenido devuelve el mismo codigo'
);

select throws_ok(
  $$select public.registrar_solicitud_compra('99999999-9999-9999-9999-999999999999', 'Cliente prueba', '+57 (300) 000-0000', 'Cali', null, jsonb_build_array(jsonb_build_object('presentacion_id', current_setting('test.presentacion_inmediata')::integer, 'cantidad', 1, 'precio_esperado', 90000)), true, true)$$,
  '23505', null, 'El mismo intento con contenido distinto se rechaza'
);
select throws_ok(
  $$select public.registrar_solicitud_compra('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cliente prueba', 'telefono', null, null, jsonb_build_array(jsonb_build_object('presentacion_id', current_setting('test.presentacion_inmediata')::integer, 'cantidad', 1, 'precio_esperado', 90000)), true, true)$$,
  '22023', null, 'El telefono no admite letras'
);
select throws_ok(
  $$select public.registrar_solicitud_compra('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Cliente prueba', '3000000000', null, null, jsonb_build_array(jsonb_build_object('presentacion_id', current_setting('test.presentacion_inmediata')::integer, 'cantidad', 1, 'precio_esperado', 90000)), false, true)$$,
  '22023', null, 'La aceptacion de terminos es obligatoria'
);
select throws_ok(
  $$select public.registrar_solicitud_compra('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Cliente prueba', '3000000000', null, null, '[]'::jsonb, true, true)$$,
  '22023', null, 'La solicitud no admite carrito vacio'
);
select throws_ok(
  $$select public.registrar_solicitud_compra('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Cliente prueba', '3000000000', null, null, jsonb_build_array(jsonb_build_object('presentacion_id', current_setting('test.presentacion_inmediata')::integer, 'cantidad', 1, 'precio_esperado', 90000), jsonb_build_object('presentacion_id', current_setting('test.presentacion_inmediata')::integer, 'cantidad', 1, 'precio_esperado', 90000)), true, true)$$,
  '22023', null, 'La solicitud no admite presentaciones repetidas'
);
select throws_ok(
  $$select public.registrar_solicitud_compra('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Cliente prueba', '3000000000', null, null, jsonb_build_array(jsonb_build_object('presentacion_id', current_setting('test.presentacion_inmediata')::integer, 'cantidad', 4, 'precio_esperado', 90000)), true, true)$$,
  '22023', null, 'Venta inmediata no supera el stock actual'
);
select throws_ok(
  $$select public.registrar_solicitud_compra('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Cliente prueba', '3000000000', null, null, jsonb_build_array(jsonb_build_object('presentacion_id', current_setting('test.presentacion_no_disponible')::integer, 'cantidad', 1, 'precio_esperado', 60000)), true, true)$$,
  '22023', null, 'No disponible no admite solicitud'
);

set local role postgres;
select is(
  (select stock from public.presentaciones where id = current_setting('test.presentacion_inmediata')::integer),
  3,
  'Registrar una solicitud Nueva no descuenta inventario'
);
select is(
  (select terminos_version from public.solicitudes where identificador_intento = '99999999-9999-9999-9999-999999999999'),
  'terminos-v2',
  'La solicitud conserva la version vigente de terminos'
);
select is(
  (select politica_datos_version from public.solicitudes where identificador_intento = '99999999-9999-9999-9999-999999999999'),
  'politica-datos-v2',
  'La solicitud conserva la version vigente de politica de datos'
);
select is(
  (select count(*) from public.solicitudes where identificador_intento = '99999999-9999-9999-9999-999999999999'),
  1::bigint,
  'El reintento no duplica la solicitud'
);
select is(
  (select count(*) from public.pagos_solicitud ps join public.solicitudes s on s.id = ps.solicitud_id where s.identificador_intento = '99999999-9999-9999-9999-999999999999'),
  1::bigint,
  'El registro crea atomically el pago pendiente asociado'
);

select * from finish();
rollback;
