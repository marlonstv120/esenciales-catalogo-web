# Documentación

Esta carpeta es la fuente permanente de contexto del proyecto. Las fuentes originales se conservan en [sources/](sources/README.md); los documentos derivados deben resumir y enlazar, no duplicar.

## Navegación

- [Proyecto](project/overview.md): estado y objetivos vigentes.
- [Alcance funcional MVP V1](project/functional-scope.md): macrofuncionalidades, prioridades, límites, aceptación y pendientes.
- [Requisitos](project/requirements.md): requisitos funcionales y no funcionales identificados.
- [Reglas de negocio](project/business-rules.md): comportamiento obligatorio del dominio.
- [Actores y flujos](project/actors-and-flows.md): participantes, permisos y recorridos principales.
- [Sistema visual](project/DESIGN.md): fuente principal de identidad aplicada, tokens, componentes, responsive y accesibilidad de la interfaz.
- [Guía de wireframes](project/wireframe-guide.md): pantallas, estados y proceso para bocetar en papel y trasladar el diseño a Figma.
- [Identidad visual](project/visual-identity.md): guía derivada del logo para orientar colores, jerarquía y estilo de la interfaz.
- [Arquitectura](architecture/overview.md): decisiones técnicas confirmadas.
- [Contratos de servicios](architecture/service-contracts.md): RPC, Edge Function, autorizacion y fuentes ejecutables de los contratos.
- [Modelo lógico de datos](architecture/data-model.md): entidades, restricciones, transacciones y fuentes técnicas de PostgreSQL.
- [Desarrollo](development/workflow.md): flujo de trabajo y [herramientas recomendadas](development/tooling.md).
- [Términos y condiciones](../public/legal/terminos-v2.html) y [política de datos](../public/legal/politica-datos-v2.html): versiones vigentes `terminos-v2` y `politica-datos-v2` desde el 1 de octubre de 2026. Los documentos V1 se conservan como versiones históricas aceptadas por solicitudes anteriores.
- [Académico](academic/README.md): contexto del curso e informe en construcción.
- [Historial](history/project-log.md): trazabilidad e hitos relevantes.
- [Entregables del informe](../informe/README.md): briefing, requisitos, diseno, arquitectura y evidencias organizados para los hitos academicos.
- [Registro de uso de IA](../ia/README.md): evidencia academica revisada por el equipo.

## Política de actualización

Antes de un cambio importante, consulte los documentos relacionados. Actualice alcance, requisitos, reglas, actores o flujos solo si son afectados; documente decisiones técnicas relevantes mediante ADR; registre nuevas instrucciones del profesor y propague su impacto. Evalúe actualizar el borrador académico cuando exista evidencia relevante, las referencias cuando surja una fuente útil y el historial ante hitos.

No actualice archivos mecánicamente. Evite duplicación y mantenga trazabilidad si una decisión cambia.
