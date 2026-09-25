# Catalog Database Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear un esquema local reproducible y probado para usuarios administrativos, categorias, productos, presentaciones e imagenes de producto.

**Architecture:** Una unica migracion inicial define el nucleo relacional del catalogo, sus restricciones, indices, marcas de tiempo y una postura de seguridad cerrada. Pruebas pgTAP separadas por responsabilidad verifican estructura, integridad y privilegios; `seed.sql` aporta un conjunto local reproducible de categorias sin mezclar datos reales con el esquema.

**Tech Stack:** PostgreSQL 17, Supabase CLI 2.117.0, migraciones SQL, pgTAP, npm scripts.

**Spec:** `docs/superpowers/specs/2026-09-24-mvp-implementation-strategy-design.md`

## Global Constraints

- El MVP pertenece exclusivamente a ESENCIALES; no agregar `tenant_id`, empresas ni soporte multiemprendimiento.
- Usar nombres de tablas y columnas en espanol, minusculas y sin tildes.
- Las claves de negocio usan enteros generados; `usuarios_administrativos.id` usa el UUID de `auth.users`.
- Usar `timestamptz` para fechas y enteros COP sin decimales para precios.
- Los campos opcionales usan `NULL`, no texto vacio.
- No almacenar estados publicos derivados ni una columna `publicado`.
- No agregar tablas de solicitudes, detalles, auditoria de inventario, roles o configuracion en este incremento.
- No agregar dependencias nuevas.
- No aplicar migraciones al proyecto remoto durante este plan.
- Los pasos de commit se omiten salvo que el usuario solicite explicitamente crear commits.
- Docker Desktop debe estar iniciado antes de ejecutar comandos locales de Supabase.
- Las migraciones SQL son la fuente tecnica del esquema implementado.

## Review Focus

- Nombres formados solo por espacios deben rechazarse en categorias, productos y presentaciones; lo prueba Task 4.
- Una categoria duplicada con distinta combinacion de mayusculas y espacios laterales debe rechazarse; lo prueba Task 4.
- `bajo_pedido` con stock distinto de cero debe rechazarse sin impedir que `venta_inmediata` tenga stock cero; lo prueba Task 5.
- Precio promocional igual, mayor o no positivo respecto al normal debe rechazarse; lo prueba Task 5.
- `anon` y `authenticated` no deben obtener acceso directo por crear tablas nuevas; lo prueba Task 7.

---

## File Map

| Archivo | Responsabilidad |
| --- | --- |
| `package.json` | Exponer un comando estable para ejecutar pruebas de base de datos. |
| `supabase/migrations/20260924000100_create_catalog_core.sql` | Definir funcion de marcas de tiempo, cinco tablas, restricciones, indices, triggers, RLS y revocaciones. |
| `supabase/tests/database/01_catalog_structure.test.sql` | Verificar tablas, columnas, tipos, relaciones, indices y triggers. |
| `supabase/tests/database/02_catalog_integrity.test.sql` | Verificar entradas validas e invalidas del modelo del catalogo. |
| `supabase/tests/database/03_catalog_security.test.sql` | Verificar RLS y ausencia de privilegios para roles de API. |
| `supabase/tests/database/04_catalog_seed.test.sql` | Verificar las cinco categorias iniciales despues del reset. |
| `supabase/seed.sql` | Insertar categorias iniciales reproducibles e idempotentes. |
| `.ai/current-context.md` | Reflejar el estado real cuando el incremento haya sido validado. |
| `docs/architecture/data-model.md` | Cambiar el estado de las entidades materializadas y registrar decisiones SQL finales. |
| `docs/history/project-log.md` | Registrar el hito una vez comprobado. |
| `docs/development/mvp-implementation-roadmap.md` | Marcar el Incremento 1 como completado solo al superar la puerta de salida. |

### Task 1: Preparar el ciclo de pruebas SQL

**Files:**
- Modify: `package.json`
- Create: `supabase/tests/database/01_catalog_structure.test.sql`

**Interfaces:**
- Consumes: Supabase CLI configurada por `supabase/config.toml`.
- Produces: comando `npm run supabase:test-db` y suite pgTAP descubierta por Supabase CLI.

- [ ] **Step 1: Agregar el script de pruebas de base de datos**

Agregar despues de `supabase:reset` en `package.json`:

```json
"supabase:reset": "supabase db reset",
"supabase:test-db": "supabase test db"
```

- [ ] **Step 2: Escribir la prueba estructural inicial que debe fallar**

Crear `supabase/tests/database/01_catalog_structure.test.sql`:

```sql
begin;

select plan(1);

select has_table('public', 'categorias', 'Debe existir categorias');

select * from finish();
rollback;
```

- [ ] **Step 3: Iniciar Supabase local**

Run: `npm run supabase:start`
Expected: servicios locales saludables y Studio disponible en `http://127.0.0.1:55323`. Si Docker no esta iniciado, detener esta tarea, iniciar Docker Desktop y repetir el comando.

- [ ] **Step 4: Ejecutar la prueba y comprobar el fallo esperado**

Run: `npm run supabase:test-db`
Expected: FAIL porque `public.categorias` no existe.

- [ ] **Step 5: Commit**

```bash
git add package.json supabase/tests/database/01_catalog_structure.test.sql
git commit -m "test: preparar pruebas del esquema de catalogo"
```

### Task 2: Crear usuarios administrativos y categorias

**Files:**
- Create: `supabase/migrations/20260924000100_create_catalog_core.sql`
- Modify: `supabase/tests/database/01_catalog_structure.test.sql`

**Interfaces:**
- Consumes: `auth.users(id)` provista por Supabase Auth.
- Produces: `public.actualizar_actualizado_en()`, `public.usuarios_administrativos` y `public.categorias`; las tareas posteriores consumen `categorias.id`.

- [ ] **Step 1: Ampliar la prueba estructural antes de implementar**

Reemplazar `select plan(1);` por `select plan(17);` y agregar antes de la asercion existente de categorias:

```sql
select has_column('public', 'usuarios_administrativos', 'id', 'Administrador tiene id');
select col_type_is('public', 'usuarios_administrativos', 'id', 'uuid', 'Id administrativo usa UUID');
select has_pk('public', 'usuarios_administrativos', 'Administrador tiene clave primaria');
select has_fk('public', 'usuarios_administrativos', 'Administrador referencia auth.users');
select has_column('public', 'usuarios_administrativos', 'activo', 'Administrador tiene estado activo');
select has_column('public', 'usuarios_administrativos', 'creado_en', 'Administrador registra creacion');
select has_column('public', 'usuarios_administrativos', 'actualizado_en', 'Administrador registra actualizacion');
select has_trigger('public', 'usuarios_administrativos', 'usuarios_administrativos_actualizar_fecha', 'Administrador actualiza su marca de tiempo');
```

Agregar despues de la asercion existente de categorias y antes de `finish()`:

```sql
select has_column('public', 'categorias', 'id', 'Categoria tiene id');
select col_type_is('public', 'categorias', 'id', 'integer', 'Id de categoria usa integer');
select has_pk('public', 'categorias', 'Categoria tiene clave primaria');
select has_column('public', 'categorias', 'nombre', 'Categoria tiene nombre');
select has_column('public', 'categorias', 'activo', 'Categoria tiene estado activo');
select has_column('public', 'categorias', 'creado_en', 'Categoria registra creacion');
select has_column('public', 'categorias', 'actualizado_en', 'Categoria registra actualizacion');
select has_trigger('public', 'categorias', 'categorias_actualizar_fecha', 'Categoria actualiza su marca de tiempo');
```

- [ ] **Step 2: Ejecutar la prueba y verificar que las nuevas aserciones fallan**

Run: `npm run supabase:test-db`
Expected: FAIL porque las tablas y columnas aun no existen.

- [ ] **Step 3: Crear la funcion y las dos primeras tablas**

Crear `supabase/migrations/20260924000100_create_catalog_core.sql` con:

```sql
create function public.actualizar_actualizado_en()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

create table public.usuarios_administrativos (
  id uuid primary key references auth.users (id) on update cascade on delete restrict,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create trigger usuarios_administrativos_actualizar_fecha
before update on public.usuarios_administrativos
for each row execute function public.actualizar_actualizado_en();

create table public.categorias (
  id integer generated always as identity primary key,
  nombre text not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint categorias_nombre_valido check (
    nombre = btrim(nombre) and nombre <> ''
  )
);

create unique index categorias_nombre_unico_ci
on public.categorias (lower(nombre));

create trigger categorias_actualizar_fecha
before update on public.categorias
for each row execute function public.actualizar_actualizado_en();
```

- [ ] **Step 4: Reconstruir la base local**

Run: `npm run supabase:reset`
Expected: PASS y la migracion `20260924000100_create_catalog_core.sql` aplicada.

- [ ] **Step 5: Ejecutar las pruebas estructurales**

Run: `npm run supabase:test-db`
Expected: las 17 aserciones de usuarios y categorias pasan.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260924000100_create_catalog_core.sql supabase/tests/database/01_catalog_structure.test.sql
git commit -m "feat: crear usuarios administrativos y categorias"
```

### Task 3: Crear productos, presentaciones e imagenes

**Files:**
- Modify: `supabase/migrations/20260924000100_create_catalog_core.sql`
- Modify: `supabase/tests/database/01_catalog_structure.test.sql`

**Interfaces:**
- Consumes: `public.categorias(id)` de Task 2.
- Produces: `productos.id`, `presentaciones.id`, `imagenes_producto.id` y sus relaciones para los incrementos de administracion, Storage y solicitudes.

- [ ] **Step 1: Reemplazar la prueba estructural por la version completa**

Usar este contenido en `supabase/tests/database/01_catalog_structure.test.sql`:

```sql
begin;

select plan(46);

select has_table('public', 'usuarios_administrativos', 'Debe existir usuarios_administrativos');
select has_table('public', 'categorias', 'Debe existir categorias');
select has_table('public', 'productos', 'Debe existir productos');
select has_table('public', 'presentaciones', 'Debe existir presentaciones');
select has_table('public', 'imagenes_producto', 'Debe existir imagenes_producto');

select col_type_is('public', 'usuarios_administrativos', 'id', 'uuid', 'Id administrativo usa UUID');
select has_pk('public', 'usuarios_administrativos', 'Administrador tiene clave primaria');
select has_fk('public', 'usuarios_administrativos', 'Administrador referencia auth.users');
select has_column('public', 'usuarios_administrativos', 'activo', 'Administrador tiene estado activo');
select has_column('public', 'usuarios_administrativos', 'creado_en', 'Administrador registra creacion');
select has_column('public', 'usuarios_administrativos', 'actualizado_en', 'Administrador registra actualizacion');
select has_trigger('public', 'usuarios_administrativos', 'usuarios_administrativos_actualizar_fecha', 'Administrador actualiza su marca de tiempo');

select col_type_is('public', 'categorias', 'id', 'integer', 'Id de categoria usa integer');
select has_pk('public', 'categorias', 'Categoria tiene clave primaria');
select has_column('public', 'categorias', 'nombre', 'Categoria tiene nombre');
select has_column('public', 'categorias', 'activo', 'Categoria tiene estado activo');
select has_index('public', 'categorias', 'categorias_nombre_unico_ci', 'Categoria tiene indice unico por nombre');
select has_trigger('public', 'categorias', 'categorias_actualizar_fecha', 'Categoria actualiza su marca de tiempo');

select col_type_is('public', 'productos', 'id', 'integer', 'Id de producto usa integer');
select has_pk('public', 'productos', 'Producto tiene clave primaria');
select has_fk('public', 'productos', 'Producto referencia categoria');
select has_column('public', 'productos', 'descripcion', 'Producto tiene descripcion');
select has_column('public', 'productos', 'genero', 'Producto tiene genero opcional');
select has_column('public', 'productos', 'clasificacion', 'Producto tiene clasificacion opcional');
select has_column('public', 'productos', 'destacado', 'Producto tiene indicador destacado');
select has_index('public', 'productos', 'productos_categoria_id_idx', 'FK de producto tiene indice');
select has_index('public', 'productos', 'productos_referencia_unica', 'Referencia tiene indice unico');
select has_trigger('public', 'productos', 'productos_actualizar_fecha', 'Producto actualiza su marca de tiempo');

select col_type_is('public', 'presentaciones', 'id', 'integer', 'Id de presentacion usa integer');
select has_pk('public', 'presentaciones', 'Presentacion tiene clave primaria');
select has_fk('public', 'presentaciones', 'Presentacion referencia producto');
select has_column('public', 'presentaciones', 'precio_normal', 'Presentacion tiene precio normal');
select has_column('public', 'presentaciones', 'precio_promocional', 'Presentacion tiene precio promocional opcional');
select has_column('public', 'presentaciones', 'stock', 'Presentacion tiene stock');
select has_column('public', 'presentaciones', 'modo_disponibilidad', 'Presentacion tiene modo');
select has_index('public', 'presentaciones', 'presentaciones_producto_id_idx', 'FK de presentacion tiene indice');
select has_trigger('public', 'presentaciones', 'presentaciones_actualizar_fecha', 'Presentacion actualiza su marca de tiempo');

select col_type_is('public', 'imagenes_producto', 'id', 'integer', 'Id de imagen usa integer');
select has_pk('public', 'imagenes_producto', 'Imagen tiene clave primaria');
select has_fk('public', 'imagenes_producto', 'Imagen referencia producto');
select has_column('public', 'imagenes_producto', 'identificador_externo', 'Imagen conserva ruta de Storage');
select has_column('public', 'imagenes_producto', 'posicion', 'Imagen tiene posicion');
select has_index('public', 'imagenes_producto', 'imagenes_producto_producto_id_idx', 'FK de imagen tiene indice');

select * from finish();
rollback;
```

- [ ] **Step 2: Ejecutar la prueba y comprobar el fallo de las tablas pendientes**

Run: `npm run supabase:test-db`
Expected: FAIL en las aserciones de productos, presentaciones e imagenes.

- [ ] **Step 3: Agregar productos a la migracion**

Agregar despues del trigger de categorias:

```sql
create table public.productos (
  id integer generated always as identity primary key,
  categoria_id integer not null references public.categorias (id) on update cascade on delete restrict,
  nombre text not null,
  descripcion text not null,
  marca text,
  genero text,
  familia_olfativa text,
  referencia text,
  clasificacion text,
  destacado boolean not null default false,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint productos_nombre_valido check (nombre = btrim(nombre) and nombre <> ''),
  constraint productos_descripcion_valida check (descripcion = btrim(descripcion) and descripcion <> ''),
  constraint productos_marca_valida check (marca is null or (marca = btrim(marca) and marca <> '')),
  constraint productos_genero_valido check (genero is null or genero in ('hombre', 'mujer', 'unisex')),
  constraint productos_familia_olfativa_valida check (
    familia_olfativa is null or (familia_olfativa = btrim(familia_olfativa) and familia_olfativa <> '')
  ),
  constraint productos_referencia_valida check (
    referencia is null or (referencia = btrim(referencia) and referencia <> '')
  ),
  constraint productos_clasificacion_valida check (
    clasificacion is null or clasificacion in ('original', 'uno_a_uno', 'inspiracion')
  )
);

create index productos_categoria_id_idx on public.productos (categoria_id);
create unique index productos_referencia_unica
on public.productos (referencia)
where referencia is not null;

create trigger productos_actualizar_fecha
before update on public.productos
for each row execute function public.actualizar_actualizado_en();
```

- [ ] **Step 4: Agregar presentaciones a la migracion**

```sql
create table public.presentaciones (
  id integer generated always as identity primary key,
  producto_id integer not null references public.productos (id) on update cascade on delete restrict,
  etiqueta text not null,
  precio_normal integer not null,
  precio_promocional integer,
  stock integer not null default 0,
  modo_disponibilidad text not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint presentaciones_etiqueta_valida check (etiqueta = btrim(etiqueta) and etiqueta <> ''),
  constraint presentaciones_precio_normal_valido check (precio_normal > 0),
  constraint presentaciones_precio_promocional_valido check (
    precio_promocional is null or (precio_promocional > 0 and precio_promocional < precio_normal)
  ),
  constraint presentaciones_stock_valido check (stock >= 0),
  constraint presentaciones_modo_valido check (
    modo_disponibilidad in ('venta_inmediata', 'bajo_pedido', 'no_disponible')
  ),
  constraint presentaciones_bajo_pedido_sin_stock check (
    modo_disponibilidad <> 'bajo_pedido' or stock = 0
  )
);

create index presentaciones_producto_id_idx on public.presentaciones (producto_id);

create trigger presentaciones_actualizar_fecha
before update on public.presentaciones
for each row execute function public.actualizar_actualizado_en();
```

- [ ] **Step 5: Agregar imagenes a la migracion**

```sql
create table public.imagenes_producto (
  id integer generated always as identity primary key,
  producto_id integer not null references public.productos (id) on update cascade on delete restrict,
  url text not null,
  identificador_externo text not null,
  texto_alternativo text,
  posicion integer not null,
  creado_en timestamptz not null default now(),
  constraint imagenes_producto_url_valida check (url = btrim(url) and url <> ''),
  constraint imagenes_producto_identificador_valido check (
    identificador_externo = btrim(identificador_externo) and identificador_externo <> ''
  ),
  constraint imagenes_producto_texto_alternativo_valido check (
    texto_alternativo is null or (texto_alternativo = btrim(texto_alternativo) and texto_alternativo <> '')
  ),
  constraint imagenes_producto_posicion_valida check (posicion >= 0),
  constraint imagenes_producto_posicion_unica unique (producto_id, posicion)
);

create index imagenes_producto_producto_id_idx on public.imagenes_producto (producto_id);
```

- [ ] **Step 6: Reconstruir y probar la estructura completa**

Run: `npm run supabase:reset`
Expected: PASS.

Run: `npm run supabase:test-db`
Expected: las 46 aserciones pasan.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/20260924000100_create_catalog_core.sql supabase/tests/database/01_catalog_structure.test.sql
git commit -m "feat: crear esquema principal del catalogo"
```

### Task 4: Probar integridad de categorias y productos

**Files:**
- Create: `supabase/tests/database/02_catalog_integrity.test.sql`
- Modify: `supabase/migrations/20260924000100_create_catalog_core.sql` only if a test exposes a missing constraint

**Interfaces:**
- Consumes: tablas y restricciones creadas en Tasks 2 y 3.
- Produces: contrato probado para nombres, referencias, valores controlados, relaciones y marcas de tiempo.

- [ ] **Step 1: Escribir pruebas de categorias y productos**

Crear `supabase/tests/database/02_catalog_integrity.test.sql`:

```sql
begin;

select plan(14);

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

select * from finish();
rollback;
```

- [ ] **Step 2: Ejecutar la prueba de integridad**

Run: `npm run supabase:test-db`
Expected: PASS. Si una asercion falla, ajustar la restriccion correspondiente en la migracion, ejecutar `npm run supabase:reset` y repetir hasta que pase; no relajar la prueba para aceptar datos contrarios al modelo.

- [ ] **Step 3: Commit**

```bash
git add supabase/tests/database/02_catalog_integrity.test.sql supabase/migrations/20260924000100_create_catalog_core.sql
git commit -m "test: verificar integridad de categorias y productos"
```

### Task 5: Probar integridad de presentaciones e imagenes

**Files:**
- Modify: `supabase/tests/database/02_catalog_integrity.test.sql`
- Modify: `supabase/migrations/20260924000100_create_catalog_core.sql` only if a test exposes a missing constraint

**Interfaces:**
- Consumes: producto valido creado dentro de la transaccion de prueba.
- Produces: contrato probado de precios, stock, modos, posiciones y conservacion de relaciones.

- [ ] **Step 1: Ampliar el plan de pruebas**

Cambiar `select plan(14);` por `select plan(27);` y agregar antes de `finish()`:

```sql
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
  '23514',
  null,
  'Rechaza bajo pedido con stock'
);

select throws_ok(
  $$insert into public.presentaciones
      (producto_id, etiqueta, precio_normal, stock, modo_disponibilidad)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      '   ', 50000, 1, 'venta_inmediata'
    )$$,
  '23514',
  null,
  'Rechaza etiqueta vacia'
);

select throws_ok(
  $$insert into public.presentaciones
      (producto_id, etiqueta, precio_normal, stock, modo_disponibilidad)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      'Invalida', 0, 0, 'venta_inmediata'
    )$$,
  '23514',
  null,
  'Rechaza precio normal no positivo'
);

select throws_ok(
  $$insert into public.presentaciones
      (producto_id, etiqueta, precio_normal, precio_promocional, stock, modo_disponibilidad)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      'Invalida', 50000, 50000, 0, 'venta_inmediata'
    )$$,
  '23514',
  null,
  'Rechaza promocion igual al precio normal'
);

select throws_ok(
  $$insert into public.presentaciones
      (producto_id, etiqueta, precio_normal, precio_promocional, stock, modo_disponibilidad)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      'Invalida', 50000, 50001, 0, 'venta_inmediata'
    )$$,
  '23514',
  null,
  'Rechaza promocion mayor al precio normal'
);

select throws_ok(
  $$insert into public.presentaciones
      (producto_id, etiqueta, precio_normal, precio_promocional, stock, modo_disponibilidad)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      'Invalida', 50000, -1, 0, 'venta_inmediata'
    )$$,
  '23514',
  null,
  'Rechaza promocion no positiva'
);

select throws_ok(
  $$insert into public.presentaciones
      (producto_id, etiqueta, precio_normal, stock, modo_disponibilidad)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      'Invalida', 50000, -1, 'venta_inmediata'
    )$$,
  '23514',
  null,
  'Rechaza stock negativo'
);

select throws_ok(
  $$insert into public.presentaciones
      (producto_id, etiqueta, precio_normal, stock, modo_disponibilidad)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      'Invalida', 50000, 0, 'desconocido'
    )$$,
  '23514',
  null,
  'Rechaza modo desconocido'
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
  '23505',
  null,
  'Rechaza posicion duplicada para el producto'
);

select throws_ok(
  $$insert into public.imagenes_producto
      (producto_id, url, identificador_externo, posicion)
    values (
      (select id from public.productos where nombre = 'Producto valido'),
      'https://example.test/otra.webp', 'productos/otra.webp', -1
    )$$,
  '23514',
  null,
  'Rechaza posicion negativa'
);
```

- [ ] **Step 2: Ejecutar todas las pruebas de integridad**

Run: `npm run supabase:test-db`
Expected: las 27 aserciones de integridad y las 46 estructurales pasan.

- [ ] **Step 3: Commit**

```bash
git add supabase/tests/database/02_catalog_integrity.test.sql supabase/migrations/20260924000100_create_catalog_core.sql
git commit -m "test: verificar presentaciones e imagenes"
```

### Task 6: Cargar las categorias iniciales

**Files:**
- Modify: `supabase/seed.sql`
- Create: `supabase/tests/database/04_catalog_seed.test.sql`

**Interfaces:**
- Consumes: `public.categorias(nombre)` y su unicidad sin distinguir mayusculas.
- Produces: cinco categorias iniciales disponibles despues de cada `supabase db reset`.

- [ ] **Step 1: Escribir la prueba del seed antes de implementarlo**

Crear `supabase/tests/database/04_catalog_seed.test.sql`:

```sql
begin;

select plan(2);

select results_eq(
  $$select nombre from public.categorias order by nombre$$,
  $$values
      ('Cremas'::text),
      ('Humidificadores'::text),
      ('Otros productos'::text),
      ('Perfumes / Lociones'::text),
      ('Splash'::text)$$,
  'Existen exactamente las cinco categorias iniciales'
);

select results_eq(
  $$select count(*)::bigint from public.categorias where activo$$,
  $$values (5::bigint)$$,
  'Las categorias iniciales estan activas'
);

select * from finish();
rollback;
```

- [ ] **Step 2: Ejecutar la prueba y comprobar el fallo esperado**

Run: `npm run supabase:reset`
Expected: PASS, pero sin insertar categorias.

Run: `npm run supabase:test-db`
Expected: FAIL en `04_catalog_seed.test.sql` porque faltan las cinco categorias.

- [ ] **Step 3: Implementar el seed reproducible**

Reemplazar el contenido de `supabase/seed.sql` por:

```sql
insert into public.categorias (nombre)
select categoria.nombre
from (
  values
    ('Perfumes / Lociones'::text),
    ('Splash'::text),
    ('Cremas'::text),
    ('Humidificadores'::text),
    ('Otros productos'::text)
) as categoria(nombre)
where not exists (
  select 1
  from public.categorias existente
  where lower(existente.nombre) = lower(categoria.nombre)
);
```

- [ ] **Step 4: Reconstruir y verificar el seed**

Run: `npm run supabase:reset`
Expected: PASS y mensaje de ejecucion de `seed.sql`.

Run: `npm run supabase:test-db`
Expected: PASS en estructura, integridad y seed.

- [ ] **Step 5: Comprobar idempotencia**

Run: `npx supabase db query --local --file supabase/seed.sql`
Expected: `INSERT 0 0`.

Run: `npx supabase db query --local "select count(*) from public.categorias;"`
Expected: el resultado sigue siendo `5` y no se produce un error de unicidad.

- [ ] **Step 6: Commit**

```bash
git add supabase/seed.sql supabase/tests/database/04_catalog_seed.test.sql
git commit -m "feat: cargar categorias iniciales"
```

### Task 7: Cerrar el acceso por defecto con RLS

**Files:**
- Modify: `supabase/migrations/20260924000100_create_catalog_core.sql`
- Create: `supabase/tests/database/03_catalog_security.test.sql`

**Interfaces:**
- Consumes: las cinco tablas publicas del catalogo.
- Produces: RLS habilitado y ausencia de privilegios directos para `anon` y `authenticated`; el Incremento 2 agregara politicas permitidas.

- [ ] **Step 1: Escribir las pruebas de seguridad que deben fallar**

Crear `supabase/tests/database/03_catalog_security.test.sql`:

```sql
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
```

- [ ] **Step 2: Ejecutar y comprobar el fallo esperado**

Run: `npm run supabase:test-db`
Expected: FAIL porque RLS aun no esta habilitado. Las pruebas de privilegios pueden pasar debido a `auto_expose_new_tables = false`; el fallo de RLS sigue siendo obligatorio.

- [ ] **Step 3: Agregar postura cerrada al final de la migracion**

```sql
alter table public.usuarios_administrativos enable row level security;
alter table public.categorias enable row level security;
alter table public.productos enable row level security;
alter table public.presentaciones enable row level security;
alter table public.imagenes_producto enable row level security;

revoke all on table public.usuarios_administrativos from anon, authenticated;
revoke all on table public.categorias from anon, authenticated;
revoke all on table public.productos from anon, authenticated;
revoke all on table public.presentaciones from anon, authenticated;
revoke all on table public.imagenes_producto from anon, authenticated;

revoke all on sequence public.categorias_id_seq from anon, authenticated;
revoke all on sequence public.productos_id_seq from anon, authenticated;
revoke all on sequence public.presentaciones_id_seq from anon, authenticated;
revoke all on sequence public.imagenes_producto_id_seq from anon, authenticated;

revoke all on function public.actualizar_actualizado_en() from public, anon, authenticated;
```

- [ ] **Step 4: Reconstruir y ejecutar toda la suite**

Run: `npm run supabase:reset`
Expected: PASS.

Run: `npm run supabase:test-db`
Expected: PASS en las cuatro suites.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260924000100_create_catalog_core.sql supabase/tests/database/03_catalog_security.test.sql
git commit -m "security: cerrar acceso inicial al catalogo"
```

### Task 8: Revisar el esquema y actualizar su documentacion

**Files:**
- Modify: `docs/architecture/data-model.md`
- Modify: `.ai/current-context.md`
- Modify: `docs/history/project-log.md`
- Modify: `docs/development/mvp-implementation-roadmap.md`

**Interfaces:**
- Consumes: migracion y pruebas validadas de Tasks 1 a 7.
- Produces: estado documental coherente y punto de partida del Incremento 2.

- [ ] **Step 1: Ejecutar la verificacion final desde cero**

Run: `npm run supabase:reset`
Expected: exit code 0; migracion y seed aplicados.

Run: `npm run supabase:test-db`
Expected: exit code 0; 46 pruebas estructurales, 27 de integridad, 20 de seguridad y 2 de seed pasan.

Run: `npm run build`
Expected: exit code 0; la migracion no rompe la compilacion existente.

- [ ] **Step 2: Revisar el esquema local en Studio**

Abrir `http://127.0.0.1:55323` y comprobar:

- cinco tablas en `public`;
- claves foraneas hacia categoria, producto y `auth.users`;
- RLS habilitado en las cinco tablas;
- cinco categorias activas;
- ausencia de politicas permisivas, que se agregaran en el Incremento 2.

- [ ] **Step 3: Actualizar el estado del modelo de datos**

En `docs/architecture/data-model.md`:

- cambiar el estado inicial para indicar que las cinco entidades del nucleo del catalogo ya estan materializadas por `20260924000100_create_catalog_core.sql`;
- conservar solicitudes y detalles como diseno pendiente;
- registrar que los valores controlados se implementaron con restricciones `CHECK`, los identificadores con `integer generated always as identity`, la unicidad de categorias mediante `lower(nombre)` y la postura inicial de RLS cerrada;
- no presentar politicas administrativas o publicas como implementadas.

- [ ] **Step 4: Actualizar contexto, historial y roadmap**

En `.ai/current-context.md`, cambiar la fase a seguridad y autenticacion administrativa y definir como siguiente trabajo el Incremento 2.

En `docs/history/project-log.md`, agregar una entrada fechada con:

```markdown
- Se materializo y valido localmente el nucleo PostgreSQL del catalogo mediante una migracion versionada, datos iniciales reproducibles y pruebas pgTAP de estructura, integridad y seguridad cerrada. Las politicas de acceso y la autenticacion administrativa permanecen para el siguiente incremento.
```

En `docs/development/mvp-implementation-roadmap.md`, cambiar el Incremento 1 a `Completado` e incluir como evidencia la migracion y las suites ejecutadas. No hacer este cambio si alguna verificacion anterior fallo.

- [ ] **Step 5: Comprobar que la documentacion no anticipa funciones inexistentes**

Run: `git diff --check`
Expected: sin errores de espacios o formato.

Revisar el diff y confirmar que no afirma que autenticacion, politicas permisivas, Storage, catalogo publico o solicitudes ya funcionan.

- [ ] **Step 6: Commit**

```bash
git add docs/architecture/data-model.md .ai/current-context.md docs/history/project-log.md docs/development/mvp-implementation-roadmap.md
git commit -m "docs: registrar esquema inicial del catalogo"
```

## Final Verification Gate

Antes de considerar completado el Incremento 1, ejecutar nuevamente:

```bash
npm run supabase:reset
npm run supabase:test-db
npm run build
git status --short
```

Resultados requeridos:

- las migraciones reconstruyen la base local desde cero;
- las 95 aserciones pgTAP pasan;
- las cinco categorias iniciales existen una sola vez;
- RLS esta habilitado y los roles de API no tienen privilegios directos;
- el frontend compila;
- no se modifico ni aplico el esquema remoto;
- el estado de Git solo contiene cambios intencionales, si queda alguno.

No iniciar el Incremento 2 si falta cualquiera de estas evidencias.
