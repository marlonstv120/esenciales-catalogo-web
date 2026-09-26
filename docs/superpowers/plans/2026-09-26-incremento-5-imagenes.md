# Incremento 5: imagen principal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cargar, reemplazar y retirar una imagen principal segura por producto.

**Architecture:** Una migracion declara bucket y politicas Storage; `images.js` coordina validacion, ruta, Storage y tabla; el editor de producto integra una seccion de imagen con estado recuperable. PostgreSQL conserva referencia y Storage conserva el objeto.

**Tech Stack:** Supabase Storage, PostgreSQL/RLS, JavaScript ES modules, Vite, pgTAP y `node:test`.

**Spec:** `docs/superpowers/specs/2026-09-26-incremento-5-imagenes-design.md`

## Global Constraints

- Bucket publico `productos`; solo administrador activo escribe o elimina.
- Una imagen principal en posicion cero; JPEG, PNG o WebP hasta 5 MiB.
- Productos sin imagen siguen siendo `No publicable`, no bloqueados.
- Usar ruta unica `productos/<producto-id>/<uuid>.<extension>`.
- No implementar carga multiple, ordenamiento, transformacion o catalogo publico.
- No aplicar cambios remotos sin autorizacion.

## Review Focus

- Un archivo MIME permitido con tamano mayor a 5 MiB no llega a Storage.
- Un error al registrar imagen elimina el objeto recien cargado.
- Reemplazar conserva la imagen actual si la nueva carga falla.
- Retirar deja el producto sin referencia incluso si queda un objeto huerfano.
- Usuario no administrador no puede escribir objetos aunque conozca la ruta.

---

### Task 1: Crear bucket y politicas Storage

**Files:**
- Create: `supabase/migrations/20260926000100_add_product_images_storage.sql`
- Modify: `supabase/tests/database/03_catalog_security.test.sql`

- [ ] Escribir prueba pgTAP para existencia de bucket publico y rechazo de escritura no autorizada.
- [ ] Ejecutar `npm run supabase:reset` y observar fallo inicial.
- [ ] Crear bucket `productos`, limite 5 MiB, MIME permitidos y politicas `storage.objects` que permiten lectura publica y escritura solo cuando `es_administrador_activo()`.
- [ ] Ejecutar `npm run supabase:reset; npm run supabase:test-db` y confirmar PASS.

### Task 2: Crear modulo de imagenes

**Files:**
- Create: `src/images.js`
- Create: `tests/images.test.mjs`

- [ ] Escribir pruebas que fallen para `validateImage(file)` y `imagePath(productId, file)`.
- [ ] Implementar validacion MIME/tamano, ruta UUID, `uploadImage`, `replaceImage` y `removeImage` con compensacion.
- [ ] Ejecutar `node --test tests/images.test.mjs` y confirmar PASS.

### Task 3: Integrar editor de producto

**Files:**
- Modify: `src/product-views.mjs`
- Modify: `src/products-controller.js`
- Modify: `src/styles.css`
- Modify: `tests/product-views.test.mjs`

- [ ] Escribir prueba que falle para estado neutral e imagen con texto alternativo editable.
- [ ] Agregar vista previa 4/5, selector, texto alternativo, reemplazo, retiro, ocupado/error y reintento.
- [ ] Integrar operaciones despues de guardar producto; bloquear duplicados y conservar estado recuperable.
- [ ] Ejecutar `npm run test:auth` y `npm run build` y confirmar PASS.

### Task 4: Validar y documentar

**Files:**
- Modify: `.ai/current-context.md`
- Modify: `docs/development/mvp-implementation-roadmap.md`
- Modify: `docs/history/project-log.md`

- [ ] Ejecutar `npm test` y `npm run build`.
- [ ] Documentar comandos que pasen y dejar como pendiente el recorrido manual de carga, reemplazo, retiro, teclado y responsive.

## Self-Review

- La migracion protege Storage, el modulo encapsula coherencia y el editor expone todos los estados.
- Las pruebas cubren limite, ruta y UI; pgTAP verifica politicas.
- No hay dependencia nueva ni funcionalidad fuera de alcance.
