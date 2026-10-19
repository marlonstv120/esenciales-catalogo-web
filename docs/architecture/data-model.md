# Modelo lógico de datos

## Estado

Diseño técnico propuesto el 5 de septiembre de 2026 y adaptado a Supabase el 7 de septiembre de 2026. El núcleo de catálogo fue materializado en `20260924000100_create_catalog_core.sql`; las políticas administrativas, Storage y las RPC de lectura pública se implementaron en migraciones posteriores. Las migraciones de solicitudes materializan restricciones, RLS, registro transaccional, edición limitada y transiciones administrativas. La migración `20261001000400_add_bre_b_payment_proofs.sql` agrega el token público de la solicitud, `pagos_solicitud`, el bucket privado de comprobantes y las RPC asociadas al pago manual Bre-B. La migración `20261002000200_complete_purchase_request_payment_flow.sql` completa la confirmación externa con `metodo = externo` y `estado = validado_manualmente`. El cliente consulta el catálogo mediante `obtener_catalogo_publico()` y `obtener_producto_publico(integer)`, manteniendo las tablas cerradas a `anon`.

## Propósito

Este documento define la estructura lógica en PostgreSQL para administrar el catálogo, las solicitudes de compra y su pago manual opcional. Supabase Auth administra las credenciales y sesiones administrativas fuera de las tablas de negocio. También establece las transacciones necesarias para preservar precios históricos, inventario consistente y la separación entre estado de solicitud y estado de pago.

No sustituye las reglas de negocio en [business-rules.md](../project/business-rules.md). Las migraciones SQL, políticas RLS y funciones RPC deberán cumplir ambos documentos.

## Fuentes tecnicas

- El esquema ejecutable, las restricciones, las politicas RLS y las funciones RPC se versionan en [`supabase/migrations/`](../../supabase/migrations/).
- Los datos iniciales reproducibles se mantienen en [`supabase/seed.sql`](../../supabase/seed.sql).
- Las reglas del dominio se documentan en [business-rules.md](../project/business-rules.md).
- Los contratos consumidos por el frontend se resumen en [service-contracts.md](service-contracts.md).

Las migraciones son la autoridad del esquema implementado. No se mantienen copias SQL divergentes ni datos personales reales dentro de la documentacion.

## Convenciones

- Tablas y columnas en español, minúsculas y sin tildes.
- Las claves primarias de las tablas de negocio se denominarán `id` y usarán enteros generados por PostgreSQL, excepto `usuarios_administrativos`, que usará el identificador UUID de Supabase Auth.
- Las claves foráneas se denominarán `<entidad>_id`.
- Las fechas se almacenarán con zona horaria (`timestamptz`).
- Los precios se almacenarán como enteros en pesos colombianos, sin decimales.
- Los datos opcionales se almacenarán como `NULL`, no como texto vacío.
- Las consultas que reciban datos externos usarán parámetros; no se construirá SQL concatenando entradas del usuario.

## Decisiones confirmadas

- Supabase Auth gestiona el correo electrónico, las credenciales y la sesión del administrador.
- Supabase Auth gestiona el envío del enlace y el flujo de recuperación de contraseña administrativa.
- `usuarios_administrativos` autoriza qué usuarios de Supabase Auth pueden administrar el sistema.
- `genero` admite `hombre`, `mujer`, `unisex` o valor nulo.
- `familia_olfativa` es obligatoria en Perfumes / Lociones y opcional en las demás categorías.
- Los detalles de una solicitud muestran el nombre actual del producto y la etiqueta actual de la presentación.
- El precio unitario efectivo aplicado se conserva como dato histórico.
- El sistema conserva el estado actual de la solicitud y sus fechas relevantes, sin una tabla de auditoría de transiciones.
- Cada solicitud tiene un token aleatorio para recuperar de manera limitada su información pública y enviar un comprobante sin crear una cuenta.
- `pagos_solicitud` mantiene el estado del pago separado de la solicitud; la transferencia Bre-B se realiza fuera del sitio y su comprobante requiere revisión administrativa.

## Entidades y relaciones

```text
categorias 1 --- N productos
productos 1 --- N presentaciones
productos 1 --- N imagenes_producto

solicitudes 1 --- N detalles_solicitud
presentaciones 1 --- N detalles_solicitud
solicitudes 1 --- 1 pagos_solicitud

auth.users 1 --- 0..1 usuarios_administrativos
```

La relación entre `detalles_solicitud` y `presentaciones` permite recuperar el nombre actual del producto y la presentación. La relación se preserva incluso cuando un producto o una presentación deja de estar activo.

## Tablas de negocio

### `usuarios_administrativos`

| Columna | Tipo lógico | Reglas principales |
| --- | --- | --- |
| `id` | UUID | Clave primaria y referencia a `auth.users.id`. |
| `activo` | booleano | Obligatorio; valor inicial `true`. |
| `creado_en` | fecha con zona horaria | Obligatorio; valor inicial de la base de datos. |
| `actualizado_en` | fecha con zona horaria | Obligatorio; se actualiza al modificar el registro. |

La autenticación se realiza con el correo y la contraseña administrados por Supabase Auth; no se duplican ni se almacenan contraseñas en las tablas públicas. No se incluye un rol hasta que se confirme el segundo rol autenticado.

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
| `familia_olfativa` | texto | Obligatoria para Perfumes / Lociones; opcional en otras categorías. |
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
| `identificador_externo` | texto | Obligatorio; ruta del objeto en Supabase Storage. |
| `texto_alternativo` | texto | Opcional. |
| `posicion` | entero | Obligatoria; no negativa. |
| `creado_en` | fecha con zona horaria | Obligatorio. |

La combinación `producto_id` y `posicion` será única. Supabase Storage es el proveedor de imágenes confirmado.

### `solicitudes`

| Columna | Tipo lógico | Reglas principales |
| --- | --- | --- |
| `id` | entero generado | Clave primaria interna. |
| `codigo` | texto | Obligatorio y único; inicia con formato `ES-00001`. |
| `token_cliente` | UUID | Obligatorio y único; permite recuperar la solicitud y enviar comprobante con credencial no predecible. |
| `nombre_cliente` | texto | Obligatorio y no vacío. |
| `telefono` | texto | Obligatorio y no vacío; no se almacena como número. |
| `ciudad` | texto | Opcional. |
| `observaciones` | texto | Opcional. |
| `terminos_version` | texto | Obligatorio y no vacío; versión de los Términos y condiciones aceptados. |
| `politica_datos_version` | texto | Obligatorio y no vacío; versión de la Política de tratamiento de datos aceptada. |
| `aceptado_en` | fecha con zona horaria | Obligatorio; fecha y hora de aceptación de ambos documentos. |
| `estado` | texto controlado | `nueva`, `confirmada`, `entregada` o `cancelada`. |
| `creado_en` | fecha con zona horaria | Obligatorio. |
| `actualizado_en` | fecha con zona horaria | Obligatorio. |
| `confirmado_en` | fecha con zona horaria | Nula hasta confirmar. |
| `entregado_en` | fecha con zona horaria | Nula hasta entregar. |
| `cancelado_en` | fecha con zona horaria | Nula hasta cancelar. |

El código se generará a partir de una secuencia de PostgreSQL. La secuencia puede tener huecos, conforme a RN-14.

La evidencia de aceptación se almacena en `solicitudes`, no en una tabla separada, porque cada aceptación corresponde a una solicitud y el MVP no contiene cuentas ni una entidad consolidada de clientes. No se almacena un booleano redundante: la presencia obligatoria de las dos versiones y `aceptado_en` representa una aceptación válida.

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

### `pagos_solicitud`

| Columna | Tipo lógico | Reglas principales |
| --- | --- | --- |
| `solicitud_id` | entero | Obligatorio, único y referencia a `solicitudes`. |
| `metodo` | texto controlado | `bre_b` cuando se procesa un comprobante o `externo` para una confirmación administrativa sin comprobante verificado en la plataforma. |
| `estado` | texto controlado | `pendiente`, `comprobante_enviado`, `verificado`, `rechazado` o `validado_manualmente`. |
| `monto` | entero | Obligatorio y mayor que cero; corresponde al total histórico de la solicitud. |
| `comprobante_path` | texto | Ruta privada en Storage; solo existe cuando se recibe un comprobante. |
| `comprobante_mime`, `comprobante_bytes` | metadatos | Restringidos a JPG, PNG, WebP o PDF de hasta 5 MiB. |
| `enviado_en`, `revisado_en`, `revisado_por` | trazabilidad | Registran envío y revisión administrativa. |
| `observacion_revision` | texto | Obligatoria cuando el comprobante es rechazado. |

El archivo no se expone por una URL pública. La Edge Function valida el código, token y archivo antes de guardarlo en el bucket privado `comprobantes-pago`; el administrador lo consulta mediante URL firmada de corta duración.

Al confirmar sin comprobante pendiente, la misma RPC que confirma la solicitud y aplica el inventario actualiza el pago a `metodo = externo` y `estado = validado_manualmente`. Este estado evita representar una validación externa como si se hubiera verificado un archivo en la plataforma.

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
- Unicidad de código de solicitud y posición de imagen por producto.
- Familia olfativa obligatoria para los productos de Perfumes / Lociones.
- Unicidad de presentación por detalle de solicitud.
- Versiones de términos y política no vacías y fecha de aceptación obligatoria en cada solicitud.
- Cálculo consistente del subtotal.
- Atomicidad y bloqueos en las transacciones de inventario.

## Responsabilidades del cliente y de Supabase

- El cliente valida la experiencia de formulario, pero no constituye una barrera de seguridad.
- Las funciones RPC validan y normalizan entradas de solicitudes, aplican reglas de publicación, disponibilidad, precios, transiciones y edición permitida.
- La función RPC de registro exige la aceptación, recibe por línea el precio efectivo que el visitante revisó y, si cambió, devuelve el resumen vigente sin crear la solicitud. Asigna desde configuración controlada las versiones vigentes y la fecha de aceptación; no confía en versiones arbitrarias enviadas por el navegador.
- Supabase Auth identifica al administrador y las políticas RLS, permisos y funciones autorizan cada operación administrativa.
- `obtener_catalogo_publico()` y `obtener_producto_publico(integer)` exponen solo el catálogo publicable; las tablas relacionadas permanecen cerradas a lectura anónima directa. Las RPC no aceptan escrituras.
- Las reglas de Storage validan la autorización de carga, modificación y eliminación de imágenes; el cliente también validará tipo y tamaño antes de cargarlas.
- La Edge Function `submit-payment-proof` valida código, token, elegibilidad, tipo, firma y tamaño del comprobante antes de utilizar su credencial de servidor para almacenar el archivo privado y registrar sus metadatos.

## Transacciones críticas

### Registro de una solicitud

La función RPC de registro inicia y finaliza estas operaciones dentro de la transacción de PostgreSQL.

```text
BEGIN
Validar datos del cliente, aceptación expresa y carrito no vacío
Bloquear y consultar productos, presentaciones y categorías actuales
Revalidar actividad, precio esperado, modo y stock aplicable
Devolver el resumen vigente sin insertar si cambió un precio
Generar código con la secuencia de PostgreSQL
Insertar solicitud en estado Nueva con versiones vigentes y fecha de aceptación
Insertar detalles con precio unitario histórico y cantidad_descontada en cero
COMMIT
```

Registrar una solicitud no descuenta ni reserva inventario.

### Confirmación de una solicitud

Una función RPC exclusiva para administradores ejecuta estas operaciones dentro de una transacción de PostgreSQL.

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

### Verificación de un comprobante y confirmación

La RPC administrativa de verificación integra el pago y la confirmación sin confundir el estado de ambas entidades.

```text
BEGIN
Bloquear solicitud y registro de pago
Comprobar solicitud Nueva y comprobante enviado
Bloquear y revalidar las presentaciones involucradas
Comprobar stock suficiente para todas las líneas de venta inmediata
Marcar el pago como Verificado y registrar la revisión
Confirmar la solicitud, registrar cantidades descontadas y reducir inventario
COMMIT
```

Si cualquier validación falla, no se verifica el pago, no se confirma la solicitud y no se descuenta inventario parcialmente.

### Cancelación de una solicitud confirmada

Una función RPC exclusiva para administradores ejecuta estas operaciones dentro de una transacción de PostgreSQL.

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

Una función RPC exclusiva para administradores ejecuta estas operaciones dentro de una transacción de PostgreSQL.

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

## Validación y pendientes

- El flujo completo de comprobante privado se validó con la solicitud controlada `ES-00082`; incluyó revisión administrativa, confirmación, descuento y posterior restitución del inventario.
- Las instrucciones, la llave o alias y el QR Bre-B fueron aprobados por el propietario.
- Permanece pendiente revisar la carga definitiva con el conjunto completo de datos e imágenes reales de ESENCIALES.
- Debe mantenerse la validación de teléfonos sin excluir números legítimos y comprobarla en pruebas manuales representativas.
