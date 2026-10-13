# VEHIMARCAS del Valle

Aplicación web Full Stack para la publicación y administración del catálogo de vehículos de **VEHIMARCAS del Valle** ("Tu plataforma confiable para la compra y venta de vehículos"). El sistema permite consultar camionetas SUV, pick-ups y sedanes sin registro, filtrar por marca, tipo, año, precio, transmisión y estado, preparar solicitudes de cotización o compra y continuar libremente la atención comercial por WhatsApp.

## Funcionalidades principales

- **Catálogo de vehículos:** Búsqueda rápida y filtros por marca, tipo de vehículo (SUV, Sedán, Pick-up, etc.), año, rango de precio, transmisión (Mecánica/Automática) y estado (Nuevo/Usado).
- **Ficha detallada de vehículo:** Galería de fotos en alta resolución, ficha técnica completa (Marca, Modelo, Año, Kilometraje, Transmisión, Combustible, Estado y Precio) y botón de contacto por WhatsApp / Cotización.
- **Carrito / Solicitud de cotización:** Selección de vehículos de interés, resumen de cotización y registro de solicitud.
- **Acceso administrativo:** Panel protegido con Supabase Auth para gestionar inventario de vehículos, imágenes y solicitudes recibidas.

## Tecnologías

- **Frontend:** HTML5, CSS3 vanilla (sistema de diseño automotriz moderno con colores cobalto, azul marino y acento deportivo naranja/rojo) y JavaScript ES Modules sin frameworks pesados.
- **Build Tool:** Vite.
- **Backend & Base de datos:** Supabase (PostgreSQL, Auth, Storage, RPC).
- **Pruebas:** `node:test` para pruebas unitarias de controladores e interfaz.

## Instalación y ejecución

La aplicación administra el catálogo a través de una API local (**Node.js + Express + PostgreSQL**). El frontend la usa cuando no se configuran credenciales de Supabase (`VITE_SUPABASE_URL`).

Requisitos:

- **Node.js** (18 o superior)
- **PostgreSQL** corriendo en `localhost:5432` (o ajusta `DATABASE_URL` en `.env`)

```bash
npm install
npm run dev
```

`npm run dev` hace todo en un solo comando:

1. Prepara la base de datos local `vehimarcas` (idempotente, no borra datos).
2. Arranca la API en **http://localhost:3000** (`node server/index.js`).
3. Arranca Vite con recarga en caliente en **http://localhost:5173**.

| Página | URL |
| --- | --- |
| Catálogo público | http://localhost:5173 |
| Panel de administración | http://localhost:5173/admin |

> La API y la base de datos solo funcionan en local. Exportando el panel: si abres el panel sin la API corriendo verás un aviso de conexión (no datos de ejemplo) y no podrás guardar cambios. Usa `npm run dev` para levantar todo.

Pasos por separado (opcional):

```bash
npm run db:setup    # crea la base y aplica migraciones + seed (una vez o cuando cambien)
npm run server      # API local en http://localhost:3000
npm run dev:frontend # solo Vite en http://localhost:5173
```

Credenciales de acceso al panel (entorno local / demo): `admin@vehimarcas.com`.

## Construcción para producción

```bash
npm run build
```

El servidor local (`node server/index.js`) también sirve la compilación (`dist/`) en http://localhost:3000.

## Pruebas

```bash
npm run test:auth
```
