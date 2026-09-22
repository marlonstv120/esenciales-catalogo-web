# Visión general

## Identificación

**Título vigente:** Sistema web para la gestión y publicación del catálogo de productos para la empresa ESENCIALES.

**Nombre corto del proyecto:** Catálogo Web de ESENCIALES.

**Nombre técnico:** `esenciales-catalogo-web`.

**Titulillo del informe:** Gestión del catálogo web de ESENCIALES.

El título vigente se utilizará en la portada, el informe técnico y las referencias formales. El nombre corto se utilizará en la sustentación, presentaciones, diagramas y otros espacios donde el título formal resulte extenso. `ESENCIALES` identifica exclusivamente a la empresa, no al proyecto o al sistema.

ESENCIALES es una empresa real dedicada principalmente a la comercialización de perfumes inspirados 1.1, originales o importados y otros productos de perfumería. Fuentes: [contexto inicial](../sources/CONTEXTO_PROYECTO_ESENCIALES.md) y [entrevista de levantamiento de requerimientos](../sources/ENTREVISTA_LEVANTAMIENTO_REQUERIMIENTOS_ESENCIALES.md).

## Situación y propósito

**Problema confirmado por el equipo:** la información del catálogo y el inventario de ESENCIALES se gestiona principalmente mediante Excel y registros manuales. Los productos se presentan mediante Instagram, Facebook Marketplace, WhatsApp y ventas directas. Cuando un cliente solicita información, puede ser necesario enviarle numerosas fotografías de forma individual, llegando en algunos casos a cerca de cincuenta imágenes. Además, los productos, precios y existencias no se encuentran reunidos en un solo lugar que permita consultarlos y actualizarlos de manera clara y organizada.

Esta forma de trabajo hace más difícil mantener actualizados el catálogo y el inventario y presentar claramente la información de los productos. También dificulta que los clientes consulten los productos, sus precios y su disponibilidad, porque la información queda distribuida entre hojas de cálculo, registros, publicaciones y conversaciones. Por esta razón, ESENCIALES no cuenta con un medio centralizado que facilite la administración del catálogo y permita a los clientes consultar su información de manera organizada.

El [briefing de necesidades](briefing-esenciales.md) sintetiza el levantamiento realizado con el propietario y diferencia las necesidades cubiertas por el MVP de las solicitudes parciales, conflictivas o externas al alcance vigente.

### Pregunta problema

¿Cómo desarrollar una aplicación web full stack que permita centralizar la gestión, publicación y consulta del catálogo de productos, precios y disponibilidad de la empresa ESENCIALES?

La aplicación permitirá administrar productos, presentaciones, precios, disponibilidad e inventario; publicar un catálogo para visitantes; registrar solicitudes de compra; y continuar voluntariamente la conversación comercial por WhatsApp.

Una solicitud de compra expresa intención de compra, pero no representa un pago o una venta concluida. La confirmación comercial ocurre por WhatsApp y su estado se administra dentro del sistema.

## Objetivos vigentes

### Objetivo general

Desarrollar una aplicación web full stack que permita la gestión, publicación y consulta del catálogo de productos, precios y disponibilidad de la empresa ESENCIALES.

### Objetivos específicos

1. Identificar el proceso actual de gestión y presentación del catálogo de la empresa ESENCIALES y las dificultades relacionadas con la organización y consulta de sus productos, precios y disponibilidad.
2. Desarrollar una solución web con funcionalidades de acceso administrativo, gestión del catálogo, publicación pública, búsqueda, filtrado y registro de solicitudes de compra, que responda a las dificultades identificadas en el diagnóstico.
3. Validar la aplicación web mediante pruebas funcionales y su despliegue en un entorno de producción para comprobar el cumplimiento de los requisitos definidos.

## Estado

- **Alcance funcional:** MVP V1 aprobado por el equipo el 3 de septiembre de 2026, con pendientes académicos, de negocio y técnicos identificados.
- **Implementación:** base de frontend con Vite, HTML5, CSS3 y JavaScript creada; aún no hay integración con Supabase ni funcionalidades del catálogo.
- **Tecnologías base del curso:** HTML5, CSS3, JavaScript, Node.js, Express y Git/GitHub. El profesor autorizó usar Supabase en sustitución de Express para agilizar el desarrollo; la autorización y su alcance están registrados en las instrucciones del profesor.
- **Decisiones técnicas confirmadas:** Supabase proveerá PostgreSQL, autenticación, almacenamiento de imágenes y acceso a datos; el frontend utilizará HTML5, CSS3 y JavaScript sin framework adicional.
- **Arquitectura restante:** pendiente de concretar mediante migraciones, políticas RLS, funciones RPC y despliegue del cliente.

Consulte el [alcance funcional MVP V1](functional-scope.md) para conocer las macrofuncionalidades, prioridades, límites y criterios de aceptación.
