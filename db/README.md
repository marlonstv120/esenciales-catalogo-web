# Base de datos

Esta carpeta orienta la documentacion del esquema, sus reglas y los datos de prueba del proyecto.

- El modelo logico propuesto esta en [`docs/architecture/data-model.md`](../docs/architecture/data-model.md).
- Las reglas de negocio estan en [`docs/project/business-rules.md`](../docs/project/business-rules.md).
- El SQL ejecutable y versionado se mantiene en [`supabase/migrations/`](../supabase/migrations/); la primera migración del núcleo de catálogo ya fue validada localmente.
- Los datos de prueba reproducibles se mantendran en [`supabase/seed.sql`](../supabase/seed.sql).

Las migraciones SQL seran la fuente tecnica del esquema implementado. Este directorio no debe contener copias divergentes del mismo SQL ni datos personales reales.
