# Arquitectura

## Tecnologías base del curso

El curso establece HTML5, CSS3, JavaScript, Node.js, Express y Git/GitHub como tecnologías base. Posteriormente, el profesor autorizó emplear Supabase en sustitución de Express para agilizar el desarrollo. La aplicación conservará HTML5, CSS3 y JavaScript sin framework en el cliente; Node.js y Express no formarán parte de la arquitectura objetivo del MVP.

## Decisiones técnicas confirmadas

PostgreSQL será el sistema gestor de base de datos del proyecto y será provisto por Supabase. Consulte [ADR-001](decisions/ADR-001-postgresql-como-sgbd.md) y [ADR-007](decisions/ADR-007-servicios-backend-con-supabase.md).

El frontend utilizará HTML5, CSS3 y JavaScript sin framework adicional. Consulte [ADR-002](decisions/ADR-002-frontend-sin-framework.md).

El frontend estático consumirá los servicios de Supabase mediante su cliente JavaScript. Las operaciones de dominio críticas se expondrán como funciones RPC de PostgreSQL, no como una API propia de Express. El catálogo público utiliza RPC de solo lectura para exponer categorías activas y productos publicables sin acceso anónimo directo a sus tablas. Consulte [ADR-007](decisions/ADR-007-servicios-backend-con-supabase.md) y [ADR-008](decisions/ADR-008-lectura-publica-del-catalogo-mediante-rpc.md).

Las migraciones, restricciones, políticas RLS y funciones RPC se mantendrán como SQL versionado. El cliente web no tendrá acceso a credenciales administrativas ni usará una conexión directa con privilegios de base de datos.

La autenticación administrativa utilizará Supabase Auth. Las políticas RLS y los privilegios de funciones autorizarán cada operación según el usuario autenticado.

Las imágenes de productos se almacenarán en Supabase Storage; PostgreSQL conservará su ruta, URL pública cuando aplique y metadatos necesarios. Consulte [ADR-006](decisions/ADR-006-almacenamiento-externo-de-imagenes.md) y ADR-007.

## Despliegue confirmado

El frontend se publica automáticamente en GitHub Pages mediante GitHub Actions después de cada `push` a `main`. Vite compila con la base `/esenciales-catalogo-web/` y la aplicación normaliza esa base en rutas, recursos y retornos de Supabase Auth. Supabase alojado es el backend compartido para desarrollo y demostración; el flujo habitual no depende de Docker local. Consulte [ADR-009](decisions/ADR-009-despliegue-continuo-con-github-pages.md).

## Implementación vigente

Las migraciones `20260924000100_create_catalog_core.sql`, `20260924000200_add_admin_auth_policies.sql`, `20260926000100_add_product_images_storage.sql`, `20260926000200_add_public_catalog_rpc.sql`, `20260927000100_add_public_reference_normal_price.sql`, `20260930000100_create_purchase_request_schema.sql`, `20260930000200_add_purchase_request_registration_rpc.sql`, `20261001000100_add_admin_purchase_request_edit_rpc.sql` y `20261001000200_add_purchase_request_status_transition_rpcs.sql` materializan el núcleo de catálogo, su acceso administrativo, almacenamiento de imágenes, RPC de lectura pública, el esquema seguro de solicitudes, su registro público atómico, la edición administrativa limitada de solicitudes Nuevas y sus transiciones de inventario. El cliente integra el registro en `/carrito`, con reintento idempotente, revisión explícita de precio, confirmación temporal y WhatsApp voluntario. La administración lista solicitudes, corrige solo las Nuevas y permite confirmar, entregar o cancelar únicamente cuando la transición está permitida.

La migración de transiciones está aplicada en local y remoto. Siguen pendientes la validación integral de los flujos, el contenido real verificado y la evidencia final de producción. Cualquier cambio a las decisiones aceptadas deberá justificarse y aprobarse como una decisión técnica relevante.
