# Reglas de negocio de ESENCIALES

Este documento presenta las reglas de negocio vigentes para la entrega academica. La version tecnica detallada y mantenida como fuente de verdad se encuentra en [`docs/project/business-rules.md`](../../docs/project/business-rules.md).

## Inventario y disponibilidad

### RN-01 - Cantidad solicitada

Cada cantidad debe ser un entero entre 1 y 99. En venta inmediata tampoco puede superar el stock disponible al agregar, registrar, editar o confirmar una solicitud.

### RN-02 - Presentacion agotada o no disponible

Una presentacion agotada o no disponible puede seguir visible, pero no puede agregarse al carrito.

### RN-03 - Carrito y solicitud validos

No se registra una solicitud vacia. Cada linea debe corresponder a un producto y una presentacion validos, admitir solicitudes y tener una cantidad permitida.

### RN-04 - Precio historico

Cada detalle conserva el precio unitario aplicado al registrar la solicitud. Los cambios posteriores del catalogo no alteran ese valor.

### RN-05 - Bajo pedido

Una presentacion bajo pedido mantiene stock local vendible igual a cero. Puede solicitarse, pero no descuenta inventario al confirmar y su entrega queda sujeta a confirmacion comercial.

### RN-06 - Momento del descuento

Agregar al carrito o registrar una solicitud Nueva no descuenta ni reserva inventario. El descuento ocurre al confirmar y solo para lineas de venta inmediata.

### RN-07 - Cancelacion y restitucion

Cancelar una solicitud Confirmada restituye exclusivamente las unidades que esa solicitud desconto.

### RN-08 - Conservacion historica

Los productos relacionados con solicitudes historicas se desactivan en lugar de eliminarse fisicamente.

### RN-09 - Stock bajo

Se considera stock bajo una presentacion activa de venta inmediata con una a tres unidades. Stock cero se muestra como Agotado; Bajo pedido y No disponible no forman parte de esta alerta.

### RN-10 - Revalidacion y concurrencia

Antes de confirmar, PostgreSQL vuelve a comprobar el stock. La validacion, el descuento y el cambio de estado se ejecutan en una transaccion para impedir stock negativo, doble descuento o confirmaciones parciales.

### RN-11 - Disponibilidad por presentacion

La disponibilidad se determina por cada presentacion activa. Un producto puede tener simultaneamente presentaciones Disponibles, Agotadas, Bajo pedido o No disponibles.

### RN-12 - Agotado automatico

En venta inmediata, una presentacion se muestra Disponible con stock positivo y Agotada con stock cero. Al reabastecerla vuelve a mostrarse Disponible.

## Precios y promociones

### RN-13 - Precio promocional

Los precios se manejan en pesos colombianos sin decimales. El precio normal debe ser mayor que cero y una promocion valida debe ser menor que el precio normal. El precio efectivo queda guardado en la solicitud.

## Solicitudes

### RN-14 - Codigo unico

Cada solicitud registrada recibe un codigo unico y legible con formato inicial `ES-00001`. Se permiten huecos y el numero puede crecer mas alla de cinco digitos.

### RN-15 - Solicitud mixta

Una solicitud puede combinar venta inmediata y Bajo pedido. Al confirmar se usa el modo vigente; solo la venta inmediata descuenta stock y una linea inactiva, agotada o no disponible impide confirmar.

### RN-16 - Edicion de una solicitud Nueva

Mientras permanezca Nueva, el administrador puede corregir datos, cantidades o retirar lineas. No puede agregar o duplicar lineas, cambiar presentaciones, alterar precios historicos ni dejarla vacia.

### RN-17 - Inmutabilidad posterior

Una solicitud Confirmada no puede editarse. Si cambia el acuerdo, debe cancelarse y registrarse una nueva. Una solicitud Entregada es final.

### RN-18 - Transiciones permitidas

Las transiciones ordinarias son `Nueva -> Confirmada`, `Nueva -> Cancelada`, `Confirmada -> Entregada` y `Confirmada -> Cancelada`.

## Publicacion del catalogo

### RN-19 - Condiciones de publicacion

Un producto publico debe estar activo y tener nombre, descripcion, categoria activa, al menos una imagen y una presentacion activa valida con precio.

### RN-20 - Categoria inactiva

Desactivar una categoria oculta la categoria y sus productos sin eliminar datos ni relaciones historicas.

### RN-21 - Productos destacados

Destacado es una seleccion manual del administrador, no una medicion de ventas. Solo se publican como destacados los productos que cumplen las condiciones de publicacion.

### RN-22 - Clasificaciones comerciales

Las clasificaciones `Original`, `1.1` e `Inspiracion` se asignan solo cuando correspondan y no representan disponibilidad ni inventario.

### RN-23 - Presentacion valida

Una presentacion valida tiene etiqueta, precio normal entero positivo, stock entero no negativo y un modo permitido.

### RN-24 - Presentacion inactiva

Una presentacion inactiva se conserva por trazabilidad, pero no se publica, no participa en filtros y no admite solicitudes nuevas.

### RN-25 - Precio de referencia

El filtro de precio considera los precios efectivos de presentaciones activas que admiten solicitudes. El ordenamiento por precio utiliza el menor precio efectivo solicitable del producto.

## Aceptacion y pago manual

### RN-26 - Aceptacion expresa por solicitud

El visitante debe aceptar expresamente los Terminos y condiciones y la Politica de tratamiento de datos antes de registrar cada solicitud. Se conservan las versiones aceptadas y la fecha y hora de aceptacion.

### RN-27 - Pago manual y comprobante

El estado del pago se administra separado del estado de la solicitud. El pago inmediato solo se ofrece para una solicitud Nueva cuyas lineas sean de venta inmediata, esten activas y tengan stock suficiente. La transferencia Bre-B ocurre fuera del sitio y el envio de un comprobante privado no confirma automaticamente el pago. Se admiten archivos JPG, PNG, WebP o PDF de hasta 5 MiB.

### RN-28 - Confirmacion de pago e inventario

Solo un administrador autenticado puede rechazar o verificar un comprobante. El rechazo exige un motivo. La verificacion confirma el pago, confirma la solicitud y descuenta el inventario aplicable dentro de una unica transaccion; si alguna condicion falla, no se aplica ninguna de esas operaciones.

## Delimitaciones relacionadas

- El sistema no es una pasarela de pagos y no procesa tarjetas.
- No solicita credenciales bancarias, CVV ni codigos OTP.
- No valida automaticamente que una transferencia haya llegado a la cuenta de ESENCIALES.
- No realiza reembolsos automaticos, facturacion, contabilidad ni gestion de cuentas por cobrar.
- WhatsApp se conserva como canal voluntario para continuar la conversacion comercial.
