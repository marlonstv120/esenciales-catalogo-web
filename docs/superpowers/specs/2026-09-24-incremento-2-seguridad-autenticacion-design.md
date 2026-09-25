# Diseno del Incremento 2: seguridad y autenticacion administrativa

**Fecha:** 24 de septiembre de 2026

## Objetivo

Entregar acceso administrativo seguro para el MVP de ESENCIALES. Un administrador autorizado podra iniciar y cerrar sesion, recuperar su contrasena por correo y operar las tablas del nucleo del catalogo. Los visitantes, usuarios sin sesion y usuarios autenticados no autorizados no obtendran esos permisos.

Este incremento satisface RF-01, RF-02, RF-03, RF-56 y RNF-04. No habilita todavia consultas publicas del catalogo, CRUD de categorias ni roles adicionales.

## Decisiones confirmadas

- Supabase Auth administra correo, contrasena, sesion y recuperacion de contrasena.
- `public.usuarios_administrativos` determina si un usuario de Auth puede administrar el sistema.
- El administrador inicial se crea mediante una invitacion manual en Supabase Auth. Su UUID se registra despues de forma explicita en `usuarios_administrativos` con `activo = true`.
- No habra registro publico, gestion de usuarios desde la aplicacion ni segundo rol en este incremento.
- La autorizacion efectiva se aplica en PostgreSQL con permisos y RLS; la proteccion del cliente solo orienta la navegacion.

## Autorizacion en PostgreSQL

Una nueva migracion creara `public.es_administrador_activo()` como funcion SQL reutilizable. La funcion usara `auth.uid()` y devolvera verdadero solo cuando exista una fila en `usuarios_administrativos` con el mismo UUID y `activo = true`.

La tabla `usuarios_administrativos` permanecera sin politicas permisivas ni privilegios directos para usuarios de la aplicacion: no habra gestion administrativa de autorizaciones en este incremento. Se otorgaran a `authenticated` los privilegios de tabla y secuencia estrictamente necesarios para las cuatro tablas del catalogo. Sus politicas RLS permitiran operaciones administrativas solo cuando `es_administrador_activo()` sea verdadera. Las escrituras y lecturas directas de usuarios no autorizados seguiran rechazadas por la base de datos.

La funcion no formara parte de una operacion de negocio del cliente. Se ejecutara con privilegios y `search_path` seguros para consultar la tabla cerrada desde las politicas. Solo `authenticated` recibira ejecucion de la funcion para que las politicas puedan evaluarla; no se concedera acceso a `anon` ni a la tabla administrativa. Tampoco se abriran lecturas publicas hasta el Incremento 6.

## Flujo de sesion del cliente

La aplicacion incorporara una superficie administrativa minima con estos estados:

1. Carga: obtiene la sesion actual y comprueba la autorizacion administrativa.
2. Sin sesion: muestra el formulario de correo y contrasena, junto con la opcion de solicitar recuperacion.
3. Sesion autorizada: muestra un estado administrativo basico y permite cerrar sesion. Los CRUD se incorporaran en los incrementos posteriores.
4. Sesion no autorizada o inactiva: cierra la sesion local y muestra un mensaje generico sin revelar informacion sobre cuentas o permisos.
5. Recuperacion: solicita a Supabase el correo de recuperacion; tras la redireccion de Auth, permite establecer una contrasena nueva y volver al acceso.

El cliente usara las APIs de `@supabase/supabase-js` para iniciar sesion, cerrar sesion, solicitar recuperacion, actualizar contrasena y observar cambios de sesion. La URL de retorno de recuperacion se derivara del origen local o desplegado de la aplicacion y se configurara como URL permitida en Supabase Auth para cada entorno.

## Manejo de errores y seguridad

- Los formularios validaran correo requerido, contrasena requerida y confirmacion de contrasena cuando corresponda, sin sustituir las validaciones de Supabase.
- Los errores de acceso y recuperacion se traduciran a mensajes utiles pero no confirmaran si una cuenta existe o si posee permisos.
- La clave publica de Supabase seguira siendo la unica clave disponible para Vite. No se usara `service_role` ni se expondran credenciales administrativas en el cliente.
- Desactivar una fila de `usuarios_administrativos` debe retirar el acceso en la siguiente consulta u operacion protegida, aunque el usuario conserve una sesion de Auth valida.

## Validacion

Las pruebas pgTAP comprobaran que:

- la funcion identifica al administrador activo y rechaza usuario anonimo, autenticado no registrado y administrador inactivo;
- los privilegios y cada politica permiten al administrador activo las operaciones previstas sobre las cuatro tablas del catalogo;
- los tres actores rechazados no pueden leer ni modificar datos del catalogo, y ningun usuario de aplicacion puede modificar `usuarios_administrativos`;
- las secuencias requeridas por inserciones administrativas no se exponen a `anon` ni a usuarios no autorizados.

La validacion manual local comprobara inicio de sesion, restauracion de sesion al recargar, rechazo de cuenta no autorizada, cierre de sesion, solicitud de recuperacion en Mailpit y actualizacion de contrasena desde el enlace. La salida exige ejecutar desde una base limpia `supabase db reset`, `npm test` y `npm run build`.

## Fuera de alcance

- Registro publico o alta de administradores desde el cliente.
- Segundo rol autenticado, permisos diferenciados o gestion de roles.
- Acceso publico al catalogo y politicas de lectura para visitantes.
- Buckets o politicas de Supabase Storage.
- CRUD administrativo de categorias, productos, presentaciones o imagenes.
- Aplicar la migracion al proyecto remoto sin autorizacion expresa.
