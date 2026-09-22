# Instrucciones del profesor

Registro acumulativo de instrucciones explícitas que afecten el proyecto, entregables, metodología, informe o sustentación.

## 2026-09-17 - Aceptación de términos y condiciones

**Contexto/clase:** indicación previa del profesor comunicada posteriormente por el equipo al precisar el flujo de clientes del MVP.

**Indicación comunicada:** incluir la aceptación de términos y condiciones al registrar usuarios, contemplando que el sistema podría necesitarlos en una evolución futura aunque todavía no incorpore una pasarela de pagos.

**Aplicación al alcance vigente:** como el MVP no tendrá registro ni autenticación de clientes, el equipo acuerda aplicar la aceptación al registrar cada solicitud de compra. El visitante deberá consultar y aceptar los Términos y condiciones y la Política de tratamiento de datos; la solicitud conservará las versiones y la fecha de aceptación. La suscripción promocional queda fuera del MVP.

**Documentos afectados:** alcance funcional, requisitos, reglas de negocio, actores y flujos, modelo lógico de datos y guía de wireframes.

**Estado:** incorporado a la especificación; el contenido de los documentos legales debe elaborarse y validarse con Esenciales antes del despliegue.

## 2026-09-14 - Wireframe manual y prototipo en Figma

**Contexto/clase:** indicación del profesor comunicada por el equipo sobre el diseño preliminar de la aplicación.

**Indicación:** elaborar primero a mano, con papel y lápiz, el esqueleto de la página web. El boceto debe contemplar sus módulos, páginas, pestañas y estados relevantes, incluidos contenido cargado, carga en curso, ausencia de datos y errores. Después de revisar el esqueleto manual, trasladarlo a Figma.

**Impacto:** se crea una guía basada en el alcance aprobado que enumera las pantallas públicas y administrativas, su contenido mínimo, sus estados y los flujos que debe permitir el prototipo. El boceto y el wireframe podrán conservarse como evidencia del diseño preliminar para compararlos posteriormente con la interfaz final.

**Documentos afectados:** `docs/project/wireframe-guide.md`, `docs/README.md` y `docs/academic/report/EVIDENCE_PLAN.md`.

**Estado:** guía elaborada; bocetos en papel, revisión del equipo y traslado a Figma pendientes.

## 2026-09-09 - Visibilidad de la pregunta problema

**Contexto/revisión:** observación del profesor sobre la versión actual del informe técnico.

**Indicación:** dar mayor visibilidad a la pregunta problema. No debe quedar integrada visualmente dentro de un párrafo de la introducción; debe incluir un encabezado y presentarse como un párrafo independiente, de acuerdo con la convención observada en los demás grupos.

**Impacto:** se incorpora el encabezado `Pregunta problema` antes de la interrogante en el borrador académico. La pregunta conserva su ubicación después de la descripción del contexto y el problema.

**Documentos afectados:** `docs/academic/report/REPORT_DRAFT.md`.

**Estado:** aplicado; verificar el mismo formato en el documento Word que se entregue al profesor.

## 2026-09-03 - Pregunta problema y objetivos

**Contexto/clase:** retroalimentación del profesor sobre la formulación de la pregunta problema y los objetivos del proyecto.

**Indicación:** identificar expresamente a Esenciales como empresa o emprendimiento para que el lector comprenda a qué tipo de organización se refiere el informe. Esta contextualización debe considerarse especialmente al desarrollar la introducción y también en la pregunta problema y el objetivo general cuando se mencione a Esenciales.

Los objetivos específicos no deben repetir de forma genérica expresiones como `aplicación web` o `aplicación web full stack`. Deben desglosar las funcionalidades concretas que se desarrollarán para resolver el problema.

**Impacto:** se reformulan la pregunta problema, el objetivo general y los tres objetivos específicos. Los objetivos específicos se organizan en administración del catálogo, catálogo público y solicitudes de compra.

**Documentos afectados:** `docs/academic/report/REPORT_DRAFT.md`, `docs/project/overview.md` y `docs/project/functional-scope.md`.

**Estado:** aplicado inicialmente; la organización de los objetivos específicos por módulos fue reemplazada por la aclaración metodológica registrada el 5 de septiembre de 2026.

## 2026-09-05 - Estructura del problema y secuencia de objetivos

**Contexto/clase:** aclaración de la retroalimentación del profesor sobre la sección del problema y la formulación de los objetivos específicos.

**Indicación:** ubicar la pregunta problema después de la descripción del contexto y del problema, formularla con signos de interrogación y asignarle un encabezado propio. Incorporar la justificación del proyecto y definir su alcance y delimitación.

Los objetivos específicos deben corresponder a etapas distintas del trabajo y seguir una secuencia lógica de diagnóstico, desarrollo o análisis y evaluación. Se debe incorporar la etapa de diagnóstico, fusionar los objetivos anteriores de diseño y construcción en una sola etapa de desarrollo y conservar el objetivo de validación. El objetivo de desarrollo debe especificar las funcionalidades concretas relacionadas con los síntomas descritos, sin convertir cada módulo del sistema en un objetivo independiente ni repetir el objetivo general.

**Impacto:** se completa la introducción con pregunta problema, justificación, alcance y delimitación; y se reformulan los objetivos específicos como diagnóstico, desarrollo funcional y validación.

**Documentos afectados:** `docs/academic/report/REPORT_DRAFT.md`, `docs/project/overview.md` y `docs/project/functional-scope.md`.

**Estado:** aplicado; sujeto a revisión posterior del profesor.

## 2026-09-11 - Actor, briefing y evidencias comparativas

**Contexto/clase:** indicaciones comunicadas por el equipo sobre el diagnóstico y las evidencias esperadas para el informe y la sustentación.

**Indicación:** identificar cómo se resuelve el problema y quién es el actor afectado. Entrevistar a la persona o empresa destinataria de la solución y elaborar un briefing que registre la situación inicial, las solicitudes y los requisitos. Utilizar esta línea base para comparar lo solicitado con lo efectivamente realizado.

Para la presentación, mostrar evidencia del diagnóstico mediante un comparativo entre el proceso inicial y la solución obtenida, contrastar el diseño preliminar con el diseño final e incluir en la diapositiva de cierre un enlace o código QR que permita acceder a la aplicación desplegada.

**Impacto:** la entrevista se incorpora a la metodología como técnica del diagnóstico y el cuestionario conserva las respuestas del actor. El briefing derivado sintetiza el problema, las prioridades y el alcance para validarlos con el propietario. Los hallazgos y la comparación con la solución corresponden a resultados y análisis. Las capturas comparativas, los diseños, las pruebas y la URL se organizan como evidencias del informe y la sustentación.

**Documentos afectados:** `docs/academic/report/REPORT_DRAFT.md` y `docs/academic/report/EVIDENCE_PLAN.md`.

**Estado:** aplicado en la estructura metodológica y en el plan de evidencias. La entrevista está identificada y el briefing derivado fue validado por el propietario el 10 de septiembre de 2026. Las comparaciones y el QR requieren evidencia final del sistema y una URL de producción estable.

## 2026-09-07 - Uso de Supabase en sustitución de Express

**Contexto/clase:** autorización comunicada por el equipo después de consultar al profesor sobre la posibilidad de trabajar con Supabase.

**Indicación:** el profesor autorizó usar Supabase para sustituir Express y agilizar el desarrollo. El equipo informó además que el profesor explicó que Supabase conserva relación con el ecosistema de JavaScript; esta explicación no implica que el MVP deba implementar Node.js o Express.

**Impacto:** se reemplaza la arquitectura de Express, `pg` y sesiones propias por Supabase PostgreSQL, Auth, Storage, políticas RLS y funciones RPC. Se conservan el alcance funcional, el título, la pregunta problema y los objetivos, porque el problema que resuelve el sistema no cambia.

**Documentos afectados:** arquitectura, ADR-003 a ADR-007, modelo lógico de datos, requisitos técnicos, contexto actual, bitácora e informe académico.

**Estado:** aplicado en la documentación de trabajo; conservar evidencia de la autorización si el profesor la entrega por un canal verificable.

## 2026-09-05 - Redacción continua de la introducción

**Contexto/clase:** aclaración del profesor sobre la presentación de la introducción.

**Indicación:** la justificación, el alcance, la delimitación y la estructura del informe deben formar parte de un texto continuo dentro de la introducción, organizado mediante párrafos y sin subtítulos internos. La pregunta problema se presenta en un párrafo independiente para diferenciarla del contexto y del problema.

**Impacto:** se eliminan los subtítulos internos de la introducción y se conserva su contenido en párrafos consecutivos.

**Documentos afectados:** `docs/academic/report/REPORT_DRAFT.md`.

**Estado:** aplicado; sujeto a revisión posterior del profesor.
