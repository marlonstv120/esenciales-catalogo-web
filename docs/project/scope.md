# Alcance

Este archivo resume los límites vigentes del proyecto. La especificación detallada se encuentra en [Alcance funcional MVP V1](functional-scope.md). Todo cambio significativo debe conservar trazabilidad en el historial.

## Confirmado por el equipo

- El proyecto se desarrolla exclusivamente para Esenciales durante el MVP.
- Se prioriza un producto full stack completo, desplegado, comprensible y sustentable.
- El cliente consulta el catálogo sin registrarse.
- El proceso central registra una solicitud de compra y permite continuar voluntariamente hacia WhatsApp.
- No se procesan pagos ni se considera la solicitud como una venta concluida.
- El inventario, la disponibilidad y los precios se administran por presentación.
- El catálogo utiliza productos destacados seleccionados manualmente, no afirmaciones automáticas de productos más vendidos.
- PostgreSQL es el sistema gestor de base de datos confirmado.

## Ocho macrofuncionalidades

1. Autenticación y acceso administrativo.
2. Gestión de la estructura del catálogo.
3. Gestión de productos, presentaciones, precios e imágenes.
4. Gestión de inventario y disponibilidad.
5. Publicación y consulta del catálogo público.
6. Búsqueda, filtrado y navegación.
7. Carrito y generación de solicitud de compra.
8. Gestión administrativa de solicitudes.

Esta agrupación es una decisión de organización del equipo. El supuesto máximo académico de ocho funcionalidades debe confirmarse con el profesor.

## Prioridad obligatoria

- Autenticación administrativa.
- Categorías, productos, presentaciones, precio, imagen mínima, stock y disponibilidad.
- Producto destacado mediante selección manual.
- Catálogo público, detalle, búsqueda por nombre y filtros por categoría y disponibilidad.
- Carrito, registro de solicitud, código único y flujo hacia WhatsApp.
- Gestión de solicitudes nuevas, confirmadas, entregadas y canceladas.
- Ajustes controlados de solicitudes nuevas.
- Validación transaccional del inventario al confirmar y restituir.
- Validaciones de seguridad, PostgreSQL y despliegue.

## Prioridad SHOULD

- Varias imágenes, filtros ampliados y ordenamiento.
- Promociones, dashboard y persistencia local del carrito.
- Familia olfativa y explicación validada de clasificaciones comerciales.

## Prioridad COULD

- Configuración editable de redes y WhatsApp.
- Generación interna de QR.

## Fuera del MVP

- Pagos, autenticación de clientes y seguimiento público de solicitudes.
- Facturación, contabilidad, cuentas por cobrar y almacén profesional.
- Reseñas, favoritos, fidelización, chat interno y analítica avanzada.
- API avanzada de WhatsApp Business.
- Multiemprendimiento, precios mayoristas y gestión completa de proveedores.
- Recomendador con inteligencia artificial y quiz de fragancias.
- Ranking automático de productos más vendidos.

## Pendiente de validar

- Límite académico de ocho funcionalidades.
- Necesidad de un segundo rol autenticado.
- Definiciones públicas de `Original`, `1.1` e `Inspiración`.
- Datos públicos de WhatsApp, entrega y envío.
- Decisiones técnicas todavía listadas en la [especificación funcional](functional-scope.md#11-pendientes-de-validación).

## Evolución futura

La solución podría evolucionar a una plataforma para múltiples emprendimientos, pero no se añadirá complejidad al MVP para anticiparla.
