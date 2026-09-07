# Modelo lógico de datos

## Estado

Diseño técnico propuesto el 5 de septiembre de 2026. Deriva del alcance funcional MVP V1 y de las decisiones de datos confirmadas durante su definición. Debe validarse contra las migraciones SQL antes de considerarse implementado.

## Propósito

Este documento define la estructura lógica inicial en PostgreSQL para administrar el catálogo, las solicitudes de compra y las sesiones administrativas. También establece las transacciones necesarias para preservar precios históricos e inventario consistente.

No sustituye las reglas de negocio en [business-rules.md](../project/business-rules.md). Las migraciones SQL y el código de Express deberán cumplir ambos documentos.

## Convenciones

- Tablas y columnas en español, minúsculas y sin tildes.
- Las claves primarias se denominarán `id` y usarán enteros generados por PostgreSQL.
- Las claves foráneas se denominarán `<entidad>_id`.
- Las fechas se almacenarán con zona horaria (`timestamptz`).
- Los precios se almacenarán como enteros en pesos colombianos, sin decimales.
- Los datos opcionales se almacenarán como `NULL`, no como texto vacío.
- Las consultas que reciban datos externos usarán parámetros; no se construirá SQL concatenando entradas del usuario.

## Decisiones confirmadas

- El inicio de sesión administrativo utiliza `nombre_usuario`.
- Las sesiones administrativas se almacenan en PostgreSQL.
- `genero` admite `hombre`, `mujer`, `unisex` o valor nulo.
- `referencia` es opcional y única cuando existe.
- Los detalles de una solicitud muestran el nombre actual del producto y la etiqueta actual de la presentación.
- El precio unitario efectivo aplicado se conserva como dato histórico.
- El sistema conserva el estado actual de la solicitud y sus fechas relevantes, sin una tabla de auditoría de transiciones.

## Entidades y relaciones

```text
categorias 1 --- N productos
productos 1 --- N presentaciones
productos 1 --- N imagenes_producto

solicitudes 1 --- N detalles_solicitud
presentaciones 1 --- N detalles_solicitud

usuarios_administrativos 1 --- N sesiones
```

La relación entre `detalles_solicitud` y `presentaciones` permite recuperar el nombre actual del producto y la presentación. La relación se preserva incluso cuando un producto o una presentación deja de estar activo.

## Tablas de negocio

### `usuarios_administrativos`

| Columna | Tipo lógico | Reglas principales |
| --- | --- | --- |
| `id` | entero generado | Clave primaria. |
| `nombre_usuario` | texto | Obligatorio; único sin distinguir mayúsculas o minúsculas. |
| `contrasena_hash` | texto | Obligatorio; nunca almacena la contraseña en texto plano. |
| `activo` | booleano | Obligatorio; valor inicial `true`. |
| `creado_en` | fecha con zona horaria | Obligatorio; valor inicial de la base de datos. |
| `actualizado_en` | fecha con zona horaria | Obligatorio; se actualiza al modificar el registro. |

No se incluye un rol hasta que se confirme el segundo rol autenticado.

### `categorias`

| Columna | Tipo lógico | Reglas principales |
| --- | --- | --- |
| `id` | entero generado | Clave primaria. |
| `nombre` | texto | Obligatorio; único sin distinguir mayúsculas o minúsculas. |
| `activo` | booleano | Obligatorio; valor inicial `true`. |
| `creado_en` | fecha con zona horaria | Obligatorio. |
| `actualizado_en` | fecha con zona horaria | Obligatorio. |

La instalación inicial incluirá Perfumes / Lociones, Splash, Cremas, Humidificadores y Otros productos.

### `productos`

| Columna | Tipo lógico | Reglas principales |
| --- | --- | --- |
| `id` | entero generado | Clave primaria. |
| `categoria_id` | entero | Obligatorio; referencia a `categorias`. |
| `nombre` | texto | Obligatorio y no vacío. |
| `descripcion` | texto | Obligatoria y no vacía. |
| `marca` | texto | Opcional. |
| `genero` | texto controlado | `hombre`, `mujer`, `unisex` o nulo. |
| `familia_olfativa` | texto | Opcional; funcionalidad SHOULD. |
| `referencia` | texto | Opcional; única cuando existe. |
| `clasificacion` | texto controlado | `original`, `uno_a_uno`, `inspiracion` o nulo. |
| `destacado` | booleano | Obligatorio; valor inicial `false`. |
| `activo` | booleano | Obligatorio; valor inicial `true`. |
| `creado_en` | fecha con zona horaria | Obligatorio. |
| `actualizado_en` | fecha con zona horaria | Obligatorio. |

No se incluye una columna `publicado`: la publicación se deriva de las condiciones de RN-19.

### `presentaciones`

| Columna | Tipo lógico | Reglas principales |
| --- | --- | --- |
| `id` | entero generado | Clave primaria. |
| `producto_id` | entero | Obligatorio; referencia a `productos`. |
| `etiqueta` | texto | Obligatoria y no vacía. |
| `precio_normal` | entero | Obligatorio; mayor que cero. |
| `precio_promocional` | entero | Opcional; mayor que cero y menor que `precio_normal`. |
| `stock` | entero | Obligatorio; no negativo. |
| `modo_disponibilidad` | texto controlado | `venta_inmediata`, `bajo_pedido` o `no_disponible`. |
| `activo` | booleano | Obligatorio; valor inicial `true`. |
| `creado_en` | fecha con zona horaria | Obligatorio. |
| `actualizado_en` | fecha con zona horaria | Obligatorio. |

Una presentación con `modo_disponibilidad = bajo_pedido` debe tener `stock = 0`.

Los estados públicos no se almacenan porque se derivan así:

```text
venta_inmediata y stock > 0  -> Disponible
venta_inmediata y stock = 0  -> Agotado
bajo_pedido                  -> Bajo pedido
no_disponible                -> No disponible
```

### `imagenes_producto`

| Columna | Tipo lógico | Reglas principales |
| --- | --- | --- |
| `id` | entero generado | Clave primaria. |
| `producto_id` | entero | Obligatorio; referencia a `productos`. |
| `url` | texto | Obligatoria; ubicación pública de la imagen. |
| `identificador_externo` | texto | Obligatorio; identificador devuelto por el proveedor. |
| `texto_alternativo` | texto | Opcional. |
| `posicion` | entero | Obligatoria; no negativa. |
| `creado_en` | fecha con zona horaria | Obligatorio. |

La combinación `producto_id` y `posicion` será única. El proveedor externo de imágenes sigue pendiente de selección.

### `solicitudes`

| Columna | Tipo lógico | Reglas principales |
| --- | --- | --- |
| `id` | entero generado | Clave primaria interna. |
| `codigo` | texto | Obligatorio y único; inicia con formato `ES-00001`. |
| `nombre_cliente` | texto | Obligatorio y no vacío. |
| `telefono` | texto | Obligatorio y no vacío; no se almacena como número. |
| `ciudad` | texto | Opcional. |
| `observaciones` | texto | Opcional. |
| `estado` | texto controlado | `nueva`, `confirmada`, `entregada` o `cancelada`. |
| `creado_en` | fecha con zona horaria | Obligatorio. |
| `actualizado_en` | fecha con zona horaria | Obligatorio. |
| `confirmado_en` | fecha con zona horaria | Nula hasta confirmar. |
| `entregado_en` | fecha con zona horaria | Nula hasta entregar. |
| `cancelado_en` | fecha con zona horaria | Nula hasta cancelar. |

El código se generará a partir de una secuencia de PostgreSQL. La secuencia puede tener huecos, conforme a RN-14.

### `detalles_solicitud`

| Columna | Tipo lógico | Reglas principales |
| --- | --- | --- |
| `id` | entero generado | Clave primaria. |
| `solicitud_id` | entero | Obligatorio; referencia a `solicitudes`. |
| `presentacion_id` | entero | Obligatorio; referencia a `presentaciones`. |
| `cantidad` | entero | Obligatoria; entre 1 y 99. |
| `precio_unitario` | entero | Obligatorio; precio efectivo histórico mayor que cero. |
| `subtotal` | entero calculado | `cantidad * precio_unitario`. |
| `cantidad_descontada` | entero | Obligatoria; no negativa; valor inicial cero. |

La combinación `solicitud_id` y `presentacion_id` será única. Una solicitud no podrá tener la misma presentación en dos líneas.

`cantidad_descontada` registra las unidades que efectivamente redujeron el inventario al confirmar. Su valor será igual a `cantidad` para venta inmediata y cero para bajo pedido; permite restituir exactamente el stock al cancelar.

El valor total de productos se calculará sumando los subtotales de sus detalles. No se duplicará en `solicitudes` para evitar inconsistencias durante la edición de una solicitud Nueva.

## Tabla técnica

### `sesiones`

Las sesiones administrativas se almacenarán en PostgreSQL y se asociarán a un usuario administrativo. Su estructura concreta dependerá de la librería de sesiones compatible con Express que se seleccione al implementar la autenticación. Esta librería podrá requerir nombres técnicos de columnas distintos de la convención del dominio.

## Integridad y conservación

- Categorías, productos, presentaciones y usuarios administrativos se desactivan, no se eliminan desde la aplicación.
- Solicitudes y detalles de solicitud no se eliminan desde la aplicación.
- Las claves foráneas del catálogo y de las solicitudes restringirán eliminaciones que destruyan relaciones históricas.
- Una imagen podrá retirarse si el producto conserva otra imagen o deja de cumplir las condiciones de publicación.
- Cambiar el nombre de un producto o la etiqueta de una presentación modifica cómo se muestra una solicitud histórica, según la decisión confirmada; no modifica su precio histórico.

## Reglas que debe garantizar PostgreSQL

- Relaciones entre las tablas mediante claves foráneas.
- Valores permitidos para género, clasificación, modo de disponibilidad y estado.
- Precios positivos y precio promocional menor que el normal cuando exista.
- Stock y cantidades descontadas no negativos.
- Cantidades entre uno y 99.
- Stock igual a cero para presentaciones bajo pedido.
- Unicidad de código de solicitud, nombre de usuario, referencia existente y posición de imagen por producto.
- Unicidad de presentación por detalle de solicitud.
- Cálculo consistente del subtotal.
- Atomicidad y bloqueos en las transacciones de inventario.

## Responsabilidades de Express

- Validar y normalizar entradas antes de consultar PostgreSQL.
- Aplicar las condiciones de publicación de un producto.
- Calcular el resumen público de disponibilidad por producto.
- Impedir transiciones de estado no permitidas.
- Limitar la edición de solicitudes Nuevas a datos del cliente, cantidades y retiro de líneas existentes.
- Revalidar catálogo, disponibilidad y precios antes de registrar o confirmar una solicitud.
- Autenticar y autorizar operaciones administrativas.
- Validar archivos antes de enviarlos al proveedor de imágenes.

## Transacciones críticas

### Registro de una solicitud

```text
BEGIN
Validar datos del cliente y carrito no vacío
Consultar productos y presentaciones actuales
Revalidar actividad, precio, modo y stock aplicable
Generar código con la secuencia de PostgreSQL
Insertar solicitud en estado Nueva
Insertar detalles con precio unitario histórico y cantidad_descontada en cero
COMMIT
```

Registrar una solicitud no descuenta ni reserva inventario.

### Confirmación de una solicitud

```text
BEGIN
Bloquear solicitud con SELECT ... FOR UPDATE
Comprobar que el estado es Nueva
Bloquear presentaciones involucradas en un orden estable
Revalidar categoría, producto y presentación activos
Revalidar modo de disponibilidad y stock actual
Descontar solo las líneas de venta inmediata
Registrar cantidad_descontada por cada detalle
Cambiar estado a Confirmada y registrar confirmado_en
COMMIT
```

Bloquear la solicitud evita una confirmación duplicada. Bloquear las presentaciones evita que confirmaciones concurrentes lleven el stock por debajo de cero.

### Cancelación de una solicitud confirmada

```text
BEGIN
Bloquear solicitud con SELECT ... FOR UPDATE
Comprobar que el estado es Confirmada
Restituir a cada presentación su cantidad_descontada
Cambiar estado a Cancelada y registrar cancelado_en
COMMIT
```

La restitución usará `cantidad_descontada`, incluso si la presentación fue desactivada o cambió de modo después de confirmar.

### Edición de una solicitud Nueva

```text
BEGIN
Bloquear solicitud y comprobar estado Nueva
Actualizar solo datos del cliente permitidos
Actualizar cantidades o retirar detalles existentes
Revalidar cantidades y stock de venta inmediata
Comprobar que permanece al menos un detalle
COMMIT
```

La operación no podrá crear detalles, cambiar presentaciones ni actualizar precios históricos.

## Pendientes antes de escribir migraciones

- Definir el proveedor de almacenamiento externo de imágenes y los metadatos exactos que entregue.
- Elegir la librería y el almacenamiento concreto de las sesiones en PostgreSQL.
- Precisar la validación técnica de teléfonos sin excluir números legítimos.
- Validar los tipos SQL finales, índices y mecanismos para actualizar `actualizado_en`.
- Revisar el diseño con los datos reales iniciales de Esenciales.
- Probar las migraciones y las transacciones en una base PostgreSQL vacía antes de conectar Express.
