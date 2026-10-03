# Herramientas de desarrollo

Este documento registra las herramientas auxiliares necesarias para trabajar en el proyecto. No modifica las decisiones de arquitectura ni sustituye HTML5, CSS3, JavaScript, Supabase o PostgreSQL.

## Configuración

Las herramientas y configuraciones compartidas se incorporan solo cuando son reproducibles desde el repositorio:

- Vite está instalado como dependencia de desarrollo y se ejecuta con `npm run dev`; `npm run build` genera la compilación de producción.
- La CLI de Supabase está instalada como dependencia de desarrollo y enlazada al proyecto remoto compartido. `npm run supabase:status`, `npm run supabase:push:dry` y `npm run supabase:push` cubren el flujo habitual sin Docker.
- PostgreSQL podrá administrarse mediante el Dashboard de Supabase, la CLI o una conexión autorizada, sin guardar contraseñas en el repositorio.
- Las migraciones, políticas RLS y funciones RPC se mantienen en archivos SQL versionados bajo `supabase/migrations/`.
- GitHub Actions compila y publica `dist` en GitHub Pages después de cada envío a `main`.

Las extensiones del editor son una preferencia local y no forman parte de la entrega. Las dependencias se incorporan únicamente cuando responden a una necesidad concreta de la implementación.
