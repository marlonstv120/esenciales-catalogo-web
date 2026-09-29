# Plan detallado: rediseño del catálogo público y carrito local básico

**Fecha:** 29 de septiembre de 2026  
**Estado:** plan listo para revisión y ejecución; no representa funcionalidad ya implementada  
**Alcance:** catálogo público unificado, filtros persistentes, tarjetas, selector de presentaciones, carrito local básico y ajuste terminológico del filtro administrativo de inventario

## 1. Objetivo

Rediseñar el catálogo público de ESENCIALES para que la exploración ocurra en una sola cuadrícula, con búsqueda, filtros y ordenamiento persistentes en la URL, tarjetas compactas y una acción directa para agregar presentaciones comprables a un carrito local.

El trabajo debe conservar la arquitectura vigente de HTML, CSS y JavaScript sin framework, las RPC públicas de Supabase, las reglas reales de publicación y disponibilidad, y la identidad boutique oscura y marfil definida en [`../project/DESIGN.md`](../project/DESIGN.md).

## 2. Decisiones confirmadas para este incremento

1. La categoría deja de ser una sección visual y pasa a ser un filtro dentro de una única cuadrícula.
2. Los enlaces de categorías de Inicio utilizarán una URL compartible del catálogo.
3. Se incorpora disponibilidad como filtro, reemplazando la decisión anterior de mostrarla sin permitir filtrarla. Este cambio requiere actualizar requisitos, reglas de negocio, guía de wireframes e historial durante la implementación.
4. Se conservan cuatro estados de disponibilidad: `En stock`, `Bajo pedido`, `Agotado` y `No disponible`.
5. El estado `Agotado` corresponde a una presentación activa de venta inmediata con stock cero. No se agrupa con `No disponible`.
6. El filtro administrativo actualmente llamado `Sin stock` cambiará a `Con presentación agotada`, sin alterar su criterio actual.
7. Las fotografías de tarjetas usarán una caja `4 / 5` con `object-fit: cover`, reemplazando para esta superficie la regla anterior de `contain`.
8. Se implementará un carrito local básico: agregar, combinar líneas de la misma presentación, persistir en el navegador, actualizar el contador y mostrar una vista funcional del carrito.
9. El registro de solicitudes, aceptación de términos, transacciones, códigos y WhatsApp permanece fuera de este incremento.
10. No se añadirán favoritos, nuevas entidades, nuevas tablas, frameworks ni dependencias.

## 3. Hallazgos que condicionan el plan

- `obtener_catalogo_publico()` y `buscar_catalogo_publico(...)` ya aplican las reglas de publicación en PostgreSQL. El frontend no debe replicarlas ni ocultar inconsistencias con CSS.
- El catálogo actual se agrupa por categoría y los enlaces de Inicio usan anclas `#categoria-ID`.
- Los filtros actuales ya utilizan `pushState`, parámetros de consulta y `popstate`, pero categoría se serializa como ID y no existe disponibilidad ni ordenamiento.
- La RPC de catálogo entrega el resumen de disponibilidad, precio, promoción y destacado necesario para tarjetas, pero no entrega las presentaciones completas.
- `obtener_producto_publico(producto_id)` ya devuelve las presentaciones activas y permite decidir qué puede agregarse al carrito.
- El carrito actual y su contador son placeholders fijos.
- Existe una excepción de frontend que oculta de destacados al producto llamado `prubea`; debe eliminarse y la coherencia debe depender de datos y reglas de publicación.
- Una URL directa con precios inválidos puede llegar a ejecutar la RPC y terminar en un error genérico. La ruta debe validarse antes de consultar.
- El modelo permite que un producto publicable solo tenga presentaciones no solicitables. Es un estado válido y la acción `+` debe quedar deshabilitada.

## 4. Enfoque técnico

### 4.1 Principio general

Evolucionar el flujo existente mediante módulos pequeños y funciones puras. La URL será la fuente de verdad del catálogo; la base de datos continuará siendo la fuente de verdad de publicación, precio y disponibilidad; el navegador será la fuente temporal del carrito local.

### 4.2 Consultas

- Mantener `obtener_catalogo_publico()` para Inicio, catálogo sin filtros y lista base de categorías.
- Mantener `buscar_catalogo_publico(...)` para búsqueda, categoría, género, clasificación y rango de precio.
- Aplicar disponibilidad sobre el resultado devuelto por la RPC, porque cada fila ya contiene el resumen calculado por las reglas de PostgreSQL.
- Aplicar ordenamiento en el cliente sobre las filas resultantes, porque destacado, precio de referencia y nombre ya están disponibles.
- Consultar `obtener_producto_publico(producto_id)` al pulsar `+`. Esta carga bajo demanda evita ampliar el payload de todas las tarjetas.
- No crear una migración salvo que las pruebas demuestren que el resumen existente no permite distinguir correctamente algún estado requerido.

### 4.3 Categorías estables en URL

La URL solicitada usa un slug, pero el contrato actual solo entrega ID y nombre. Para no cambiar el modelo de datos ni inventar un slug persistido:

1. Serializar inicialmente el ID estable existente en `categoria`, por ejemplo `/catalogo?categoria=3`.
2. No derivar un slug del nombre como si fuera estable, porque un cambio administrativo de nombre rompería enlaces compartidos.
3. Documentar un slug persistido como evolución futura únicamente si el equipo decide añadir una columna o contrato específico.

Este criterio cumple persistencia y compartibilidad sin modificar el modelo.

### 4.4 Carrito local

Crear un módulo sin dependencias que exponga un contrato similar a:

- `loadCart(storage)`
- `addCartItem(cart, product, presentation)`
- `updateCartItemQuantity(cart, presentationId, quantity)`
- `removeCartItem(cart, presentationId)`
- `saveCart(storage, cart)`
- `getCartCount(cart)`
- `getCartTotal(cart)`

Cada línea conservará solo los datos necesarios para renderizar y recuperar la selección: identificadores de producto y presentación, nombres, etiqueta, imagen, precio efectivo, precio normal cuando exista promoción, modo y cantidad.

Reglas:

- La clave de combinación será `presentacion_id`.
- Agregar la misma presentación incrementará su cantidad.
- La cantidad será un entero entre 1 y 99.
- `Bajo pedido` podrá agregarse hasta 99.
- Venta inmediata deberá respetar el stock disponible. Si el RPC público no entrega stock numérico, el incremento se limitará a agregar una unidad por acción y el carrito marcará la necesidad de revalidación posterior; no se inventará un máximo.
- `Agotado` y `No disponible` nunca se agregarán.
- Los datos corruptos o con versión desconocida en `localStorage` se descartarán de forma segura.
- La persistencia usará una clave versionada, por ejemplo `esenciales.cart.v1`.
- El carrito no reservará ni descontará inventario.

Antes de implementar edición libre de cantidades, se debe confirmar si `obtener_producto_publico` entrega stock numérico. Si no lo entrega, este incremento mantendrá cantidad por adiciones unitarias y dejará la validación completa de stock para el contrato seguro del flujo de solicitudes.

## 5. Diseño funcional del catálogo

### 5.1 Encabezado del contenido

Mostrar, en este orden:

1. `h1` con `Catálogo`.
2. Descripción breve orientada a explorar productos, precios y disponibilidad.
3. Barra de herramientas con buscador, botón `Filtros (N)`, `Limpiar filtros` cuando corresponda, cantidad de resultados y selector de orden.
4. Etiquetas removibles de filtros activos.
5. Una única cuadrícula o el estado de datos correspondiente.

La búsqueda debe tener etiqueta accesible aunque visualmente se presente de forma compacta. No se duplicarán filtros rápidos fuera del panel.

### 5.2 Parámetros de URL

Extender el contrato actual con:

| Criterio | Parámetro | Valores |
| --- | --- | --- |
| Búsqueda | `q` | texto |
| Categoría | `categoria` | ID entero positivo |
| Disponibilidad | `disponibilidad` | `en-stock`, `bajo-pedido`, `agotado`, `no-disponible` repetible |
| Género | `genero` | `hombre`, `mujer`, `unisex` repetible |
| Clasificación | `clasificacion` | `original`, `uno_a_uno`, `inspiracion` repetible |
| Precio mínimo | `min` | entero COP positivo |
| Precio máximo | `max` | entero COP positivo |
| Orden | `orden` | `destacados`, `precio-asc`, `precio-desc`, `nombre` |

`destacados` será el orden predeterminado: productos destacados primero y, dentro de cada grupo, nombre ascendente para obtener un resultado determinista.

El contador `Filtros (N)` contará criterios, no cada valor seleccionado: búsqueda, categoría, disponibilidad, género, clasificación y rango de precio. El ordenamiento no contará como filtro.

### 5.3 Normalización y validación

- Ignorar parámetros desconocidos y valores enumerados inválidos.
- Deduplicar valores repetidos.
- Validar `min` y `max` antes de llamar Supabase, incluso en entrada directa o navegación `popstate`.
- Si la URL contiene precios inválidos, mostrar validación recuperable y conservar los demás criterios válidos.
- Serializar siempre en un orden estable para facilitar pruebas y enlaces compartidos.
- Eliminar parámetros con valores predeterminados.
- Al quitar la última etiqueta activa, volver a `/catalogo` sin `?` vacío.

### 5.4 Panel de filtros

#### Móvil

- Región expandible de ancho completo inmediatamente después del buscador.
- Controles apilados y agrupados mediante `fieldset` y `legend`.
- Acciones `Aplicar filtros` y `Limpiar filtros` al final.
- Los cambios permanecerán como borrador hasta `Aplicar filtros`, evitando una consulta y rerender por cada toque.

#### Escritorio

- Popover no modal anclado al botón `Filtros` mediante un contenedor posicionado en la barra.
- Fondo marfil, borde sutil y sombra elevada ya definida por el sistema visual.
- No desplazará la cuadrícula ni aumentará la altura del encabezado.
- Cerrará con X, Escape y clic exterior.
- Mientras esté abierto, Tab y Shift+Tab permanecerán dentro del panel.
- Al cerrar, devolverá el foco al botón que lo abrió.
- `Aplicar filtros` actualizará URL y resultados sin recargar el documento.
- `Limpiar filtros` limpiará el borrador y aplicará el estado vacío.

No se usará `<details>` para escritorio porque no cubre por sí solo cierre exterior, trampa y restauración de foco. Se reutilizará el mismo formulario y se variará su presentación con CSS y una capa pequeña de control accesible.

### 5.5 Etiquetas activas

Cada criterio visible tendrá una etiqueta con texto comprensible y botón independiente:

- `Búsqueda: Ámbar`
- `Categoría: Perfumes / Lociones`
- `Disponibilidad: Bajo pedido`
- `Género: Mujer`
- `Clasificación: Original`
- `Precio desde $50.000`
- `Precio hasta $120.000`

Eliminar una etiqueta actualizará la URL, resultados, contador y controles. Los botones usarán nombres como `Quitar filtro Categoría: Perfumes / Lociones`.

### 5.6 Ordenamiento

- `Destacados`: destacado descendente y nombre ascendente.
- `Menor precio`: `precio_referencia` ascendente y nombre ascendente.
- `Mayor precio`: `precio_referencia` descendente y nombre ascendente.
- `Nombre`: comparación alfabética en español y estable.

No se añadirá `Más recientes`, porque el contrato público actual no entrega fecha de creación y no debe inventarse ese dato.

## 6. Tarjeta de producto

### 6.1 Estructura semántica

- `article` para la tarjeta.
- Enlace sobre la imagen, independiente del botón de carrito.
- Enlace sobre el nombre, independiente del botón de carrito.
- Ningún botón dentro de un enlace.
- Categoría como texto secundario.
- Nombre con máximo visual de dos líneas.
- Descripción con máximo visual de dos líneas.
- Precio y posible precio normal tachado con lectura accesible.
- Botón circular `+` con nombre `Agregar {producto} al carrito`.

### 6.2 Imagen

- Contenedor con `aspect-ratio: 4 / 5` para reservar espacio.
- Imagen con ancho y alto del contenedor y `object-fit: cover`.
- `loading="lazy"` fuera del contenido inicial prioritario.
- Fallback neutral con icono SVG y texto `Imagen no disponible`.
- La imagen rota activará el mismo fallback sin dejar el icono nativo del navegador.

### 6.3 Disponibilidad

Mapeo de la terminología técnica actual a la interfaz:

| Valor actual | Etiqueta pública |
| --- | --- |
| `Disponible` | `En stock` |
| `Bajo pedido` | `Bajo pedido` |
| `Agotado` | `Agotado` |
| `No disponible` | `No disponible` |

La etiqueta aparecerá dentro de la fotografía, en la esquina superior izquierda, con texto, fondo y borde contrastantes. No dependerá del color.

### 6.4 Precio

- Formato COP sin decimales mediante `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })`, retirando cualquier sufijo visible `COP` si el entorno lo añade.
- Varias presentaciones con precios efectivos diferentes: `Desde $100.000`.
- Promoción válida: precio promocional principal y precio normal tachado.
- No mostrar `COP`, decimales ni precios inventados.

### 6.5 Acción `+`

1. Si el resumen es `Agotado` o `No disponible`, renderizar el botón deshabilitado con explicación accesible.
2. Si el resumen permite solicitudes, cargar el detalle al pulsar.
3. Filtrar presentaciones activas solicitables: venta inmediata en stock o bajo pedido.
4. Si queda una presentación, agregar una unidad directamente.
5. Si quedan varias, abrir un selector compacto anclado a la tarjeta.
6. Si no queda ninguna por un cambio concurrente, no agregar y mostrar un mensaje recuperable.
7. Mientras se consulta, marcar el botón ocupado y bloquear pulsaciones duplicadas.
8. Después de agregar, actualizar contador, persistir y anunciar `Producto añadido al carrito` mediante una región `aria-live`.

El selector compacto tendrá título con el nombre del producto, opciones con etiqueta, precio y disponibilidad, acción de cerrar, cierre con Escape/clic exterior, foco contenido y devolución de foco al botón `+`.

## 7. Cuadrícula responsive

- Base móvil: dos columnas siempre que cada tarjeta conserve legibilidad y objetivos táctiles.
- Tableta: tres columnas cuando el contenedor permita aproximadamente `14rem` por tarjeta.
- Escritorio: cuatro columnas dentro del ancho máximo público de `75rem` a `80rem`.
- Usar `grid-template-columns` y puntos de quiebre dictados por el contenido, no por nombres de dispositivo.
- A 200 % de zoom, permitir que la cuadrícula reduzca columnas sin desbordamiento horizontal.
- Mantener una separación suficiente para que los botones circulares no se superpongan ni incumplan el objetivo táctil recomendado de `44px`.

## 8. Estados del catálogo

### Cargando

- Mantener título y herramientas disponibles.
- Mostrar esqueletos con proporción de imagen reservada.
- Conservar resultados anteriores atenuados durante un cambio de filtros solo si queda claro que se están actualizando; de lo contrario, mostrar esqueletos.
- Anunciar la actualización sin mover el foco.

### Catálogo vacío

- Usar cuando la consulta base no contiene productos publicables.
- Mensaje único y general; no renderizar categorías vacías.
- No sugerir limpiar filtros.

### Sin coincidencias

- Usar cuando el catálogo base tiene productos y el resultado filtrado está vacío.
- Mostrar criterios activos y `Limpiar filtros`.
- No mostrar varias secciones ni mensajes por categoría.

### Error

- Mostrar `No fue posible cargar el catálogo` y `Reintentar`.
- Conservar navegación y carrito.
- Reintentar la consulta que falló sin duplicar eventos.

### Producto sin imagen

- No debería entrar al catálogo conforme a RN-19.
- Mantener fallback por resiliencia ante URL rota o eliminación externa del archivo.
- Las pruebas de base de datos deben demostrar que un producto sin registro de imagen no se publica.

### Producto no solicitable

- Mantener visible si cumple las reglas de publicación.
- Mostrar `Agotado` o `No disponible` según corresponda.
- Deshabilitar `+` sin ocultar el producto.

### Producto añadido

- Confirmación breve no bloqueante.
- Contador actualizado inmediatamente después de persistir.
- La notificación complementa, no sustituye, el estado visible del carrito.

## 9. Carrito local básico

### Vista con productos

- Lista de líneas con imagen, producto, presentación, disponibilidad conocida, precio unitario, cantidad, subtotal y retirar.
- Controles de cantidad con nombre accesible por producto y presentación.
- `Valor total de productos`.
- Acciones `Seguir comprando` y un mensaje que indique que el registro de solicitudes se habilitará en un incremento posterior.
- No mostrar CTA de pago, venta completada o WhatsApp.

### Vista vacía

- Mensaje `Tu carrito está vacío`.
- Acción `Explorar catálogo`.
- Sin total ni acción de continuación.

### Coherencia y fallos

- Si `localStorage` falla, mantener el carrito en memoria durante la sesión y anunciar que no pudo conservarse para visitas posteriores.
- Al cargar, validar forma, tipos, cantidades y precios antes de renderizar.
- No confiar en el carrito como fuente definitiva de precio o disponibilidad para una solicitud futura.
- La futura RPC de registro deberá revalidar todas las líneas.

## 10. Cambios por archivo

### Frontend existente

- `src/public-catalog-filters.mjs`
  - Incorporar disponibilidad y orden.
  - Separar criterios de filtro del criterio de orden.
  - Añadir normalización, conteo y eliminación individual.
  - Validar URLs directas antes de consultar.

- `src/public-catalog.mjs`
  - Mantener las RPC actuales.
  - Añadir funciones puras para filtrar por disponibilidad y ordenar filas si resulta más claro que ubicarlas en el controlador.
  - No introducir consultas por tarjeta durante el render.

- `src/public-catalog-controller.mjs`
  - Eliminar la lógica de anclas de categoría.
  - Gestionar borrador/aplicación del panel de filtros.
  - Gestionar apertura, cierre, clic exterior, Escape, foco y restauración.
  - Gestionar etiquetas removibles y selector de orden.
  - Cargar el detalle bajo demanda para `+`.
  - Integrar el carrito y la notificación accesible.
  - Mantener descarte de respuestas obsoletas mediante `requestId`.

- `src/public-views.mjs`
  - Sustituir secciones por una cuadrícula única.
  - Rediseñar encabezado, herramientas, panel, etiquetas y estados.
  - Rediseñar tarjeta sin interacciones anidadas.
  - Eliminar filtros rápidos duplicados.
  - Cambiar enlaces de categorías de Inicio a query string.
  - Eliminar la excepción por nombre `prubea`.
  - Renderizar selector compacto, notificación y carrito real.

- `src/styles.css`
  - Añadir composición compacta de herramientas.
  - Implementar panel móvil en flujo y popover de escritorio.
  - Aplicar cuadrícula 2/3/4, imagen `4 / 5` con `cover`, truncado de dos líneas, estados, foco y objetivos táctiles.
  - Verificar que no se introduzcan degradados ni sombras fuera de los tokens existentes.

- `src/inventory-views.mjs`
  - Cambiar `Sin stock` por `Con presentación agotada`.
  - Conservar `data-inventory-availability="out-of-stock"` y la lógica existente.

### Módulos nuevos propuestos

- `src/public-cart.mjs`
  - Estado, validación, operaciones puras, totales y persistencia del carrito.

- `src/public-overlay.mjs`, solo si la lógica de foco supera un tamaño razonable dentro del controlador.
  - Apertura/cierre, clic exterior, Escape, trampa y restauración de foco para panel y selector.
  - No crear este módulo si dos funciones pequeñas en el controlador son suficientes.

### Pruebas

- `tests/public-catalog-filters.test.mjs`
- `tests/public-catalog.test.mjs`
- `tests/public-filter-controller.test.mjs`
- `tests/public-controller.test.mjs`
- `tests/public-views.test.mjs`
- `tests/public-routes.test.mjs`
- `tests/inventory-views.test.mjs`
- `tests/inventory-utils.test.mjs`
- `tests/public-cart.test.mjs`, nuevo
- `supabase/tests/database/06_public_catalog.test.sql`
- `supabase/tests/database/07_public_catalog_search.test.sql`

### Documentación que deberá actualizar la implementación

- `docs/project/requirements.md`: RF-29 para incorporar disponibilidad y RF-31 para reflejar los órdenes realmente implementados.
- `docs/project/business-rules.md`: RN-11 para permitir filtrar disponibilidad sin cambiar su cálculo.
- `docs/project/DESIGN.md`: tarjeta, imagen `cover`, panel responsive, eliminación de filtros rápidos y cuatro etiquetas.
- `docs/project/wireframe-guide.md`: P-02 y P-04 según el alcance implementado.
- `docs/history/project-log.md` y, si corresponde, `docs/history/CHANGELOG.md`.
- `.ai/current-context.md` al finalizar y verificar el incremento.

No se requiere un ADR porque no cambia la arquitectura ni incorpora una tecnología nueva.

## 11. Orden de implementación

### Fase 1: fijar contratos mediante pruebas

1. Añadir pruebas de parseo y serialización para disponibilidad y orden.
2. Añadir pruebas de normalización de URL inválida y conteo de criterios.
3. Añadir pruebas de filtrado y ordenamiento determinista.
4. Añadir pruebas del carrito: carga, corrupción, combinación, límites, retirada, conteo y total.
5. Añadir prueba del texto administrativo `Con presentación agotada` y de su criterio real.

### Fase 2: estado de URL y datos

1. Extender las funciones puras de filtros.
2. Validar la ruta antes de consultar Supabase.
3. Aplicar disponibilidad y orden sobre el resultado remoto.
4. Eliminar navegación por hash.
5. Cambiar Inicio para generar enlaces con `categoria=<id>`.
6. Verificar atrás, adelante, recarga y enlace directo.

### Fase 3: cuadrícula, herramientas y estados

1. Sustituir agrupación por categoría por cuadrícula única.
2. Implementar encabezado compacto y contador de resultados.
3. Implementar etiquetas removibles.
4. Implementar panel móvil y popover de escritorio.
5. Diferenciar vacío, sin coincidencias, carga y error.
6. Eliminar excepción `prubea`.

### Fase 4: tarjetas y selector

1. Ajustar semántica y enlaces independientes.
2. Aplicar fotografía `4 / 5` con `cover` y fallback.
3. Aplicar textos, truncado y precio.
4. Mostrar las cuatro disponibilidades.
5. Implementar carga bajo demanda de presentaciones.
6. Agregar directamente cuando haya una presentación comprable.
7. Abrir selector cuando haya varias.
8. Deshabilitar cuando no haya ninguna.

### Fase 5: carrito local

1. Integrar `public-cart.mjs` al controlador público.
2. Actualizar contador global en todas las rutas.
3. Sustituir placeholder de `/carrito`.
4. Implementar modificación y retirada dentro de los límites que permita el contrato público.
5. Añadir confirmación accesible después de agregar.
6. Verificar persistencia y degradación si Storage no está disponible.

### Fase 6: estilos y accesibilidad

1. Aplicar layout mobile-first y cuadrícula 2/3/4.
2. Aplicar popover, foco, estados y objetivos táctiles.
3. Verificar contraste de nuevas combinaciones.
4. Probar teclado, Escape, clic exterior, retorno y trampa de foco.
5. Probar 200 % de zoom y texto largo.
6. Respetar `prefers-reduced-motion` en transiciones nuevas.

### Fase 7: coherencia de datos y documentación

1. Ejecutar pgTAP para publicación, imágenes, actividad y presentaciones válidas.
2. Añadir casos que excluyan producto inactivo, categoría inactiva, sin imagen y sin presentación activa válida.
3. Mantener visibles productos publicables no solicitables con acción deshabilitada.
4. Actualizar documentación afectada por las decisiones confirmadas.
5. No activar ni inventar datos de productos durante esta tarea.

## 12. Estrategia de pruebas automatizadas

### Filtros y URL

- Catálogo sin parámetros.
- Entrada desde cada categoría de Inicio.
- Categoría, disponibilidad, género, clasificación y precio combinados.
- Valores repetidos o inválidos.
- Eliminación individual de cada etiqueta.
- Limpieza total.
- Persistencia al recargar.
- Atrás y adelante con estados sucesivos.
- Ordenamiento sin contarlo como filtro.
- Precio inválido escrito directamente en la URL.

### Publicación y datos

- Producto activo y completo se publica.
- Producto inactivo no se publica.
- Categoría inactiva oculta sus productos.
- Producto sin imagen no se publica.
- Producto sin presentación activa válida con precio no se publica.
- Presentación inactiva no participa.
- Disponible, bajo pedido, agotado y no disponible respetan precedencia.
- Promoción válida fija precio efectivo y normal tachado.

### Tarjeta y carrito

- Imagen y nombre enlazan al detalle.
- `+` no está anidado dentro de enlaces.
- Una presentación comprable agrega directamente.
- Varias presentaciones abren selector.
- Ninguna presentación comprable deshabilita la acción.
- Agregar la misma presentación combina la línea.
- Contador y total se actualizan.
- El carrito persiste tras recrear el controlador.
- Datos corruptos se recuperan sin romper la aplicación.
- Error de detalle no agrega y permite reintento.

### Accesibilidad del comportamiento

- Botones solo con icono tienen nombre accesible.
- El panel cierra con X, Escape y clic exterior.
- El foco no escapa de una superposición abierta.
- El foco vuelve al disparador.
- La confirmación de agregado se anuncia.
- El botón ocupado impide duplicados.

## 13. Validación manual renderizada

Realizar la validación con datos reales disponibles, sin fabricar productos:

| Escenario | 390 px | 768 px | 1440 px |
| --- | ---: | ---: | ---: |
| Catálogo sin filtros | Sí | Sí | Sí |
| Panel abierto | Sí | Sí | Sí |
| Varios filtros y etiquetas | Sí | Sí | Sí |
| Sin resultados | Sí | Sí | Sí |
| Error y reintento | Sí | Sí | Sí |
| Una presentación | Sí | Sí | Sí |
| Varias presentaciones | Sí | Sí | Sí |
| Carrito con productos | Sí | Sí | Sí |
| Carrito vacío | Sí | Sí | Sí |

Además:

- Navegar solo con teclado.
- Verificar foco visible en todos los controles.
- Abrir y cerrar panel y selector repetidamente.
- Probar zoom del navegador al 200 %.
- Probar texto largo de nombre, descripción, categoría y presentación.
- Probar imagen ausente y URL de imagen rota.
- Probar `localStorage` bloqueado desde las herramientas del navegador si es posible.
- Probar atrás/adelante después de aplicar y quitar varios filtros.
- Probar enlace directo bajo la base de GitHub Pages.
- Comprobar que no exista desplazamiento horizontal de la página.

La revisión debe registrar evidencia y distinguir pruebas automatizadas, observación manual y aspectos no verificados.

## 14. Comandos de verificación

Durante la implementación, ejecutar primero las pruebas focalizadas y al final la suite completa:

```powershell
node --test tests/public-catalog-filters.test.mjs tests/public-catalog.test.mjs tests/public-filter-controller.test.mjs tests/public-controller.test.mjs tests/public-views.test.mjs tests/public-routes.test.mjs tests/public-cart.test.mjs tests/inventory-utils.test.mjs tests/inventory-views.test.mjs
```

```powershell
npm run supabase:test-db
```

```powershell
npm test
```

```powershell
$env:BASE_PATH="/esenciales-catalogo-web/"; npm run build
```

Después de compilar, previsualizar el build y validar rutas directas, assets y comportamiento responsive.

## 15. Criterios de aceptación

El incremento estará completo únicamente cuando:

1. El catálogo muestre una sola cuadrícula sin secciones ni mensajes vacíos por categoría.
2. Inicio abra el catálogo con la categoría aplicada mediante query string.
3. Todos los filtros activos, incluido disponibilidad, sean persistentes, compartibles y removibles individualmente.
4. Atrás, adelante y recarga reconstruyan el mismo estado.
5. El panel tenga comportamiento responsive y accesible según el ancho.
6. Ordenamiento funcione con destacados, menor precio, mayor precio y nombre.
7. Las tarjetas tengan layout 2/3/4, imagen estable, cuatro estados y precios correctos.
8. Imagen y nombre abran detalle y `+` sea una acción independiente.
9. Una o varias presentaciones sigan los flujos definidos y los productos no solicitables no puedan agregarse.
10. La confirmación de agregado y el contador reflejen el carrito persistido.
11. `/carrito` deje de ser un placeholder y permita revisar, modificar y retirar líneas dentro del contrato disponible.
12. La publicación pública siga dependiendo de PostgreSQL y sus pruebas cubran inconsistencias administrativas.
13. El filtro administrativo se denomine `Con presentación agotada` y conserve su criterio preciso.
14. Pasen las pruebas focalizadas, pgTAP, la suite completa y el build con base de GitHub Pages.
15. La validación manual cubra móvil estrecho, tableta, escritorio, teclado y zoom al 200 %.

## 16. Riesgos y límites

- **Stock numérico público:** el contrato actual parece ocultarlo deliberadamente. No se debe exponer solo para simplificar el carrito. La edición de cantidades quedará limitada hasta disponer de una validación segura.
- **Categoría por slug:** no existe un slug persistido. Usar ID evita enlaces inestables y cambios de esquema innecesarios.
- **Disponibilidad en cliente:** es válida mientras el catálogo completo filtrado se cargue en una sola respuesta. Si se incorpora paginación remota, deberá trasladarse a la RPC.
- **Carrito no transaccional:** la persistencia local no garantiza precio, stock ni disponibilidad. El futuro registro de solicitud deberá revalidar todo en PostgreSQL.
- **Pruebas de foco:** las pruebas unitarias del DOM no sustituyen una validación real de teclado y navegador.
- **Datos reales insuficientes:** si no existen productos que cubran todos los estados, se podrán validar reglas con fixtures de pruebas, pero no se afirmará que fueron observados en producción.

## 17. Fuera de alcance

- Registro de solicitud de compra.
- Tablas o migraciones de solicitudes.
- Aceptación de términos y política de datos.
- Código único de solicitud.
- Integración con WhatsApp.
- Descuento o reserva de inventario.
- Favoritos.
- Filtro por marca.
- Galería de imágenes.
- Más recientes.
- Paginación remota.
- Cambios generales al diseño administrativo.
