# Sistema visual de ESENCIALES

**Estado:** decisiones visuales aprobadas para el MVP.

**Fecha de aprobación:** 25 de septiembre de 2026.

## 1. Propósito y alcance

Este documento es la fuente principal para diseñar y revisar la interfaz compartida del catálogo público y la administración de ESENCIALES. Define identidad aplicada, tokens, composición, componentes, estados, responsive y accesibilidad.

No modifica el alcance funcional. Las pantallas y recorridos se definen en la [guía de wireframes](wireframe-guide.md); los comportamientos obligatorios, en [requisitos](requirements.md), [reglas de negocio](business-rules.md) y [actores y flujos](actors-and-flows.md). Si una mejora visual exige nueva lógica de negocio, debe registrarse primero como propuesta y validarse antes de tratarse como requisito.

Los wireframes y mockups existentes son referencias de estructura y flujo, no especificaciones visuales. La apariencia provisional del frontend tampoco constituye un patrón que deba preservarse.

## 2. Principios y dirección visual

La dirección aprobada es **perfumería boutique clara con anclas oscuras**.

**Tesis visual:** una perfumería boutique cercana y ordenada, con fotografías protagonistas, negro como ancla de marca, superficies funcionales blancas y oro contenido.

Principios:

1. La claridad, la tarea y el funcionamiento prevalecen sobre la decoración.
2. Las fotografías expresan el producto; la interfaz les proporciona orden y contexto.
3. El negro aporta contraste y ancla la marca; no domina todas las superficies.
4. El dorado se usa de forma selectiva para identidad, énfasis y selección.
5. El espacio y la jerarquía sustituyen adornos, tarjetas y sombras innecesarias.
6. La interfaz debe sentirse elegante, moderna y cercana, no ostentosa ni genérica.
7. Todo patrón debe funcionar con teclado, tacto, puntero, zoom y texto ampliado.
8. El blanco es la superficie funcional principal. El marfil o blanco cálido es un recurso opcional y puntual, nunca un fondo base obligatorio ni un marco permanente alrededor de las pantallas.

## 3. Catálogo público y administración

Ambas áreas comparten colores, tipografía, espaciado, controles, estados y comportamiento accesible. Deben reconocerse como partes del mismo producto.

### Catálogo público

- Usa más espacio, fotografía y composición de marca.
- Puede incorporar bloques negros puntuales para identidad o llamados principales.
- Prioriza descubrir productos, entender precio y disponibilidad y avanzar hacia la solicitud.
- Evita información administrativa, decoración competitiva y rutas de compra falsas.

### Administración

- Usa superficies claras, densidad moderada y acentos de marca discretos.
- Prioriza exploración rápida, comparación, edición y estado operativo.
- En escritorio puede utilizar navegación lateral; en móvil, encabezado y panel de navegación.
- Las tablas se conservan cuando facilitan comparar columnas y se transforman en listas estructuradas cuando el ancho no permite leerlas.

## 4. Logo y uso de marca

El archivo vigente es el [logo oficial](../sources/logo_esenciales.jpg). Debe utilizarse sin sustituirlo por estrellas, símbolos improvisados ni texto en una fuente cursiva aproximada.

- Conservar proporciones y evitar deformación, recorte o recoloración arbitraria.
- No separar ni reconstruir el lettering, isotipo o eslogan.
- Sobre fondos incompatibles, ubicar la versión disponible dentro de una superficie negra suficiente, sin añadir marcos decorativos.
- Proporcionar texto alternativo según el contexto: `ESENCIALES` cuando identifica la marca y alternativa vacía cuando repite un nombre visible adyacente.
- El logo no reemplaza el título de la página ni otros textos que deban ser HTML.

Siguen pendientes del propietario un archivo vectorial, versiones horizontal, reducida y monocromática, y reglas oficiales de tamaño mínimo y área de protección. Hasta disponer de ellas, no deben inventarse variantes.

## 5. Color

Los nombres propuestos pueden trasladarse posteriormente a CSS custom properties. Los valores son decisiones vigentes del sistema visual.

### Marca y superficies

| Token | Valor | Uso |
| --- | --- | --- |
| `--color-brand-black` | `#000000` | Marca, CTA principal, bloques oscuros |
| `--color-brand-gold` | `#D4AF37` | Acento de marca y superficies oscuras |
| `--color-brand-gold-light` | `#FFDF73` | Brillo o detalle sobre negro; no texto sobre claro |
| `--color-brand-bronze` | `#765C00` | Texto, foco y énfasis de marca sobre superficies claras |
| `--color-ink` | `#17140F` | Texto principal |
| `--color-text-muted` | `#5F574C` | Texto secundario |
| `--color-surface-page` | `#FFFFFF` | Fondo principal de páginas y áreas funcionales |
| `--color-surface` | `#FFFFFF` | Formularios, tablas y contenido elevado |
| `--color-surface-subtle` | `#F5F5F5` | Agrupación suave, esqueletos, estados secundarios y fondos de imagen |
| `--color-surface-warm` | `#FFF9EE` | Recurso cálido opcional y puntual; no usar como base o marco permanente |
| `--color-border` | `#DEDEDE` | Separadores decorativos y límites no interactivos |
| `--color-border-strong` | `#737373` | Controles y límites que deben percibirse |

Combinaciones verificadas:

- `#D4AF37` sobre `#000000`: `9.99:1`.
- `#D4AF37` sobre `#FFFFFF`: `2.1:1`; no cumple para texto o límites significativos.
- `#765C00` sobre `#FFFFFF`: `6.36:1`.
- `#17140F` sobre `#FFFFFF`: `18.37:1`.
- `#5F574C` sobre `#FFFFFF`: `7.11:1`.
- `#737373` sobre `#FFFFFF`: `4.74:1`.

El CTA principal predeterminado usa negro con texto blanco. Un botón dorado puede utilizar fondo `#D4AF37` y texto negro cuando la composición requiera mayor presencia de marca. El dorado no debe convertirse en color predeterminado para todos los controles.

Las superficies exteriores no deben crear un borde decorativo permanente alrededor de la aplicación. Los grises claros se reservan para jerarquía, separación o estados secundarios. Una superficie cálida solo se incorpora cuando su aporte sea deliberado y local, sin desplazar al blanco como base funcional.

### Colores semánticos

| Semántica | Texto, borde e icono | Fondo | Contraste comprobado |
| --- | --- | --- | --- |
| Éxito, `--color-success` | `#166534` | `#F0FDF4`, `--color-success-bg` | `6.81:1` |
| Advertencia, `--color-warning` | `#854D0E` | `#FFFBEB`, `--color-warning-bg` | `6.61:1` |
| Error, `--color-error` | `#991B1B` | `#FEF2F2`, `--color-error-bg` | `7.6:1` |
| Información, `--color-info` | `#1E40AF` | `#EFF6FF`, `--color-info-bg` | `8.01:1` |
| Neutral, `--color-neutral` | `#4B5563` | `#F3F4F6`, `--color-neutral-bg` | `6.87:1` |

Estos pares orientan texto y fondo. Bordes, iconos, foco y estados interactivos deben verificarse en su combinación renderizada. Ningún estado se comunica solo mediante color: siempre requiere texto y, cuando aporte claridad, icono.

## 6. Tipografía y jerarquía

La familia principal es **Source Sans 3**. Es una sans-serif legible, adecuada para texto, precios, formularios y tablas, dispone de varios pesos y mantiene claridad en tamaños compactos. Debe incorporarse preferentemente como archivo web optimizado y alojado por el proyecto; no requiere una librería de interfaz.

Fallbacks:

```css
font-family: "Source Sans 3", "Segoe UI", Arial, sans-serif;
```

No se introduce una segunda familia. El lettering manuscrito pertenece exclusivamente al logo.

Escala base sugerida:

| Token | Tamaño | Uso |
| --- | --- | --- |
| `--text-xs` | `0.75rem` | Metadatos secundarios, con uso restringido |
| `--text-sm` | `0.875rem` | Ayudas, filtros y tablas |
| `--text-md` | `1rem` | Texto y controles |
| `--text-lg` | `1.125rem` | Énfasis y subtítulos |
| `--text-xl` | `1.5rem` | Títulos de sección |
| `--text-2xl` | `2rem` | Título principal compacto |
| `--text-display` | `clamp(2.25rem, 5vw, 3.5rem)` | Portada pública |

- Texto general: peso `400`, interlineado entre `1.5` y `1.65`.
- Controles y subtítulos: peso `600`.
- Títulos y cifras clave: peso `700` cuando sea necesario.
- Evitar texto funcional inferior a `0.875rem`; `0.75rem` se reserva para metadatos no esenciales.
- Mantener líneas de lectura aproximadamente entre 45 y 75 caracteres.

## 7. Espaciado, radios, bordes y sombras

Escala espacial:

| Token | Valor |
| --- | --- |
| `--space-1` | `0.25rem` |
| `--space-2` | `0.5rem` |
| `--space-3` | `0.75rem` |
| `--space-4` | `1rem` |
| `--space-6` | `1.5rem` |
| `--space-8` | `2rem` |
| `--space-12` | `3rem` |
| `--space-16` | `4rem` |

El catálogo usa normalmente separaciones de `--space-6` a `--space-16`; la administración, de `--space-3` a `--space-8` según densidad.

| Token | Valor | Uso |
| --- | --- | --- |
| `--radius-sm` | `0.25rem` | Etiquetas y elementos compactos |
| `--radius-md` | `0.5rem` | Campos y botones |
| `--radius-lg` | `0.75rem` | Tarjetas y paneles justificados |
| `--radius-round` | `999px` | Solo indicadores breves o controles circulares |

- Bordes ordinarios: `1px`; selección destacada: `2px` sin cambiar el tamaño exterior.
- Sombra baja: `0 1px 2px rgb(23 20 15 / 8%)`.
- Sombra elevada: `0 8px 24px rgb(23 20 15 / 12%)`, reservada para diálogos, drawers o elementos realmente superpuestos.
- No envolver cada sección en una tarjeta. Fondo, espacio, borde o encabezado pueden establecer jerarquía sin contenedor elevado.

## 8. Fotografías e imágenes

- Las imágenes públicas de producto usan una caja `4 / 5`, adecuada para botellas y presentaciones verticales.
- La imagen principal de detalle conserva `4 / 5` y puede crecer sin superar un ancho que desplace la información esencial.
- Las miniaturas administrativas pueden usar `1 / 1` para mantener listados compactos.
- Usar `object-fit: contain` y posición centrada para no recortar el producto.
- Usar `--color-surface-subtle` o blanco como fondo. Evitar filtros, degradados o efectos que alteren el color real.
- Reservar dimensiones antes de cargar para evitar saltos de layout.
- Proporcionar texto alternativo que identifique el producto cuando la imagen sea informativa.
- Imagen faltante: mostrar un bloque neutral con icono SVG simple y texto `Imagen no disponible`.
- Fallo de carga: sustituir la imagen por el mismo estado neutral; no dejar icono roto del navegador.
- En móvil la imagen ocupa el ancho disponible sin forzar alturas fijas; en escritorio se integra en la cuadrícula manteniendo su proporción.
- Optimización, formatos y tamaños de archivo se definirán durante la implementación y deberán medirse, no suponerse.

## 9. Layouts y responsive

El sistema es mobile-first y responde al espacio disponible. Las referencias `390 × 844`, `768 × 1024` y `1440 × 900` son tamaños de verificación, no nombres de dispositivo ni garantía suficiente de adaptación.

Puntos iniciales para probar el cambio de composición:

- `40rem`: contenido que puede pasar de una a dos columnas si conserva legibilidad.
- `64rem`: navegación pública expandida, filtros laterales o navegación administrativa persistente cuando realmente caben.

Estos valores pueden ajustarse durante la verificación renderizada si el contenido demuestra otra necesidad.

- Contenedor público: ancho máximo orientativo de `75rem`, centrado y con margen lateral fluido.
- Formularios de una tarea: ancho legible entre `28rem` y `42rem` según contenido.
- Navegación pública móvil: identidad, carrito siempre visible y menú para enlaces secundarios.
- Catálogo móvil: buscador visible; filtros y ordenamiento en panel; cuadrícula de una o dos columnas según el ancho real de la tarjeta.
- Detalle móvil: imagen, información, presentación, cantidad y CTA en orden de lectura.
- Formularios: una columna en anchos estrechos; dos columnas solo para campos relacionados y suficientemente amplios.
- Tablas: mantener tabla accesible cuando permita comparación; usar lista de registros en móvil, sin ocultar datos o acciones esenciales.
- Acciones: las principales pueden ocupar todo el ancho en móvil; las destructivas deben quedar separadas de las seguras.
- Administración móvil: encabezado y drawer; escritorio: navegación lateral y área de trabajo flexible.
- No usar desplazamiento horizontal para resolver formularios o navegación. Una tabla genuinamente ancha puede usar una región desplazable identificada si no existe representación mejor.

## 10. Navegación

### Pública

- Base: `Inicio`, `Catálogo` y `Carrito`.
- El carrito permanece visible y comunica su cantidad de forma consistente.
- El enlace activo se identifica con texto, peso o borde además del color.
- Contacto, redes y WhatsApp general solo aparecen cuando su contenido sea confirmado.
- WhatsApp no se convierte en botón flotante obligatorio: el flujo confirmado lo ofrece después de registrar la solicitud.

### Administrativa

- Base: `Categorías`, `Productos`, `Inventario`, `Solicitudes` y `Cerrar sesión`.
- `Resumen` se añade únicamente si se implementa su prioridad SHOULD.
- Escritorio: navegación lateral y encabezado contextual.
- Móvil: menú accesible que conserva el título y las acciones relevantes.
- El cierre de sesión debe distinguirse de la navegación ordinaria sin presentarse como acción destructiva alarmante.

## 11. Componentes y variantes

El MVP necesita un conjunto pequeño:

### Botones y enlaces

- Variantes: primario negro, secundario con borde, marca dorado, textual y destructivo.
- Estados: `hover`, `focus-visible`, `active`, `disabled` y `busy`.
- Una pantalla debe tener una acción principal evidente; no todos los botones compiten con el mismo peso.
- Un botón ocupado conserva su ancho, impide envíos duplicados y comunica progreso.

### Campos y controles

- Incluyen etiqueta visible, control, ayuda opcional y espacio estable para error.
- Variantes: normal, foco, completado, error, deshabilitado y solo lectura.
- Placeholder no reemplaza la etiqueta.
- Agrupar opciones relacionadas con `fieldset` y `legend` cuando corresponda.
- Los campos de contraseña usan una acción nativa de botón integrada al extremo del control, con iconos SVG simples de ojo y ojo tachado según el estado. Debe reservarse espacio para que no cubra el texto, mantener un objetivo mínimo de `44 × 44px`, foco visible y nombre accesible dinámico `Mostrar contraseña` u `Ocultar contraseña`; el icono es decorativo para tecnologías de asistencia.

### Tarjeta de producto

- Imagen, nombre, precio o `Desde $X`, disponibilidad textual y acción clara para abrir el detalle.
- La tarjeta completa puede ser navegable solo si mantiene semántica y no contiene controles interactivos anidados.
- Estados: normal, foco, imagen ausente y producto no solicitable. No requiere sombra elevada por defecto.

### Indicador de estado

- Combina texto con color y, cuando aporte, icono.
- Usa forma compacta; las cápsulas se reservan para etiquetas breves.
- Estados de catálogo y solicitud usan exactamente la terminología del dominio.

### Alertas y mensajes

- Variantes: información, éxito, advertencia y error.
- Mensajes relacionados con un campo o sección aparecen cerca de ese contexto.
- Una notificación temporal puede complementar, nunca sustituir, una confirmación importante.

### Diálogos y paneles

- Solo para confirmaciones, filtros móviles o tareas breves que no justifican una página.
- Deben tener título, acción principal, cancelar/cerrar, foco inicial deliberado, trampa de foco y devolución de foco.
- Las acciones irreversibles o de impacto requieren explicación concreta.

### Controles de cantidad

- Incluyen disminuir, valor editable o legible y aumentar.
- Deben comunicar mínimo, máximo, stock y error sin depender de deshabilitar silenciosamente.
- Cada control conserva nombre accesible asociado al producto y presentación.

### Elementos administrativos

- Barra de página con título y acción principal.
- Filtros y búsqueda solo donde estén respaldados por la guía.
- Tabla o lista de registros, menú de acciones, formulario y resumen de estado.
- No crear paneles de métricas, gráficas o tarjetas de dashboard fuera de la prioridad aprobada.

### Iconografía

- SVG simples con trazo o relleno coherente.
- Iconos decorativos se ocultan de tecnologías de asistencia.
- Botones solo con icono requieren nombre accesible y tamaño táctil suficiente.
- No usar emojis, caracteres improvisados ni una dependencia externa solo para iconos.

## 12. Estados visuales e interacción

Los controles relevantes deben diseñar `hover`, `focus-visible`, `active`, `selected`, `disabled`, `busy`, `error` y `success`.

- `hover` refuerza la disponibilidad sin ser el único indicador.
- `focus-visible` usa contorno de al menos `3px`, preferentemente `--color-brand-bronze` sobre superficies claras y `--color-brand-gold-light` sobre superficies negras, con separación suficiente del componente.
- `active` comunica la pulsación sin desplazar contenido.
- `selected` combina borde, superficie y estado programático.
- `disabled` se usa solo cuando la acción no es válida; debe seguir siendo comprensible.
- `busy` bloquea duplicados, comunica progreso y conserva el contenido recuperable.
- `error` explica qué ocurrió y cómo corregirlo.
- `success` solo aparece después de confirmar el resultado real.

## 13. Estados de datos y operaciones

Cada vista implementa únicamente los estados que le correspondan, tomando como catálogo común:

- `Inicial`: estructura lista para interactuar.
- `Cargando`: esqueleto o progreso sin datos inventados y sin saltos grandes.
- `Cargado`: datos y acciones disponibles.
- `Vacío`: la consulta funcionó, pero no existen registros.
- `Sin resultados`: existen registros, pero ningún filtro coincide; mostrar filtros activos y permitir limpiarlos.
- `Error`: no fue posible consultar o guardar; preservar datos recuperables y ofrecer reintento seguro.
- `Validación`: errores específicos asociados a campos o líneas y foco en el primer error relevante.
- `Procesando`: evitar duplicados y anunciar progreso.
- `Éxito`: confirmar el resultado real y ofrecer el siguiente paso.
- `Conflicto`: explicar cambios de precio, stock, disponibilidad o estado y permitir corregir.
- `No encontrado`: explicar que el recurso no existe o dejó de publicarse.
- `Sesión vencida`: proteger información, informar y volver al acceso.

Los estados completos por pantalla permanecen en la [guía de wireframes](wireframe-guide.md).

## 14. Accesibilidad

WCAG 2.2 nivel AA es la línea base.

- Preferir HTML semántico antes que ARIA.
- Mantener orden de lectura, visual y de foco coherentes.
- Operar toda función con teclado y sin trampas de foco.
- Proporcionar foco visible con contraste suficiente.
- Asociar etiquetas, instrucciones, unidades y errores con cada control.
- Anunciar resultados asincrónicos relevantes sin mover foco innecesariamente.
- Cumplir contraste mínimo `4.5:1` para texto normal, `3:1` para texto grande y los requisitos aplicables de contraste no textual.
- No comunicar disponibilidad, validación, selección o estado solo con color.
- Soportar zoom y texto al `200%` sin perder contenido o funcionalidad.
- Cumplir objetivos de puntero de al menos `24 × 24px`; preferir `44 × 44px` para acciones frecuentes, táctiles o riesgosas cuando el layout lo permita.
- Evitar contenido esencial disponible solo mediante hover.
- Devolver el foco al cerrar diálogos, drawers y superposiciones.
- Proporcionar un enlace para saltar la navegación repetida.
- Verificar teclado, lector de pantalla, zoom, reflow, contraste y puntero táctil en los flujos principales antes de declarar conformidad.

## 15. Movimiento

- Usar transiciones breves, aproximadamente entre `120ms` y `200ms`, para foco visual, apertura, cierre y feedback.
- Preferir cambios de opacidad o transformación que no provoquen relayout innecesario.
- No usar parallax, carruseles automáticos, scroll secuestrado, preloader decorativo ni animaciones grandes.
- Respetar `prefers-reduced-motion` eliminando movimiento no esencial sin ocultar cambios de estado.
- No depender de animación para comunicar información.

## 16. Terminología visual

- Usar `ESENCIALES` para la empresa en contextos formales y el archivo oficial para la marca gráfica.
- Usar `Productos destacados`, nunca `Más vendidos`.
- Usar `Solicitud de compra`, `Solicitud registrada` y `Código de solicitud`; no afirmar `Compra realizada`, `Venta realizada` o `Pago completado`.
- Usar `Valor total de productos`, separado de domicilio o envío.
- Disponibilidad: `Disponible`, `Bajo pedido`, `Agotado` y `No disponible`.
- Solicitudes: `Nueva`, `Confirmada`, `Entregada` y `Cancelada`.
- En acciones administrativas, describir el resultado: `Desactivar categoría`, `Confirmar solicitud` o `Marcar como entregada`.

## 17. Pendientes reales

No quedan decisiones visuales bloqueantes para comenzar la adaptación del frontend. Permanecen pendientes activos y contenido externo al sistema:

- Obtener del propietario versiones vectorial, horizontal, reducida y monocromática del logo y sus reglas oficiales de uso.
- Recopilar y revisar fotografías reales de productos.
- Confirmar WhatsApp, contacto, entrega y envío antes de incorporarlos.
- Validar mediante implementación renderizada los puntos de quiebre y ajustes finos de densidad; esta comprobación no autoriza cambiar contenido o alcance.

## 18. Referencias

- [Identidad visual](visual-identity.md): origen y composición de la marca.
- [Guía de wireframes](wireframe-guide.md): pantallas, flujos, contenido y estados esperados.
- [Requisitos](requirements.md): requisitos funcionales y no funcionales.
- [Reglas de negocio](business-rules.md): disponibilidad, inventario, solicitudes y publicación.
- [Actores y flujos](actors-and-flows.md): recorridos del visitante y administrador.
- [Alcance funcional](functional-scope.md): prioridades y límites del MVP.
- [Logo oficial](../sources/logo_esenciales.jpg): activo de marca disponible.
- [`docs/wireframes/wireframes.html`](../wireframes/wireframes.html): referencia estructural de baja fidelidad.
- [`informe/03-diseno/`](../../informe/03-diseno/): evidencias y exportaciones de diseño, no fuente visual definitiva.
