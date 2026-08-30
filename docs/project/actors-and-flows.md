# Actores y flujos

## Actores preliminares

| Actor | Responsabilidad descrita | Estado |
| --- | --- | --- |
| Administrador | Gestiona los aspectos administrativos generales que se definan. | Preliminar |
| Propietario / administrador de Esenciales | Administra catálogo, categorías, productos, precios, inventario y solicitudes de cotización. | Preliminar |
| Cliente / visitante | Consulta el catálogo, selecciona productos y genera una solicitud de cotización sin registro inicial. | Preliminar |

Los permisos definitivos y la posible diferenciación entre los dos actores administrativos están pendientes de análisis. Fuente: [CONTEXTO_PROYECTO_ESENCIALES.md](../sources/CONTEXTO_PROYECTO_ESENCIALES.md).

## Flujo principal preliminar

Propietario inicia sesión, administra el catálogo y este queda disponible para consulta. El cliente consulta productos, agrega productos al carrito, el sistema valida y registra la solicitud, prepara el mensaje y el cliente continúa la conversación por WhatsApp.

El flujo deberá mantenerse demostrable de principio a fin y validarse antes de implementarse.
