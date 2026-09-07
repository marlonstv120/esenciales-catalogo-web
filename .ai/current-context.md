# Contexto actual

- **Fase:** alcance funcional consolidado; preparación del diseño técnico.
- **Último hito:** introducción y objetivos específicos ajustados el 5 de septiembre de 2026 según la secuencia de diagnóstico, desarrollo y validación indicada por el profesor.
- **Documento rector:** `docs/project/functional-scope.md`, complementado por requisitos, reglas de negocio y flujos en `docs/project/`.
- **Decisiones vigentes:** MVP exclusivo para Esenciales; ocho macrofuncionalidades; solicitudes de compra sin pago; catálogo público; administración de inventario por presentación; WhatsApp como continuación voluntaria; PostgreSQL confirmado.
- **Decisiones recientes:** la introducción incorpora pregunta problema, justificación, alcance y delimitación; los objetivos específicos corresponden a diagnóstico, desarrollo funcional y validación; Productos destacados mediante selección manual; agotado derivado del stock; Bajo pedido con stock vendible cero; precios COP enteros; solicitudes Nuevas permiten corregir cliente, cantidades o retirar líneas, sin agregar líneas ni cambiar presentaciones o precios; solicitudes Confirmadas inmutables.
- **Tecnologías exigidas por el curso:** HTML5, CSS3, JavaScript, Node.js, Express y Git/GitHub.
- **Arquitectura confirmada:** PostgreSQL; frontend con HTML5, CSS3 y JavaScript sin framework; monolito modular con Express que sirve el frontend y API bajo `/api`; SQL explícito con `pg`; autenticación administrativa por sesiones; imágenes en servicio externo. Consultar ADR-001 a ADR-006.
- **Estado de implementación:** desarrollo de la aplicación aún no iniciado.
- **Entorno revisado:** VS Code, Git, GitHub CLI autenticado, OpenCode CLI, Docker CLI, Node.js 24.19.0 LTS y pgAdmin 4 9.17 instalados; PostgreSQL aún pendiente.
- **Pendientes académicos:** confirmar el supuesto máximo de ocho funcionalidades y si se exige un segundo rol autenticado.
- **Pendientes de negocio:** validar definiciones públicas de `Original`, `1.1` e `Inspiración`; confirmar WhatsApp y textos de entrega/envío; recopilar datos e imágenes reales.
- **Diseño técnico propuesto:** `docs/architecture/data-model.md` define entidades, restricciones y transacciones críticas; debe validarse al crear migraciones SQL.
- **Pendientes técnicos:** instalar PostgreSQL 17.x; validar modelo lógico y transacciones mediante migraciones; definir proveedor de imágenes, almacenamiento concreto de sesiones y despliegue.
- **Trabajo siguiente recomendado:** convertir el modelo lógico en migraciones SQL y probarlas en PostgreSQL local, sin ampliar el MVP.
- **Consultar:** `README.md`, `docs/README.md`, `docs/project/`, `docs/sources/` y `AGENTS.md`.
