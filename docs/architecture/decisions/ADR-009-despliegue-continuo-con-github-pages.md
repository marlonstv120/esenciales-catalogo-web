# ADR-009: Despliegue continuo con GitHub Pages

**Estado:** Accepted
**Fecha:** 28 de septiembre de 2026

## Contexto

El equipo necesita consultar el avance desde celulares y otros equipos sin ejecutar el servidor de desarrollo. El frontend se compila como archivos estáticos con Vite y consume PostgreSQL, Auth y Storage desde Supabase alojado, por lo que no requiere un servidor Node en producción.

El profesor mostró GitHub Pages como alternativa válida para publicar el avance académico y recomendó desplegar pronto para facilitar la revisión continua. El sitio de proyecto queda bajo la subruta `/esenciales-catalogo-web/`, que debe ser considerada por recursos, rutas y retornos de autenticación.

## Decisión

- GitHub Pages publicará el frontend de demostración en `https://marlonstv120.github.io/esenciales-catalogo-web/`.
- Un workflow de GitHub Actions ejecutará las pruebas, compilará Vite y desplegará `dist` después de cada `push` a `main`.
- `BASE_PATH` establecerá la base de Vite y una utilidad compartida normalizará rutas internas, recursos y retornos de Supabase Auth.
- `404.html` reutilizará la entrada de la aplicación para permitir enlaces directos a rutas del cliente.
- GitHub Actions recibirá únicamente la URL y la clave publicable de Supabase. Ninguna clave secreta se incluirá en el frontend.
- El proyecto alojado de Supabase será el backend compartido de desarrollo y demostración. Los cambios persistentes se aplicarán mediante migraciones versionadas después de revisar `db push --dry-run`.
- Las pruebas pgTAP se ejecutarán contra el proyecto remoto con el rol técnico exclusivo `cli_login_postgres`; sus transacciones revierten los datos de prueba.

## Motivos

- Permite revisar el avance desde dispositivos reales mediante una URL estable.
- Automatiza la publicación y evita compilar o copiar `dist` manualmente.
- Aprovecha GitHub, Vite y Supabase ya adoptados por el proyecto sin agregar dependencias.
- Mantiene RLS, permisos y RPC como frontera de seguridad aunque el frontend sea público.

## Alternativas consideradas

- **Netlify o Vercel:** simplifican las rutas SPA en dominio raíz, pero añaden otro proveedor cuando GitHub Pages satisface la necesidad académica inmediata.
- **Publicación manual:** aumenta errores y deja el sitio desactualizado.
- **Supabase local con Docker para cada integrante:** ofrece aislamiento, pero agrega pasos y no permite compartir datos o validar el sitio publicado con facilidad en esta etapa.

## Consecuencias

- Todas las rutas internas deben funcionar tanto desde `/` en desarrollo como desde la subruta de Pages.
- Los cambios enviados a `main` afectan el sitio compartido y deben pasar las verificaciones antes del envío.
- Los cambios de base de datos requieren coordinación porque el equipo comparte un único proyecto remoto.
- La publicación actual es un entorno académico de demostración; el proveedor deberá reevaluarse antes de operar solicitudes comerciales reales si cambian las necesidades o condiciones del servicio.
