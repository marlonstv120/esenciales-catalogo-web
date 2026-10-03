# Arquitectura

## Tecnologías base del curso

El curso establece HTML5, CSS3, JavaScript, Node.js, Express y Git/GitHub como tecnologías base. Posteriormente, el profesor autorizó emplear Supabase en sustitución de Express para agilizar el desarrollo. La aplicación conservará HTML5, CSS3 y JavaScript sin framework en el cliente; Node.js y Express no formarán parte de la arquitectura objetivo del MVP.

## Decisiones técnicas confirmadas

PostgreSQL será el sistema gestor de base de datos del proyecto y será provisto por Supabase. Consulte [ADR-001](decisions/ADR-001-postgresql-como-sgbd.md) y [ADR-007](decisions/ADR-007-servicios-backend-con-supabase.md).

El frontend utilizará HTML5, CSS3 y JavaScript sin framework adicional. Consulte [ADR-002](decisions/ADR-002-frontend-sin-framework.md).

El frontend estático consumirá los servicios de Supabase mediante su cliente JavaScript. Las operaciones de dominio críticas se expondrán como funciones RPC de PostgreSQL, no como una API propia de Express. El catálogo público utiliza RPC de solo lectura para exponer categorías activas y productos publicables sin acceso anónimo directo a sus tablas. Consulte [ADR-007](decisions/ADR-007-servicios-backend-con-supabase.md) y [ADR-008](decisions/ADR-008-lectura-publica-del-catalogo-mediante-rpc.md).

Las migraciones, restricciones, políticas RLS y funciones RPC se mantendrán como SQL versionado. El cliente web no tendrá acceso a credenciales administrativas ni usará una conexión directa con privilegios de base de datos.

La autenticación administrativa utilizará Supabase Auth. Las políticas RLS y los privilegios de funciones autorizarán cada operación según el usuario autenticado.

Las imágenes de productos se almacenan en Supabase Storage; PostgreSQL conserva su ruta, URL pública cuando aplica y metadatos necesarios. Los comprobantes de pago manual se almacenan en el bucket privado `comprobantes-pago`; una Edge Function valida el archivo y registra su metadato sin exponer `service_role` al navegador. Consulte [ADR-006](decisions/ADR-006-almacenamiento-externo-de-imagenes.md), ADR-007 y [ADR-010](decisions/ADR-010-comprobantes-de-pago-manual-privados.md).

## Despliegue confirmado

El frontend se publica automáticamente en GitHub Pages mediante GitHub Actions después de cada `push` a `main`. Vite compila con la base `/esenciales-catalogo-web/` y la aplicación normaliza esa base en rutas, recursos y retornos de Supabase Auth. Supabase alojado es el backend compartido para desarrollo y demostración; el flujo habitual no depende de Docker local. Consulte [ADR-009](decisions/ADR-009-despliegue-continuo-con-github-pages.md).

## Implementación vigente

Las migraciones versionadas materializan el núcleo de catálogo, su acceso administrativo, Storage de imágenes, RPC de lectura pública, el esquema seguro de solicitudes, su registro público atómico, la edición administrativa limitada de solicitudes Nuevas y las transiciones de inventario. Las migraciones `20261001000400_add_bre_b_payment_proofs.sql`, `20261001000500_update_legal_versions_for_manual_payment.sql` y `20261001000600_add_payment_eligibility_to_request_confirmation.sql` agregan el pago manual Bre-B: token público no predecible, estado separado en `pagos_solicitud`, comprobante privado, elegibilidad y versiones legales vigentes.

El cliente integra el registro en `/carrito`, con reintento idempotente, revisión explícita de precio, confirmación, WhatsApp voluntario y pago Bre-B solo para solicitudes elegibles. La Edge Function `submit-payment-proof` recibe el comprobante, valida código, token, formato, firma y tamaño, y usa credenciales de servidor para guardarlo en Storage privado. La administración lista solicitudes, corrige solo las Nuevas, consulta comprobantes mediante URL firmada y puede rechazar o verificar un pago; la verificación confirma pago y solicitud y descuenta el inventario dentro de una transacción.

Las migraciones están aplicadas en local y remoto. Siguen pendientes la validación integral de los flujos, la validación comercial de las instrucciones Bre-B, el contenido real verificado y la evidencia final de producción. Cualquier cambio a las decisiones aceptadas deberá justificarse y aprobarse como una decisión técnica relevante.
