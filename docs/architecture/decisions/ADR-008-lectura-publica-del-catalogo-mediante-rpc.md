# ADR-008: Lectura pública del catálogo mediante RPC

**Estado:** Accepted
**Fecha:** 27 de septiembre de 2026

## Contexto

El catálogo debe consultarse sin autenticar visitantes, pero el esquema existente mantiene las tablas de categorías, productos, presentaciones e imágenes cerradas a `anon`. Abrir RLS directamente en varias tablas aumenta el alcance de datos expuestos y obliga a coordinar filtros de publicación entre relaciones.

## Decisión

La lectura pública se implementa con dos funciones PostgreSQL de solo lectura y privilegios `security definer` controlados:

- `public.obtener_catalogo_publico()` devuelve categorías activas y solamente sus productos publicables, con precio efectivo y normal de referencia y disponibilidad calculados en PostgreSQL.
- `public.obtener_producto_publico(producto_id integer)` devuelve como JSONB un producto publicable y sus presentaciones activas, o `NULL` si el producto no está disponible públicamente.

Ambas funciones fijan un `search_path` vacío, califican los objetos con su esquema y conceden ejecución únicamente a `anon` y `authenticated`. Las tablas de catálogo mantienen sus privilegios cerrados para `anon`; las funciones no realizan escrituras ni exponen el stock numérico.

## Motivos

- La base de datos conserva la autoridad sobre publicación, precio y disponibilidad.
- Una sola frontera SQL evita conceder lectura directa sobre las tablas relacionadas.
- El cliente no necesita duplicar reglas comerciales o filtrar productos no publicables.
- pgTAP puede verificar de forma directa el acceso permitido y el rechazo de escrituras.

## Alternativas consideradas

- **RLS de lectura en las tablas:** requiere coordinar políticas y filtros entre productos, categorías, presentaciones e imágenes; aumenta el riesgo de exponer datos no publicables.
- **Vistas públicas:** ofrecen una lectura delimitada, pero representar el detalle anidado y todas las reglas de disponibilidad requiere vistas adicionales o procesamiento duplicado.

## Consecuencias

- Las respuestas SQL constituyen un contrato público versionado que debe probarse con las migraciones.
- Los cambios de reglas de publicación o disponibilidad deben actualizar las funciones y sus pruebas.
- Las tablas siguen sin acceso anónimo directo; cualquier lectura pública nueva requiere una revisión explícita del contrato.
