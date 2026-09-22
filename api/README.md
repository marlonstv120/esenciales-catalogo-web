# Contrato de servicios

Esta carpeta documenta el contrato que consumen el frontend y los servicios de backend. En el MVP, el profesor autorizo utilizar Supabase en sustitucion de una API propia con Express.

El contrato concreto se documentara aqui a medida que se implementen y validen:

- las consultas publicas permitidas por las politicas RLS;
- las operaciones administrativas autenticadas;
- las funciones RPC de PostgreSQL;
- sus entradas, salidas y errores esperados.

La arquitectura vigente se describe en [`docs/architecture/overview.md`](../docs/architecture/overview.md). No se debe presentar una operacion como implementada hasta que exista en las migraciones de [`supabase/`](../supabase/) y haya sido probada.
