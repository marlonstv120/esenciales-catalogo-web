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

## Pendiente de definición

Las migraciones `20260924000100_create_catalog_core.sql`, `20260924000200_add_admin_auth_policies.sql`, `20260926000100_add_product_images_storage.sql`, `20260926000200_add_public_catalog_rpc.sql` y `20260927000100_add_public_reference_normal_price.sql` materializan localmente el núcleo de catálogo, su acceso administrativo, almacenamiento de imágenes y dos RPC de lectura pública. El [modelo lógico de datos](data-model.md) conserva como diseño pendiente las solicitudes, sus transacciones y sus funciones RPC.

Siguen pendientes las operaciones de solicitudes, su validación transaccional, la validación técnica del teléfono, la estructura restante del cliente y el proveedor de despliegue del frontend. Las políticas RLS administrativas y la lectura pública mediante RPC están implementadas localmente. Cualquier cambio a las decisiones aceptadas deberá justificarse y aprobarse como una decisión técnica relevante.
