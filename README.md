# Esenciales Catálogo Web

Aplicación web Full Stack para la **gestión y publicación del catálogo de productos de Esenciales**, desarrollada como proyecto integrador del Curso de Opción de Grado en Desarrollo Web Full Stack.

> **Estado actual:** el MVP usa Supabase para los servicios de backend. El primer esquema local del catálogo, sus datos iniciales y su postura de seguridad cerrada están implementados y validados; la autenticación, las políticas de acceso y las funcionalidades del catálogo siguen pendientes.

## Sobre el proyecto

**Esenciales** es un emprendimiento real que comercializa lociones, splash, cremas, humidificadores y otros productos.

El proyecto busca centralizar mediante una aplicación web la administración y presentación de su catálogo, facilitando la gestión de la información de los productos y su consulta por parte de los clientes.

El MVP está enfocado específicamente en Esenciales. Una posible plataforma para múltiples emprendimientos se considera una evolución futura y no forma parte del alcance actual.

## Contexto académico

Este repositorio corresponde al proyecto integrador del Curso de Opción de Grado de Desarrollo Web Full Stack.

Además del desarrollo de la aplicación, el repositorio conserva el contexto académico y técnico necesario para acompañar progresivamente:

- las actividades y avances del curso;
- las indicaciones del profesor;
- las decisiones del proyecto;
- el desarrollo y validación del sistema;
- la preparación del documento académico;
- la sustentación final.

La documentación se actualizará conforme avance el curso. Las indicaciones explícitas más recientes del profesor tienen prioridad sobre decisiones o planteamientos anteriores cuando exista algún conflicto.

## Documentación

La documentación principal se encuentra en [`docs/`](docs/README.md).

Áreas principales:

- [`docs/sources/`](docs/sources/) — documentos fuente del curso y del proyecto.
- [`docs/project/`](docs/project/) — contexto, alcance, requisitos, reglas de negocio, actores y flujos.
- [`docs/architecture/`](docs/architecture/) — arquitectura y decisiones técnicas confirmadas.
- [`docs/development/`](docs/development/) — configuración, convenciones y flujo de desarrollo.
- [`docs/academic/`](docs/academic/) — contexto académico, indicaciones del profesor y material de trabajo para el documento académico.
- [`docs/history/`](docs/history/) — evolución, decisiones y cambios relevantes del proyecto.

Las fuentes originales se conservan separadas de la documentación derivada para evitar duplicaciones y mantener trazabilidad.

## Estructura del repositorio

- [`docs/`](docs/README.md): documentacion permanente del proyecto.
- [`api/`](api/README.md): contrato entre el frontend y los servicios de Supabase.
- [`db/`](db/README.md): orientacion del esquema, reglas y datos de prueba.
- [`supabase/`](supabase/): configuracion local y SQL versionado de Supabase.
- [`ia/`](ia/README.md): registro academico del uso de inteligencia artificial.
- [`informe/`](informe/README.md): entregables y evidencias organizados por hito.

El proyecto usa `supabase/` como ruta de backend; no mantiene simultaneamente una carpeta `backend/`. La carpeta [`.ai/`](.ai/README.md) contiene contexto operativo para agentes y no reemplaza el registro academico de `ia/`.

## Desarrollo asistido por IA

El proyecto puede utilizar herramientas de IA como apoyo para análisis, aprendizaje, implementación, revisión y documentación.

Las reglas que deben seguir los agentes de IA están definidas en [`AGENTS.md`](AGENTS.md).

La IA actúa como asistente de desarrollo. Las decisiones importantes del proyecto deben estar respaldadas por el contexto disponible y, cuando corresponda, ser aprobadas por el equipo antes de considerarse definitivas.

## Principios del proyecto

- Resolver el problema real identificado para Esenciales.
- Mantener un MVP alcanzable dentro del curso.
- Diferenciar decisiones confirmadas, propuestas preliminares y evolución futura.
- Priorizar funcionamiento, claridad, seguridad y mantenibilidad.
- Evitar tecnologías, dependencias y complejidad innecesarias.
- Mantener coherencia entre requisitos, implementación, documentación y trabajo académico.
- Comprender, probar y validar el código, incluso cuando sea generado con ayuda de IA.

## Estado de implementación

El prototipo inicial con Node.js y Express fue sustituido por una base de frontend con Vite, HTML5, CSS3 y JavaScript sin framework. Supabase está vinculado al proyecto remoto y el entorno local cuenta con una primera migración validada para el núcleo del catálogo. Están pendientes la autenticación administrativa, las políticas de acceso, Storage y las funcionalidades del catálogo.

 La arquitectura, estructura del código y decisiones técnicas se incorporarán progresivamente a partir del [alcance funcional MVP V1](docs/project/functional-scope.md).

## Ejecución local

Instale las dependencias:

```bash
npm install
```

Para ejecutar el cliente en desarrollo:

```bash
npm run supabase:start
npm run dev
```

Supabase Studio estará disponible en `http://127.0.0.1:55323`. Vite mostrará la URL del cliente en la terminal, normalmente `http://localhost:5173`.

Para detener los servicios locales de Supabase:

```bash
npm run supabase:stop
```

Para comprobar la compilación de producción:

```bash
npm run build
```

Para previsualizar la compilación:

```bash
npm run preview
```

Copie `.env.example` como `.env.local` y complete las variables públicas de Supabase cuando configure un entorno nuevo. `.env.local` no se versiona. Las claves secretas o de servicio nunca deben utilizar el prefijo `VITE_` ni incluirse en el frontend.

---

Para conocer el estado vigente y detallado del proyecto, consulta [`docs/README.md`](docs/README.md) y la documentación enlazada desde allí.
