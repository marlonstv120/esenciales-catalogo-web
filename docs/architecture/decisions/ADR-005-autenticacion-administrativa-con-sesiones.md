# ADR-005: Autenticación administrativa con sesiones

## Estado

Accepted

## Contexto

El MVP requiere que el administrador inicie y cierre sesión y que las vistas y operaciones administrativas estén protegidas. La aplicación se servirá desde un único origen mediante Express, y no se requiere autenticación para visitantes ni clientes.

## Decisión

Implementar la autenticación administrativa mediante sesiones de servidor identificadas por una cookie segura. No se utilizará JWT para el MVP.

La elección específica del almacenamiento de sesiones y los parámetros finales de la cookie se definirá durante la implementación, de acuerdo con el entorno local y de producción.

## Motivos

- Se ajusta a una aplicación web del mismo origen con un único tipo de usuario autenticado confirmado.
- Evita la complejidad innecesaria de diseñar y administrar tokens JWT.
- Permite invalidar sesiones de forma directa al cerrar sesión o aplicar controles administrativos.
- Resulta más sencillo de comprender y sustentar para el alcance actual.

## Alternativas consideradas

- JSON Web Tokens (JWT).

No se seleccionan porque son más adecuados cuando existen clientes separados o una API consumida por terceros, condiciones no confirmadas para este MVP.

## Consecuencias

- Las contraseñas deberán almacenarse con hash seguro; nunca en texto plano.
- Las rutas y operaciones administrativas comprobarán una sesión válida.
- La configuración de producción deberá usar HTTPS y cookies con atributos de seguridad apropiados.
- La aplicación deberá aplicar las protecciones necesarias frente a solicitudes no confiables y errores de autenticación.
