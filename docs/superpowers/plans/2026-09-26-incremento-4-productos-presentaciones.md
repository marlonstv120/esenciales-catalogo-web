# Incremento 4: productos y presentaciones Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que un administrador activo gestione productos, presentaciones, promociones e inventario desde un workspace responsive.

**Architecture:** Un shell administrativo con hash routes contiene la sesion y la navegacion. Modulos de datos puros encapsulan consultas Supabase; controladores por pantalla conservan estado y eventos; vistas puras generan el HTML de productos e inventario. Se reutiliza RLS y el esquema existente.

**Tech Stack:** Vite, JavaScript ES modules, `@supabase/supabase-js`, Supabase PostgreSQL/RLS, pgTAP y `node:test`.

**Spec:** `docs/superpowers/specs/2026-09-26-incremento-4-productos-presentaciones-design.md`

## Global Constraints

- No agregar dependencias, framework, `service_role` ni cambios remotos sin autorizacion.
- Un producto incompleto se puede guardar, pero debe mostrarse `No publicable` hasta cumplir RN-19.
- Producto primero; las presentaciones se crean o editan despues, usando su `producto_id`.
- Incluir promocion opcional; aplazar familia olfativa, imagenes, Storage, catalogo publico y solicitudes.
- No eliminar fisicamente productos ni presentaciones.
- Bajo pedido siempre usa stock cero; Agotado se deriva de venta inmediata con stock cero.
- Usar `docs/project/DESIGN.md`: tabla desktop cuando compara datos y lista estructurada en movil.
- Limitar pruebas nuevas a contratos de datos y vistas; el equipo realiza la validacion manual responsive.

## Review Focus

- Una categoria inactiva nunca aparece como opcion seleccionable al crear o editar un producto.
- Una referencia duplicada o promocion invalida conserva los valores ingresados y muestra un error comprensible.
- Una carga de productos que termina tras cerrar sesion no vuelve a mostrar datos administrativos.
- Bajo pedido fuerza stock cero incluso si el formulario enviaba otro valor.
- Un producto sin imagen o presentacion valida se identifica claramente como no publicable sin impedir guardarlo.

---

## File Structure

- `src/admin-shell.js`: rutas hash, shell y ciclo de vida de las pantallas administrativas.
- `src/categories-controller.js`: CRUD existente de categorias extraido desde `main.js`.
- `src/products.js`: operaciones Supabase y normalizacion de productos/presentaciones.
- `src/product-views.mjs`: listados, formularios, resumen de publicacion y dialogos.
- `src/products-controller.js`: pantalla Productos y editor de producto.
- `src/inventory-controller.js`: pantalla Inventario y edicion rapida.
- `src/main.js`: Auth e inicializacion del shell autorizado.
- `src/styles.css`: navegacion, tablas/listas, formularios y estados del workspace.
- `tests/products.test.mjs`: contratos de normalizacion y consultas.
- `tests/product-views.test.mjs`: contratos de vistas y estados derivados.

### Task 1: Extraer shell administrativo y categorias

**Files:**
- Create: `src/admin-shell.js`
- Create: `src/categories-controller.js`
- Modify: `src/main.js`
- Modify: `src/category-views.mjs`
- Modify: `src/styles.css`

**Interfaces:**
- Produces: `startAdminShell({ app, generation, isCurrentGeneration, onSignOut })`.
- Consumes: `renderCategoriesScreen(context)` desde el controlador de categorias.

- [ ] **Step 1: Escribir una prueba que falle para la ruta administrativa**

```js
test('uses products as the active screen for the productos hash', () => {
  assert.equal(getAdminRoute('#productos'), 'productos');
  assert.equal(getAdminRoute('#otra-ruta'), 'categorias');
});
```

- [ ] **Step 2: Ejecutar la prueba**

Run: `node --test tests/admin-shell.test.mjs`

Expected: falla porque `src/admin-shell.js` no existe.

- [ ] **Step 3: Implementar el shell y trasladar categorias**

```js
export function getAdminRoute(hash) {
  return ['categorias', 'productos', 'inventario'].includes(hash.slice(1))
    ? hash.slice(1)
    : 'categorias';
}
```

El shell escucha `hashchange`, verifica `isCurrentGeneration()` antes de renderizar datos y conserva `Cerrar sesion`. Mover el estado, carga y eventos de categorias a `categories-controller.js`; mantener sus selectores y comportamiento probados. La navegacion lateral se vuelve un menu compacto accesible bajo `64rem`.

- [ ] **Step 4: Ejecutar pruebas de shell y categorias**

Run: `node --test tests/admin-shell.test.mjs tests/categories.test.mjs tests/category-views.test.mjs`

Expected: PASS.

### Task 2: Crear contratos de datos para productos y presentaciones

**Files:**
- Create: `src/products.js`
- Create: `tests/products.test.mjs`

**Interfaces:**
- Produces: `listProducts(client)`, `getProduct(client, id)`, `saveProduct(client, id, values)`, `savePresentation(client, id, values)`, `listInventory(client)`.
- Returns: Supabase `{ data, error }`; los valores se normalizan antes de consultar.

- [ ] **Step 1: Escribir pruebas que fallen para normalizacion**

```js
test('normalizes optional product fields before insert', () => {
  const values = normalizeProduct({ nombre: '  Aroma  ', marca: ' ', referencia: ' REF-1 ' });
  assert.deepEqual(values, { nombre: 'Aroma', marca: null, referencia: 'REF-1' });
});

test('forces zero stock for bajo pedido', () => {
  assert.equal(normalizePresentation({ stock: 8, modo_disponibilidad: 'bajo_pedido' }).stock, 0);
});
```

- [ ] **Step 2: Ejecutar la prueba**

Run: `node --test tests/products.test.mjs`

Expected: falla porque `src/products.js` no existe.

- [ ] **Step 3: Implementar normalizacion y consultas**

```js
export function normalizePresentation(values) {
  const modo = values.modo_disponibilidad;
  return { ...values, stock: modo === 'bajo_pedido' ? 0 : Number(values.stock) };
}

export function saveProduct(client, id, values) {
  const query = client.from('productos');
  return id ? query.update(values).eq('id', id).select(PRODUCT_COLUMNS).single()
    : query.insert(values).select(PRODUCT_COLUMNS).single();
}
```

Incluir categoria, presentaciones e imagenes en `getProduct`; usar una consulta de inventario que relacione producto y categoria. Mapear errores `23505` de referencia y `23514` de restricciones en el controlador, no en este modulo.

- [ ] **Step 4: Ejecutar las pruebas de datos**

Run: `node --test tests/products.test.mjs`

Expected: PASS.

### Task 3: Construir vistas de productos y presentaciones

**Files:**
- Create: `src/product-views.mjs`
- Create: `tests/product-views.test.mjs`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: producto con `categoria`, `presentaciones` e `imagenes_producto`.
- Produces: `productsView`, `productFormView`, `presentationFormView`, `inventoryView`, `publicationSummary`.

- [ ] **Step 1: Escribir pruebas que fallen para estados derivados**

```js
test('marks a product without an image as not publishable', () => {
  const summary = publicationSummary({ activo: true, categoria: { activo: true }, imagenes_producto: [], presentaciones: [validPresentation] });
  assert.match(summary, /No publicable/);
  assert.match(summary, /Imagen pendiente/);
});

test('shows agotado from immediate-sale stock zero', () => {
  assert.match(presentationRowView({ modo_disponibilidad: 'venta_inmediata', stock: 0, activo: true }), /Agotado/);
});
```

- [ ] **Step 2: Ejecutar la prueba**

Run: `node --test tests/product-views.test.mjs`

Expected: falla porque `src/product-views.mjs` no existe.

- [ ] **Step 3: Implementar vistas y estilos**

Construir listado con imagen ausente neutral, nombre, categoria, estado, destacado y resumen. Crear formulario de datos generales con categorias activas y editor de presentaciones disponible solo para productos guardados. Usar `fieldset` para disponibilidad/precio, etiqueta COP visible y errores asociados. El inventario usa tabla en escritorio y lista en movil. Escapar todo valor interpolado.

- [ ] **Step 4: Ejecutar las pruebas de vistas**

Run: `node --test tests/product-views.test.mjs`

Expected: PASS.

### Task 4: Integrar Productos e Inventario

**Files:**
- Create: `src/products-controller.js`
- Create: `src/inventory-controller.js`
- Modify: `src/admin-shell.js`
- Modify: `src/styles.css`
- Modify: `tests/products.test.mjs`

**Interfaces:**
- Consumes: shell context `{ app, generation, isCurrentGeneration }`, módulos de datos y vistas.
- Produces: `renderProductsScreen(context)` y `renderInventoryScreen(context)`.

- [ ] **Step 1: Extender pruebas para errores recuperables**

```js
test('keeps a promotional price after a database constraint error', () => {
  const view = productFormView({ values: { precio_promocional: '50000' }, error: 'La promocion debe ser menor al precio normal.' });
  assert.match(view, /value="50000"/);
  assert.match(view, /La promocion debe ser menor al precio normal/);
});
```

- [ ] **Step 2: Ejecutar la prueba**

Run: `node --test tests/product-views.test.mjs`

Expected: falla hasta conservar los valores en el formulario.

- [ ] **Step 3: Implementar controladores**

Productos carga categorias y productos autorizados, aplica busqueda/filtros locales, confirma desactivacion y preserva datos ante error. Al guardar producto, redirige o conserva el editor con la seccion Presentaciones habilitada. Inventario permite modificar precio normal, promocion, stock, modo y activo; bloquea envio duplicado. Cada carga verifica la generacion de sesion antes de renderizar y cada dialogo controla foco, Escape y devolucion de foco.

- [ ] **Step 4: Ejecutar pruebas de cliente y compilacion**

Run: `npm run test:auth`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

### Task 5: Validar y actualizar evidencia

**Files:**
- Modify: `docs/development/mvp-implementation-roadmap.md`
- Modify: `.ai/current-context.md`
- Modify: `docs/history/project-log.md`

- [ ] **Step 1: Revisar cobertura SQL existente**

Confirmar que `02_catalog_integrity.test.sql` prueba precio, promocion, stock, modo y bajo pedido; y que `05_admin_auth_security.test.sql` prueba RLS de productos/presentaciones. Agregar SQL solo ante una regla no cubierta o una regresion demostrada.

- [ ] **Step 2: Ejecutar la validacion automatizada**

Run: `npm test`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Documentar evidencia real y pendientes manuales**

Actualizar el estado del Incremento 4 solo con los comandos que pasen. Registrar como pendiente la verificacion manual de productos, presentaciones e inventario en 390 px, 768 px y escritorio, teclado, zoom, datos largos y errores. No afirmar carga de imagenes, lectura publica o despliegue.

## Self-Review

- Cobertura: Task 1 protege la arquitectura y categorias; Task 2 normaliza datos; Task 3 cubre publicacion derivada y UI; Task 4 integra CRUD e inventario; Task 5 valida y documenta.
- Review focus: categoria inactiva, promocion, sesion, bajo pedido y publicacion tienen contrato de datos o vista en Tasks 2 a 4.
- Consistencia: los controladores consumen las funciones definidas en Task 2 y las vistas de Task 3; el shell conserva una unica generacion de sesion.
- Alcance: no hay Storage, familia olfativa, catalogo publico, solicitudes, dependencia nueva ni eliminacion fisica.
