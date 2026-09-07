# Bitácora del proyecto

## 2026-08-29

### Contexto

Inicialización documental del repositorio para el proyecto integrador Esenciales Catálogo Web.

### Decisiones / cambios

- Se creó la estructura documental inicial.
- Se incorporaron y verificaron las cuatro fuentes base originales en `docs/sources/`.
- La arquitectura y los requisitos definitivos permanecen pendientes de validación.

### Pendientes

- Validar requisitos, alcance operativo, roles y reglas de negocio.
- Definir arquitectura solo cuando existan decisiones confirmadas.
- Registrar futuras instrucciones explícitas del profesor.

## 2026-08-29

### Contexto

Confirmación de tecnologías requeridas para el proyecto y del sistema gestor de base de datos.

### Decisiones / cambios

- Se confirma el uso de HTML5, CSS3, JavaScript, Node.js, Express y Git/GitHub, conforme a las tecnologías establecidas por el curso.
- Se acepta PostgreSQL como sistema gestor de base de datos del proyecto.

### Pendientes

- Definir únicamente las demás decisiones de arquitectura que se confirmen posteriormente.

## 2026-09-03

### Contexto

Consolidación y validación interna de la primera versión seria del alcance funcional del MVP de Esenciales.

### Decisiones / cambios

- Se aprueba por el equipo el alcance funcional MVP V1, sujeto a pendientes académicos, de negocio y técnicos expresamente identificados.
- Se aprueba el planteamiento del problema sobre la gestión del catálogo en Excel, el envío individual de numerosas fotografías por WhatsApp y la falta de un medio centralizado para administrar y consultar su información.
- Se reformulan la pregunta problema y el objetivo general para identificar expresamente a Esenciales como emprendimiento.
- Se reemplazan los objetivos específicos genéricos por tres resultados funcionales: administración del catálogo, catálogo público y solicitudes de compra, conforme a la retroalimentación del profesor.
- El sistema se organiza en ocho macrofuncionalidades para controlar el alcance.
- Se adopta `solicitud de compra` en lugar de `solicitud de cotización` para describir la intención del cliente sin implicar pago o venta concluida.
- Se definen productos, presentaciones, precios históricos, disponibilidad, inventario, carrito, solicitudes y estados administrativos.
- Se define `Productos destacados` como selección manual del administrador; no se afirmarán productos más vendidos a partir de fuentes externas.
- Se define Agotado como resultado automático del stock cero en venta inmediata y Bajo pedido con stock local vendible igual a cero.
- Se define el estado activo o inactivo de las presentaciones y la precedencia del resumen público `Disponible`, `Bajo pedido`, `Agotado` y `No disponible`.
- Se aprueban solicitudes mixtas, cantidades entre 1 y 99 y precios en COP sin decimales.
- Al confirmar se aplica el modo de disponibilidad vigente acordado por WhatsApp.
- Las cinco categorías iniciales quedan precargadas y pueden editarse o desactivarse.
- Se permite corregir datos del cliente, cantidades y retirar líneas existentes mientras una solicitud esté Nueva, sin agregar líneas ni cambiar presentaciones o precios; después de confirmada será inmutable.
- Se actualizan requisitos, reglas de negocio, actores, flujos y contexto vigente.
- Se confirma el frontend con HTML5, CSS3 y JavaScript sin framework adicional y se registra la decisión en ADR-002.

### Pendientes

- Confirmar con el profesor el límite de funcionalidades y la necesidad de un segundo rol autenticado.
- Validar con Esenciales las definiciones de `Original`, `1.1` e `Inspiración`.
- Confirmar contenido público, datos reales de productos y número de WhatsApp.
- Definir autenticación, imágenes, modelo lógico de PostgreSQL, transacciones y despliegue.

### Referencias

- [Alcance funcional MVP V1](../project/functional-scope.md).
- [Requisitos](../project/requirements.md).
- [Reglas de negocio](../project/business-rules.md).
- [ADR-002: Frontend sin framework adicional](../architecture/decisions/ADR-002-frontend-sin-framework.md).

## 2026-09-05

### Contexto

Aclaración del profesor sobre la estructura de la introducción y la secuencia metodológica de los objetivos específicos.

### Decisiones / cambios

- Se conserva el objetivo general vigente.
- Se reformulan los objetivos específicos en tres etapas: diagnóstico, desarrollo funcional y validación.
- Se fusionan las etapas anteriores de diseño y construcción dentro del objetivo de desarrollo.
- Se completa la introducción con la pregunta problema bajo encabezado propio, la justificación aplicada y académica, el alcance, la delimitación y la estructura del informe.
- Se evita presentar como resultados los beneficios esperados de una aplicación que todavía no ha sido implementada.
- Se ajusta la introducción como texto continuo, con la pregunta problema en un párrafo independiente y sin subtítulos internos.

### Referencias

- [Borrador del informe académico](../academic/report/REPORT_DRAFT.md).
- [Instrucciones del profesor](../academic/professor-instructions.md).

## 2026-09-05

### Contexto

Inicio de la preparación técnica para implementar el MVP de Esenciales de manera incremental.

### Decisiones / cambios

- Se confirma una aplicación monolítica modular con Node.js y Express, que sirve el frontend estático y expone la API bajo `/api`.
- Se confirma el acceso a PostgreSQL con `pg` y SQL explícito, sin ORM.
- Se confirma la autenticación administrativa mediante sesiones de servidor y cookie segura.
- Se confirma el almacenamiento de imágenes de producto en un servicio externo; PostgreSQL conservará sus URL y metadatos.
- Se registran las decisiones en los ADR-003 a ADR-006.

### Pendientes

- Diseñar el modelo lógico de PostgreSQL y las transacciones de confirmación y cancelación.
- Elegir el proveedor de imágenes, el almacenamiento específico de sesiones y el proveedor de despliegue.
- Instalar PostgreSQL localmente antes de implementar la conexión.

### Referencias

- [Arquitectura](../architecture/overview.md).
- [Decisiones arquitectónicas](../architecture/decisions/README.md).

## 2026-09-05

### Contexto

Diseño inicial del modelo lógico de datos antes de crear la infraestructura de PostgreSQL y la aplicación Express.

### Decisiones / cambios

- Se documenta el modelo lógico propuesto para categorías, productos, presentaciones, imágenes, solicitudes, detalles, usuarios administrativos y sesiones.
- Se documentan las restricciones de precios, cantidades, stock, disponibilidad y conservación de precios históricos.
- Se describen las transacciones de registro, confirmación, cancelación y edición de solicitudes Nuevas.
- Se diferencian las garantías de PostgreSQL de las responsabilidades de Express.

### Pendientes

- Convertir y validar el diseño mediante migraciones SQL en PostgreSQL local.
- Resolver los tipos, índices y mecanismos SQL finales durante la implementación.

### Referencias

- [Modelo lógico de datos](../architecture/data-model.md).
- [Reglas de negocio](../project/business-rules.md).
