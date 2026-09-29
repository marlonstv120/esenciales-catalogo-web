# Flujo de trabajo

## Trabajo diario

1. Actualizar la rama local desde `main` antes de comenzar.
2. Instalar dependencias con `npm install` cuando cambie `package-lock.json`.
3. Configurar `.env.local` con la URL y la clave publicable del Supabase remoto compartido.
4. Ejecutar el frontend con `npm run dev`; no es necesario iniciar Docker ni Supabase local.
5. Ejecutar `npm test` y `npm run build` antes de enviar cambios.
6. Confirmar y enviar los cambios a GitHub. Cada `push` a `main` vuelve a probar y publica GitHub Pages automáticamente.

## Cambios de base de datos

- El proyecto remoto enlazado de Supabase es el entorno compartido de desarrollo y demostración.
- Todo cambio de esquema, RLS, RPC o Storage se registra primero en `supabase/migrations/`; no se crean objetos permanentes manualmente en el Dashboard.
- Antes de aplicar migraciones, ejecutar `npm run supabase:push:dry` y revisar la lista completa.
- Aplicar migraciones coordinadas con `npm run supabase:push` y verificar después con `npm run supabase:status` y `npm run supabase:test-db`.
- Las pruebas pgTAP abren transacciones y terminan con `rollback`; no deben introducir datos permanentes.
- El rol técnico `cli_login_postgres`, usado por `supabase test db --linked`, tiene permisos de prueba y `BYPASSRLS` únicamente para validar el proyecto remoto; no es un rol consumido por el frontend, `anon` ni `authenticated`.
- Los datos reales se administran desde la aplicación. `supabase/seed.sql` se reserva para carga inicial controlada y no se ejecuta automáticamente en cada cambio.

## Reglas permanentes

- Revisar documentación y código relacionados antes de cambiar algo.
- Mantener los cambios simples, comprensibles y compatibles con el curso.
- Actualizar únicamente la documentación afectada.
- Revisar y probar las contribuciones generadas con IA.
- No incluir secretos, contraseñas ni claves `service_role` en el repositorio o frontend.
