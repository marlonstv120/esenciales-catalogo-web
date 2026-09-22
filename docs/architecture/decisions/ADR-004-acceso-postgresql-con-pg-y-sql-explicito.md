# ADR-004: Acceso a PostgreSQL con pg y SQL explícito

## Estado

Superseded

Reemplazado por [ADR-007](ADR-007-servicios-backend-con-supabase.md) el 2026-09-07.

## Contexto

PostgreSQL fue confirmado como SGBD en ADR-001. Aún debía definirse cómo la aplicación Node.js accedería a la base de datos. El MVP contiene reglas críticas de integridad, como la conservación de precios históricos y las transacciones de confirmación y cancelación de solicitudes.

Esta decisión se conserva como antecedente. El acceso de la aplicación ya no se realizará mediante una API Node.js propia; Supabase administrará la conexión y expondrá operaciones controladas mediante su cliente JavaScript, RLS y funciones RPC.

## Decisión

Usar el paquete `pg` para conectar Node.js con PostgreSQL y escribir consultas SQL explícitas. No se incorporará un ORM durante el MVP.

## Motivos

- Mantiene visible y comprensible la relación entre el modelo lógico, las consultas y las reglas de negocio.
- Facilita aprender y sustentar SQL, restricciones y transacciones de PostgreSQL.
- Evita una dependencia y una abstracción no necesarias para el alcance actual.
- Permite controlar de forma directa las transacciones de inventario requeridas por las reglas RN-06, RN-07 y RN-10.

## Alternativas consideradas

- Usar un ORM.

No se selecciona porque no es necesario para el MVP y añade conceptos, configuración y una capa adicional que el equipo debería aprender y justificar.

## Consecuencias

- Las consultas parametrizadas serán obligatorias para datos externos.
- Las migraciones y datos iniciales se mantendrán como archivos SQL versionados.
- El diseño posterior definirá consultas y transacciones concretas para la confirmación y cancelación de solicitudes.
- El equipo deberá mantener el SQL organizado y probado, evitando duplicación innecesaria.
