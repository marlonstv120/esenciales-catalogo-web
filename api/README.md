# Contrato de servicios

Esta carpeta documenta el contrato que consumen el frontend y los servicios de backend. En el MVP, el profesor autorizo utilizar Supabase en sustitucion de una API propia con Express.

## Lectura pública del catálogo

Las migraciones `20260926000200_add_public_catalog_rpc.sql` y `20260927000100_add_public_reference_normal_price.sql` exponen dos funciones de solo lectura a `anon` y `authenticated`. Las tablas del catálogo no otorgan lectura ni escritura directa a `anon`.

| RPC | Entrada | Salida | Comportamiento |
| --- | --- | --- | --- |
| `obtener_catalogo_publico` | Ninguna | Filas de categorías activas y productos publicables; columnas de producto son nulas en categorías sin productos publicables. | Orden de categorías por identificador y de productos por nombre. Incluye precio efectivo y normal de referencia y disponibilidad textual. |
| `obtener_producto_publico` | `producto_id integer` | Objeto JSONB o `NULL`. | Devuelve metadatos, precios normal/promocional de referencia, imagen principal y presentaciones activas con precio normal, promoción válida y disponibilidad exacta. No incluye stock numérico. |

Un producto publicable está activo, pertenece a una categoría activa, tiene imagen y al menos una presentación activa con precio normal válido. Los errores de Supabase se muestran en el cliente como mensajes genéricos con opción de reintento; la respuesta interna de PostgreSQL no se presenta al visitante.

La seguridad y elegibilidad de estos resultados se comprueban en `supabase/tests/database/06_public_catalog.test.sql`.

## Operaciones administrativas y pendientes

Las operaciones administrativas autenticadas se validan mediante la función `es_administrador_activo()` y políticas RLS existentes. Las RPC de solicitudes aún están pendientes de implementación y se documentarán junto con sus entradas, salidas y errores esperados.

La arquitectura vigente se describe en [`docs/architecture/overview.md`](../docs/architecture/overview.md). No se debe presentar una operacion como implementada hasta que exista en las migraciones de [`supabase/`](../supabase/) y haya sido probada.
