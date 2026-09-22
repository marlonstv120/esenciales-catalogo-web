# Reglas de negocio

Estas reglas desarrollan el [alcance funcional MVP V1](functional-scope.md) aprobado por el equipo el 3 de septiembre de 2026. Las decisiones técnicas para hacerlas cumplir se definirán durante el diseño sin cambiar su intención.

## Inventario y disponibilidad

### RN-01 - Cantidad solicitada

Cada cantidad debe ser un entero entre 1 y 99. Para una presentación de venta inmediata, tampoco puede superar el stock disponible al agregarla, registrar la solicitud, editar una solicitud Nueva o confirmarla.

### RN-02 - Presentación agotada o no disponible

Una presentación agotada o marcada como No disponible puede continuar visible, pero no puede agregarse al carrito.

### RN-03 - Carrito y solicitud válidos

No se puede registrar una solicitud con el carrito vacío. Todas las líneas deben referenciar un producto y una presentación válidos, tener una cantidad permitida y encontrarse en un modo que admita solicitudes.

### RN-04 - Precio histórico

Cada detalle conserva el precio unitario efectivo aplicado cuando se registra la solicitud. Los cambios posteriores del catálogo no modifican solicitudes existentes, incluso mientras estén Nuevas.

### RN-05 - Bajo pedido

Una presentación con modo `Bajo pedido` debe tener stock local vendible igual a cero y puede solicitarse dentro del límite general de cantidad. Su disponibilidad y tiempo de entrega están sujetos a confirmación y no descuenta inventario al confirmar.

### RN-06 - Momento del descuento

Agregar al carrito o registrar una solicitud Nueva no descuenta inventario. El descuento ocurre cuando la solicitud pasa a Confirmada y únicamente para líneas de venta inmediata.

### RN-07 - Cancelación y restitución

Al cancelar una solicitud Confirmada se restituyen exclusivamente las unidades que esa solicitud descontó. No se incrementa stock para líneas bajo pedido ni para cualquier línea que no haya producido descuento.

### RN-08 - Conservación histórica

Un producto relacionado con solicitudes históricas no se elimina físicamente. Debe desactivarse para conservar integridad y trazabilidad.

### RN-09 - Stock bajo

Se considera stock bajo una presentación activa de venta inmediata con entre una y tres unidades. Stock cero se clasifica como `Agotado`. `Bajo pedido` y `No disponible` no forman parte del indicador de stock bajo.

### RN-10 - Revalidación y concurrencia

Antes de confirmar, una función de PostgreSQL vuelve a comprobar el stock de todas las líneas de venta inmediata. La validación, el descuento y el cambio de estado deben ejecutarse dentro de una transacción para impedir stock negativo, doble descuento o confirmaciones parciales.

### RN-11 - Disponibilidad por presentación

La disponibilidad se determina por presentación activa y no únicamente por producto. Un producto puede conservar presentaciones con estados `Agotado`, `Disponible`, `Bajo pedido` o `No disponible` simultáneamente.

En tarjetas, el resumen utiliza esta precedencia: `Disponible` si existe al menos una presentación disponible; de lo contrario, `Bajo pedido` si existe al menos una presentación en ese modo; `Agotado` si las presentaciones restantes de venta inmediata tienen stock cero; y `No disponible` si ninguna admite solicitudes. El detalle conserva el estado individual de cada presentación.

El filtro de disponibilidad incluye un producto cuando al menos una presentación activa coincide con el estado seleccionado.

### RN-12 - Agotado automático

El administrador selecciona `Venta inmediata`, `Bajo pedido` o `No disponible`. Una presentación en venta inmediata se muestra `Disponible` con stock mayor que cero y `Agotado` con stock cero. Al reabastecerla, vuelve a mostrarse `Disponible`.

## Precios y promociones

### RN-13 - Precio promocional

Los precios se manejan en pesos colombianos sin decimales y el precio normal debe ser mayor que cero. Cuando se implemente la promoción SHOULD, su valor debe ser mayor que cero y menor que el precio normal. Si existe una promoción válida, ese es el precio efectivo almacenado en la solicitud.

La activación y desactivación de promociones es manual; no se requieren fechas automáticas en el MVP.

## Solicitudes

### RN-14 - Código único

Cada solicitud registrada correctamente recibe un código único y legible con formato inicial `ES-00001`. Se permiten huecos en la secuencia y el número puede ampliar su longitud al superar cinco dígitos.

El código se genera como parte del registro exitoso, no al abrir el carrito.

### RN-15 - Solicitud mixta

Una solicitud puede combinar presentaciones de venta inmediata y Bajo pedido. Al confirmar se utiliza el modo vigente después de la conversación comercial y se comprueba que producto, categoría y presentación continúen activos. Solo las líneas en `Venta inmediata` descuentan stock; `Bajo pedido` no descuenta; y una línea inactiva, `Agotado` o `No disponible` impide confirmar.

### RN-16 - Edición de una solicitud Nueva

Mientras permanezca Nueva, el administrador puede corregir datos del cliente, modificar cantidades y retirar líneas existentes. No puede agregar ni duplicar líneas, cambiar la presentación seleccionada o alterar los precios históricos.

Las cantidades editadas deben volver a cumplir RN-01. Si el cliente desiste de todas las líneas, la solicitud debe cancelarse en lugar de quedar vacía.

### RN-17 - Inmutabilidad posterior

Una solicitud Confirmada no puede editar sus datos, líneas, cantidades o precios. Si cambia el acuerdo comercial, debe cancelarse para restituir el inventario descontado y registrarse una nueva solicitud.

Una solicitud Entregada se considera finalizada y no cambia de estado dentro del flujo normal.

### RN-18 - Transiciones permitidas

Las transiciones ordinarias son:

```text
Nueva -> Confirmada
Nueva -> Cancelada
Confirmada -> Entregada
Confirmada -> Cancelada
```

No se permiten transiciones diferentes sin una nueva decisión de negocio.

## Publicación del catálogo

### RN-19 - Condiciones de publicación

Un producto público debe estar activo y tener nombre, descripción, categoría activa, al menos una imagen y una presentación activa válida con precio.

### RN-20 - Categoría inactiva

Desactivar una categoría oculta públicamente la categoría y sus productos, pero no elimina ni altera sus datos históricos. Al reactivarla, sus productos pueden volver a mostrarse si continúan activos y publicables.

### RN-21 - Productos destacados

El indicador Destacado es una selección manual del administrador, no una medición de ventas. Solo aparecen públicamente como destacados los productos que también cumplen RN-19.

No se utilizarán rankings, reseñas o estudios externos para presentarlos como productos más vendidos de Esenciales.

### RN-22 - Clasificaciones comerciales

Los valores disponibles son `Original`, `1.1` e `Inspiración`, pero solo se asignan cuando correspondan. Sus descripciones públicas no pueden inventarse y deben esperar validación expresa de Esenciales.

### RN-23 - Presentación válida

Una presentación válida tiene etiqueta no vacía, precio normal entero en COP mayor que cero, stock entero no negativo y uno de los modos permitidos. Una presentación agotada, bajo pedido o no disponible puede seguir siendo válida para conservarse y mostrarse.

### RN-24 - Presentación inactiva

Una presentación inactiva se conserva para mantener relaciones históricas, pero no se muestra públicamente, no participa en filtros o resúmenes de disponibilidad y no admite nuevas solicitudes.

### RN-25 - Precio de referencia del producto

Cuando se implementen los filtros y ordenamientos SHOULD de precio, se usa el precio efectivo de presentaciones activas que admitan solicitudes. El filtro coincide si al menos una está dentro del rango y el orden utiliza el menor precio efectivo de cada producto. `Más recientes` utiliza la fecha de creación del producto.

## Aceptación de términos y tratamiento de datos

### RN-26 - Aceptación expresa por solicitud

El visitante debe aceptar expresamente los Términos y condiciones y la Política de tratamiento de datos vigentes antes de registrar cada solicitud. El control debe iniciar desmarcado y la función de registro debe rechazar la operación si no recibe la aceptación.

Cada solicitud conserva la fecha y hora de aceptación y las versiones de ambos documentos que fueron aceptadas. Esta evidencia pertenece a la solicitud porque el MVP no crea cuentas ni una entidad consolidada de clientes.

La autorización para recibir publicidad o novedades no forma parte del MVP. Si se incorpora posteriormente, deberá ser opcional, independiente y no estar marcada previamente.

## Pendientes técnicos relacionados

- El modelo lógico debe registrar qué líneas descontaron inventario para cumplir RN-07.
- La confirmación y cancelación requieren una estrategia transaccional concreta.
- No se exige un módulo profesional de movimientos de almacén para cumplir estas reglas.
