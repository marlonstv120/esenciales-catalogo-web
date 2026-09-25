# Arquitectura

## Tecnologías base del curso

El curso establece HTML5, CSS3, JavaScript, Node.js, Express y Git/GitHub como tecnologías base. Posteriormente, el profesor autorizó emplear Supabase en sustitución de Express para agilizar el desarrollo. La aplicación conservará HTML5, CSS3 y JavaScript sin framework en el cliente; Node.js y Express no formarán parte de la arquitectura objetivo del MVP.

## Decisiones técnicas confirmadas

PostgreSQL será el sistema gestor de base de datos del proyecto y será provisto por Supabase. Consulte [ADR-001](decisions/ADR-001-postgresql-como-sgbd.md) y [ADR-007](decisions/ADR-007-servicios-backend-con-supabase.md).

El frontend utilizará HTML5, CSS3 y JavaScript sin framework adicional. Consulte [ADR-002](decisions/ADR-002-frontend-sin-framework.md).

El frontend estático consumirá los servicios de Supabase mediante su cliente JavaScript. Las operaciones de dominio críticas se expondrán como funciones RPC de PostgreSQL, no como una API propia de Express. Consulte [ADR-007](decisions/ADR-007-servicios-backend-con-supabase.md).

Las migraciones, restricciones, políticas RLS y funciones RPC se mantendrán como SQL versionado. El cliente web no tendrá acceso a credenciales administrativas ni usará una conexión directa con privilegios de base de datos.

La autenticación administrativa utilizará Supabase Auth. Las políticas RLS y los privilegios de funciones autorizarán cada operación según el usuario autenticado.

Las imágenes de productos se almacenarán en Supabase Storage; PostgreSQL conservará su ruta, URL pública cuando aplique y metadatos necesarios. Consulte [ADR-006](decisions/ADR-006-almacenamiento-externo-de-imagenes.md) y ADR-007.

## Pendiente de definición

La migración `20260924000100_create_catalog_core.sql` materializa y valida localmente las entidades del núcleo de catálogo, sus restricciones, índices, marcas de tiempo y una postura RLS cerrada. El [modelo lógico de datos](data-model.md) conserva como diseño pendiente las solicitudes, sus transacciones y las funciones RPC.

La arquitectura de implementación debe concretar las políticas RLS permitidas de cada tabla y bucket, la validación técnica del teléfono, las funciones RPC, la estructura del cliente y el proveedor de despliegue del frontend. Cualquier cambio a las decisiones aceptadas deberá justificarse y aprobarse como una decisión técnica relevante.
