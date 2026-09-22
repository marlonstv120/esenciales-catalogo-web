# Herramientas de desarrollo

Este documento registra las herramientas auxiliares recomendadas para trabajar en el proyecto. No modifican las decisiones de arquitectura ni sustituyen HTML5, CSS3, JavaScript, Supabase o PostgreSQL.

## Extensiones recomendadas de VS Code

Las recomendaciones compartidas con el equipo están declaradas en [`.vscode/extensions.json`](../../.vscode/extensions.json).

| Extensión | Identificador | Finalidad |
| --- | --- | --- |
| ESLint | `dbaeumer.vscode-eslint` | Mostrar en el editor los problemas detectados por ESLint. |
| Prettier | `esbenp.prettier-vscode` | Aplicar el formato de código definido por el proyecto. |
| EditorConfig | `editorconfig.editorconfig` | Respetar reglas compartidas de sangría, codificación y finales de línea. |
| GitLens | `eamodio.gitlens` | Consultar historial, autoría y cambios de Git desde el editor. |
| Error Lens | `usernamehw.errorlens` | Hacer visibles los errores y advertencias directamente en el código. |
| PostgreSQL | `ms-ossdata.vscode-pgsql` | Consultar y administrar PostgreSQL desde VS Code. |
| axe Accessibility Linter | `deque-systems.vscode-axe-linter` | Detectar problemas comunes de accesibilidad en HTML. |

## Configuración

Instalar una extensión no configura por sí sola la herramienta correspondiente. La configuración mínima se incorporará progresivamente según exista una necesidad concreta:

- ESLint y Prettier deberán instalarse como dependencias de desarrollo para que sus versiones y reglas sean reproducibles entre colaboradores.
- EditorConfig requerirá un archivo `.editorconfig` cuando se acuerden las convenciones de código.
- Vite está instalado como dependencia de desarrollo y se ejecuta con `npm run dev`; `npm run build` genera la compilación de producción.
- La CLI de Supabase está instalada como dependencia de desarrollo. `npm run supabase:start` inicia el entorno local con Docker y `npm run supabase:stop` lo detiene.
- PostgreSQL podrá administrarse mediante Supabase Studio, la CLI de Supabase o una conexión autorizada, sin guardar contraseñas en el repositorio.
- Las migraciones, políticas RLS y funciones RPC deberán mantenerse en archivos SQL versionados cuando se inicialice Supabase.

Las dependencias se incorporan únicamente cuando responden a una necesidad concreta de la implementación.
