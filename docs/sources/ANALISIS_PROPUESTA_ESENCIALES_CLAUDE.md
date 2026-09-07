# Análisis y Propuesta de Especificaciones — Catálogo Web de Esenciales

## 0. Cómo leer este documento

Ya tienen dos documentos de contexto muy sólidos (`CONTEXTO_PROYECTO_ESENCIALES.md` y `CONTEXTO_FUNCIONAL_ESENCIALES_MVP.md`). Este tercer documento no repite lo ya decidido, sino que:

- **Confirma y organiza** lo que ya está definido, cruzándolo con cómo lo resuelven otros negocios similares.
- **Agrega opiniones y propuestas nuevas** (diferenciadores, lógica de negocio adicional, estructura de menús, UX).

Para que quede claro qué es qué, uso estas etiquetas:

| Etiqueta | Significado |
|---|---|
| ✅ **Confirmado** | Ya está decidido en sus documentos de contexto. Lo resumo, no lo invento. |
| 💡 **Propuesta (provisional)** | Es mi recomendación. No está decidido — deben evaluarlo como equipo y, si aplica, validarlo con el profesor. |
| ⚠️ **Punto a decidir** | Requiere una decisión suya antes de poder documentarlo como requisito. |

---

## 1. Resumen ejecutivo

El proyecto ya tiene algo poco común en un trabajo de grado: un **caso de negocio real, con reglas reales** (variantes de presentación, "bajo pedido" vs "agotado", conservación del precio histórico, etc.). Eso es una fortaleza — no hay que diluirla agregando funcionalidades "porque quedan bien en el informe".

Mi recomendación general, después de revisar cómo resuelven este mismo problema otras herramientas (catálogos-con-WhatsApp genéricos) y otros negocios del mismo nicho (perfumería 1.1/originales en Colombia), es:

1. El **80% de las funcionalidades ya decididas por ustedes coinciden con lo que hacen las soluciones comerciales especializadas en esto** (catálogo sin checkout + botón WhatsApp). Van por buen camino.
2. El diferenciador real para el curso **no debería ser una funcionalidad más**, sino la calidad de la lógica de negocio (estados, inventario, historial de precios) — eso es lo que un catálogo genérico de WhatsApp Business *no* tiene y ustedes sí van a construir.
3. Para el emprendimiento, el diferenciador que más impacto tiene frente a la competencia de perfumería no es técnico, es de **confianza y orientación al cliente** (explicar qué es "1.1", ayudar a elegir fragancia). Esto sí conviene resolverlo con una funcionalidad simple.
4. El QR que mencionan es una buena idea, pero es un *canal de entrada*, no una funcionalidad aislada — lo detallo en la sección 9.

---

## 2. Benchmark: cómo resuelven esto otros

### 2.1 Herramientas genéricas de "catálogo + WhatsApp"

Revisé varias soluciones que existen específicamente para este problema (Pedix, Klink, CatálogoAR, catálogos hechos con WooCommerce en "modo catálogo", el catálogo nativo de WhatsApp Business). El patrón es consistente en todas:

- El catálogo **nunca cobra dentro del sitio**; el cierre de la venta pasa a WhatsApp, tal como ya decidieron.
- El **enlace del catálogo es el activo central**: va en la bio de Instagram/TikTok, en el estado de WhatsApp, y como QR impreso en el punto físico si lo hay. Esto valida su idea del QR.
- El error más común que señalan estas fuentes es tratar el catálogo como una página estática: **precios desactualizados o productos "agotados" mostrados como disponibles matan la confianza**. Esto refuerza por qué su regla de mantener inventario real (no solo disponible/agotado) es la decisión correcta.
- El catálogo de WhatsApp Business nativo (la alternativa "gratis" con la que suelen comparar) **no tiene carrito real, no filtra bien y no controla stock** — es exactamente lo que ustedes van a mejorar, y es un argumento fácil de usar en el informe técnico para justificar el proyecto frente a "¿por qué no usar solo WhatsApp Business?".

### 2.2 Competencia directa del nicho (perfumería 1.1 / originales en Colombia)

Revisé varias tiendas colombianas del mismo rubro (perfumes originales, 1.1 y "dupes"/inspirados). Patrones que se repiten y que sí conviene tener en cuenta:

- **Variantes con rango de precio visible en la tarjeta del producto** ("Desde $X"), y el precio exacto se define al elegir presentación — coincide con la decisión ya tomada de manejar presentaciones como variantes de un mismo producto.
- **Asesoría por WhatsApp para "elegir el perfume ideal"** aparece en casi todas como gancho de confianza — porque comprar fragancia sin poder olerla es la principal objeción de compra.
- **Explicación explícita de qué significa cada clasificación** (original / 1.1 / inspirado / decant) en un lugar visible, no escondida — porque es lo primero que un comprador nuevo pregunta y afecta la percepción de seriedad del negocio.
- Uso de **notas olfativas** (salida, corazón, fondo) como ficha técnica del producto en varias de estas tiendas.
- Secciones de **testimonios/reseñas** — está fuera de su alcance del MVP (ya lo decidieron así, y me parece correcto: agregarían autenticación de cliente o moderación, complejidad innecesaria para 8 semanas).

**Conclusión del benchmark:** ninguna de estas tiendas resuelve mejor que ustedes el problema operativo (inventario real, estados de solicitud, historial de precio). Donde sí les llevan ventaja es en **comunicación y confianza hacia el comprador nuevo** — ahí es donde recomiendo poner el esfuerzo diferenciador, no en agregar módulos.

---

## 3. Diferenciadores propuestos (priorizados)

💡 Todo lo de esta sección es provisional. Los ordené por relación esfuerzo/impacto, pensando en que **no** se trata de agregar funcionalidades sino de hacer bien pocas cosas que sí importan.

### Nivel 1 — Alto impacto, bajo esfuerzo (recomendado incluir en el MVP)

| Diferenciador | Por qué importa | Esfuerzo aproximado |
|---|---|---|
| **Sección fija "¿Qué significa Original / 1.1 / Inspiración?"** | Resuelve la primera duda de cualquier comprador nuevo; genera confianza sin necesidad de asesor humano. Es contenido estático, no lógica nueva. | Muy bajo (una página/sección) |
| **Ficha de notas olfativas por producto** (salida, corazón, fondo) — ya la mencionan como atributo posible | Diferencia un catálogo "de fotos y precio" de uno que asesora. Reutiliza el modelo de datos que ya definieron para el producto. | Bajo (2-3 campos de texto más en el producto) |
| **QR de acceso** (ver sección 9) | Puente entre punto físico/redes y el catálogo; fácil de sustentar como innovación aplicada. | Bajo (una librería de generación de QR + una ruta) |
| **Seguimiento de solicitud por código, sin cuenta** — ya lo tienen implícito con el código `ES-00125` | Permite que el cliente vuelva a consultar el estado de su pedido sin WhatsApp ni login. Cierra el ciclo del código que ya decidieron generar. | Bajo (una vista pública "Consultar mi solicitud") |

### Nivel 2 — Buen diferenciador, esfuerzo moderado (evaluar según tiempo disponible)

| Diferenciador | Por qué importa | Esfuerzo aproximado |
|---|---|---|
| **Filtro/quiz simple "¿Qué buscas?"** (fresco, dulce, amaderado, cítrico → mapea a familia olfativa) | Reemplaza parcialmente la asesoría humana que en la competencia depende de un vendedor por WhatsApp; funciona como filtro adicional, no como IA compleja. | Moderado (requiere clasificar cada producto por familia olfativa) |
| **Favoritos/lista de deseos local (sin cuenta, en el navegador)** | Le da al cliente una razón para volver sin forzar registro, que ya descartaron correctamente para el MVP. | Moderado (persistencia local + UI) |

### Nivel 3 — No recomendado para el MVP (dejarlo como evolución futura)

- Recomendador con IA generativa ("chatbot que recomienda fragancia"): interesante para el curso pero es fácil que se vuelva el centro del proyecto y desvíe tiempo de la base funcional. Si el profesor valora explícitamente el uso de IA aplicada, es mejor limitarlo a algo acotado (p. ej. generar automáticamente la descripción del producto a partir de notas olfativas) que a una funcionalidad cliente-facing nueva.
- Reseñas/calificaciones, programa de fidelización, multi-idioma: coincide con lo que ya excluyeron y confirmo que es correcto excluirlo.

⚠️ **Punto a decidir:** de los diferenciadores de Nivel 1, ¿cuáles entran al alcance formal del MVP y cuáles quedan como "mejora si sobra tiempo"? Sugiero fijarlo antes de escribir el informe técnico, para no describir como requisito algo que después no se sustenta.

---

## 4. Lógica de negocio — reglas adicionales propuestas

Ya tienen 9 reglas de negocio bien definidas (RN-01 a RN-09) que cubren disponibilidad, agotado, carrito válido, conservación de precio, bajo pedido, descuento de inventario, cancelación/restitución y eliminación lógica. Son sólidas y no las repito. Propongo complementarlas con:

- **RN-10 (propuesta) — Formato y unicidad del código de solicitud.** El código (`ES-00001`, `ES-00002`, ...) debe ser secuencial y único; debe generarse solo al confirmar la solicitud, no al abrir el carrito, para evitar huecos por carritos abandonados.
- **RN-11 (propuesta) — Concurrencia sobre inventario.** Si dos solicitudes distintas intentan confirmarse casi al mismo tiempo sobre la misma presentación con poco stock, el sistema debe validar la cantidad disponible *en el momento de confirmar* (no solo al agregar al carrito), para no descontar inventario en negativo. Esto es más importante en su caso que en un e-commerce grande porque manejan cantidades reales bajas (a veces 1-3 unidades).
- **RN-12 (propuesta) — Solicitudes sin gestionar por mucho tiempo.** Definir (aunque sea como regla visual en el dashboard, no automática) qué se considera una solicitud "Nueva" que lleva demasiado tiempo sin atender, para que el administrador no la pierda de vista. No implica cancelación automática, solo alerta visual.
- **RN-13 (propuesta) — Presentación agotada vs producto agotado.** Ya decidieron que las presentaciones tienen stock propio; conviene dejar explícito que un producto puede seguir "Disponible" en general aunque una presentación puntual (p. ej. 1oz) esté agotada — el catálogo debe reflejar eso por presentación, no solo por producto.

⚠️ **Punto a decidir:** confirmar si estas reglas adicionales aplican o si prefieren mantener el alcance exactamente en las 9 ya aceptadas (también es una decisión válida — menos reglas, menos superficie que sustentar).

---

## 5. Modelo de datos preliminar

💡 Propuesta basada en las entidades que ya se desprenden de sus decisiones (productos con variantes, categorías, solicitudes con detalle, estados). La presento para que sirva de punto de partida al diagrama entidad-relación del informe.

**Entidades principales:**

- **Usuario_Admin**: credenciales, rol (si aplica un segundo rol más adelante).
- **Categoria**: nombre, descripción.
- **Producto**: nombre, descripción, marca, género, familia olfativa, notas (salida/corazón/fondo), tipo comercial (original / 1.1 / inspiración — según lo que finalmente use Esenciales), categoría (FK), estado (activo/inactivo), destacado (bool), fecha de creación.
- **Presentacion** (variante del producto): producto (FK), tamaño/mililitros, precio, precio promocional (opcional), cantidad disponible, estado de disponibilidad (disponible / bajo pedido / agotado).
- **ImagenProducto**: producto (FK), url/ruta, orden.
- **Solicitud**: código único, nombre del cliente, teléfono, ciudad (opcional), observación (opcional), estado (nueva / confirmada / entregada / cancelada), total, fecha.
- **DetalleSolicitud**: solicitud (FK), presentación (FK), cantidad, **precio unitario congelado al momento de la solicitud** (aplica directamente su RN-04).

**Relaciones clave:**

```
Categoria 1---N Producto
Producto  1---N Presentacion
Producto  1---N ImagenProducto
Solicitud 1---N DetalleSolicitud
DetalleSolicitud N---1 Presentacion
```

Esto cumple de forma natural el criterio académico de "modelo de datos con varias entidades y relaciones", sin inventar entidades que no van a usar (por ejemplo, no propongo tabla de "Proveedores" porque ya decidieron que no manejarán proveedores en el MVP).

---

## 6. Roles y permisos

✅ Ya tienen claro que, funcionalmente, un único rol (Administrador/propietario) es suficiente para el negocio real, y que un segundo rol ("Colaborador") solo debería agregarse si el profesor exige explícitamente dos roles autenticados con permisos distintos.

💡 Si terminan necesitando el segundo rol solo por el requisito académico, mi recomendación es que sea **el mínimo viable**: Colaborador puede ver y actualizar inventario/solicitudes, pero no puede crear/eliminar categorías ni ver ninguna sección de configuración. Así el segundo rol demuestra el concepto de permisos diferenciados sin construir un sistema de permisos complejo (que ya descartaron correctamente para el MVP).

---

## 7. Estructura de menús (arquitectura de información)

💡 Propuesta de navegación, pensada para que el sitio público tenga pocos clics entre "llegar" y "generar solicitud", y para que el panel admin refleje el flujo operativo real del negocio.

### 7.1 Sitio público (mobile-first)

```
Inicio
 ├─ Banner + botón "Ver catálogo"
 ├─ Categorías (accesos rápidos)
 ├─ Destacados / Promociones (si aplica)
 └─ Sobre Esenciales + redes

Catálogo
 ├─ Buscador + filtros (categoría, género, marca, precio, disponibilidad)
 └─ Grid de productos → Detalle de producto
                          ├─ Notas olfativas / clasificación (original·1.1·inspirado)
                          ├─ Selector de presentación (precio y stock cambian según elección)
                          └─ Agregar al carrito

Carrito (persistente en el navegador)
 └─ Datos del cliente (nombre, teléfono; ciudad y observación opcionales)
     └─ Generar solicitud → código + redirección a WhatsApp

Consultar mi solicitud (por código)   ← nueva, ver sección 3

Sobre Esenciales / Contacto
```

Nota de navegación: el botón flotante de WhatsApp (ya decidido) debe estar visible en *todas* las pantallas del sitio público, no solo en el carrito — es el canal de salida para dudas antes de comprar, no solo para cerrar la venta.

### 7.2 Panel administrativo

```
Login
Dashboard
 ├─ Solicitudes nuevas / pendientes
 ├─ Productos agotados
 ├─ Productos con pocas unidades (≤3)
 └─ Total de productos registrados

Productos
 ├─ Listado (con filtro por categoría/estado)
 ├─ Crear/editar producto
 │   ├─ Datos generales (nombre, descripción, marca, género, notas)
 │   └─ Presentaciones (precio, stock, disponibilidad por variante)
 └─ Imágenes

Categorías
 └─ CRUD simple

Solicitudes
 ├─ Listado por estado (nueva/confirmada/entregada/cancelada)
 └─ Detalle → cambiar estado (dispara descuento/restitución de inventario)

Configuración (opcional, si el tiempo lo permite)
 └─ Número de WhatsApp, textos del banner, redes sociales
```

Mantener el panel a **estos cinco puntos de menú** (Dashboard, Productos, Categorías, Solicitudes, Configuración) evita que el admin se sienta como un sistema empresarial pesado — coincide con lo que ya pidieron: sencillo pero completo.

---

## 8. Principios de UX/UI (simplicidad e intuición)

💡 Con la identidad visual que ya tienen definida (negro, blanco, dorado, gris — estética elegante/premium), algunas recomendaciones concretas:

1. **Máximo 3 pasos entre "ver un producto" y "llegar a WhatsApp"**: detalle → carrito → datos + enviar. Cada paso extra es una venta que se enfría (patrón que se repite en el benchmark).
2. **Jerarquía visual simple:** foto grande, nombre, precio, estado de disponibilidad (con color: verde disponible, ámbar bajo pedido, gris agotado) — sin sobrecargar la tarjeta de producto con más de 4-5 datos.
3. **Dorado como acento, no como color base**: en un catálogo con muchas fotos de producto, el dorado funciona mejor reservado para botones de acción ("Agregar al carrito", "Generar solicitud") y detalles, para que no compita visualmente con las fotos.
4. **Tipografía:** una serif o serif-display discreta para títulos (refuerza "premium"), sans-serif para el resto (legibilidad en móvil). Evitar más de dos familias tipográficas.
5. **Estados de disponibilidad siempre visibles, nunca solo en el detalle**: que se vean también en el grid del catálogo, para no hacer perder tiempo al cliente entrando a un producto agotado.
6. **El mensaje de WhatsApp pre-armado debe ser editable** antes de enviarse (WhatsApp permite esto por defecto al abrir con texto prellenado) — así el cliente siente que tiene control, no que un sistema "decide por él" lo que va a decir.

---

## 9. QR de acceso — especificación funcional

💡 Es una buena adición, y encaja bien con lo que ya identificaron: el enlace del catálogo debe estar en todos los canales (Instagram, TikTok, estado de WhatsApp) — el QR es la versión física de ese mismo enlace. Propuesta concreta:

- **Qué hace:** apunta al mismo enlace público del catálogo (`Inicio` o `Catálogo`, a decidir). No requiere lógica de backend nueva más allá de generar la imagen del QR.
- **Dónde se usaría en la práctica:** empaques o tarjetas físicas de Esenciales, posible punto de venta físico si lo hay, historias/publicaciones de Instagram y TikTok, y como imagen en el propio sitio (por ejemplo en "Contacto") para que alguien lo escanee desde otro dispositivo.
- **Variante con valor real (opcional, bajo esfuerzo):** un QR distinto por canal (uno para empaques, otro para redes) usando un parámetro en la URL (`?origen=empaque`, `?origen=instagram`). Esto no cambia la experiencia del cliente, pero les permite —sin necesidad de Google Analytics ni herramientas externas— saber desde el propio backend cuántas solicitudes se originaron en cada canal, simplemente registrando ese parámetro en la solicitud. Es un argumento fuerte para el informe técnico ("medimos el impacto real del canal físico vs digital") y para el emprendimiento (decidir dónde invertir en marketing).
- **Esfuerzo:** generar el QR es una librería estándar (del lado del servidor o incluso client-side); el parámetro de origen es un campo adicional en `Solicitud`. No amerita una sección de menú propia — puede vivir como una imagen descargable en "Configuración" o "Contacto" del panel admin.

⚠️ **Punto a decidir:** si quieren la variante con parámetro de origen (recomendada, bajo costo y con valor real de negocio) o solo el QR simple.

---

## 10. Alineación con el curso (brochure de 64 horas)

El stack que enseña el curso es HTML5 + CSS3 + JavaScript + Git/GitHub + Node.js/Express + despliegue (Netlify/Vercel/Fly.io). Esto encaja naturalmente con el alcance ya definido:

| Módulo del curso | Cómo se aplica al proyecto |
|---|---|
| M1 Proyectos | Definición de alcance (ya avanzada en sus documentos) |
| M2 HTML5 | Estructura semántica del catálogo público y formularios (solicitud) |
| M3 CSS3 | Identidad visual (negro/blanco/dorado), diseño responsivo mobile-first, tarjetas de producto |
| M4 JavaScript | Carrito persistente (localStorage), filtros/búsqueda, validaciones de formulario, generación del mensaje de WhatsApp |
| M5 Git/GitHub | Control de versiones del equipo de 3 personas |
| M6 Node.js/Express | API del catálogo, autenticación admin, endpoints de productos/categorías/solicitudes, lógica de inventario |
| M7 Integración Full Stack | Conexión frontend-backend, seguridad básica (validación de entradas, protección de rutas admin), despliegue |

No veo necesidad de un framework de frontend adicional (React/Vue) dado que el curso no lo cubre — JavaScript vanilla bien organizado es suficiente para el alcance que definieron, y reduce riesgo en 8 semanas con 3 personas.

⚠️ **Punto a decidir (técnico, no cubierto en el brochure):** motor de base de datos. El brochure no especifica uno. Dado el modelo de datos relativamente relacional (categorías → productos → presentaciones → solicitudes → detalle), una base de datos relacional simple (por ejemplo PostgreSQL o incluso SQLite/MySQL para simplificar el despliegue en 8 semanas) encaja mejor que una NoSQL. Esto lo dejo como punto abierto porque no vi que lo hayan decidido en sus documentos.

---

## 11. Qué queda fuera (confirmación)

✅ Repaso rápido de lo que ya excluyeron correctamente, sin cambios de mi parte: pasarela de pagos, registro/autenticación de clientes, favoritos con cuenta, reseñas, fidelización, facturación electrónica, contabilidad, integración avanzada con la API oficial de WhatsApp, multi-emprendimiento, precios mayoristas, sistema de proveedores, reportes financieros avanzados y movimientos de almacén profesionales. Todo esto coincide con el benchmark: ninguna herramienta de este tipo de nicho (catálogo-cotización, no e-commerce completo) lo incluye en su versión base.

---

## 12. Próximos pasos sugeridos

1. Decidir cuáles de los diferenciadores de Nivel 1 (sección 3) entran formalmente al alcance del MVP.
2. Confirmar con el profesor si exige dos roles autenticados (define si implementan "Colaborador").
3. Decidir el motor de base de datos (sección 10).
4. Decidir si el QR lleva parámetro de origen o es simple (sección 9).
5. Con esas decisiones tomadas, el siguiente documento natural sería el **listado de historias de usuario / requisitos funcionales numerados**, listo para convertirse en tareas del equipo repartidas por semana del curso.

---

*Documento generado como insumo de discusión para el equipo — todo lo marcado como 💡 o ⚠️ requiere su validación antes de tratarse como definitivo, en línea con el principio ya establecido en sus documentos de no fijar requisitos sin decisión explícita del grupo o del profesor.*
