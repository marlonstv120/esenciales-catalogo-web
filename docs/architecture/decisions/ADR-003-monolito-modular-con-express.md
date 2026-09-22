# ADR-003: Monolito modular con Express

## Estado

Superseded

Reemplazado por [ADR-007](ADR-007-servicios-backend-con-supabase.md) el 2026-09-07.

## Contexto

El MVP requiere un frontend con HTML5, CSS3 y JavaScript, una API con Node.js y Express, autenticación administrativa y conexión a PostgreSQL. El frontend sin framework ya fue confirmado en ADR-002. Era necesario definir si el frontend y el backend se ejecutarían como proyectos independientes o como una sola aplicación.

Esta decisión se conserva como antecedente. El profesor autorizó posteriormente el uso de Supabase en sustitución de Express para agilizar el desarrollo del MVP.

## Decisión

Construir el MVP como una sola aplicación Node.js con Express. Express servirá los recursos estáticos del frontend y expondrá la API bajo el prefijo `/api`.

La organización interna será modular por responsabilidades, sin separar el frontend y el backend en repositorios o procesos distintos durante el MVP.

## Motivos

- Cumple directamente con las tecnologías exigidas por el curso.
- Reduce configuración, ejecución simultánea de procesos y problemas de CORS.
- Simplifica la integración, las pruebas y el despliegue inicial.
- Es proporcional al tamaño del MVP y a la experiencia inicial del equipo.
- Permite explicar y demostrar con claridad el flujo navegador, Express y PostgreSQL.

## Alternativas consideradas

- Frontend y API como proyectos o despliegues separados.
- Arquitectura de microservicios.

No se seleccionan porque añaden configuración y complejidad sin una necesidad confirmada del MVP.

## Consecuencias

- La aplicación tendrá una única forma de ejecución local y despliegue.
- El frontend consumirá rutas del mismo origen, principalmente bajo `/api`.
- La estructura de código deberá separar rutas, acceso a datos, reglas de negocio y recursos públicos cuando sea necesario, sin introducir capas innecesarias.
- Esta decisión no impide separar componentes en una evolución futura si cambian los requisitos.
