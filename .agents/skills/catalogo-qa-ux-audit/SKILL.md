---
name: catalogo-qa-ux-audit
description: Audita la aplicacion web de ESENCIALES en funcionamiento, UX/UI, responsive, accesibilidad basica y errores del navegador, y entrega hallazgos priorizados con evidencia sin modificar la aplicacion. Usar cuando se pida probar, revisar o validar el catalogo, carrito, solicitudes, WhatsApp o administracion.
compatibility: OpenCode y agentes compatibles con Agent Skills, incluidos modelos de OpenAI/ChatGPT y Google Antigravity/Gemini; requiere capacidad de navegador para la auditoria visual y puede usar Playwright si ya esta disponible.
---

# Auditoria QA + UX/UI del catalogo de ESENCIALES

Realiza una auditoria reproducible y de solo lectura. No corrijas codigo, datos, configuracion ni contenido durante la auditoria. No confirmes, entregues o canceles solicitudes reales, no alteres inventario y no envies mensajes de WhatsApp. Si una comprobacion requiere una mutacion real, usa datos y entorno de prueba autorizados o reportala como no ejecutada.

## Contexto obligatorio

Antes de navegar, lee `AGENTS.md` y el contexto minimo que este exige. Para esta auditoria consulta tambien:

- `docs/project/functional-scope.md`, `requirements.md`, `business-rules.md` y `actors-and-flows.md` para distinguir comportamiento confirmado, pendiente y fuera del MVP.
- `docs/project/DESIGN.md`, `visual-identity.md` y `wireframe-guide.md` para evaluar la interfaz contra decisiones reales.
- `.ai/current-context.md`, `package.json`, rutas, vistas y pruebas existentes para conocer el estado implementado.

No inventes pantallas, reglas, credenciales, datos ni resultados. Separa claramente lo confirmado, lo no comprobable y lo pendiente de validacion.

## Preparacion

1. Identifica el comando de desarrollo, la URL base y el `base` de Vite. Prefiere la aplicacion local; usa produccion solo si el usuario lo pide o la comprobacion local no es posible.
2. Revisa si el repositorio ya tiene Playwright, configuracion E2E o una herramienta de navegador equivalente. Usa Playwright cuando este disponible. No instales dependencias ni navegadores sin autorizacion explicita.
3. Si Playwright no esta disponible, usa las capacidades de navegador del entorno para la revision manual asistida y declara la limitacion. No afirmes que una comprobacion automatica paso si no se ejecuto.
4. No expongas valores de `.env.local`, tokens, datos personales ni credenciales en capturas, trazas o informes.
5. Define una carpeta temporal ignorada por Git para capturas, trazas y resultados. No dejes artefactos generados dentro del codigo fuente.

## Cobertura basada en el proyecto

Construye primero un inventario de rutas y estados realmente implementados. Como minimo, cuando existan y sean accesibles, cubre:

- Inicio, catalogo, filtros y busqueda.
- Tarjetas y detalle de producto.
- Presentaciones, precio COP, disponibilidad, stock visible y cantidad.
- Carrito, datos de solicitud, confirmacion y continuacion voluntaria por WhatsApp.
- Acceso y vistas administrativas sin ejecutar transiciones destructivas.
- Estados inicial, loading, cargado, vacio, sin resultados, error/reintento, validacion, procesando, exito, conflicto, no encontrado y sesion vencida que puedan provocarse de forma segura.

Para cada ruta revisa:

- Botones, enlaces, navegacion, historial atras/adelante, enlaces directos y formularios.
- Nombres, imagenes, texto alternativo o alternativa visual, proporcion, carga fallida y reserva de imagen.
- Coherencia entre producto, presentacion seleccionada, precio, disponibilidad, cantidad, subtotal y total.
- Que WhatsApp aparezca como continuacion opcional posterior al registro y que su URL/mensaje se pueda inspeccionar sin enviarlo.
- Consola, errores de pagina, solicitudes de red fallidas, recursos rotos, redirecciones inesperadas y 404.

## Responsive y consistencia visual

Prueba como minimo anchos de `320`, `375`, `768`, `1024` y `1440` px con una altura razonable. No limites la revision a capturas: interactua en cada patron relevante.

Detecta overflow horizontal, contenido cortado, solapamientos, controles fuera de pantalla, objetivos tactiles dificiles, reflujo defectuoso, tablas inutilizables, paneles o modales inaccesibles y acciones principales ocultas. Compara entre pantallas y estados la jerarquia, tipografia, alturas de botones y campos, radios, paddings, margenes, cards, encabezados, etiquetas y mensajes.

Trata una diferencia como defecto solo cuando contradiga la documentacion, rompa el uso o cree una inconsistencia observable; no conviertas preferencias esteticas en fallos.

## Accesibilidad basica

Comprueba al menos:

- jerarquia de headings, landmarks y titulo de pagina;
- nombre accesible de enlaces, botones, iconos y controles;
- labels y asociacion de errores con campos;
- `alt` adecuado o imagen decorativa ignorada;
- recorrido completo con teclado, orden de tabulacion, activacion y cierre con teclas esperadas;
- foco visible, gestion del foco en paneles/modales y ausencia de trampas;
- estados comunicados por texto y no solo por color;
- zoom/reflujo cuando la herramienta lo permita;
- contraste mediante una herramienta disponible, marcando como estimacion cualquier revision solo visual.

Si el entorno dispone de Axe u otro analizador, usalo como complemento, no como sustituto de teclado y revision manual. No instaleslo sin autorizacion.

## Flujo E2E principal

Valida, con datos de prueba autorizados:

`Inicio -> Catalogo -> buscar/filtrar -> detalle -> elegir presentacion y cantidad -> agregar al carrito -> revisar -> completar datos -> registrar solicitud -> ver codigo -> inspeccionar opcion de WhatsApp`.

Evita duplicados. Si registrar una solicitud afecta el backend compartido y no hay datos o permiso de prueba, detente antes del envio y documenta exactamente hasta donde se valido. No describas como probado el tramo omitido.

## Evidencia y severidad

Conserva para cada hallazgo evidencia minima suficiente: URL/ruta, viewport, estado previo, pasos numerados, resultado observado, resultado esperado y, cuando aporte valor, captura, error de consola, respuesta de red o selector del componente. Oculta datos sensibles.

Clasifica por impacto, no por cantidad:

- `CRITICAL`: perdida/corrupcion de datos, exposicion sensible, bloqueo general del sistema o flujo principal imposible sin alternativa.
- `HIGH`: funcion MVP principal rota, error grave de solicitud/inventario/precio, barrera de accesibilidad que impide completar una tarea o fallo responsive generalizado.
- `MEDIUM`: tarea posible con friccion relevante, estado o validacion incorrectos, inconsistencia repetida, defecto responsive localizado o accesibilidad significativa con alternativa.
- `LOW`: problema menor, cosmetico o de claridad que no bloquea la tarea.

No eleves severidad por preferencia personal. Agrupa duplicados con la misma causa y enumera las paginas afectadas.

## Salida

Lee [references/report-template.md](references/report-template.md) y entrega el informe con esa estructura. Ordena hallazgos por severidad y luego por impacto en el flujo principal. Cada hallazgo debe incluir pagina/componente, problema, evidencia o pasos para reproducir y mejora recomendada.

Incluye tambien alcance ejecutado, entorno, viewports, datos usados, comprobaciones aprobadas, limitaciones y pruebas no ejecutadas. Diferencia siempre entre `PASS`, `FAIL`, `NOT TESTED` y `BLOCKED`.

Al terminar, no modifiques la aplicacion. Si el usuario pide correcciones despues, tratalas como una tarea separada y solicita las decisiones necesarias segun `AGENTS.md`.

## Invocacion

En OpenCode, pide al modelo que cargue la skill por su identificador o seleccionala desde el catalogo de skills:

`Usa la skill catalogo-qa-ux-audit para auditar la aplicacion local completa sin corregir el codigo.`

Si la version de OpenCode expone skills como comandos interactivos, tambien puede aparecer como:

`/catalogo-qa-ux-audit`

La misma carpeta es compatible con Antigravity/Gemini. Ejemplo: `Usa /catalogo-qa-ux-audit para auditar la aplicacion local completa y guarda el informe en docs/qa/ sin corregir el codigo.`
