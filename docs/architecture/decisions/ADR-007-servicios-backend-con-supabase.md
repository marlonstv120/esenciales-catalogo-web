# ADR-007: Servicios de backend con Supabase

## Estado

Accepted

## Contexto

El curso inicialmente contemplaba Node.js y Express. El profesor autorizó al equipo usar Supabase en sustitución de Express para agilizar el desarrollo del MVP. Esta instrucción posterior tiene prioridad sobre las decisiones arquitectónicas que dependían de una API propia con Express.

El MVP requiere persistencia relacional, autenticación administrativa, almacenamiento de imágenes, autorización de operaciones y transacciones de inventario. Supabase provee PostgreSQL, Auth, Storage y un cliente JavaScript para consumir operaciones protegidas desde el frontend. PostgreSQL continúa siendo el sistema gestor de datos definido en ADR-001.

## Decisión

Usar Supabase como plataforma de servicios de backend del MVP:

- Supabase PostgreSQL conservará el modelo relacional, las restricciones, las migraciones SQL y las funciones RPC.
- Supabase Auth gestionará las credenciales y sesiones del administrador. No habrá sesiones propias ni almacenamiento local de contraseñas.
- Supabase Storage almacenará las imágenes de producto.
- El frontend en HTML5, CSS3 y JavaScript sin framework consumirá Supabase mediante su cliente JavaScript y una clave pública o publicable. No se implementará una API propia con Express.
- Las políticas Row Level Security (RLS), los permisos de tabla y los permisos de funciones limitarán el acceso público y administrativo. Las claves con privilegios administrativos nunca se expondrán en el navegador.
- El registro, la confirmación, la cancelación y la edición controlada de solicitudes se implementarán como funciones RPC de PostgreSQL con validaciones, transacciones y bloqueos necesarios. Las mutaciones públicas no escribirán directamente en las tablas de negocio.
- Las Edge Functions no forman parte del MVP inicial. Solo se evaluarán si una necesidad futura exige ejecutar lógica con secretos de servidor o integrar un servicio externo.

## Motivos

- Cumple la autorización posterior del profesor y reduce la infraestructura que debe configurar y desplegar el equipo.
- Conserva PostgreSQL y permite aplicar restricciones y transacciones directamente sobre los datos.
- Integra autenticación, almacenamiento de imágenes y acceso a datos sin desarrollar ni mantener un servidor Express independiente.
- Mantiene el frontend en las tecnologías web base del curso y deja explícitas las medidas de autorización necesarias para un acceso directo desde el navegador.
- Es proporcional al MVP, siempre que las políticas RLS y las funciones transaccionales se prueben antes del despliegue.

## Alternativas consideradas

- Mantener el monolito modular con Node.js, Express, `pg` y sesiones propias, definido en ADR-003 a ADR-005.
- Usar Supabase solo como base de datos alojada y mantener Express para la API.

No se seleccionan porque el profesor autorizó específicamente sustituir Express y el objetivo es reducir trabajo de infraestructura que no agrega valor funcional al MVP.

## Consecuencias

- ADR-003, ADR-004 y ADR-005 quedan reemplazados; se conservan para mantener trazabilidad histórica.
- El proyecto debe crear un proyecto Supabase, configurar variables públicas del cliente sin incluir secretos y versionar las migraciones SQL.
- Cada tabla o vista expuesta y cada bucket de Storage deberá tener permisos y políticas RLS revisados y probados para los roles anónimo y autenticado.
- El catálogo público solo expondrá los datos publicables. Las operaciones administrativas requerirán un usuario administrativo activo autorizado por las políticas.
- Las funciones RPC críticas deberán comprobar reglas de negocio, ejecutar sus modificaciones de manera atómica y otorgar ejecución solo a los roles necesarios.
- El despliegue se divide entre Supabase para los servicios de backend y un proveedor aún por definir para los archivos estáticos del frontend.
