# Briefing de necesidades de ESENCIALES

**Estado:** contenido validado por el propietario el 14 de septiembre de 2026.

**Fuente primaria:** [Entrevista de levantamiento de requerimientos](../sources/ENTREVISTA_LEVANTAMIENTO_REQUERIMIENTOS_ESENCIALES.md).

**Actor principal:** Daniel Steven Contreras Lopez, propietario de ESENCIALES e integrante del equipo del proyecto.

> Este documento sintetiza el levantamiento y lo contrasta con el MVP. La reorganización no convierte en hechos las necesidades que no fueron confirmadas ni modifica las delimitaciones aprobadas.

## Bloque 0: Apertura

El levantamiento tuvo como propósito comprender cómo ESENCIALES administra y presenta sus productos antes de definir la solución. La fuente disponible no conserva la formulación literal utilizada en la apertura de la entrevista.

## Bloque 1: La organización y el contexto

ESENCIALES comercializa principalmente perfumes inspirados 1.1, originales o importados y otros productos de perfumería. El propietario administra principalmente el negocio. Los productos se presentan mediante Instagram, Facebook Marketplace, WhatsApp, otras publicaciones y atención directa.

El catálogo, el inventario y las ventas se registran manualmente, principalmente en Excel, registros y conversaciones. Los cambios de precios, disponibilidad, ventas e ingresos de mercancía requieren actualizaciones manuales.

## Bloque 2: El problema

La dispersión y actualización manual de la información dificultan mantener consistentes el catálogo, las existencias y el seguimiento comercial. Esto puede ocasionar que se muestre un producto sin disponibilidad, que el inventario no refleje una venta o un ingreso de mercancía y que sea necesario consultar varias fuentes para conocer el estado de un pedido.

## Bloque 3: El proceso actual, paso a paso

1. El cliente consulta productos por WhatsApp, redes sociales o atención directa.
2. El propietario verifica disponibilidad, producto y precio en sus registros.
3. Se solicitan datos del cliente y se registra la venta manualmente o en Excel.
4. Se verifica manualmente el pago antes del despacho.
5. Los cambios de disponibilidad, ventas e ingresos de mercancía se actualizan en los registros separados.

La entrega contra pago se realiza dentro de la ciudad; los pedidos nacionales normalmente se despachan después de confirmar el pago. Esta operación comercial no se traslada como gestión de pagos al MVP.

## Bloque 4: Las personas que lo van a usar

| Perfil | Acción principal | Contexto de uso |
| --- | --- | --- |
| Propietario o administrador | Gestionar productos, presentaciones, precios, imágenes, existencias y solicitudes. | Puede operar desde computador o móvil. |
| Cliente o visitante | Consultar el catálogo, seleccionar productos y registrar una solicitud de compra. | Consulta pública desde computador o móvil. |

## Bloque 5: Reglas, excepciones y casos raros

Las siguientes reglas delimitan el comportamiento inicial del MVP:

1. La disponibilidad, el precio y el inventario se administran por presentación.
2. El cliente consulta el catálogo sin registrarse y registra una `solicitud de compra`; esta no equivale a una venta concluida ni a un pago.
3. Para registrar la solicitud web se requieren nombre y teléfono; la ciudad es opcional. Dirección y barrio se continúan recopilando por WhatsApp.
4. El inventario de venta inmediata se descuenta cuando el administrador confirma la solicitud, no al registrarla como nueva.
5. Las presentaciones agotadas o no disponibles no admiten solicitudes; las presentaciones bajo pedido no descuentan inventario local.
6. Los pagos, ventas contra entrega y cuentas por cobrar se gestionan fuera del MVP, aunque forman parte del proceso comercial actual.


## Bloque 6: Información y reportes

El propietario manifestó necesidad de consultar inventario, ventas, clientes, productos y pagos. También identificó como valiosos los reportes de ventas por periodo, productos más vendidos e inventario disponible.

El MVP cubre la consulta administrativa del inventario y las solicitudes registradas. Los reportes de ventas, ganancias, productos más vendidos, deudores o cuentas por cobrar, así como la gestión de pagos, permanecen fuera del alcance porque el sistema no registra ventas concluidas ni movimientos financieros.

## Bloque 7: Expectativas y alcance

La necesidad prioritaria es centralizar la gestión del catálogo y el inventario para reducir el trabajo manual y permitir que los clientes consulten productos, precios y disponibilidad. Se espera que el propietario gestione la información desde un solo sistema y que el catálogo público refleje los datos vigentes.

| Necesidad levantada | Cobertura en el MVP vigente | Observación |
| --- | --- | --- |
| Gestión de categorías, productos, presentaciones, imágenes, precios y existencias | Incluida | Forma parte de la gestión administrativa del catálogo. |
| Catálogo público con búsqueda, filtros y disponibilidad | Incluida | Permite consulta sin registro del cliente. |
| Selección de productos y registro de pedido | Incluida parcialmente | El MVP registra una `solicitud de compra`, no una venta concluida. |
| Actualización de inventario al registrar una venta | Incluida parcialmente | Se descuenta al confirmar una solicitud de venta inmediata. |
| Costos internos, clientes, pagos, cuentas por cobrar y reportes de ventas | Fuera del MVP | Se excluyen para proteger la viabilidad y porque el MVP no gestiona ventas concluidas. |

Los criterios de éxito validados son:

1. El propietario administra productos, presentaciones, precios, imágenes y existencias desde un solo sistema.
2. El catálogo público refleja la información vigente registrada por el administrador.
3. El cliente consulta el catálogo, selecciona productos y registra una solicitud.
4. El inventario de venta inmediata se actualiza cuando el administrador confirma la solicitud.
5. El propietario consulta y gestiona las solicitudes sin depender exclusivamente de conversaciones dispersas.

## Bloque 8: Restricciones reales

La aplicación debe poder utilizarse desde un dispositivo móvil o computador con acceso a internet, sin depender de un equipo especializado. La consulta del catálogo será pública, mientras que la gestión de productos, existencias y solicitudes estará restringida al administrador para proteger la información interna del negocio.

La conversación comercial continuará por WhatsApp después de registrar una solicitud. El MVP no requiere integraciones con otros sistemas ni una integración avanzada con WhatsApp; se prioriza una solución sencilla que el propietario pueda administrar directamente.

## Bloque 9: Cierre y aprobación

El briefing se envió para confirmar la síntesis, los criterios de éxito y las delimitaciones. WhatsApp es el medio acordado para revisar actualizaciones del briefing y resolver dudas posteriores sobre el proyecto.

**Nombre:** Daniel Steven Contreras Lopez  
**Rol:** Propietario de ESENCIALES  
**Fecha de validación:** 14 de septiembre de 2026  
**Resultado:** Aprobado  
**Observaciones:** Se confirman la síntesis, los criterios de éxito y las delimitaciones registradas en este briefing.
