# Auditoría UI/UX responsive

## Alcance

- **Fecha:** 2 de octubre de 2026.
- **Cobertura:** navegación pública y administrativa, notificaciones transitorias, drawers/modales, foco, scroll, viewport móvil y riesgo de overflow horizontal.
- **Método:** inspección estática de controladores, vistas y hojas de estilo, más pruebas unitarias y build. No sustituye una revisión visual en dispositivos reales.

## Ajustes implementados

| Área | Cambio | Archivos |
| --- | --- | --- |
| Notificaciones | Un único componente global, apilable, con cierre, `status`/`alert` y tonos de éxito, información o error. | `src/notifications.mjs`, `src/public-catalog-controller.mjs`, `src/products-controller.js`, `src/requests-controller.js`, `src/categories-controller.js` |
| Mensajes persistentes | Se conservaron errores de campo, ayudas de cantidad, estados de carga y confirmaciones destructivas; no se convirtieron en toasts. | Vistas y controladores existentes |
| Foco y drawers | El menú, carrito, selector y paneles públicos ya encierran el foco; se añadió foco circular y Escape al drawer de filtros administrativo. Los drawers administrativos recuperan el foco en su activador al cerrarse. | `src/public-catalog-controller.mjs`, `src/products-controller.js` |
| Scroll | Los overlays públicos y los drawers administrativos bloquean el fondo mientras están abiertos. La navegación por enlace desplaza al inicio; back/forward no lo fuerza. | `src/public-catalog-controller.mjs`, `src/admin-shell.js`, `src/products-controller.js` |
| Móvil y viewport | Los campos en dispositivos táctiles usan al menos `1rem`, los overlays relevantes usan `dvh`, y las imágenes no exceden su contenedor. | `src/styles.css` |
| Capas | Se centralizaron tokens `--z-*`; toasts quedan por encima de drawers y modales. | `src/styles.css` |
| Carrito | Se reforzó el encogimiento de contenido largo y el reflujo de controles de cantidad para evitar overflow en ancho estrecho. | `src/styles.css` |

## Matriz pendiente de comprobación renderizada

| Superficie | 320-430 px | 768 px | 1024 px | 1440 px | Estado |
| --- | --- | --- | --- | --- | --- |
| Inicio y catálogo | Pendiente | Pendiente | Pendiente | Pendiente | Revisión en navegador requerida |
| Detalle y selector | Pendiente | Pendiente | Pendiente | Pendiente | Revisión en navegador requerida |
| Carrito y formulario/pago | Pendiente | Pendiente | Pendiente | Pendiente | Revisión en navegador requerida |
| Inventario y filtros | Pendiente | Pendiente | Pendiente | Pendiente | Revisión en navegador requerida |
| Solicitudes y comprobante | Pendiente | Pendiente | Pendiente | Pendiente | Revisión en navegador requerida |

## Casos de validación pendientes

1. Probar portrait y landscape en móvil, incluidos texto ampliado y zoom del navegador.
2. Recorrer Tab y Shift+Tab en menú, filtros, categorías, selector, carrito, formulario y diálogos de pago.
3. Confirmar que Escape y clic en backdrop cierran los overlays permitidos y devuelven foco al activador.
4. Revisar contenido largo: nombres de producto, cliente, ciudad, observaciones, precios y mensajes de error.
5. Verificar la consola y desbordamiento horizontal en cada viewport con datos reales o de prueba aprobados.

## Limitaciones

- No hay Playwright ni un navegador automatizado configurado en este repositorio; esta auditoría no acredita pruebas en iPhone/Safari ni en Android.
- No se midieron contraste, Core Web Vitals ni se ejecutó un lector de pantalla. Los cambios siguen la base de accesibilidad, pero requieren validación manual.
