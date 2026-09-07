# Alcance funcional MVP V1

**Proyecto:** Sistema web para la gestión y publicación del catálogo de productos de Esenciales  
**Versión:** 1.0  
**Fecha de consolidación:** 3 de septiembre de 2026  
**Estado:** aprobado por el equipo; sujeto a validaciones académicas y de negocio expresamente identificadas  
**Nombre técnico:** `esenciales-catalogo-web`

## 1. Propósito y autoridad

Este documento consolida el alcance funcional aprobado por el equipo para la primera versión del MVP de Esenciales. Es el punto de entrada para comprender qué debe resolver el producto, sus prioridades, sus límites y las decisiones que todavía requieren validación.

El detalle verificable se mantiene en documentos especializados:

- [Requisitos funcionales y no funcionales](requirements.md).
- [Reglas de negocio](business-rules.md).
- [Actores y flujos](actors-and-flows.md).
- [Visión general](overview.md).
- [Arquitectura y decisiones técnicas](../architecture/overview.md).

Este documento es una especificación derivada del proyecto, no una fuente académica primaria. Las instrucciones explícitas posteriores del profesor tienen prioridad.

## 2. Fuentes y validación

La consolidación considera:

- Las fuentes oficiales del curso disponibles en [`docs/sources/`](../sources/README.md).
- El [contexto original del proyecto](../sources/CONTEXTO_PROYECTO_ESENCIALES.md).
- Las decisiones de alcance y tecnología registradas en el repositorio.
- El [análisis externo de Claude](../sources/ANALISIS_PROPUESTA_ESENCIALES_CLAUDE.md) únicamente como insumo de contraste.
- Las decisiones funcionales aprobadas directamente por el equipo el 3 de septiembre de 2026.

`CONTEXTO_FUNCIONAL_ESENCIALES_MVP.md` fue mencionado por un insumo externo, pero no se encuentra actualmente en el repositorio y no se utiliza como fuente disponible.

Las afirmaciones comparativas del análisis externo no se consideran resultados académicos ni hechos del proyecto sin evidencia verificable.

## 3. Propósito del sistema

Esenciales comercializa perfumes o lociones, splash, cremas, humidificadores y otros productos. La aplicación busca centralizar la administración y publicación de productos, presentaciones, precios, disponibilidad e inventario, y permitir que los clientes preparen una solicitud de compra antes de continuar la conversación comercial por WhatsApp.

El sistema no procesa pagos ni afirma que una solicitud registrada sea una venta concluida. La compra se confirma comercialmente con Esenciales por WhatsApp y administrativamente dentro del sistema.

## 4. Objetivos vigentes

### Objetivo general

Desarrollar una aplicación web full stack para centralizar la gestión, publicación y consulta del catálogo de productos, precios y disponibilidad del emprendimiento Esenciales.

### Objetivos específicos

1. Diagnosticar el proceso actual de gestión y presentación del catálogo del emprendimiento Esenciales, identificando las dificultades relacionadas con la organización y consulta de sus productos, precios y disponibilidad.
2. Desarrollar una solución web con funcionalidades de acceso administrativo, gestión del catálogo, publicación pública, búsqueda, filtrado y registro de solicitudes de compra, que responda a las dificultades identificadas en el diagnóstico.
3. Validar la aplicación web mediante pruebas funcionales y su despliegue en un entorno de producción para comprobar el cumplimiento de los requisitos definidos.

## 5. Alcance organizativo

El MVP se organiza en ocho macrofuncionalidades. Esta agrupación controla el alcance y no significa que cada requisito detallado sea una funcionalidad académica independiente.

La existencia de un máximo académico de ocho funcionalidades debe reconfirmarse con el profesor. Hasta entonces, las ocho macrofuncionalidades se conservan como decisión organizativa del equipo y no como exigencia académica demostrada.

## 6. Actores

### Administrador o propietario

Usuario autenticado que administra categorías, productos, presentaciones, imágenes, precios, promociones, inventario, disponibilidad, productos destacados y solicitudes de compra.

### Cliente o visitante

Usuario público que consulta el catálogo sin registrarse, prepara un carrito, registra una solicitud de compra y decide si continúa hacia WhatsApp.

### Colaborador

Rol autenticado propuesto únicamente si el profesor confirma que se requieren dos roles autenticados con permisos diferentes. No forma parte del MVP confirmado.

## 7. Macrofuncionalidades

### MF-01 - Autenticación y acceso administrativo

Incluye:

- Inicio de sesión de usuarios administrativos autorizados.
- Validación segura de credenciales.
- Protección de vistas y operaciones administrativas.
- Cierre de sesión.

No incluye inicialmente registro público, autenticación de clientes, recuperación automática de contraseña ni gestión avanzada de roles.

### MF-02 - Gestión de la estructura del catálogo

El administrador podrá crear, consultar, editar, activar y desactivar categorías. Cada producto tendrá una categoría principal.

Categorías iniciales confirmadas:

- Perfumes / Lociones.
- Splash.
- Cremas.
- Humidificadores.
- Otros productos.

Estas cinco categorías deben quedar precargadas en la instalación inicial. El administrador podrá editarlas o desactivarlas posteriormente.

Una categoría desactivada y sus productos dejarán de aparecer públicamente, pero conservarán sus relaciones e historial administrativo. El género será un atributo opcional del producto y no una subcategoría.

Los datos generales del negocio, como WhatsApp, redes y textos de contacto, podrán mantenerse inicialmente en configuración técnica. Una pantalla administrativa de configuración es secundaria.

### MF-03 - Gestión de productos, presentaciones, precios e imágenes

El administrador podrá crear, consultar, editar, activar y desactivar productos.

Un producto puede contener:

- Nombre.
- Descripción.
- Categoría principal.
- Marca opcional.
- Género opcional.
- Familia olfativa opcional.
- Referencia opcional.
- Clasificación comercial opcional.
- Indicador manual de producto destacado.
- Estado activo o inactivo.
- Una o más imágenes.
- Una o más presentaciones.

Para publicarse, el producto debe estar activo y tener como mínimo nombre, descripción, categoría activa, una imagen y una presentación activa válida con precio.

Las clasificaciones comerciales disponibles serán `Original`, `1.1` e `Inspiración`, únicamente cuando correspondan al producto. Sus definiciones públicas están pendientes de validación con el encargado de Esenciales.

La familia olfativa será opcional. Las notas de salida, corazón y fondo no forman parte del MVP confirmado.

#### Presentaciones

Cada presentación tendrá información propia:

- Etiqueta libre, por ejemplo `1 oz`, `100 ml`, `250 g`, `unidad` o `kit`.
- Precio normal en pesos colombianos sin decimales.
- Precio promocional opcional.
- Stock vendible local.
- Modo de disponibilidad.
- Estado activo o inactivo.

La etiqueta libre permite utilizar el mismo modelo para diferentes tipos de productos sin crear estructuras específicas por categoría.

Una presentación válida debe tener una etiqueta no vacía, un precio normal entero en COP mayor que cero, un stock entero no negativo y un modo de disponibilidad permitido. Una presentación inactiva se conserva para el historial, pero no se muestra ni admite solicitudes. Una presentación activa puede conservarse visible aunque en ese momento esté agotada o no disponible.

#### Imágenes

Un producto publicado requiere al menos una imagen. La capacidad de asociar varias imágenes es importante, pero tiene prioridad SHOULD y no debe retrasar el flujo principal.

El mecanismo técnico de almacenamiento de imágenes permanece pendiente.

#### Productos destacados

El administrador podrá marcar o desmarcar un producto mediante un control simple, como un checkbox `Producto destacado`.

La página pública utilizará el nombre `Productos destacados`, no `Más vendidos`. Solo se mostrarán productos destacados que también estén activos, tengan una categoría activa y cumplan las condiciones de publicación. El administrador controlará cuántos productos mantiene marcados.

No se utilizarán investigaciones web, reseñas o rankings externos para afirmar cuáles son los productos más vendidos de Esenciales. Una clasificación automática basada en solicitudes entregadas podrá estudiarse como evolución futura, teniendo presente que no representaría las ventas realizadas por otros canales.

### MF-04 - Gestión de inventario y disponibilidad

El stock se administra por presentación y representa unidades locales vendibles.

Modos seleccionables por el administrador:

- `Venta inmediata`.
- `Bajo pedido`.
- `No disponible`.

Estados visibles derivados:

- `Disponible`: resultado de `Venta inmediata` con stock mayor que cero.
- `Agotado`: resultado automático de `Venta inmediata` con stock cero.
- `Bajo pedido`: presentación sin stock local vendible, cuya disponibilidad y entrega deben confirmarse.
- `No disponible`: presentación que no admite solicitudes, aunque pueda conservarse visible.

Al reabastecer una presentación de venta inmediata agotada, esta vuelve a mostrarse disponible. Una presentación bajo pedido debe mantener stock vendible local igual a cero y no descuenta inventario al confirmarse.

El administrador podrá aumentar, disminuir o establecer manualmente el stock. Un historial profesional de movimientos de almacén no forma parte del MVP.

Se considera stock bajo una presentación activa de venta inmediata con entre una y tres unidades. El stock cero se informa como `Agotado` y no se duplica en el indicador de stock bajo. `Bajo pedido` y `No disponible` tampoco generan esta alerta.

### MF-05 - Publicación y consulta del catálogo público

El catálogo será público y no requerirá autenticación del cliente.

La página de inicio podrá incluir identidad visual, llamado a ver el catálogo, acceso a categorías, productos destacados, promociones vigentes, presentación breve del negocio, redes sociales, WhatsApp e información básica sobre entrega y envío.

Las tarjetas priorizarán:

- Imagen.
- Nombre.
- Marca cuando resulte útil.
- Precio o texto `Desde $X` cuando existan diferentes precios.
- Resumen de disponibilidad expresado con texto y no solo con color.

Cuando un producto tenga presentaciones activas con estados diferentes, la tarjeta mostrará como resumen `Disponible` si al menos una está disponible; en caso contrario, `Bajo pedido` si al menos una admite esa modalidad; `Agotado` si las restantes de venta inmediata tienen stock cero; y `No disponible` si ninguna admite solicitudes. El detalle siempre mostrará el estado exacto de cada presentación activa.

El detalle permitirá consultar la información del producto, sus imágenes y presentaciones, seleccionar presentación y cantidad y agregar al carrito cuando corresponda.

Una sección educativa sobre clasificaciones comerciales tendrá prioridad SHOULD, después de validar con Esenciales las definiciones exactas de `Original`, `1.1` e `Inspiración`.

### MF-06 - Búsqueda, filtrado y navegación

El mínimo obligatorio incluye:

- Búsqueda por nombre.
- Filtro por categoría.
- Filtro por disponibilidad.

Tienen prioridad SHOULD:

- Filtro por género.
- Filtro por marca.
- Filtro por rango de precio.
- Ordenamiento por fecha reciente, menor precio, mayor precio o nombre.

La interfaz seguirá un enfoque mobile-first para usuarios procedentes principalmente de Instagram, TikTok y WhatsApp.

El filtro de disponibilidad opera sobre las presentaciones activas: un producto coincide cuando al menos una tiene el estado seleccionado. La tarjeta conserva el resumen definido para el producto y el detalle permite identificar la presentación que produjo la coincidencia.

Cuando se implementen los filtros y ordenamientos SHOULD relacionados con precio, se utilizará el precio efectivo de las presentaciones activas que admitan solicitudes. El filtro por rango coincidirá si al menos una presentación está dentro del rango; el orden por precio utilizará el menor precio efectivo del producto; y `Más recientes` utilizará la fecha de creación del producto.

### MF-07 - Carrito y generación de solicitud de compra

El cliente podrá:

- Agregar presentaciones disponibles o bajo pedido.
- Combinar ambos tipos de presentación en una misma solicitud.
- Elegir cantidades enteras entre 1 y 99.
- Modificar cantidades y retirar elementos.
- Consultar subtotales y valor total de productos.
- Agregar observaciones.

Para venta inmediata, la cantidad tampoco podrá superar el stock disponible. Las presentaciones agotadas o no disponibles no podrán agregarse.

La persistencia del carrito mediante almacenamiento local tiene prioridad SHOULD.

Antes de registrar la solicitud se pedirán:

- Nombre obligatorio.
- Teléfono obligatorio.
- Ciudad opcional.
- Observaciones opcionales.

El valor mostrado se denominará `Valor total de productos` para diferenciarlo de la cantidad de unidades. No incluirá domicilio o envío; estos valores se confirmarán posteriormente según la ubicación del cliente.

El backend volverá a validar productos, presentaciones, cantidades, precios y disponibilidad. Cuando el registro sea exitoso, asignará un código único con formato inicial `ES-00001`. Se permiten huecos y el formato podrá ampliar su cantidad de dígitos cuando sea necesario.

Después del registro, el sistema preparará un mensaje con código, cliente, productos, presentaciones, cantidades, precios y valor total. El cliente decidirá si abre WhatsApp y envía el mensaje. La solicitud permanecerá registrada aunque el cliente no continúe hacia WhatsApp.

No se integrará inicialmente la API oficial avanzada de WhatsApp.

### MF-08 - Gestión administrativa de solicitudes

Estados permitidos:

1. Nueva.
2. Confirmada.
3. Entregada.
4. Cancelada.

Transiciones principales:

```text
Nueva -> Confirmada
Nueva -> Cancelada
Confirmada -> Entregada
Confirmada -> Cancelada
```

Mientras una solicitud esté Nueva, el administrador podrá:

- Corregir nombre, teléfono, ciudad y observaciones.
- Modificar cantidades de líneas existentes.
- Retirar líneas existentes.

No podrá agregar ninguna línea, duplicar líneas existentes, cambiar la presentación seleccionada ni alterar los precios históricos. La solicitud no podrá quedar sin líneas; si el cliente desiste de todas, deberá cancelarse.

Al confirmar, el backend utilizará el modo de disponibilidad vigente después de la conversación comercial por WhatsApp. También comprobará que producto, categoría y presentación continúen activos. Revalidará el stock de las líneas que en ese momento estén en `Venta inmediata` y descontará sus unidades dentro de una transacción. Una línea inactiva, `Agotado` o `No disponible` impedirá confirmar; las líneas que estén `Bajo pedido` no descontarán inventario.

Después de confirmada, la solicitud será inmutable. Si el acuerdo cambia, deberá cancelarse para restituir únicamente el inventario descontado y registrarse una nueva solicitud.

Una solicitud entregada se considera finalizada. No se contempla modificarla o cancelarla dentro del flujo normal.

El dashboard tiene prioridad SHOULD y puede resumir solicitudes nuevas y confirmadas, presentaciones agotadas, presentaciones con stock bajo y total de productos registrados. No requiere gráficas ni métricas financieras.

## 8. Decisiones de datos conceptuales

El modelo conceptual contempla las siguientes entidades:

- Usuario administrativo.
- Categoría.
- Producto.
- Presentación.
- Imagen de producto.
- Solicitud.
- Detalle de solicitud.

Relaciones principales:

```text
Categoria 1 -> N Producto
Producto 1 -> N Presentacion
Producto 1 -> N ImagenProducto
Solicitud 1 -> N DetalleSolicitud
DetalleSolicitud N -> 1 Presentacion
```

El detalle de solicitud debe conservar cantidad, precio unitario aplicado y subtotal. El diseño lógico deberá permitir identificar qué líneas descontaron inventario para que una cancelación restituya exactamente lo correspondiente.

La estructura definitiva de PostgreSQL y el mecanismo de trazabilidad del descuento son decisiones pendientes de diseño técnico. No se exige un módulo profesional de movimientos de almacén.

## 9. Priorización

### MUST - Obligatorio para aceptar el MVP

- Autenticación y protección administrativa.
- Gestión de categorías.
- Gestión de productos y al menos una imagen por producto publicado.
- Gestión de presentaciones, precios, stock y disponibilidad.
- Producto destacado mediante selección manual.
- Catálogo público y detalle de producto.
- Búsqueda por nombre.
- Filtros por categoría y disponibilidad.
- Carrito y registro de solicitud de compra.
- Validación en backend y persistencia en PostgreSQL.
- Código único de solicitud.
- Gestión administrativa de solicitudes y ajustes mientras estén nuevas.
- Confirmación y cancelación transaccional con inventario consistente.
- Flujo voluntario hacia WhatsApp.
- Seguridad y validaciones esenciales.
- Despliegue en producción.

### SHOULD - Importante si no compromete el núcleo

- Varias imágenes por producto.
- Filtros por género, marca y precio.
- Ordenamiento del catálogo.
- Precio promocional.
- Dashboard de resumen.
- Persistencia local del carrito.
- Familia olfativa.
- Explicación pública de clasificaciones comerciales, después de validarlas.
- Contenido ampliado de inicio y contacto.

### COULD - Mejora si existe capacidad restante

- Configuración editable de redes y WhatsApp.
- Generación de QR desde el panel.
- Mejoras adicionales de presentación que no agreguen nueva lógica central.

### WON'T - Fuera de este MVP

- Pasarela de pagos.
- Registro o inicio de sesión de clientes.
- Seguimiento público de solicitudes.
- Reseñas, favoritos y fidelización.
- Facturación electrónica, contabilidad y cuentas por cobrar.
- Reservas complejas de inventario.
- Gestión profesional de movimientos de almacén.
- API avanzada de WhatsApp Business.
- Chat interno.
- Multiemprendimiento.
- Precios mayoristas y gestión completa de proveedores.
- Reportes financieros avanzados.
- Recomendador con inteligencia artificial.
- Quiz de fragancias.
- Analítica avanzada de canales.
- Ranking automático de productos más vendidos.
- Notas olfativas de salida, corazón y fondo.

## 10. Criterio general de aceptación

El MVP deberá permitir demostrar de principio a fin que:

1. Un administrador inicia sesión.
2. Crea o edita una categoría.
3. Crea un producto con sus datos mínimos.
4. Agrega imagen y presentación con precio, stock y disponibilidad.
5. Puede marcar el producto como destacado y publicarlo.
6. Un visitante abre el catálogo desde un celular.
7. Encuentra el producto mediante búsqueda, categoría o disponibilidad.
8. Abre el detalle, elige presentación y cantidad y agrega al carrito.
9. Puede combinar una línea disponible con una línea bajo pedido.
10. Ingresa nombre y teléfono y registra la solicitud.
11. El backend valida y persiste la solicitud y su precio histórico en PostgreSQL.
12. El sistema genera un código `ES-00001` y prepara el mensaje para WhatsApp.
13. El administrador visualiza la solicitud Nueva y puede corregir sus datos o cantidades permitidas.
14. El administrador confirma la solicitud.
15. El backend revalida y descuenta únicamente el inventario de venta inmediata.
16. La solicitud puede finalizar como Entregada.
17. En un escenario alternativo, una solicitud confirmada puede cancelarse y restituir exactamente el inventario descontado.
18. Una segunda confirmación concurrente no puede producir stock negativo.

## 11. Pendientes de validación

### Académicos

- Confirmar si el profesor establece un máximo de ocho funcionalidades.
- Confirmar si se requieren dos roles autenticados con permisos diferentes.
- Incorporar instrucciones metodológicas posteriores cuando existan.

### Negocio y contenido

- Validar las definiciones públicas exactas de `Original`, `1.1` e `Inspiración`.
- Confirmar el número público de WhatsApp.
- Confirmar textos de contacto, entrega y envío.
- Recopilar fotografías y datos reales para pruebas y carga inicial.

### Técnicos

- Definir el mecanismo de autenticación.
- Definir el almacenamiento de imágenes.
- Diseñar la estructura lógica definitiva de PostgreSQL.
- Diseñar las transacciones de confirmación y cancelación.
- Definir cómo registrar qué líneas descontaron inventario.
- Definir proveedor o proveedores de despliegue.
- Definir el formato técnico de validación del teléfono sin restringir casos legítimos.

## 12. Validación posterior

El administrador deberá probar autenticación, categorías, productos, presentaciones, precios, inventario, disponibilidad, destacados y gestión completa de solicitudes.

Los usuarios de prueba deberán navegar desde móvil, buscar, filtrar, consultar detalles, manejar el carrito, registrar una solicitud y continuar hacia WhatsApp.

Los resultados, métricas, evidencias y conclusiones solo se documentarán después de ejecutar las pruebas. No deben anticiparse como hechos académicos.
