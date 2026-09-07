# Requisitos

Estos requisitos detallan el [alcance funcional MVP V1](functional-scope.md), aprobado por el equipo el 3 de septiembre de 2026. Su cantidad no modifica la organización académica del sistema en ocho macrofuncionalidades.

Prioridades:

- **MUST:** obligatorio para aceptar el MVP.
- **SHOULD:** importante, pero no debe comprometer el flujo principal.
- **COULD:** mejora opcional si existe capacidad.

El estado `Aprobado por el equipo` no sustituye una validación académica posterior cuando esta sea necesaria.

## Requisitos funcionales

### Autenticación

| ID | Descripción | Prioridad | Estado | Fuente |
| --- | --- | --- | --- | --- |
| RF-01 | El sistema debe permitir que un usuario administrativo autorizado inicie sesión. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-02 | El sistema debe impedir que usuarios no autenticados accedan a vistas u operaciones administrativas. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-03 | El usuario autenticado debe poder cerrar sesión. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |

### Categorías

| ID | Descripción | Prioridad | Estado | Fuente |
| --- | --- | --- | --- | --- |
| RF-04 | La instalación inicial debe incluir las categorías Perfumes / Lociones, Splash, Cremas, Humidificadores y Otros productos. | MUST | Aprobado por el equipo | Validación del equipo, 2026-09-03 |
| RF-05 | El administrador debe poder crear, consultar, editar, activar y desactivar categorías. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-06 | El sistema debe permitir asociar cada producto con una categoría principal. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-07 | El catálogo debe ocultar las categorías inactivas y los productos asociados a ellas, sin eliminar su información administrativa o histórica. | MUST | Aprobado por el equipo | Validación del equipo, 2026-09-03 |

### Productos, presentaciones, precios e imágenes

| ID | Descripción | Prioridad | Estado | Fuente |
| --- | --- | --- | --- | --- |
| RF-08 | El administrador debe poder crear, consultar, editar, activar y desactivar productos. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-09 | El producto debe admitir nombre, descripción, categoría, marca, género, referencia y las clasificaciones opcionales `Original`, `1.1` e `Inspiración` cuando correspondan. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-10 | El producto debería admitir familia olfativa opcional cuando corresponda. | SHOULD | Aprobado por el equipo | Validación del equipo, 2026-09-03 |
| RF-11 | El administrador debe poder asociar múltiples presentaciones a un producto y activar o desactivar cada una sin eliminar su historial. | MUST | Aprobado por el equipo | MVP V1 y validación del equipo, 2026-09-03 |
| RF-12 | Cada presentación debe admitir una etiqueta libre no vacía, precio normal entero en COP mayor que cero, stock local vendible entero no negativo y modo `Venta inmediata`, `Bajo pedido` o `No disponible`. | MUST | Aprobado por el equipo | Validación del equipo, 2026-09-03 |
| RF-13 | Cada presentación debería admitir un precio promocional opcional, entero en COP, mayor que cero y menor que el precio normal. | SHOULD | Aprobado por el equipo | Validación del equipo, 2026-09-03 |
| RF-14 | El administrador debe poder asociar al menos una imagen a un producto antes de publicarlo. | MUST | Aprobado por el equipo | Validación del equipo, 2026-09-03 |
| RF-15 | El administrador debería poder asociar varias imágenes a un producto y definir su orden de visualización. | SHOULD | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-16 | El administrador debe poder marcar o desmarcar manualmente un producto como destacado. | MUST | Aprobado por el equipo | Validación del equipo, 2026-09-03 |
| RF-17 | El sistema solo debe publicar productos activos que tengan nombre, descripción, categoría activa, al menos una imagen y una presentación activa válida con precio. | MUST | Aprobado por el equipo | Validación del equipo, 2026-09-03 |
| RF-18 | El administrador debe poder modificar precio normal, stock y modo de disponibilidad de una presentación. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-19 | El administrador debería poder establecer o retirar manualmente un precio promocional válido. | SHOULD | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-20 | El sistema debe conservar mediante desactivación los productos relacionados con solicitudes históricas. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |

### Catálogo público

| ID | Descripción | Prioridad | Estado | Fuente |
| --- | --- | --- | --- | --- |
| RF-21 | El visitante debe poder acceder al catálogo sin autenticarse. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-22 | Las tarjetas deben mostrar imagen, nombre, precio o precio mínimo y un resumen textual con precedencia `Disponible`, `Bajo pedido`, `Agotado` y `No disponible`, calculado a partir de sus presentaciones activas. | MUST | Aprobado por el equipo | MVP V1 y validación del equipo, 2026-09-03 |
| RF-23 | El visitante debe poder consultar el detalle de un producto y sus presentaciones. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-24 | El sistema debe mostrar el precio normal y el estado exacto de la presentación seleccionada. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-25 | Cuando se implemente la promoción SHOULD, el sistema debe mostrar claramente el precio promocional válido junto al precio normal. | SHOULD | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-26 | La página pública debe mostrar una sección de Productos destacados formada únicamente por productos marcados y publicables. | MUST | Aprobado por el equipo | Validación del equipo, 2026-09-03 |
| RF-27 | El sitio debería explicar las clasificaciones comerciales después de que Esenciales valide sus definiciones exactas. | SHOULD | Pendiente de contenido del negocio | Validación del equipo, 2026-09-03 |

### Búsqueda, filtrado y navegación

| ID | Descripción | Prioridad | Estado | Fuente |
| --- | --- | --- | --- | --- |
| RF-28 | El visitante debe poder buscar productos por nombre. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-29 | El visitante debe poder filtrar por categoría y por el estado de las presentaciones; un producto coincide con disponibilidad cuando al menos una presentación activa tiene el estado seleccionado. | MUST | Aprobado por el equipo | Validación del equipo, 2026-09-03 |
| RF-30 | El visitante debería poder filtrar por género, marca y rango; el rango de precio coincide cuando al menos una presentación activa y solicitable tiene un precio efectivo dentro de él. | SHOULD | Aprobado por el equipo | Validación del equipo, 2026-09-03 |
| RF-31 | El visitante debería poder ordenar por fecha de creación, menor precio efectivo, mayor precio efectivo y nombre; el orden por precio utiliza el menor precio efectivo solicitable de cada producto. | SHOULD | Aprobado por el equipo | MVP V1 y validación del equipo, 2026-09-03 |

### Carrito

| ID | Descripción | Prioridad | Estado | Fuente |
| --- | --- | --- | --- | --- |
| RF-32 | El visitante debe poder agregar al carrito una presentación disponible o bajo pedido. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-33 | El carrito debe permitir combinar presentaciones disponibles y bajo pedido. | MUST | Aprobado por el equipo | Validación del equipo, 2026-09-03 |
| RF-34 | El visitante debe poder elegir una cantidad entera entre 1 y 99, respetando además el stock cuando sea venta inmediata. | MUST | Aprobado por el equipo | Validación del equipo, 2026-09-03 |
| RF-35 | El visitante debe poder modificar cantidades y retirar elementos del carrito. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-36 | El carrito debe mostrar subtotales por línea y el valor total de productos, separado del costo de domicilio o envío. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-37 | El carrito debería conservarse localmente en el navegador. | SHOULD | Aprobado por el equipo | MVP V1, 2026-09-03 |

### Registro y WhatsApp

| ID | Descripción | Prioridad | Estado | Fuente |
| --- | --- | --- | --- | --- |
| RF-38 | El sistema debe solicitar nombre y teléfono antes de registrar una solicitud de compra. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-39 | El sistema debe aceptar ciudad y observaciones como datos opcionales. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-40 | El backend debe revalidar productos, presentaciones, cantidades, precios y disponibilidad antes de almacenar la solicitud. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-41 | El sistema debe registrar la solicitud y su detalle en PostgreSQL conservando los precios aplicados. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-42 | El sistema debe asignar un código único y legible con formato inicial `ES-00001` a cada solicitud registrada correctamente; se permiten huecos y podrá ampliarse la cantidad de dígitos cuando sea necesario. | MUST | Aprobado por el equipo | Validación del equipo, 2026-09-03 |
| RF-43 | El sistema debe preparar un mensaje de WhatsApp con código, cliente, líneas, cantidades, precios y valor total de productos. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-44 | El cliente debe decidir si abre y envía el mensaje desde WhatsApp; la solicitud debe permanecer registrada aunque no continúe. | MUST | Aprobado por el equipo | Validación del equipo, 2026-09-03 |

### Administración de solicitudes

| ID | Descripción | Prioridad | Estado | Fuente |
| --- | --- | --- | --- | --- |
| RF-45 | El administrador debe poder consultar el listado y el historial de solicitudes. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-46 | El administrador debe poder consultar cliente, líneas, precios históricos, subtotales, valor total, observaciones y estado de una solicitud. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-47 | Mientras una solicitud esté Nueva, el administrador debe poder corregir nombre, teléfono, ciudad y observaciones. | MUST | Aprobado por el equipo | Validación del equipo, 2026-09-03 |
| RF-48 | Mientras una solicitud esté Nueva, el administrador debe poder modificar cantidades o retirar líneas existentes. | MUST | Aprobado por el equipo | Validación del equipo, 2026-09-03 |
| RF-49 | La edición de una solicitud Nueva no debe permitir agregar o duplicar líneas, cambiar presentaciones, alterar precios históricos ni dejar la solicitud sin líneas. | MUST | Aprobado por el equipo | Validación del equipo, 2026-09-03 |
| RF-50 | El administrador debe poder realizar únicamente las transiciones de estado permitidas. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-51 | Al confirmar, el backend debe comprobar que producto, categoría y presentación continúen activos; aplicar el modo vigente; impedir líneas inactivas, agotadas o no disponibles; y descontar dentro de una transacción solo el inventario de venta inmediata. | MUST | Aprobado por el equipo | MVP V1 y validación del equipo, 2026-09-03 |
| RF-52 | Al cancelar una solicitud confirmada, el sistema debe restituir exactamente el inventario previamente descontado. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-53 | Una solicitud confirmada debe ser inmutable; si cambia el acuerdo, debe cancelarse y generarse una nueva solicitud. | MUST | Aprobado por el equipo | Validación del equipo, 2026-09-03 |
| RF-54 | El panel debería resumir solicitudes nuevas y confirmadas, presentaciones activas agotadas, presentaciones activas de venta inmediata con stock entre 1 y 3, y total de productos registrados. | SHOULD | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-55 | El panel podría permitir editar el número de WhatsApp, las redes sociales y textos públicos básicos. | COULD | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RF-56 | El panel podría generar un QR estático que apunte a la URL pública desplegada. | COULD | Aprobado por el equipo | MVP V1, 2026-09-03 |

## Requisitos no funcionales

| ID | Descripción | Prioridad | Estado | Fuente |
| --- | --- | --- | --- | --- |
| RNF-01 | La interfaz debe funcionar en celular, tableta y computador con enfoque mobile-first. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RNF-02 | La interfaz debe permitir identificar fácilmente producto, precio, presentación, disponibilidad y acción principal. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RNF-03 | El sistema debe usar HTML semántico, formularios etiquetados, contraste suficiente y estados que no dependan solo del color. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RNF-04 | El sistema debe proteger contraseñas y rutas administrativas, validar entradas en backend, proteger secretos y evitar errores que revelen información sensible. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RNF-05 | Las operaciones de solicitudes e inventario deben evitar stock negativo, doble descuento y actualizaciones parciales. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RNF-06 | El código debe priorizar claridad, nombres comprensibles, responsabilidades definidas y ausencia de dependencias o abstracciones innecesarias. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RNF-07 | La aplicación debe evitar cargas innecesarias y optimizar imágenes, listados y solicitudes al backend sin fijar métricas no medidas. | SHOULD | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RNF-08 | Las páginas públicas deberían incluir títulos y descripciones adecuados, jerarquía semántica de encabezados, texto alternativo para imágenes relevantes y contenido indexable cuando corresponda. | SHOULD | Aprobado por el equipo | MVP V1, 2026-09-03 |
| RNF-09 | El sistema debe desplegarse en producción y utilizar PostgreSQL en el entorno definitivo. | MUST | Aprobado por el equipo | MVP V1, 2026-09-03 |

## Pendientes que afectan requisitos

- El segundo rol autenticado solo se añadirá si el profesor lo exige.
- La explicación de clasificaciones depende del contenido validado por Esenciales.
- La validación técnica exacta del teléfono se definirá sin bloquear números legítimos.
- Autenticación, imágenes, despliegue y transacciones se concretarán durante el diseño técnico.
