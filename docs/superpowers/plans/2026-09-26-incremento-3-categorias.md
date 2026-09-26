# Incremento 3: administracion de categorias Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que el administrador autorizado gestione las categorias del catalogo desde una interfaz responsive.

**Architecture:** `src/categories.js` concentra las consultas protegidas a Supabase y `src/category-views.mjs` genera vistas puras. `src/main.js` conserva la responsabilidad de orquestar sesion, estado y eventos: mantiene `authCard()` para acceso y recuperacion, pero renderiza un workspace independiente cuando la sesion esta autorizada; el RLS existente sigue siendo la barrera efectiva.

**Tech Stack:** Vite, JavaScript ES modules, `@supabase/supabase-js`, Supabase PostgreSQL/RLS, pgTAP y `node:test`.

**Spec:** `docs/superpowers/specs/2026-09-26-incremento-3-categorias-design.md`

## Global Constraints

- No agregar dependencias, framework ni gestor de estado.
- No eliminar fisicamente categorias ni exponer lectura publica.
- Las cinco categorias iniciales pueden editarse, activarse y desactivarse.
- El nombre es obligatorio, sin espacios exteriores y unico sin distinguir mayusculas y minusculas.
- Reutilizar `docs/project/DESIGN.md`: administracion clara, lista movil, tabla de escritorio y panel lateral que ocupa la pantalla en movil.
- No aplicar cambios al proyecto Supabase remoto sin autorizacion expresa.

## Review Focus

- Un nombre que solo difiere por mayusculas debe mostrar un error comprensible y no duplicar datos.
- La desactivacion debe requerir confirmacion y advertir el impacto futuro sobre productos publicos.
- Un error al guardar debe conservar el nombre introducido para permitir corregirlo.
- La lista movil debe conservar nombre, estado y acciones sin desplazamiento horizontal.
- Una sesion revocada o no autorizada debe volver al acceso sin exponer el listado.

---

## File Structure

- `src/categories.js`: `listCategories`, `createCategory` y `updateCategory` con cliente inyectable.
- `src/category-views.mjs`: vistas y helpers puros de la pantalla administrativa.
- `src/main.js`: navegación administrativa, carga y eventos del CRUD.
- `src/styles.css`: layout de workspace, tabla/lista, drawer y estados.
- `tests/categories.test.mjs`: pruebas del módulo de datos mediante cliente falso.
- `tests/category-views.test.mjs`: pruebas de HTML, accesibilidad y estados.
- `supabase/tests/database/06_categories_crud.test.sql`: restricciones y RLS relevantes para categorias.

### Task 1: Crear el módulo de datos de categorías

**Files:**
- Create: `src/categories.js`
- Create: `tests/categories.test.mjs`

**Interfaces:**
- Produces: `listCategories(client)`, `createCategory(client, name)`, `updateCategory(client, id, changes)`.
- Returns: `{ data, error }`, con `name.trim()` aplicado antes de crear o actualizar.

- [ ] **Step 1: Escribir pruebas que fallen**

```js
test('normalizes a category name before inserting', async () => {
  const calls = [];
  const client = fakeClient(calls);
  await createCategory(client, '  Splash  ');
  assert.deepEqual(calls[0].payload, { nombre: 'Splash' });
});

test('lists categories alphabetically', async () => {
  const client = fakeClient([]);
  await listCategories(client);
  assert.deepEqual(client.orderCall, ['nombre', { ascending: true }]);
});
```

- [ ] **Step 2: Ejecutar las pruebas y confirmar el fallo**

Run: `node --test tests/categories.test.mjs`

Expected: falla porque `src/categories.js` no existe.

- [ ] **Step 3: Implementar operaciones mínimas**

```js
export function listCategories(client) {
  return client.from('categorias').select('id, nombre, activo').order('nombre', { ascending: true });
}

export function createCategory(client, name) {
  return client.from('categorias').insert({ nombre: name.trim() }).select('id, nombre, activo').single();
}

export function updateCategory(client, id, changes) {
  const values = { ...changes };
  if (typeof values.nombre === 'string') values.nombre = values.nombre.trim();
  return client.from('categorias').update(values).eq('id', id).select('id, nombre, activo').single();
}
```

- [ ] **Step 4: Ejecutar las pruebas del módulo**

Run: `node --test tests/categories.test.mjs`

Expected: PASS.

### Task 2: Construir vistas accesibles de categorías

**Files:**
- Create: `src/category-views.mjs`
- Create: `tests/category-views.test.mjs`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: objetos `{ id, nombre, activo }` y estados `loading`, `empty`, `error`, `loaded`.
- Produces: `categoriesView`, `categoryFormView`, `deactivationDialogView`.

- [ ] **Step 1: Escribir pruebas de vistas que fallen**

```js
test('renders category name, textual status and available action', () => {
  const view = categoriesView([{ id: 1, nombre: 'Splash', activo: true }]);
  assert.match(view, /Splash/);
  assert.match(view, /Activa/);
  assert.match(view, /Desactivar/);
});

test('renders a labeled category form and confirmation warning', () => {
  assert.match(categoryFormView(), /<label for="category-name">Nombre de la categoría<\/label>/);
  assert.match(deactivationDialogView({ nombre: 'Splash' }), /sus productos se ocultarán del catálogo público/);
});
```

- [ ] **Step 2: Ejecutar las pruebas y confirmar el fallo**

Run: `node --test tests/category-views.test.mjs`

Expected: falla porque `src/category-views.mjs` no existe.

- [ ] **Step 3: Implementar vistas y estilos mínimos**

Crear una región principal con encabezado, `Nueva categoría`, tabla con lista alternativa móvil, alertas semánticas y panel lateral. El formulario debe usar etiqueta visible, `required`, espacio para error, botones `Guardar` y `Cancelar`. El diálogo de desactivación debe incluir título, impacto, `Cancelar` y `Desactivar categoría`.

Agregar estilos mobile-first: lista estructurada bajo `40rem`, tabla desde `40rem`, y panel lateral de ancho completo en móvil. Reutilizar los tokens actuales, los botones existentes y `focus-visible`.

- [ ] **Step 4: Ejecutar las pruebas de vistas**

Run: `node --test tests/category-views.test.mjs`

Expected: PASS.

### Task 3: Integrar CRUD, estados y controles de sesión

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles.css`
- Modify: `tests/categories.test.mjs`
- Modify: `tests/category-views.test.mjs`

**Interfaces:**
- Consumes: `getAuthorizedSession`, `signOut`, `supabase`, `listCategories`, `createCategory`, `updateCategory` y las vistas de Task 2.
- Produces: navegación `Categorías`, recarga segura y CRUD operativo.

- [ ] **Step 1: Extender las pruebas de estados antes de integrar**

Añadir pruebas para vista vacía, error con acción `Reintentar`, formulario que conserva el nombre ante error y acción `Activar` para una categoría inactiva.

```js
test('keeps the submitted name after a save error', () => {
  assert.match(categoryFormView({ nombre: 'Cremas', error: 'Ese nombre ya existe.' }), /value="Cremas"/);
});
```

- [ ] **Step 2: Ejecutar las pruebas y confirmar el fallo**

Run: `node --test tests/categories.test.mjs tests/category-views.test.mjs`

Expected: falla hasta que las vistas y el manejador de error incluyan los nuevos estados.

- [ ] **Step 3: Integrar el flujo en `main.js`**

Conservar `render(content)` para llamar `authCard(content)` en acceso, recuperacion y cambio de clave. Reemplazar `showAuthorized()` por una funcion que use directamente `app.innerHTML = categoriesView(...)`, pues el workspace no debe estar dentro de la tarjeta de autenticacion. Mantener un estado local `{ categories, mode, selectedCategory, message, error }`.

```js
async function loadCategories() {
  renderAdmin({ loading: true });
  const { data, error } = await listCategories(supabase);
  if (error) return renderAdmin({ error: 'No fue posible cargar las categorias.' });
  categoryState = { ...categoryState, categories: data, error: '' };
  renderAdmin();
}

function categoryError(error) {
  return error?.code === '23505'
    ? 'Ya existe una categoria con ese nombre.'
    : 'No fue posible guardar la categoria. Intentalo de nuevo.';
}
```

Al guardar, deshabilitar el boton, invocar el modulo de datos, recargar o sustituir el registro devuelto y anunciar el exito. Ante error, reabrir el formulario con `nombre` conservado. Al cerrar panel o dialogo, devolver foco al boton que lo abrio.

Al desactivar, abrir confirmacion; al aceptar, ejecutar `updateCategory(supabase, id, { activo: false })`. Activar usa `updateCategory(supabase, id, { activo: true })` y confirma el resultado sin dialogo. Si la sesion deja de estar autorizada, volver a la vista de acceso.

- [ ] **Step 4: Ejecutar pruebas de cliente y compilación**

Run: `npm run test:auth`

Expected: PASS, incluidas las pruebas de categorías.

Run: `npm run build`

Expected: PASS.

### Task 4: Añadir regresiones de base de datos y validar el incremento

**Files:**
- Create: `supabase/tests/database/06_categories_crud.test.sql`
- Modify: `docs/development/mvp-implementation-roadmap.md`
- Modify: `.ai/current-context.md`
- Modify: `docs/history/project-log.md`

**Interfaces:**
- Consumes: restricción `categorias_nombre_unico_ci`, trigger de actualización y RLS administrativa existentes.
- Produces: evidencia reproducible y estado documentado del Incremento 3.

- [ ] **Step 1: Escribir pruebas pgTAP de regresión**

Probar que un administrador activo puede crear, renombrar, desactivar y reactivar; que un nombre duplicado sin distinguir mayúsculas falla; que un nombre vacío o con espacios externos falla; y que usuario no autorizado no modifica categorías.

- [ ] **Step 2: Ejecutar la prueba y corregir solo una regresión demostrada**

Run: `npm run supabase:reset; npm run supabase:test-db -- supabase/tests/database/06_categories_crud.test.sql`

Expected: PASS con la migración existente, salvo que la prueba revele una brecha que requiera una migración SQL mínima.

- [ ] **Step 3: Ejecutar la validación final**

Run: `npm test`

Expected: PASS para pgTAP y `node:test`.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 4: Actualizar documentación solo con evidencia real**

Marcar el Incremento 3 como completado únicamente si las pruebas y recorridos manuales observados pasan. Registrar migraciones creadas, comandos ejecutados y cualquier validación responsive pendiente. No afirmar que se aplicó una migración al proyecto remoto.

## Self-Review

- Cobertura: Task 1 implementa datos; Task 2 interfaz y accesibilidad; Task 3 integra todos los estados y el CRUD; Task 4 cubre RLS, restricciones y evidencia.
- Consistencia: las firmas del módulo de datos y los nombres de vistas se usan de forma uniforme en todas las tareas.
- Review focus: duplicados y normalización se prueban en Tasks 1 y 4; conservación ante error y móvil en Tasks 2 y 3; confirmación de desactivación en Tasks 2 y 3; sesión no autorizada en Task 3.
- Sin dependencias nuevas ni funcionalidades fuera de alcance.
