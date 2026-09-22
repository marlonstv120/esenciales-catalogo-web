# Guía de wireframes de ESENCIALES

**Propósito:** definir qué debe dibujarse primero en papel y lápiz y qué debe trasladarse después a Figma para representar el MVP de ESENCIALES.

**Estado:** guía de diseño basada en el alcance funcional aprobado. La organización visual propuesta debe revisarse con el equipo y con el propietario durante el bocetado; no agrega funcionalidades al MVP.

**Fuentes:** [alcance funcional](functional-scope.md), [requisitos](requirements.md), [reglas de negocio](business-rules.md), [actores y flujos](actors-and-flows.md) y [briefing validado](briefing-esenciales.md).

## 1. Cómo utilizar esta guía

El trabajo debe realizarse en este orden:

1. Dibujar en papel el mapa de navegación y las pantallas base descritas en esta guía.
2. Dibujar las variantes de estado indicadas para cada pantalla.
3. Revisar los bocetos con el equipo y el propietario de ESENCIALES.
4. Corregir los bocetos antes de dedicar tiempo al diseño visual.
5. Pasar a Figma las pantallas y estados aprobados.
6. Enlazar en el prototipo de Figma los flujos principales del cliente y del administrador.
7. Conservar fotografías legibles de los bocetos y una versión fechada de Figma como evidencia del diseño preliminar.

El wireframe debe ser de baja fidelidad. En esta etapa importan la distribución, la jerarquía, el contenido, la navegación y los estados; todavía no son necesarios los colores definitivos, fotografías reales, tipografías finales, sombras o decoraciones.

## 2. Convenciones

### Prioridades

- **MUST:** debe aparecer en el wireframe porque es obligatorio para el MVP.
- **SHOULD:** se diseña solo si no compromete el flujo principal.
- **COULD:** mejora opcional; no debe incluirse en la entrega base.
- **Pendiente:** requiere contenido o validación antes de presentarse como definitivo.

### Símbolos para el boceto a mano

- Rectángulo con una `X`: imagen.
- Rectángulo gris: contenido que está cargando.
- Línea horizontal: texto.
- Rectángulo con texto: botón o campo.
- Flecha: navegación o acción.
- Nota numerada: regla, validación o comportamiento que no puede mostrarse solo con el dibujo.

Numerar las hojas y los marcos con los códigos de esta guía, por ejemplo `P-02 Catálogo - cargado` o `A-08 Solicitud - Nueva`.

## 3. Actores y áreas separadas

### Sitio público

El visitante no crea una cuenta ni inicia sesión. Puede consultar productos, preparar un carrito, registrar una solicitud y decidir si continúa por WhatsApp.

Navegación pública recomendada:

```text
Inicio | Catálogo | Carrito
```

En móvil, `Inicio` y `Catálogo` pueden estar en un menú desplegable. El acceso al carrito debe permanecer visible e indicar la cantidad de líneas o unidades de forma consistente.

### Administración

El propietario accede mediante inicio de sesión. La administración debe diferenciarse visualmente del sitio público.

Navegación administrativa base:

```text
Resumen (SHOULD) | Categorías | Productos | Inventario | Solicitudes | Cerrar sesión
```

En escritorio se recomienda una barra lateral. En móvil puede utilizarse un encabezado con menú. Si no se implementa el resumen administrativo, el acceso puede llevar directamente a `Solicitudes` o `Productos`.

## 4. Mapa general de pantallas

### Correspondencia con los ocho módulos del MVP

| Módulo funcional | Pantallas donde se representa |
| --- | --- |
| MF-01 Autenticación y acceso administrativo | A-01 y navegación administrativa protegida |
| MF-02 Estructura del catálogo | A-03 y selector de categoría de A-05 |
| MF-03 Productos, presentaciones, precios e imágenes | A-04 y A-05 |
| MF-04 Inventario y disponibilidad | A-05, A-06 y estados visibles de P-02 y P-03 |
| MF-05 Publicación y consulta del catálogo | P-01, P-02 y P-03 |
| MF-06 Búsqueda, filtrado y navegación | P-02 y componentes de navegación pública |
| MF-07 Carrito y solicitud de compra | P-03, P-04, P-05 y P-06 |
| MF-08 Gestión administrativa de solicitudes | A-07 y A-08 |

### Relación entre pantallas

```text
SITIO PÚBLICO
P-01 Inicio
  ├─ P-02 Catálogo
  │    └─ P-03 Detalle de producto
  │          └─ P-04 Carrito
  └────────────── P-04 Carrito
                     └─ P-05 Datos de la solicitud
                           └─ P-06 Confirmación y WhatsApp

ADMINISTRACIÓN
A-01 Inicio de sesión
  └─ A-02 Resumen administrativo (SHOULD)
       ├─ A-03 Categorías
       ├─ A-04 Productos
       │    └─ A-05 Crear o editar producto
       ├─ A-06 Inventario y disponibilidad
       └─ A-07 Solicitudes
            └─ A-08 Detalle y gestión de solicitud
```

## 5. Componentes comunes

### Sitio público

- Encabezado con identidad de ESENCIALES, navegación y acceso al carrito.
- Indicador textual del estado de una acción; no depender únicamente del color.
- Botones primarios con etiquetas claras, por ejemplo `Ver catálogo`, `Agregar al carrito` o `Registrar solicitud`.
- Pie de página con información básica de contacto y redes cuando esos datos sean confirmados.
- Mensajes de carga, vacío, error y validación ubicados cerca del contenido afectado.

El acceso general a WhatsApp y los textos de entrega o envío permanecen pendientes de contenido del negocio. No se deben colocar datos reales no confirmados; en el wireframe se usan rótulos como `[WhatsApp pendiente]`.

### Administración

- Encabezado o barra lateral con nombre de la sección y cierre de sesión.
- Título de página y acción principal visible.
- Listados con búsqueda o filtros solo cuando se indiquen en esta guía.
- Estado activo o inactivo expresado mediante texto además de cualquier color.
- Confirmación antes de desactivar información o cambiar el estado de una solicitud.
- Mensaje de éxito o error después de guardar una operación.

## 6. Pantallas públicas

### P-01 - Página de inicio

**Objetivo:** presentar a ESENCIALES y conducir rápidamente al catálogo.

**Contenido MUST:**

- Encabezado público.
- Bloque principal con nombre o identidad del negocio, mensaje breve y botón `Ver catálogo`.
- Sección `Productos destacados` con tarjetas de productos seleccionados manualmente.
- Acceso al carrito.

**Contenido recomendado o pendiente:**

- Accesos visuales a las categorías iniciales: Perfumes / Lociones, Splash, Cremas, Humidificadores y Otros productos.
- Presentación breve del negocio.
- Contacto, redes, WhatsApp e información de entrega o envío cuando el propietario confirme esos datos.
- Promociones vigentes únicamente si se implementa la prioridad SHOULD.

**Estados que se deben representar:**

- `Cargando`: estructura visible y tarjetas grises de productos destacados.
- `Cargado`: contenido y productos destacados disponibles.
- `Sin destacados`: la página conserva su bloque principal y acceso al catálogo; no muestra una sección vacía engañosa.
- `Error`: mensaje en la sección afectada y acción `Reintentar`; la navegación principal continúa disponible.

### P-02 - Catálogo

**Objetivo:** permitir encontrar y comparar productos sin iniciar sesión.

**Contenido MUST:**

- Título `Catálogo`.
- Campo `Buscar por nombre`.
- Filtro por categoría.
- Filtro por disponibilidad: Disponible, Bajo pedido, Agotado y No disponible.
- Acción para limpiar filtros.
- Cantidad de resultados.
- Cuadrícula o lista de tarjetas.
- Cada tarjeta muestra imagen, nombre, precio o `Desde $X`, disponibilidad escrita y acción para abrir el detalle.

**Contenido SHOULD:**

- Filtros por género, marca y rango de precio.
- Orden por más recientes, menor precio, mayor precio o nombre.

**Estados que se deben representar:**

- `Cargando`: buscador y filtros visibles; tarjetas esqueleto sin datos falsos.
- `Cargado con resultados`: productos y filtros aplicados.
- `Catálogo vacío`: todavía no existen productos publicables; mensaje general sin sugerir cambiar filtros.
- `Sin resultados`: existen productos, pero ninguno coincide; mostrar los filtros activos y `Limpiar filtros`.
- `Error`: mensaje `No fue posible cargar el catálogo`, acción `Reintentar` y carrito aún accesible.

### P-03 - Detalle de producto

**Objetivo:** consultar la información exacta y elegir una presentación antes de agregarla al carrito.

**Contenido MUST:**

- Ruta para volver al catálogo.
- Imagen principal; galería solo si se implementan varias imágenes.
- Nombre, descripción, categoría, marca, género, referencia o clasificación cuando correspondan.
- Selector de presentación.
- Precio normal de la presentación seleccionada.
- Precio promocional junto al normal solo si se implementan promociones.
- Estado exacto de cada presentación con texto.
- Selector de cantidad entre 1 y 99.
- Botón `Agregar al carrito` cuando la presentación sea solicitable.

**Variantes de disponibilidad que se deben dibujar:**

- `Disponible`: botón habilitado y cantidad limitada además por el stock.
- `Bajo pedido`: botón habilitado y aviso de que disponibilidad y entrega se confirman con ESENCIALES.
- `Agotado`: visible, pero botón deshabilitado.
- `No disponible`: visible, pero botón deshabilitado.

**Otros estados:**

- `Cargando`: bloques esqueleto para imagen e información.
- `No encontrado o dejó de publicarse`: explicación breve y botón `Volver al catálogo`.
- `Error`: mensaje y acción `Reintentar`.
- `Agregado`: confirmación visible con acciones `Ver carrito` y `Seguir comprando`.

### P-04 - Carrito

**Objetivo:** revisar las presentaciones seleccionadas antes de registrar la solicitud.

**Contenido MUST:**

- Lista de líneas con imagen, producto, presentación, disponibilidad, precio unitario y cantidad.
- Control para cambiar cantidad.
- Acción para retirar una línea.
- Subtotal por línea.
- `Valor total de productos`.
- Aviso de que domicilio o envío no está incluido y se confirma posteriormente.
- Acciones `Seguir comprando` y `Continuar`.

**Estados que se deben representar:**

- `Con productos`: puede combinar líneas disponibles y bajo pedido.
- `Vacío`: mensaje, sin total ni botón de continuar, y acción `Explorar catálogo`.
- `Actualizando`: control de cantidad temporalmente bloqueado e indicador en la línea.
- `Cantidad inválida`: mensaje junto al control; debe ser un entero de 1 a 99 y no superar el stock de venta inmediata.
- `Producto modificado`: aviso si cambió precio, stock o disponibilidad y acción para corregir o retirar la línea.
- `Error`: la selección se conserva visualmente y se permite reintentar.

### P-05 - Datos de la solicitud

**Objetivo:** recopilar los datos mínimos y registrar una solicitud de compra, no un pago ni una venta terminada.

**Contenido MUST:**

- Resumen compacto del carrito y valor total de productos.
- Campo `Nombre` obligatorio.
- Campo `Teléfono` obligatorio.
- Campo `Ciudad` opcional.
- Campo `Observaciones` opcional.
- Aviso: dirección, barrio, entrega y envío se acuerdan posteriormente con ESENCIALES.
- Checkbox obligatorio, inicialmente desmarcado: `He leído y acepto los Términos y condiciones y la Política de tratamiento de datos`.
- Enlaces accesibles a ambos documentos desde el texto de aceptación.
- Botón `Registrar solicitud`.
- Enlace para volver al carrito.

**No debe contener:** dirección, barrio, datos de tarjeta, método de pago, contraseña o creación de cuenta.

**Estados que se deben representar:**

- `Inicial`: formulario vacío y resumen visible.
- `Validación`: errores específicos junto a los campos y foco visual en el primer error.
- `Aceptación pendiente`: mensaje asociado al checkbox si se intenta registrar sin aceptar.
- `Registrando`: botón bloqueado con texto `Registrando...` para evitar envíos duplicados.
- `Revalidación fallida`: indicar qué línea cambió de precio, stock o disponibilidad y permitir volver al carrito.
- `Error del sistema`: mensaje sin afirmar que la solicitud fue creada y acción segura para reintentar.

### P-06 - Confirmación de solicitud

**Objetivo:** confirmar el registro exitoso y ofrecer la continuación voluntaria por WhatsApp.

**Contenido MUST:**

- Mensaje `Solicitud registrada`.
- Código único visible, por ejemplo `ES-00001`.
- Resumen de cliente, productos, presentaciones, cantidades, precios y valor total de productos.
- Explicación de que la solicitud aún debe confirmarse comercialmente con ESENCIALES.
- Botón `Continuar por WhatsApp`.
- Alternativa `Volver al inicio` o `Seguir viendo productos`.
- Nota de que la solicitud ya quedó registrada aunque el visitante no abra WhatsApp.

No debe mostrar estados de pago, seguimiento público de la solicitud ni afirmar `Compra realizada`.

## 7. Pantallas administrativas

### A-01 - Inicio de sesión

**Contenido MUST:**

- Identidad de ESENCIALES y título `Administración`.
- Campo de correo o identificador configurado.
- Campo de contraseña y control para mostrarla u ocultarla.
- Botón `Iniciar sesión`.
- Enlace `¿Olvidaste tu contraseña?`.
- Enlace claro para volver al sitio público.

No incluir registro público de administradores.

**Estados:** inicial, enviando, credenciales inválidas, error del servicio y sesión vencida. El error no debe revelar si una cuenta administrativa existe.

### A-01A - Recuperación de contraseña

**Contenido MUST:** campo de correo, botón `Enviar enlace de recuperación`, confirmación neutral del envío y enlace para volver al inicio de sesión. La confirmación no debe revelar si el correo corresponde a una cuenta administrativa.

El enlace recibido debe conducir a una vista que permita establecer y confirmar una nueva contraseña válida. Deben representarse los estados inicial, enviando, enlace enviado, enlace inválido o vencido, contraseña actualizada y error del servicio.

### A-02 - Resumen administrativo (SHOULD)

Esta pantalla solo se diseña como parte de la entrega base si el equipo confirma que implementará el dashboard.

**Contenido propuesto:**

- Solicitudes nuevas.
- Solicitudes confirmadas.
- Presentaciones agotadas.
- Presentaciones con stock bajo, entre 1 y 3 unidades.
- Total de productos registrados.
- Accesos directos a `Nuevo producto`, `Inventario` y `Solicitudes nuevas`.

No requiere gráficas, ingresos, ventas, pagos ni productos más vendidos.

**Estados:** cargando, resumen con datos, indicadores en cero y error parcial con reintento.

### A-03 - Gestión de categorías

**Contenido MUST:**

- Listado con nombre y estado activo o inactivo.
- Acción `Nueva categoría`.
- Acciones `Editar`, `Activar` o `Desactivar`.
- Formulario de creación o edición con nombre y estado.
- Aviso de impacto al desactivar: la categoría y sus productos se ocultan del catálogo público, pero no se eliminan.

El formulario puede representarse como modal, panel lateral o bloque dentro de la página. Se recomienda reutilizar el mismo patrón en escritorio y convertirlo en pantalla completa en móvil.

**Estados:** cargando, listado cargado, sin categorías, error, guardando, validación, guardado exitoso y confirmación de desactivación.

### A-04 - Gestión de productos

**Contenido MUST:**

- Acción `Nuevo producto`.
- Listado con imagen, nombre, categoría, estado, indicador destacado y resumen de publicación.
- Acciones `Editar`, `Activar` o `Desactivar`.
- Aviso `No publicable` cuando falten condiciones obligatorias.

**Ayudas de navegación recomendadas:** búsqueda administrativa por nombre y filtros por categoría y estado activo o inactivo.

**Estados:** cargando, con productos, sin productos, sin coincidencias, error y confirmación de activación o desactivación.

### A-05 - Crear o editar producto

Para evitar un formulario demasiado largo se proponen tres secciones o pestañas. En móvil pueden mostrarse como pasos o bloques consecutivos; no es obligatorio conservar pestañas horizontales.

#### Pestaña 1 - Datos generales

- Nombre obligatorio.
- Descripción obligatoria para publicar.
- Categoría obligatoria.
- Marca opcional.
- Género opcional.
- Referencia opcional.
- Clasificación comercial opcional: Original, 1.1 o Inspiración.
- Familia olfativa opcional con prioridad SHOULD.
- Control `Producto destacado`.
- Estado activo o inactivo.

#### Pestaña 2 - Presentaciones

- Listado de presentaciones existentes.
- Acción `Agregar presentación`.
- Etiqueta libre obligatoria, por ejemplo `100 ml` o `unidad`.
- Precio normal COP entero y mayor que cero.
- Precio promocional opcional con prioridad SHOULD, menor que el precio normal.
- Stock entero no negativo.
- Modo: Venta inmediata, Bajo pedido o No disponible.
- Estado activo o inactivo.
- Estado visible derivado: Disponible o Agotado para venta inmediata.

Cuando se seleccione `Bajo pedido`, el stock vendible debe ser cero. `Agotado` no se elige manualmente: se deriva de venta inmediata con stock cero.

#### Pestaña 3 - Imágenes

- Área para seleccionar o arrastrar una imagen.
- Vista previa.
- Acción para reemplazar o retirar la imagen.
- Varias imágenes y ordenamiento únicamente si se implementa la prioridad SHOULD.

#### Acciones y estados generales

- Acciones `Crear producto` o `Guardar cambios`, según corresponda, y `Cancelar`.
- Resumen de condiciones faltantes para poder publicar.
- Estados: formulario nuevo, cargando edición, validación, guardando, carga de imagen en progreso, error de imagen, error al guardar, guardado exitoso y cambios sin guardar.

El producto no debe presentarse como publicable hasta que cumpla nombre, descripción, categoría activa, imagen y al menos una presentación activa válida con precio. Esta guía no define si se podrán guardar registros incompletos; esa decisión deberá concretarse durante la implementación sin debilitar las condiciones de publicación.

### A-06 - Inventario y disponibilidad

**Objetivo:** actualizar rápidamente stock, precio y disponibilidad por presentación sin entrar a editar cada producto completo.

**Contenido MUST:**

- Tabla o lista con producto, presentación, precio, stock, modo y estado visible.
- Acción `Editar` en cada presentación.
- Campos de edición para precio normal, stock y modo.
- Identificación textual de `Stock bajo` cuando sea venta inmediata con 1 a 3 unidades.

**Ayudas de navegación recomendadas:** búsqueda por producto y filtros por categoría, modo o estado.

No incluir costo interno, movimientos profesionales de almacén o reportes de ventas.

**Estados:** cargando, con presentaciones, sin presentaciones, sin coincidencias, error, guardando, validación y actualización exitosa.

### A-07 - Listado de solicitudes

**Contenido MUST:**

- Listado con código, fecha, cliente, teléfono, valor total de productos y estado.
- Acción `Ver detalle`.
- Estados expresados con texto, no solo con color.

**Ayudas de navegación recomendadas:** filtros por estado y búsqueda por código, nombre o teléfono.

**Estados:** cargando, con solicitudes, sin solicitudes, sin coincidencias y error con reintento.

No incluir estados de pago, reportes financieros ni seguimiento de envíos.

### A-08 - Detalle y gestión de solicitud

**Contenido común:**

- Código, fecha y estado actual.
- Nombre, teléfono, ciudad y observaciones.
- Líneas con producto, presentación, precio histórico, cantidad y subtotal.
- Valor total de productos.

**Variante Nueva:**

- Permitir corregir nombre, teléfono, ciudad y observaciones.
- Permitir modificar cantidades o retirar líneas existentes.
- No permitir agregar o duplicar líneas, cambiar presentaciones ni alterar precios históricos.
- No permitir guardar la solicitud sin líneas.
- Acciones `Guardar cambios`, `Confirmar solicitud` y `Cancelar solicitud`.

**Variante Confirmada:**

- Información inmutable.
- Acciones `Marcar como entregada` y `Cancelar solicitud`.
- Aviso de que cancelar restituye únicamente el inventario que esta solicitud descontó.

**Variantes Entregada y Cancelada:**

- Vista de solo lectura.
- Sin transiciones ordinarias disponibles.

**Estados de interacción que se deben dibujar:**

- Cargando y error de carga.
- Edición con validación.
- Confirmación previa a cada transición.
- Transición en proceso con acciones bloqueadas.
- Confirmación rechazada por producto, categoría o presentación inactiva, por falta de stock o por estado no disponible.
- Transición exitosa con nuevo estado visible.

## 8. Catálogo general de estados

No todos los estados aplican a todas las pantallas. La siguiente matriz indica dónde deben contemplarse.

| Estado | Qué debe comunicar | Pantallas principales |
| --- | --- | --- |
| Inicial | Estructura lista antes de interactuar | Formularios y filtros |
| Cargando | La consulta está en curso sin inventar datos | Inicio, catálogo, detalle y listados administrativos |
| Cargado | Datos disponibles y acciones correctas | Todas las pantallas de consulta |
| Vacío | La fuente todavía no contiene registros | Catálogo, carrito y listados administrativos |
| Sin resultados | Hay datos, pero los filtros no coinciden | Catálogo, productos, inventario y solicitudes |
| Error de carga | No fue posible consultar; permitir reintento | Pantallas con datos remotos |
| Validación | Qué campo o línea debe corregirse | Formularios, cantidades y edición administrativa |
| Procesando | Evitar acciones duplicadas mientras se guarda | Inicio de sesión, solicitud, guardados y transiciones |
| Éxito | Confirmar el resultado real de la acción | Carrito, guardados y cambios de estado |
| Conflicto de datos | La información cambió desde la última consulta | Carrito, registro y confirmación de solicitudes |
| No encontrado | El recurso no existe o dejó de publicarse | Detalle de producto y rutas por identificador |
| Sesión vencida | Proteger datos y volver a autenticación | Administración |

### Diferencia entre vacío, sin resultados y error

- `Vacío`: la consulta funcionó, pero todavía no hay registros.
- `Sin resultados`: sí existen registros, pero ninguno coincide con la búsqueda o filtros.
- `Error`: no se pudo saber si hay registros porque la consulta falló.

Estos estados deben tener mensajes y acciones diferentes.

## 9. Flujos que debe permitir el prototipo de Figma

### Flujo principal del cliente

```text
Inicio
→ Ver catálogo
→ Buscar o filtrar
→ Abrir producto
→ Elegir presentación y cantidad
→ Agregar al carrito
→ Revisar carrito
→ Ingresar datos
→ Registrar solicitud
→ Ver código
→ Elegir si continúa por WhatsApp
```

### Flujo administrativo de catálogo

```text
Iniciar sesión
→ Abrir Productos
→ Crear producto
→ Completar datos generales
→ Agregar presentación, precio, stock y modo
→ Agregar imagen
→ Marcar como destacado si corresponde
→ Guardar y verificar que sea publicable
```

### Flujo administrativo de solicitud

```text
Abrir Solicitudes
→ Filtrar Nuevas
→ Abrir detalle
→ Corregir datos o cantidades si corresponde
→ Confirmar
→ Ver inventario actualizado
→ Marcar como Entregada
```

También debe existir una rama alternativa `Confirmada → Cancelada`, mostrando la restitución del inventario descontado.

## 10. Entrega mínima de bocetos

### Pantallas base obligatorias

- [ ] P-01 Inicio.
- [ ] P-02 Catálogo.
- [ ] P-03 Detalle de producto.
- [ ] P-04 Carrito.
- [ ] P-05 Datos de la solicitud.
- [ ] P-06 Confirmación de solicitud.
- [ ] A-01 Inicio de sesión.
- [ ] A-03 Categorías.
- [ ] A-04 Productos.
- [ ] A-05 Crear o editar producto con sus tres secciones.
- [ ] A-06 Inventario y disponibilidad.
- [ ] A-07 Solicitudes.
- [ ] A-08 Detalle de solicitud en estados Nueva, Confirmada, Entregada y Cancelada.

### Variantes mínimas de estado

- [ ] Catálogo cargando.
- [ ] Catálogo vacío.
- [ ] Catálogo sin resultados.
- [ ] Catálogo con error.
- [ ] Detalle con presentación Disponible.
- [ ] Detalle con presentación Bajo pedido.
- [ ] Detalle con presentación Agotada o No disponible.
- [ ] Carrito vacío.
- [ ] Formulario de solicitud con errores de validación.
- [ ] Solicitud registrándose.
- [ ] Confirmación con código y WhatsApp.
- [ ] Inicio de sesión con error.
- [ ] Patrón administrativo de listado cargando, vacío, sin resultados y error.
- [ ] Producto con errores de validación y producto guardado.
- [ ] Solicitud Nueva editable.
- [ ] Diálogo para confirmar una transición.
- [ ] Confirmación rechazada por stock o disponibilidad.
- [ ] Transición de solicitud exitosa.

La pantalla A-02 Resumen administrativo se añade únicamente si el equipo confirma la prioridad SHOULD. No es necesario repetir en papel el mismo patrón de carga y error para cada listado administrativo; puede diseñarse una plantilla y anotar en qué pantallas se reutiliza.

## 11. Tamaños y adaptación responsive

Por el enfoque mobile-first, cada pantalla pública y administrativa debe comenzar con una versión de celular y adaptarse también a escritorio. Para Figma se recomiendan como referencias, no como medidas técnicas definitivas:

- Celular: `390 × 844 px`.
- Tableta: `768 × 1024 px`, al menos para Inicio, Catálogo, Detalle y una pantalla administrativa.
- Escritorio: `1440 × 900 px`.

En papel se puede usar una hoja dividida en un marco angosto para móvil y uno ancho para escritorio. No basta con encoger el escritorio: en móvil deben apilarse los bloques, simplificarse las tablas, abrirse los filtros en panel y mantenerse visibles las acciones principales.

## 12. Organización sugerida en Figma

```text
00 - Mapa y notas
01 - Componentes y estados
02 - Público móvil
03 - Público escritorio
04 - Administración móvil
05 - Administración escritorio
06 - Prototipo cliente
07 - Prototipo administrador
08 - Opcionales SHOULD
```

Nombres recomendados para los marcos:

```text
P-02 / Móvil / Cargando
P-02 / Móvil / Con resultados
A-08 / Escritorio / Nueva editable
A-08 / Escritorio / Error de confirmación
```

Crear componentes reutilizables para encabezados, botones, campos, tarjetas de producto, filas administrativas, etiquetas de estado, mensajes vacíos, alertas, modales y esqueletos de carga.

## 13. Criterios de revisión antes de aprobar el wireframe

- [ ] Los dos actores y sus áreas están claramente separados.
- [ ] El visitante puede completar el flujo sin registrarse ni iniciar sesión.
- [ ] Producto, presentación, precio, disponibilidad y acción principal se identifican fácilmente.
- [ ] La disponibilidad y los errores no dependen únicamente del color.
- [ ] Los formularios tienen etiquetas visibles y mensajes de validación cercanos.
- [ ] El carrito usa `Valor total de productos` y separa domicilio o envío.
- [ ] La confirmación dice `Solicitud registrada`, no `Compra pagada` ni `Venta realizada`.
- [ ] WhatsApp es una continuación voluntaria posterior al registro.
- [ ] El administrador modifica inventario por presentación.
- [ ] `Agotado` se muestra como resultado del stock cero y no como modo manual.
- [ ] Una solicitud Nueva es editable solo dentro de los límites definidos.
- [ ] Una solicitud Confirmada es inmutable.
- [ ] Los estados Nueva, Confirmada, Entregada y Cancelada usan únicamente las transiciones permitidas.
- [ ] Cada listado distingue cargando, vacío, sin resultados y error.
- [ ] Las acciones en proceso evitan envíos o cambios duplicados.
- [ ] Las versiones móvil y escritorio conservan el mismo contenido y propósito.
- [ ] Los bocetos no incluyen funcionalidades fuera del MVP.

## 14. Elementos que no se deben diseñar para el MVP

- Pago en línea, datos de tarjeta o comprobantes de pago.
- Inicio de sesión o registro de clientes.
- Seguimiento público de solicitudes mediante código.
- Módulo independiente de clientes o historial consolidado de compras.
- Dirección y barrio en el formulario web.
- Costos internos de productos.
- Facturación, contabilidad o cuentas por cobrar.
- Reseñas, favoritos, fidelización o chat interno.
- Reportes de ventas, ingresos o productos más vendidos.
- Gestión profesional de movimientos de almacén.
- Multiemprendimiento, precios mayoristas o proveedores completos.
- Recomendador con inteligencia artificial o quiz de fragancias.
- Código QR dentro del sitio para abrir el mismo sitio.

## 15. Elementos opcionales que deben mantenerse separados

Estos marcos pueden prepararse en la página `08 - Opcionales SHOULD` de Figma, pero no deben confundirse con la entrega base:

- Resumen administrativo.
- Varias imágenes y orden de galería.
- Precio promocional.
- Filtros por género, marca y precio.
- Ordenamiento del catálogo.
- Persistencia local del carrito.
- Familia olfativa.
- Explicación pública de Original, 1.1 e Inspiración, después de validar sus definiciones.
- Contenido ampliado de inicio y contacto.
- Configuración editable de redes y WhatsApp, con prioridad COULD.
