# Documentación

Esta carpeta es la fuente permanente de contexto del proyecto. Las fuentes originales se conservan en [sources/](sources/README.md); los documentos derivados deben resumir y enlazar, no duplicar.

## Navegación

- [Proyecto](project/overview.md): estado y objetivos vigentes.
- [Alcance funcional MVP V1](project/functional-scope.md): macrofuncionalidades, prioridades, límites, aceptación y pendientes.
- [Requisitos](project/requirements.md): requisitos funcionales y no funcionales identificados.
- [Reglas de negocio](project/business-rules.md): comportamiento obligatorio del dominio.
- [Actores y flujos](project/actors-and-flows.md): participantes, permisos y recorridos principales.
- [Arquitectura](architecture/overview.md): decisiones técnicas confirmadas.
- [Modelo lógico de datos](architecture/data-model.md): entidades, restricciones y transacciones propuestas para PostgreSQL.
- [Desarrollo](development/workflow.md): flujo de trabajo, [convenciones](development/conventions.md) y [herramientas recomendadas](development/tooling.md).
- [Académico](academic/README.md): contexto del curso e informe en construcción.
- [Historial](history/project-log.md): trazabilidad e hitos relevantes.

## Política de actualización

Antes de un cambio importante, consulte los documentos relacionados. Actualice alcance, requisitos, reglas, actores o flujos solo si son afectados; documente decisiones técnicas relevantes mediante ADR; registre nuevas instrucciones del profesor y propague su impacto. Evalúe actualizar el borrador académico cuando exista evidencia relevante, las referencias cuando surja una fuente útil, el historial ante hitos y el contexto inmediato ante cambios de trabajo.

No actualice archivos mecánicamente. Evite duplicación y mantenga trazabilidad si una decisión cambia.
