# Arquitectura

Esta seccion contiene:

- `esenciales-architecture.drawio`: diagrama editable actualizado con frontend, Supabase, PostgreSQL, Storage, RLS, RPC, despliegue y pago manual Bre-B.
- `esenciales-architecture.drawio.png`: exportacion para el informe.

El PNG debe regenerarse desde el archivo `.drawio` al modificar el diagrama para conservar correspondencia con la implementacion vigente. La version actual del XML incorpora la Edge Function `submit-payment-proof`, el bucket privado `comprobantes-pago`, `pagos_solicitud`, el token de cliente y la verificacion administrativa transaccional.

Consulte la [arquitectura confirmada](../../docs/architecture/overview.md), el [modelo logico](../../docs/architecture/data-model.md) y las [decisiones ADR](../../docs/architecture/decisions/README.md) antes de elaborar el diagrama.
