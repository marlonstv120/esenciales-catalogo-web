# Auditoría local del bloque 7 — ESENCIALES

## Resumen ejecutivo

- **Resultado general:** `PARTIAL`.
- **Hallazgos verificados:** 1 `HIGH` (falta contenido real verificado y caso mixto inmediato/bajo pedido para aceptación E2E); 1 `MEDIUM` (mensaje administrativo de error impreciso, detectado por inspección estática). El reflujo básico se comprobó en navegador; teclado completo y contraste siguen pendientes.
- **Riesgo principal para el MVP:** hay cuatro fichas públicas, pero el seed declara datos candidatos ficticios; no se ha comprobado su validación comercial ni una venta inmediata solicitable para el caso mixto requerido.
- **Recomendación inmediata:** obtener del propietario fichas, existencias, precios e imágenes verificados y realizar el recorrido de extremo a extremo con datos de prueba autorizados; luego ejecutar la revisión visual en navegador.

## Alcance y entorno

- **Fecha:** 30 de septiembre de 2026 (fecha del entorno de trabajo).
- **Base de código:** `87bb6bd` más cambios locales ajenos no rastreados en `.agents/`, sin modificación de la aplicación durante esta auditoría.
- **URL:** Vite local `http://127.0.0.1:5173/`, con `base: '/'`; backend configurado como Supabase compartido. Se comprobó respuesta HTTP y DOM renderizado en Chromium sin enviar solicitudes de compra ni efectuar mutaciones.
- **Herramientas:** Node (`npm run test:auth`), pgTAP en Supabase local (`npx supabase test db`), Vite (`npm run build`), `Invoke-WebRequest` y Chromium headless mediante Playwright instalado fuera del repositorio. Axe no se ejecutó. No se guardaron credenciales ni capturas con datos personales.
- **Viewports medidos:** 320, 375, 768, 1024 y 1440 × 900 px; cuatro rutas públicas/administrativas sin desbordamiento horizontal según `scrollWidth - clientWidth`, sin errores `pageerror` de JavaScript. No equivale a una revisión visual humana ni a zoom 200 %.
- **Roles y datos:** visitante y cuenta administrativa proporcionada por el usuario; solo consulta. Solicitudes mostró cero registros. La contraseña se pasó por variable de entorno transitoria y no figura en artefactos de prueba.

## Matriz de cobertura

| Área o flujo | Estado | Evidencia breve | Notas |
| --- | --- | --- | --- |
| Servidor local y rutas públicas `/`, `/catalogo`, `/carrito` | PASS | HTTP 200, cuatro productos en catálogo y encabezados renderizados en Chromium a cinco anchos | Inicio sin carrito; se probó agregado local bajo pedido. |
| Entrada `/admin`, inventario y solicitudes | PASS | Inicio de sesión y encabezados renderizados a cinco anchos, sin errores JS | Solicitudes sin registros; detalles y acciones no ejercitados. |
| Documentos `/legal/terminos-v1.html` y `/legal/politica-datos-v1.html` | PASS | HTTP 200 local | Apertura de diálogo, lectura y foco no probados. |
| Lógica pública, administración y transiciones | PASS | 117 pruebas Node; 238 pgTAP locales; build Vite correcto | Son pruebas automatizadas, no prueba E2E visual. |
| Inicio → catálogo → detalle → carrito | PASS | Cuatro productos visibles; `/producto/4` Bajo pedido se agregó localmente y `/carrito` mostró total y formulario a 375 px | No se envió la solicitud. |
| Registro → código → WhatsApp y caso mixto | BLOCKED | No se verificó presentación inmediata solicitable ni datos aprobados; `supabase/seed.sql:17-18` describe fichas candidatas | No se creó solicitud en el backend compartido. |
| Administración Auth, inventario y listado de solicitudes | PASS | Sesión válida; cinco anchos, cero desbordamiento y cero errores de página | Consulta solamente. |
| Edición, confirmación, entrega, cancelación e inventario | BLOCKED | El listado de solicitudes tiene cero registros | No se alteraron solicitudes ni stock remoto. |
| Responsive básico y consola JS 320/375/768/1024/1440 | PASS | Cuatro rutas a cinco anchos: `overflow=0`; `pageerror=[]` | No cubre contenido con productos ni detalles administrativos. |
| Teclado completo, foco, zoom 200 %, contraste y percepción visual | NOT TESTED | Solo se abrió el panel de filtros móvil con puntero y se envió Escape | Requiere recorrido interactivo completo y medición de contraste. |
| Fallos de red, reintento y recuperación por correo | NOT TESTED | No provocados | Requiere entorno controlado y correo de prueba. |

## Hallazgos

### QA-001 — Falta contenido real validado y caso mixto para acreditar el MVP

- **Severidad:** HIGH (bloquea la aceptación E2E del MVP; no se ha demostrado un fallo de código).
- **Página/componente:** catálogo público y carrito, `/catalogo` y `/carrito`.
- **Viewport/entorno:** catálogo en Chromium headless (320 a 1440 px) y revisión del seed.
- **Problema:** el catálogo observado muestra cuatro productos, entre ellos uno Bajo pedido que sí se puede agregar al carrito. Sin embargo, los datos candidatos del seed fueron inicialmente ficticios y la validación comercial de las fichas publicadas no está acreditada. Tampoco se verificó una presentación de Venta inmediata solicitable para el caso mixto exigido.
- **Impacto:** impide acreditar con contenido aprobado el recorrido de visitante con venta inmediata y bajo pedido y el cierre integral del bloque 7.
- **Evidencia/pasos:** `/catalogo` muestra cuatro productos; `/producto/1` está Agotado, `/producto/2` No disponible y `/producto/4` Bajo pedido. Agregar `/producto/4` y abrir `/carrito` muestra total y formulario (solo estado local). `supabase/seed.sql:17-18` indica carácter ficticio de los datos iniciales; `.ai/current-context.md:12,15` registra pendientes de negocio. No se realizó inventario completo ni validación comercial de filas remotas.
- **Esperado:** sitio público con fichas, precios, stock e imágenes revisados por ESENCIALES y activación selectiva.
- **Mejora recomendada:** el propietario revisa cada ficha; se cargan imágenes reales y se activan únicamente registros verificados, después se ejecuta E2E con datos de prueba autorizados.
- **Fuente de verdad:** `docs/development/mvp-completion-plan.md:71-75`, `docs/project/requirements.md` RF-14 y RF-17.

### QA-002 — Error de transición comunica que falló un guardado

- **Severidad:** MEDIUM (fricción de recuperación de una tarea administrativa; hallazgo estático, pendiente de reproducir en navegador).
- **Página/componente:** detalle administrativo de solicitud `#solicitudes`.
- **Viewport/entorno:** inspección estática de `src/requests-controller.js`.
- **Problema:** `requestError` devuelve «No fue posible guardar los cambios. Inténtalo de nuevo.» para errores diferentes de `22023`; `transition()` usa la misma función para errores de confirmar, entregar o cancelar.
- **Impacto:** ante red fallida, permiso insuficiente u otro error durante una transición, el mensaje describe otra operación y no distingue un resultado incierto, lo cual dificulta una comprobación segura antes de reintentar.
- **Evidencia/pasos:** `src/requests-controller.js:11-13,51-62`; `transition()` llama a `requestError(error)` tras una RPC de cambio de estado. No se simuló fallo de red en navegador.
- **Esperado:** mensaje contextual de transición y, si la respuesta es incierta, sugerencia de recargar y comprobar el estado antes de reintentar.
- **Mejora recomendada:** separar mensajes de edición y transición; verificar estado vigente al recuperar conectividad.
- **Fuente de verdad:** `docs/project/DESIGN.md:345,358-362`, `docs/project/wireframe-guide.md:451-458`.

## Comprobaciones aprobadas

- Vite sirvió seis rutas solicitadas con HTTP 200: inicio, catálogo, carrito, admin y los dos documentos legales.
- Chromium abrió las cuatro pantallas en 320, 375, 768, 1024 y 1440 px; sin desbordamiento horizontal, errores de JavaScript o controles de enlace/botón sin nombre accesible en la revisión DOM básica. El panel de filtros abrió en 375 px.
- Se abrieron cuatro detalles públicos: agotado y no disponible sin acción de agregado; Bajo pedido con botón de agregado. Una línea Bajo pedido se agregó al carrito local, que mostró formulario y valor total sin desbordamiento a 375 px. No se pulsó `Registrar solicitud`.
- La cuenta administrativa proporcionada inició sesión y cargó Inventario y Solicitudes sin errores visibles; el listado estaba vacío.
- `npm run test:auth`: 117/117.
- `npx supabase test db`: 238/238 contra la base local.
- `npm run build`: exitoso.

## Limitaciones y pendientes

- La comprobación automática de ancho no sustituye capturas revisadas visualmente, contraste medido, zoom 200 %, foco o recorrido de teclado completo. Realizar esas inspecciones con contenido de prueba disponible.
- Aunque se inició sesión con la cuenta proporcionada, no había solicitudes existentes para recorrer detalle, transiciones o restitución sin crear una solicitud en el backend compartido. El catálogo sí muestra cuatro productos; falta validar sus datos comerciales y una presentación inmediata para la prueba mixta. Utilizar registros de prueba aprobados y datos reales validados por ESENCIALES.
- No se verificó recuperación Auth por correo ni un fallo de red real: requiere correo controlado y simulación de red en navegador.
- HTTP 200 en rutas SPA por sí solo prueba transporte; la renderización y ausencia de `pageerror` se observaron adicionalmente en Chromium, pero no todas las operaciones.

## Prioridad sugerida

1. Reunir datos e imágenes aprobados para publicar contenido verificable y disponer de registros de prueba controlados.
2. Ejecutar E2E público y administrativo con verificación de stock, restitución, entrega y reintentos.
3. Auditar en navegador los cinco anchos, teclado, foco, zoom, contraste, errores, Auth y Storage; corregir hallazgos reproducidos.
4. Clarificar el mensaje administrativo ante error de transición y completar evidencia académica solo con resultados observados.
