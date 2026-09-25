# Bitácora del proyecto

## 2026-08-29

### Contexto

Inicialización documental del repositorio para el proyecto integrador Esenciales Catálogo Web.

### Decisiones / cambios

- Se creó la estructura documental inicial.
- Se incorporaron y verificaron las cuatro fuentes base originales en `docs/sources/`.
- La arquitectura y los requisitos definitivos permanecen pendientes de validación.

### Pendientes

- Validar requisitos, alcance operativo, roles y reglas de negocio.
- Definir arquitectura solo cuando existan decisiones confirmadas.
- Registrar futuras instrucciones explícitas del profesor.

## 2026-08-29

### Contexto

Confirmación de tecnologías requeridas para el proyecto y del sistema gestor de base de datos.

### Decisiones / cambios

- Se confirma el uso de HTML5, CSS3, JavaScript, Node.js, Express y Git/GitHub, conforme a las tecnologías establecidas por el curso.
- Se acepta PostgreSQL como sistema gestor de base de datos del proyecto.

### Pendientes

- Definir únicamente las demás decisiones de arquitectura que se confirmen posteriormente.

## 2026-09-03

### Contexto

Consolidación y validación interna de la primera versión seria del alcance funcional del MVP de Esenciales.

### Decisiones / cambios

- Se aprueba por el equipo el alcance funcional MVP V1, sujeto a pendientes académicos, de negocio y técnicos expresamente identificados.
- Se aprueba el planteamiento del problema sobre la gestión del catálogo en Excel, el envío individual de numerosas fotografías por WhatsApp y la falta de un medio centralizado para administrar y consultar su información.
- Se reformulan la pregunta problema y el objetivo general para identificar expresamente a Esenciales como emprendimiento.
- Se reemplazan los objetivos específicos genéricos por tres resultados funcionales: administración del catálogo, catálogo público y solicitudes de compra, conforme a la retroalimentación del profesor.
- El sistema se organiza en ocho macrofuncionalidades para controlar el alcance.
- Se adopta `solicitud de compra` en lugar de `solicitud de cotización` para describir la intención del cliente sin implicar pago o venta concluida.
- Se definen productos, presentaciones, precios históricos, disponibilidad, inventario, carrito, solicitudes y estados administrativos.
- Se define `Productos destacados` como selección manual del administrador; no se afirmarán productos más vendidos a partir de fuentes externas.
- Se define Agotado como resultado automático del stock cero en venta inmediata y Bajo pedido con stock local vendible igual a cero.
- Se define el estado activo o inactivo de las presentaciones y la precedencia del resumen público `Disponible`, `Bajo pedido`, `Agotado` y `No disponible`.
- Se aprueban solicitudes mixtas, cantidades entre 1 y 99 y precios en COP sin decimales.
- Al confirmar se aplica el modo de disponibilidad vigente acordado por WhatsApp.
- Las cinco categorías iniciales quedan precargadas y pueden editarse o desactivarse.
- Se permite corregir datos del cliente, cantidades y retirar líneas existentes mientras una solicitud esté Nueva, sin agregar líneas ni cambiar presentaciones o precios; después de confirmada será inmutable.
- Se actualizan requisitos, reglas de negocio, actores, flujos y contexto vigente.
- Se confirma el frontend con HTML5, CSS3 y JavaScript sin framework adicional y se registra la decisión en ADR-002.

### Pendientes

- Confirmar con el profesor el límite de funcionalidades y la necesidad de un segundo rol autenticado.
- Validar con Esenciales las definiciones de `Original`, `1.1` e `Inspiración`.
- Confirmar contenido público, datos reales de productos y número de WhatsApp.
- Definir autenticación, imágenes, modelo lógico de PostgreSQL, transacciones y despliegue.

### Referencias

- [Alcance funcional MVP V1](../project/functional-scope.md).
- [Requisitos](../project/requirements.md).
- [Reglas de negocio](../project/business-rules.md).
- [ADR-002: Frontend sin framework adicional](../architecture/decisions/ADR-002-frontend-sin-framework.md).

## 2026-09-05

### Contexto

Aclaración del profesor sobre la estructura de la introducción y la secuencia metodológica de los objetivos específicos.

### Decisiones / cambios

- Se conserva el objetivo general vigente.
- Se reformulan los objetivos específicos en tres etapas: diagnóstico, desarrollo funcional y validación.
- Se fusionan las etapas anteriores de diseño y construcción dentro del objetivo de desarrollo.
- Se completa la introducción con la pregunta problema bajo encabezado propio, la justificación aplicada y académica, el alcance, la delimitación y la estructura del informe.
- Se evita presentar como resultados los beneficios esperados de una aplicación que todavía no ha sido implementada.
- Se ajusta la introducción como texto continuo, con la pregunta problema en un párrafo independiente y sin subtítulos internos.

### Referencias

- [Borrador del informe académico](../academic/report/REPORT_DRAFT.md).

- [Instrucciones del profesor](../academic/professor-instructions.md).

## 2026-09-05

### Contexto

Inicio de la preparación técnica para implementar el MVP de Esenciales de manera incremental.

### Decisiones / cambios

- Se confirma una aplicación monolítica modular con Node.js y Express, que sirve el frontend estático y expone la API bajo `/api`.
- Se confirma el acceso a PostgreSQL con `pg` y SQL explícito, sin ORM.
- Se confirma la autenticación administrativa mediante sesiones de servidor y cookie segura.
- Se confirma el almacenamiento de imágenes de producto en un servicio externo; PostgreSQL conservará sus URL y metadatos.
- Se registran las decisiones en los ADR-003 a ADR-006.

### Pendientes

- Diseñar el modelo lógico de PostgreSQL y las transacciones de confirmación y cancelación.
- Elegir el proveedor de imágenes, el almacenamiento específico de sesiones y el proveedor de despliegue.
- Instalar PostgreSQL localmente antes de implementar la conexión.

### Referencias

- [Arquitectura](../architecture/overview.md).
- [Decisiones arquitectónicas](../architecture/decisions/README.md).

## 2026-09-05

### Contexto

Diseño inicial del modelo lógico de datos antes de crear la infraestructura de PostgreSQL y la aplicación Express.

### Decisiones / cambios

- Se documenta el modelo lógico propuesto para categorías, productos, presentaciones, imágenes, solicitudes, detalles, usuarios administrativos y sesiones.
- Se documentan las restricciones de precios, cantidades, stock, disponibilidad y conservación de precios históricos.
- Se describen las transacciones de registro, confirmación, cancelación y edición de solicitudes Nuevas.
- Se diferencian las garantías de PostgreSQL de las responsabilidades de Express.

### Pendientes

- Convertir y validar el diseño mediante migraciones SQL en PostgreSQL local.
- Resolver los tipos, índices y mecanismos SQL finales durante la implementación.

### Referencias

- [Modelo lógico de datos](../architecture/data-model.md).

## 2026-09-24

### Contexto

Materialización local del primer incremento de implementación: base de datos del catálogo.

### Decisiones / cambios

- Se materializó y validó localmente el núcleo PostgreSQL del catálogo mediante la migración `20260924000100_create_catalog_core.sql`, datos iniciales reproducibles y 95 pruebas pgTAP de estructura, integridad y seguridad cerrada.
- Se crearon `usuarios_administrativos`, `categorias`, `productos`, `presentaciones` e `imagenes_producto`, con relaciones, restricciones, índices y marcas de tiempo.
- Se precargaron las cinco categorías iniciales y se comprobó que el seed es idempotente.
- Se habilitó RLS y se revocaron los privilegios directos de `anon` y `authenticated`; las políticas de acceso permitidas y la autenticación administrativa permanecen para el siguiente incremento.
- Se cambiaron los puertos locales de Supabase al bloque `55320-55324` y `55329`, debido a una reserva de puertos de Windows que impedía utilizar el bloque predeterminado.

### Referencias

- [Migración inicial](../../supabase/migrations/20260924000100_create_catalog_core.sql).
- [Pruebas de base de datos](../../supabase/tests/database/).
- [Hoja de ruta de implementación](../development/mvp-implementation-roadmap.md).

### Contexto

Implementación local del segundo incremento: seguridad y autenticación administrativa.

### Decisiones / cambios

- Se agregó la migración `20260924000200_add_admin_auth_policies.sql`, con la función `es_administrador_activo()`, privilegios limitados y políticas RLS para las tablas del catálogo; `usuarios_administrativos` se mantiene cerrada para los roles de aplicación.
- Se configuró Auth local sin registro público, con invitación controlada, recuperación de contraseña por correo y Mailpit en el puerto `55324`.
- Se implementó el cliente mínimo de inicio de sesión, cierre, recuperación y verificación de autorización mediante RPC.
- Las pruebas pgTAP cubren administrador activo, no autorizado e inactivo; `npm test` pasó con 110 aserciones y `npm run build` compiló correctamente el 25 de septiembre de 2026.
- La validación visual manual de los flujos del cliente queda pendiente; la migración no se aplicó al proyecto remoto.

## 2026-09-21

### Contexto

El docente especifica la estructura de carpetas que debe ser visible en GitHub y la ubicacion de los entregables academicos existentes.

### Decisiones / cambios

- Se incorporan `api/`, `db/`, `ia/` e `informe/` y se conserva `supabase/` como unica ruta de backend, de acuerdo con la autorizacion vigente para sustituir Express.
- `informe/` organiza briefing, requisitos, diseno, arquitectura y evidencias sin reemplazar las fuentes de verdad mantenidas en `docs/`.
- El acta publica identifica a la persona entrevistada por su cargo y no por su nombre.
- Los wireframes y mockups de entrega se exportaran como PNG por pantalla; las previsualizaciones HTML locales quedan excluidas de Git.
- Los temporales y datos de vinculacion local de Supabase permanecen excluidos mediante `supabase/.gitignore`.

### Pendientes

- Incorporar los PNG reales de wireframes y mockups cuando sean revisados.
- Registrar el enlace compartido del prototipo de Figma.
- Crear el diagrama editable `arquitectura.drawio` y su exportacion `arquitectura.png`.
- Incorporar evidencias de pruebas, validacion y despliegue solo cuando existan.

### Referencias

- [Estructura de entregables](../../informe/README.md).
- [Registro de uso de IA](../../ia/README.md).
- [Contrato de servicios](../../api/README.md).
- [Base de datos](../../db/README.md).
- [Reglas de negocio](../project/business-rules.md).

## 2026-09-07

### Contexto

El profesor autorizó al equipo usar Supabase en sustitución de Express para agilizar la implementación del MVP.

### Decisiones / cambios

- Se adopta Supabase como plataforma de servicios de backend: PostgreSQL, Auth, Storage, RLS y funciones RPC.
- Se reemplazan las decisiones de monolito con Express, acceso mediante `pg` y sesiones propias; los ADR-003 a ADR-005 se conservan como registros reemplazados.
- Se conserva PostgreSQL, el frontend sin framework, el alcance funcional, el título, la pregunta problema y los objetivos.
- Se actualizan el modelo lógico para integrar `auth.users`, los requisitos técnicos, el contexto y las menciones arquitectónicas mínimas del informe académico.
- Se elimina el prototipo Express y se crea una base de frontend con Vite, HTML5, CSS3 y JavaScript sin framework.
- Se retiran las dependencias `express` y `nodemon`; Vite queda como dependencia de desarrollo y su compilación de producción se valida correctamente.
- Se instalan `@supabase/supabase-js` y la CLI de Supabase; el repositorio queda vinculado al proyecto remoto y se valida la API de autenticación.
- Se inicializa el entorno local de Supabase con Docker para probar migraciones y políticas antes de aplicarlas al proyecto remoto.

### Pendientes

- Definir y probar migraciones, políticas RLS, permisos de Storage y funciones RPC transaccionales.
- Definir el despliegue del cliente web.

### Referencias

- [Instrucción del profesor](../academic/professor-instructions.md).
- [ADR-007: Servicios de backend con Supabase](../architecture/decisions/ADR-007-servicios-backend-con-supabase.md).
- [Modelo lógico de datos](../architecture/data-model.md).

## 2026-09-09

### Contexto

Sincronización del borrador académico con la versión de informe técnico compartida por el equipo el 7 de septiembre de 2026.

### Decisiones / cambios

- Se incorporan al borrador un resumen, abstract y palabras clave coherentes con el estado verificable del proyecto.
- Se propone una metodología de investigación aplicada, alcance descriptivo y propositivo, Aprendizaje Basado en Proyectos y desarrollo iterativo e incremental, sin declarar la adopción de Scrum.
- Se reemplazan las afirmaciones no verificadas de implementación completa, pruebas, despliegue y resultados por el avance real y los planes pendientes.
- Se conserva el archivo Word en `docs/sources/` como fuente de contraste, sin modificarlo.

### Pendientes

- Ejecutar y registrar el diagnóstico, la implementación, las pruebas funcionales, la validación con Esenciales y el despliegue antes de redactar resultados y conclusiones definitivos.
- Incorporar únicamente técnicas metodológicas que se realicen y cuenten con evidencia.

### Referencias

- [Borrador del informe académico](../academic/report/REPORT_DRAFT.md).
- [Informe técnico entregado](../sources/README.md#informe-técnico-entregado).

## 2026-09-09

### Contexto

Precisión de las denominaciones del emprendimiento, proyecto e informe, y aplicación de una observación del profesor sobre la presentación de la pregunta problema.

### Decisiones / cambios

- Se mantiene como título formal: `Sistema web para la gestión y publicación del catálogo de productos de Esenciales`.
- Se define `Catálogo Web de Esenciales` como nombre corto del proyecto para sustentaciones, presentaciones y diagramas.
- Se conserva `esenciales-catalogo-web` como nombre técnico del repositorio y `Gestión del catálogo web de Esenciales` como titulillo del informe.
- Se aclara que `Esenciales` identifica al emprendimiento y no reemplaza el nombre del proyecto.
- Se añade el encabezado `Pregunta problema` al borrador académico para diferenciar visualmente la interrogante dentro de la introducción.

### Referencias

- [Visión general](../project/overview.md).
- [Borrador del informe académico](../academic/report/REPORT_DRAFT.md).
- [Instrucciones del profesor](../academic/professor-instructions.md).

## 2026-09-10

### Contexto

Revisión del informe técnico con los ajustes comunicados por la coordinadora de proyectos de grado.

### Decisiones / cambios

- Se reemplaza el título formal por `Sistema web para la gestión y publicación del catálogo de productos para la empresa ESENCIALES`.
- El informe utiliza `ESENCIALES` en mayúsculas y presenta la organización como empresa.
- Se reescriben el resumen y el abstract en tiempo presente, dentro del límite de 150 a 250 palabras, con objetivo, metodología, resultados verificables y una conclusión general.
- Se eliminan del resumen los detalles técnicos innecesarios y las expresiones sobre trabajo pendiente.
- Se revisa la coherencia de la introducción y se explicitan las tres etapas del proyecto: diagnóstico, desarrollo e integración, y validación y despliegue.
- El objetivo general se ajusta a la formulación `Desarrollar una aplicación web full stack que permita la gestión, publicación y consulta del catálogo de productos, precios y disponibilidad de la empresa ESENCIALES`.
- El primer objetivo específico comienza con `Identificar` y coordina en una sola proposición el proceso actual y sus dificultades, sin repetir `identificando`.
- `Estudio de caso` y `Pregunta problema` se establecen como encabezados de nivel 2, alineados a la izquierda según la plantilla institucional.
- Se retiran del borrador académico la cita y la referencia `Tecnológica Autónoma del Pacífico (2026)`.
- El archivo Word de `docs/sources/` se conserva sin modificaciones; el equipo traslada manualmente los cambios desde el borrador.

### Pendientes

- Revisar el contenido de la metodología y el marco conceptual cuando el equipo comparta las observaciones restantes de la coordinadora.
- Actualizar las conclusiones del resumen cuando existan resultados finales adicionales respaldados por evidencia.

### Referencias

- [Observaciones de la coordinadora](../academic/coordinator-instructions.md).
- [Borrador del informe académico](../academic/report/REPORT_DRAFT.md).

## 2026-09-11

### Contexto

Revisión del marco conceptual, la metodología y las evidencias solicitadas para el diagnóstico, el informe y la sustentación.

### Decisiones / cambios

- `Aplicación Web Full Stack y Modelo Cliente-Servidor` pasa a ser el primer concepto después del párrafo inicial del marco conceptual.
- Se conservan las fuentes técnicas primarias actuales y no se atribuye un cuartil Q1/Q2 a un artículo únicamente por tener DOI o por la clasificación de otro año o categoría.
- Se añaden como respaldo complementario dos artículos en español con DOI sobre adopción de TIC en mipymes y gestión de inventarios. Se descarta el artículo sobre datos abiertos porque su relación con el catálogo empresarial es insuficiente; el borrador queda con nueve referencias pertinentes y no presenta como Q1/Q2 aquellas cuya clasificación aplicable no está demostrada.
- La metodología se organiza en tipo de investigación, metodología de desarrollo, fases, participantes y unidad de análisis, técnicas e instrumentos, y herramientas tecnológicas.
- Se elimina la expresión `Aplica:` y se conserva la caracterización del estudio como investigación aplicada con alcance descriptivo y propositivo.
- La entrevista con el propietario de ESENCIALES se incorpora como técnica del diagnóstico, apoyada por un cuestionario; el briefing queda como síntesis para validar y priorizar el alcance.
- Los hallazgos de la entrevista, la correspondencia entre el briefing validado y las funcionalidades, el comparativo del proceso, la evolución del diseño, las pruebas y el despliegue se reservan para resultados y análisis cuando existe evidencia.
- Se crea un plan para distribuir las evidencias entre el informe y la sustentación.
- El QR de la diapositiva final se plantea como acceso a la URL pública y el equipo decide limitarlo a materiales de presentación y difusión, sin incorporarlo como funcionalidad del MVP.

### Pendientes

- Completar los datos de la entrevista, validar el briefing derivado y extraer únicamente hallazgos respaldados.
- Confirmar con el profesor cuántos artículos Q1/Q2 se exigen y bajo qué base, categoría y año se evalúan.
- Incorporar una décima referencia directamente relacionada para cumplir el mínimo del curso sin añadir fuentes solo por cantidad.

### Referencias

- [Observaciones de la coordinadora](../academic/coordinator-instructions.md).
- [Instrucciones del profesor](../academic/professor-instructions.md).
- [Plan de evidencias](../academic/report/EVIDENCE_PLAN.md).
- [Borrador del informe académico](../academic/report/REPORT_DRAFT.md).

## 2026-09-11

### Contexto

Incorporación de la entrevista de levantamiento de requerimientos realizada al propietario de ESENCIALES y suministrada por el equipo.

### Decisiones / cambios

- Se conserva la entrevista como fuente primaria del diagnóstico y se identifica que el material no es por sí solo un briefing.
- Se crea un briefing derivado, redactado en primera persona a partir de las respuestas, para validación expresa del propietario.
- La metodología diferencia la entrevista como técnica, el cuestionario de 37 preguntas como instrumento y el briefing como síntesis para validar el problema y priorizar el alcance.
- Se actualiza el caso de estudio con los canales Instagram, Facebook Marketplace, WhatsApp y ventas directas, y con la gestión manual del catálogo y el inventario.
- Se documenta que las necesidades sobre pagos, clientes, ventas, costos, direcciones, reportes y estados comerciales no modifican automáticamente el MVP.
- El briefing compara cada necesidad con el alcance vigente y señala coberturas completas, parciales, conflictos y elementos externos al MVP.
- Daniel Steven Contreras Lopez valida el briefing, sus criterios de éxito y sus delimitaciones el 10 de septiembre de 2026.
- Se confirma el descuento de inventario al pasar una solicitud a `Confirmada`; dirección y barrio se recopilan por WhatsApp; y costos internos, pagos, módulo de clientes y reportes de ventas permanecen fuera del MVP.

### Pendientes

- Seleccionar las evidencias del proceso inicial que pueden utilizarse sin exponer datos personales o comerciales sensibles.

### Referencias

- [Entrevista de levantamiento de requerimientos](../sources/ENTREVISTA_LEVANTAMIENTO_REQUERIMIENTOS_ESENCIALES.md).
- [Briefing de necesidades](../project/briefing-esenciales.md).
- [Borrador del informe académico](../academic/report/REPORT_DRAFT.md).

## 2026-09-17

### Contexto

El equipo confirma que el cliente continuará sin cuenta, solicita incorporar la indicación comunicada del profesor sobre aceptación de términos y define la recuperación de contraseña para el administrador.

### Decisiones / cambios

- La aceptación obligatoria se ubica al registrar cada solicitud, sin crear cuentas de clientes.
- `solicitudes` conservará las versiones aceptadas de los Términos y condiciones y de la Política de tratamiento de datos, además de la fecha y hora de aceptación.
- No se crea una tabla de consentimientos porque existe una sola aceptación vinculada a cada solicitud y no hay una entidad cliente en el MVP.
- La autorización para novedades o comunicaciones promocionales queda fuera del MVP.
- El administrador podrá recuperar su contraseña por correo mediante Supabase Auth; continúa sin existir registro público de administradores.

### Pendientes

- Elaborar y validar con Esenciales los textos y las versiones iniciales de los documentos antes del despliegue.
- Materializar y probar estas reglas en las migraciones, la función RPC y las pantallas correspondientes.

### Referencias

- [Instrucciones del profesor](../academic/professor-instructions.md).
- [Requisitos](../project/requirements.md).
- [Modelo lógico de datos](../architecture/data-model.md).
