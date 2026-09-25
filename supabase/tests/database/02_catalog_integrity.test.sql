begin;

select plan(27);

insert into public.categorias (nombre) values ('Prueba');

select lives_ok(
  $$insert into public.categorias (nombre) values ('Otra categoria')$$,
  'Acepta una categoria valida'
);

select throws_ok(
  $$insert into public.categorias (nombre) values ('   ')$$,
  '23514',
  null,
  'Rechaza categoria formada por espacios'
);

select throws_ok(
  $$insert into public.categorias (nombre) values (' prueba ')$$,
  '23514',
  null,
  'Rechaza categoria con espacios laterales'
);

select throws_ok(
  $$insert into public.categorias (nombre) values ('PRUEBA')$$,
  '23505',
  null,
  'Rechaza categoria duplicada sin distinguir mayusculas'
);

select lives_ok(
  $$insert into public.productos (categoria_id, nombre, descripcion, genero, clasificacion)
    values (
      (select id from public.categorias where nombre = 'Prueba'),
      'Producto valido', 'Descripcion valida', 'unisex', 'original'
    )$$,
  'Acepta producto valido'
);

select throws_ok(
  $$insert into public.productos (categoria_id, nombre, descripcion)
    values (
      (select id from public.categorias where nombre = 'Prueba'),
      '   ', 'Descripcion valida'
    )$$,
  '23514',
  null,
  'Rechaza nombre de producto vacio'
);

select throws_ok(
  $$insert into public.productos (categoria_id, nombre, descripcion)
    values (
      (select id from public.categorias where nombre = 'Prueba'),
      'Producto', '   '
    )$$,
  '23514',
  null,
  'Rechaza descripcion vacia'
);

select throws_ok(
  $$insert into public.productos (categoria_id, nombre, descripcion, genero)
    values (
      (select id from public.categorias where nombre = 'Prueba'),
      'Producto', 'Descripcion', 'otro'
    )$$,
  '23514',
  null,
  'Rechaza genero no permitido'
);

select throws_ok(
  $$insert into public.productos (categoria_id, nombre, descripcion, clasificacion)
    values (
      (select id from public.categorias where nombre = 'Prueba'),
      'Producto', 'Descripcion', 'premium'
    )$$,
  '23514',
  null,
  'Rechaza clasificacion no permitida'
);

select lives_ok(
  $$insert into public.productos (categoria_id, nombre, descripcion, referencia)
    values (
      (select id from public.categorias where nombre = 'Prueba'),
      'Producto con referencia', 'Descripcion', 'REF-1'
    )$$,
  'Acepta referencia unica'
);

select throws_ok(
  $$insert into public.productos (categoria_id, nombre, descripcion, referencia)
    values (
      (select id from public.categorias where nombre = 'Prueba'),
      'Producto duplicado', 'Descripcion', 'REF-1'
    )$$,
  '23505',
  null,
  'Rechaza referencia duplicada'
);

select throws_ok(
  $$delete from public.categorias where nombre = 'Prueba'$$,
  '23503',
  null,
  'Impide eliminar categoria con productos'
);

select lives_ok(
  $$update public.productos set marca = null where nombre = 'Producto valido'$$,
  'Acepta NULL en atributo opcional'
);

select isnt(
  (select actualizado_en from public.productos where nombre = 'Producto valido'),
  null,
  'Producto conserva actualizado_en'
);

select lives_ok(
  $$insert into public.presentaciones
      (producto_id, etiqueta, precio_normal, stock, modo_disponibilidad)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      '100 ml', 100000, 0, 'venta_inmediata'
    )$$,
  'Venta inmediata puede estar agotada'
);

select lives_ok(
  $$insert into public.presentaciones
      (producto_id, etiqueta, precio_normal, precio_promocional, stock, modo_disponibilidad)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      '50 ml', 80000, 70000, 0, 'bajo_pedido'
    )$$,
  'Acepta bajo pedido sin stock y promocion valida'
);

select throws_ok(
  $$insert into public.presentaciones
      (producto_id, etiqueta, precio_normal, stock, modo_disponibilidad)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      '30 ml', 50000, 1, 'bajo_pedido'
    )$$,
  '23514', null, 'Rechaza bajo pedido con stock'
);

select throws_ok(
  $$insert into public.presentaciones
      (producto_id, etiqueta, precio_normal, stock, modo_disponibilidad)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      '   ', 50000, 1, 'venta_inmediata'
    )$$,
  '23514', null, 'Rechaza etiqueta vacia'
);

select throws_ok(
  $$insert into public.presentaciones
      (producto_id, etiqueta, precio_normal, stock, modo_disponibilidad)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      'Invalida', 0, 0, 'venta_inmediata'
    )$$,
  '23514', null, 'Rechaza precio normal no positivo'
);

select throws_ok(
  $$insert into public.presentaciones
      (producto_id, etiqueta, precio_normal, precio_promocional, stock, modo_disponibilidad)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      'Invalida', 50000, 50000, 0, 'venta_inmediata'
    )$$,
  '23514', null, 'Rechaza promocion igual al precio normal'
);

select throws_ok(
  $$insert into public.presentaciones
      (producto_id, etiqueta, precio_normal, precio_promocional, stock, modo_disponibilidad)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      'Invalida', 50000, 50001, 0, 'venta_inmediata'
    )$$,
  '23514', null, 'Rechaza promocion mayor al precio normal'
);

select throws_ok(
  $$insert into public.presentaciones
      (producto_id, etiqueta, precio_normal, precio_promocional, stock, modo_disponibilidad)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      'Invalida', 50000, -1, 0, 'venta_inmediata'
    )$$,
  '23514', null, 'Rechaza promocion no positiva'
);

select throws_ok(
  $$insert into public.presentaciones
      (producto_id, etiqueta, precio_normal, stock, modo_disponibilidad)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      'Invalida', 50000, -1, 'venta_inmediata'
    )$$,
  '23514', null, 'Rechaza stock negativo'
);

select throws_ok(
  $$insert into public.presentaciones
      (producto_id, etiqueta, precio_normal, stock, modo_disponibilidad)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      'Invalida', 50000, 0, 'desconocido'
    )$$,
  '23514', null, 'Rechaza modo desconocido'
);

select lives_ok(
  $$insert into public.imagenes_producto
      (producto_id, url, identificador_externo, texto_alternativo, posicion)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      'https://example.test/producto.webp', 'productos/producto.webp', null, 0
    )$$,
  'Acepta imagen valida y texto alternativo nulo'
);

select throws_ok(
  $$insert into public.imagenes_producto
      (producto_id, url, identificador_externo, posicion)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      'https://example.test/otra.webp', 'productos/otra.webp', 0
    )$$,
  '23505', null, 'Rechaza posicion duplicada para el producto'
);

select throws_ok(
  $$insert into public.imagenes_producto
      (producto_id, url, identificador_externo, posicion)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      'https://example.test/otra.webp', 'productos/otra.webp', -1
    )$$,
  '23514', null, 'Rechaza posicion negativa'
);

select * from finish();
rollback;
