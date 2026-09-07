# ADR-002: Frontend sin framework adicional

## Estado

Accepted

## Contexto

El curso exige HTML5, CSS3 y JavaScript, y el MVP debe ser realizable por tres integrantes durante el periodo académico. El alcance aprobado incluye catálogo, carrito y panel administrativo, pero no requiere por sí mismo React, Vue, Angular u otro framework frontend.

## Decisión

Construir el frontend del MVP con HTML5, CSS3 y JavaScript organizado, sin incorporar inicialmente un framework frontend adicional.

Esta decisión no define todavía la estructura de carpetas, la estrategia de renderizado, las convenciones de módulos ni librerías auxiliares concretas.

## Motivos

- Alineación directa con las tecnologías del curso.
- Menor curva de aprendizaje y riesgo dentro del tiempo disponible.
- Alcance funcional abordable con las capacidades nativas de la plataforma web.
- Mayor facilidad para comprender y sustentar la implementación.
- Evitar dependencias y complejidad no justificadas.

## Alternativas consideradas

- React.
- Vue.
- Angular.

No se seleccionan porque no son necesarios para resolver el MVP confirmado y no forman parte de las tecnologías exigidas por el curso.

## Consecuencias

- La interfaz debe organizar JavaScript, estilos y componentes visuales con convenciones claras del proyecto.
- El equipo será responsable de manejar directamente el DOM, los eventos, los formularios, el estado del carrito y la comunicación con el backend.
- No se añadirá un framework frontend sin una necesidad concreta, evaluación de impacto y nueva decisión aprobada.
- Esta decisión no impide una evolución futura si cambian sustancialmente los requisitos.
