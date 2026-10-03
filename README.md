# Esenciales

Aplicacion web para publicar y administrar el catalogo de productos de ESENCIALES. El sistema permite consultar productos sin registro, preparar un carrito, registrar solicitudes de compra y continuar voluntariamente la conversacion comercial por WhatsApp. Las solicitudes elegibles pueden usar pago manual por Bre-B con comprobante privado y revision administrativa.

## Funcionalidades principales

- Catalogo publico con busqueda y filtros combinables.
- Productos, categorias, imagenes y presentaciones con precio y disponibilidad.
- Carrito local con cantidades, seleccion de lineas y revision de precios.
- Registro idempotente de solicitudes con aceptacion de documentos legales.
- Continuacion voluntaria por WhatsApp despues del registro.
- Pago manual opcional por Bre-B para solicitudes elegibles.
- Acceso administrativo mediante Supabase Auth.
- Gestion de catalogo, inventario, solicitudes y comprobantes.
- Confirmacion y cancelacion transaccional con control de inventario.

El pago ocurre fuera del sitio. La aplicacion no solicita tarjetas, claves bancarias, CVV ni codigos OTP y no valida transferencias automaticamente.

## Tecnologias

- HTML5, CSS3 y JavaScript sin framework de interfaz.
- Vite para desarrollo y compilacion.
- Supabase PostgreSQL, Auth, Storage, RPC y Edge Functions.
- GitHub Actions y GitHub Pages para despliegue.
- `node:test` para pruebas del cliente y pgTAP para la base de datos.

## Requisitos

- Node.js 24 o una version compatible con las dependencias declaradas.
- npm.
- Variables publicas de un proyecto Supabase para ejecutar la aplicacion conectada.
- Supabase CLI y acceso autorizado al proyecto para operaciones de base de datos.
- Docker Desktop solo cuando se utilice el entorno local completo de Supabase.

## Instalacion

Instale las dependencias bloqueadas por `package-lock.json`:

```bash
npm ci
```

Copie `.env.example` como `.env.local` y complete:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Estas variables son publicas para el cliente. Nunca incluya `service_role`, contrasenas u otros secretos en variables con prefijo `VITE_`.

## Desarrollo

```bash
npm run dev
```

Vite mostrara la URL local, normalmente `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

La salida se genera en `dist/` y no se versiona.

## Pruebas

Pruebas Node del cliente:

```bash
npm run test:auth
```

Pruebas pgTAP de PostgreSQL contra el proyecto Supabase enlazado:

```bash
npm run supabase:test-db
```

Suite completa configurada:

```bash
npm test
```

El script completo incluye las pruebas remotas de base de datos y requiere acceso autorizado e infraestructura disponible.

## Base de datos y Supabase

El backend reproducible se encuentra en `supabase/`:

- `supabase/migrations/`: esquema, restricciones, RLS, permisos y RPC versionadas.
- `supabase/functions/`: Edge Functions, incluido el envio privado de comprobantes.
- `supabase/tests/database/`: pruebas pgTAP de estructura, seguridad y reglas transaccionales.
- `supabase/seed.sql`: categorias iniciales y datos reproducibles de desarrollo.
- `supabase/config.toml`: configuracion del entorno local.

No se editan migraciones ya aplicadas. Los cambios de base de datos se agregan mediante nuevas migraciones y se revisan antes de enviarlos:

```bash
npm run supabase:status
npm run supabase:push:dry
npm run supabase:push
```

La arquitectura y los contratos se describen en [`docs/architecture/`](docs/architecture/).

## Estructura del proyecto

```text
.github/    flujo de despliegue en GitHub Pages
docs/       documentacion tecnica y registro historico
ia/         registro academico del uso de inteligencia artificial
informe/    entregables y evidencias academicas
public/     assets publicos y versiones legales
src/        aplicacion web
supabase/   migraciones, funciones, configuracion, seed y pruebas SQL
tests/      pruebas automatizadas del cliente
```

Los archivos raíz `index.html`, `vite.config.mjs`, `package.json` y `package-lock.json` configuran la aplicacion y su entorno de desarrollo.

## Documentacion academica

- [`informe/`](informe/README.md) organiza briefing, requisitos, diseno, arquitectura y evidencias de la entrega.
- [`ia/`](ia/README.md) conserva el registro academico revisado del uso de inteligencia artificial.

## Seguridad

- El visitante no tiene acceso directo a las tablas del catalogo, solicitudes o pagos.
- Las operaciones publicas y administrativas sensibles se validan en PostgreSQL.
- La administracion exige Supabase Auth y autorizacion adicional mediante RLS y funciones protegidas.
- Los comprobantes se guardan en un bucket privado y se consultan mediante URLs firmadas de corta duracion.
- Los secretos administrativos no pertenecen al frontend ni al repositorio.

Consulte [`docs/README.md`](docs/README.md) para navegar la documentacion vigente.
