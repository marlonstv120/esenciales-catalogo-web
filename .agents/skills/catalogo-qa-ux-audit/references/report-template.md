# Plantilla del informe de auditoria

## Resumen ejecutivo

- Resultado general: `PASS`, `FAIL`, `BLOCKED` o `PARTIAL`.
- Hallazgos: total y conteo por `CRITICAL`, `HIGH`, `MEDIUM` y `LOW`.
- Riesgo principal para el MVP.
- Recomendacion inmediata.

## Alcance y entorno

Registra fecha, commit o estado del codigo si puede obtenerse, URL base, navegador/herramienta, viewports, rutas, roles, datos de prueba y limitaciones. Indica si se uso Playwright, Axe u otra automatizacion y que parte fue manual.

## Matriz de cobertura

| Area o flujo | Estado | Evidencia breve | Notas |
| --- | --- | --- | --- |
| Ejemplo: catalogo y filtros | PASS / FAIL / NOT TESTED / BLOCKED | Ruta, viewport o artefacto | Limitacion relevante |

## Hallazgos

Usa un bloque por hallazgo:

### QA-001 - Titulo breve

- **Severidad:** CRITICAL / HIGH / MEDIUM / LOW
- **Pagina/componente:** ruta y nombre visible
- **Viewport/entorno:** ancho x alto, navegador y estado
- **Problema:** descripcion concreta de lo observado
- **Impacto:** tarea, usuario o regla afectada
- **Evidencia/pasos:** precondiciones y pasos numerados; adjunta captura, consola o red solo cuando aporte prueba
- **Esperado:** comportamiento sustentado en requisitos, diseno o convencion accesible
- **Mejora recomendada:** correccion orientativa, sin implementarla
- **Fuente de verdad:** documento/requisito aplicable, o `heuristica UX` si no existe una regla del proyecto

## Comprobaciones aprobadas

Resume lo que se verifico correctamente, sin enumerar cada clic ni confundir ausencia de evidencia con aprobacion.

## Limitaciones y pendientes

Lista credenciales faltantes, estados no provocables, datos reales no disponibles, mutaciones evitadas, herramientas ausentes y cualquier tramo E2E no ejecutado. Para cada punto indica el paso necesario para poder validarlo.

## Prioridad sugerida

Propone un orden breve de correccion: primero seguridad/integridad y bloqueos del flujo principal; despues responsive y accesibilidad que impiden tareas; por ultimo consistencia y pulido visual.
