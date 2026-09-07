# Arquitectura

## Tecnologías exigidas por el curso

El curso establece HTML5, CSS3, JavaScript, Node.js, Express y Git/GitHub como tecnologías a utilizar. Esta exigencia académica no define por sí sola una arquitectura adicional.

## Decisiones técnicas confirmadas

PostgreSQL será el sistema gestor de base de datos del proyecto. Consulte [ADR-001](decisions/ADR-001-postgresql-como-sgbd.md).

El frontend utilizará HTML5, CSS3 y JavaScript sin framework adicional. Consulte [ADR-002](decisions/ADR-002-frontend-sin-framework.md).

El MVP se implementará como un monolito modular con Node.js y Express: Express servirá el frontend estático y expondrá la API bajo `/api`. Consulte [ADR-003](decisions/ADR-003-monolito-modular-con-express.md).

El acceso a PostgreSQL utilizará el paquete `pg` y consultas SQL explícitas, sin ORM. Consulte [ADR-004](decisions/ADR-004-acceso-postgresql-con-pg-y-sql-explicito.md).

La autenticación administrativa utilizará sesiones de servidor identificadas mediante cookie segura. Consulte [ADR-005](decisions/ADR-005-autenticacion-administrativa-con-sesiones.md).

Las imágenes de productos se almacenarán en un servicio externo; PostgreSQL conservará sus URL y metadatos necesarios. Consulte [ADR-006](decisions/ADR-006-almacenamiento-externo-de-imagenes.md).

## Pendiente de definición

El [modelo lógico de datos propuesto](data-model.md) define las entidades, restricciones y transacciones críticas que deberán materializarse en migraciones SQL. Sigue pendiente validar sus tipos e índices concretos al implementarlo.

La arquitectura de implementación debe concretar el proveedor de imágenes, el almacenamiento específico de sesiones, la validación técnica del teléfono, la estructura detallada de módulos y el proveedor de despliegue. Cualquier cambio a las decisiones aceptadas deberá justificarse y aprobarse como una decisión técnica relevante.
