# Herramientas de desarrollo

Este documento registra las herramientas auxiliares recomendadas para trabajar en el proyecto. No modifican las decisiones de arquitectura ni sustituyen HTML5, CSS3, JavaScript, Node.js, Express o PostgreSQL.

## Extensiones recomendadas de VS Code

Las recomendaciones compartidas con el equipo están declaradas en [`.vscode/extensions.json`](../../.vscode/extensions.json).

| Extensión | Identificador | Finalidad |
| --- | --- | --- |
| ESLint | `dbaeumer.vscode-eslint` | Mostrar en el editor los problemas detectados por ESLint. |
| Prettier | `esbenp.prettier-vscode` | Aplicar el formato de código definido por el proyecto. |
| Nodemon Problem Matcher | `trilean.vscode-nodemon-problem-matcher` | Integrar en el panel de problemas los errores reportados al ejecutar Nodemon. |
| EditorConfig | `editorconfig.editorconfig` | Respetar reglas compartidas de sangría, codificación y finales de línea. |
| GitLens | `eamodio.gitlens` | Consultar historial, autoría y cambios de Git desde el editor. |
| Error Lens | `usernamehw.errorlens` | Hacer visibles los errores y advertencias directamente en el código. |
| REST Client | `humao.rest-client` | Ejecutar solicitudes HTTP guardadas en archivos `.http` para probar la API. |
| PostgreSQL | `ms-ossdata.vscode-pgsql` | Consultar y administrar PostgreSQL desde VS Code. |
| axe Accessibility Linter | `deque-systems.vscode-axe-linter` | Detectar problemas comunes de accesibilidad en HTML. |

## Configuración pendiente

Instalar una extensión no configura por sí sola la herramienta correspondiente. La configuración mínima se incorporará progresivamente según exista una necesidad concreta:

- ESLint y Prettier deberán instalarse como dependencias de desarrollo para que sus versiones y reglas sean reproducibles entre colaboradores.
- Nodemon está instalado como dependencia de desarrollo y se ejecuta mediante `npm run dev` para reiniciar el servidor al guardar cambios.
- EditorConfig requerirá un archivo `.editorconfig` cuando se acuerden las convenciones de código.
- REST Client podrá utilizar archivos `.http` versionados cuando existan endpoints de la API.
- PostgreSQL requerirá una instalación local o conexión autorizada, sin guardar contraseñas en el repositorio.

No se agregan todavía paquetes NPM porque la implementación no ha comenzado y las dependencias deben incorporarse cuando exista una necesidad concreta.
