# Entrevista de levantamiento de requerimientos de ESENCIALES

**Origen:** contenido suministrado por el equipo el 14 de septiembre de 2026.

**Fecha de realización:** 14 de septiembre de 2026.

**Entrevistado:** Daniel Steven Contreras Lopez, propietario de ESENCIALES e integrante del equipo del proyecto.

**Entrevistadores:** Marlon Steev Velasco Paz y Janderson Santos Vega.

**Objetivo:** identificar las necesidades y dificultades actuales en la gestión del catálogo, inventario, clientes y ventas.

> La entrevista se reestructuró con una pregunta por bloque. Las respuestas sintetizan la evidencia suministrada originalmente y las decisiones operativas que delimitan el MVP; no son una transcripción literal.

## Bloque 0: Apertura

Marlon Steev Velasco Paz y Janderson Santos Vega se presentaron como estudiantes del Curso de Opción de Grado en Desarrollo Web Full Stack con IA de la Fundación Tecnológica Autónoma del Pacífico. Explicaron que la entrevista hacía parte del proyecto académico desarrollado para ESENCIALES y que su propósito era conocer la gestión actual del catálogo, el inventario y las ventas, así como identificar las principales dificultades y necesidades del negocio. También informaron que tomarían notas para organizar la información y definir el alcance del proyecto, y dieron al entrevistado la oportunidad de formular preguntas antes de comenzar.

## Bloque 1: La organización y el contexto

**Pregunta:** Cuénteme a qué se dedica ESENCIALES, cuál es su papel en el negocio y cómo presenta hoy sus productos a los clientes.

**Respuesta registrada:** ESENCIALES comercializa perfumes inspirados 1.1, perfumes originales o importados y otros productos de perfumería. El negocio es administrado principalmente por el propietario. Los productos se presentan mediante WhatsApp, Instagram, Facebook Marketplace, publicaciones y atención directa. El catálogo, el inventario y las ventas se registran de forma manual, principalmente en Excel, otros registros y conversaciones.

## Bloque 2: El problema

**Pregunta:** ¿Qué es lo que más trabajo les genera al mantener actualizado el catálogo, el inventario y los pedidos?

**Respuesta registrada:** Actualizar manualmente productos, precios, disponibilidad e inventario genera mayor trabajo. Las existencias pueden quedar desactualizadas después de una venta o del ingreso de mercancía. También se debe revisar información distribuida entre Excel, registros y conversaciones para conocer el estado de un pedido, lo que puede ocasionar que se muestre un producto que ya no está disponible.

## Bloque 3: El proceso actual, paso a paso

**Pregunta:** Lléveme por el proceso desde que un cliente consulta un producto hasta que se realiza el despacho.

**Respuesta registrada:** El cliente consulta por WhatsApp, redes sociales o atención directa. El propietario verifica la disponibilidad, confirma el producto y el precio, recibe los datos del cliente y registra la venta manualmente o en Excel. Antes del despacho se verifica manualmente el pago. Para las ventas contra entrega dentro de la ciudad se aplica un tratamiento diferente; los pedidos nacionales normalmente se despachan después de confirmar el pago. Los cambios de precio, disponibilidad, ventas e ingresos de mercancía se actualizan manualmente en los registros existentes.

## Bloque 4: Las personas que lo van a usar

**Pregunta:** ¿Quiénes usarían la aplicación, cuál sería su acción principal y desde qué dispositivo la utilizarían?

**Respuesta registrada:** El propietario es el usuario administrativo principal y necesita gestionar productos, precios, existencias y solicitudes. Los clientes consultan el catálogo sin registrarse, seleccionan productos y registran una solicitud. El MVP se concentra en estos dos perfiles, prioriza su uso desde dispositivos móviles y no incorpora un segundo rol administrativo.

## Bloque 5: Reglas, excepciones y casos raros

**Pregunta:** ¿Qué condiciones deben cumplirse antes de atender una solicitud y en qué casos cambia el proceso?

**Respuesta registrada:** Para atender una venta se verifica la disponibilidad, se confirman el producto y el precio y se solicitan datos del cliente. El levantamiento inicial registró nombre, teléfono, dirección, barrio y ciudad. La entrega contra pago se realiza dentro de la ciudad; para pedidos nacionales normalmente se confirma el pago antes del despacho.

En el MVP, la solicitud web requiere nombre y teléfono, con ciudad opcional; dirección y barrio se acuerdan posteriormente por WhatsApp. Una presentación agotada o no disponible no admite solicitudes. Una presentación bajo pedido se registra sin descontar inventario local, mientras que el inventario de venta inmediata se descuenta al confirmar la solicitud.

## Bloque 6: Información y reportes

**Pregunta:** ¿Qué información necesita consultar para administrar el negocio y qué cifras considera importantes?

**Respuesta registrada:** El propietario necesita consultar inventario, ventas, clientes, productos y pagos. También identificó como importantes las ventas por periodo, los productos más vendidos y el inventario disponible. La información de clientes, pedidos y pagos se conserva principalmente en registros y conversaciones.

**Nota de alcance:** los reportes de ventas, ganancias, deudores o cuentas por cobrar, y la gestión de pagos fueron necesidades expresadas, pero no están incluidos en el MVP vigente porque una solicitud de compra no representa una venta concluida ni un pago gestionado por el sistema.

## Bloque 7: Expectativas y alcance

**Pregunta:** Si tuviera una herramienta para este proceso, ¿qué espera dejar de hacer y cómo sabría que le resulta útil?

**Respuesta registrada:** Espera gestionar productos y ventas desde un solo lugar, mantener conectado el catálogo con el inventario y reducir el trabajo manual. Considera útil que los clientes puedan consultar el catálogo, seleccionar productos y registrar un pedido. La necesidad prioritaria es centralizar el catálogo y el inventario para que productos, precios y disponibilidad se consulten de forma organizada.

**Delimitación inicial:** las necesidades de costos internos, clientes, pagos, cuentas por cobrar y reportes requieren evaluación separada y permanecen fuera del MVP vigente.

## Bloque 8: Restricciones reales

**Pregunta:** ¿Qué recursos o limitaciones debemos considerar para usar y mantener la aplicación?

**Respuesta registrada:** La aplicación debe poder utilizarse desde un dispositivo móvil o computador con acceso a internet, sin depender de un equipo especializado. La consulta del catálogo será pública, mientras que la gestión de productos, existencias y solicitudes estará restringida al administrador para proteger la información interna del negocio.

La conversación comercial continuará por WhatsApp después de registrar una solicitud. El MVP no requiere integraciones con otros sistemas ni una integración avanzada con WhatsApp; se prioriza una solución sencilla que el propietario pueda administrar directamente.

## Bloque 9: Cierre

**Pregunta:** ¿Hay algo importante que no le hayamos preguntado y por qué medio podemos contactarlo para validar lo entendido?

**Respuesta registrada:** No se identificaron asuntos adicionales. WhatsApp es el canal de comunicación para revisar el briefing y resolver dudas posteriores sobre el proyecto.

---

Las respuestas constituyen evidencia del levantamiento inicial. Una necesidad expresada por el propietario no se convierte automáticamente en requisito del MVP; primero se contrasta con el alcance, el tiempo y las decisiones del equipo.
