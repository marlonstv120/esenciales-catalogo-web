begin;

select plan(11);

set local role postgres;

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'administrador-activo@prueba.local',
    '',
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'administrador-inactivo@prueba.local',
    '',
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into public.usuarios_administrativos (id, activo)
values
  ('11111111-1111-1111-1111-111111111111', true),
  ('33333333-3333-3333-3333-333333333333', false);

insert into public.categorias (nombre) values ('Categoria RLS');

insert into public.productos (categoria_id, nombre, descripcion)
values (
  (select id from public.categorias where nombre = 'Categoria RLS'),
  'Producto RLS',
  'Producto de prueba para politicas RLS'
);

insert into public.presentaciones (
  producto_id,
  etiqueta,
  precio_normal,
  stock,
  modo_disponibilidad
)
values (
  (select id from public.productos where nombre = 'Producto RLS'),
  '100 ml RLS',
  100000,
  1,
  'venta_inmediata'
);

insert into public.imagenes_producto (
  producto_id,
  url,
  identificador_externo,
  posicion
)
values (
  (select id from public.productos where nombre = 'Producto RLS'),
  'https://example.test/rls.webp',
  'productos/rls.webp',
  0
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);

select is(public.es_administrador_activo(), true, 'Administrador activo reconocido');
select lives_ok(
  $$insert into public.categorias (nombre) values ('Categoria creada por administrador')$$,
  'Administrador activo inserta categoria'
);
select results_eq(
  $$select nombre from public.productos where nombre = 'Producto RLS'$$,
  $$values ('Producto RLS'::text)$$,
  'Administrador activo consulta producto'
);
select results_eq(
  $$update public.presentaciones set stock = 2 where etiqueta = '100 ml RLS' returning stock$$,
  $$values (2::integer)$$,
  'Administrador activo modifica presentacion'
);
select results_eq(
  $$delete from public.imagenes_producto where identificador_externo = 'productos/rls.webp' returning identificador_externo$$,
  $$values ('productos/rls.webp'::text)$$,
  'Administrador activo elimina imagen'
);
select throws_ok(
  $$select * from public.usuarios_administrativos$$,
  '42501',
  null,
  'Administrador activo no consulta autorizaciones'
);
select throws_ok(
  $$update public.usuarios_administrativos set activo = false$$,
  '42501',
  null,
  'Administrador activo no modifica autorizaciones'
);

set local role postgres;
set local role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);

select is(public.es_administrador_activo(), false, 'Usuario no autorizado rechazado por funcion');
select is_empty(
  $$select * from public.categorias$$,
  'Usuario no autorizado no consulta categorias'
);

set local role postgres;
set local role authenticated;
select set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);

select is(public.es_administrador_activo(), false, 'Administrador inactivo rechazado por funcion');
select is_empty(
  $$update public.categorias set activo = false returning id$$,
  'Administrador inactivo no modifica categorias'
);

select * from finish();
rollback;
