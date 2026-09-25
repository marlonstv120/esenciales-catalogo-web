# Incremento 2: seguridad y autenticacion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir acceso administrativo solo a usuarios activos autorizados por Supabase Auth y `usuarios_administrativos`.

**Architecture:** Supabase Auth conserva credenciales y sesiones. Una funcion SQL con privilegios controlados consulta la tabla cerrada `usuarios_administrativos`; las politicas RLS de las cuatro tablas del catalogo la usan para permitir operaciones solo a administradores activos. El cliente Vite presenta los estados de sesion, inicio, recuperacion y cierre, sin sustituir la autorizacion de PostgreSQL.

**Tech Stack:** Vite 8, JavaScript ES modules, `@supabase/supabase-js` 2, Supabase CLI, PostgreSQL 17, pgTAP y Mailpit local.

**Spec:** `docs/superpowers/specs/2026-09-24-incremento-2-seguridad-autenticacion-design.md`

## Global Constraints

- No agregar dependencias ni usar `service_role` o secretos en el frontend.
- El administrador inicial se invita manualmente en Supabase Auth y su UUID se inserta manualmente en `usuarios_administrativos`.
- No hay registro publico, gestion de usuarios, segundo rol, consultas publicas ni Storage en este incremento.
- `usuarios_administrativos` conserva RLS y privilegios cerrados para usuarios de la aplicacion.
- No aplicar migraciones al proyecto remoto sin autorizacion expresa.
- Usar los puertos locales configurados: API `55321`, Studio `55323` y Mailpit `55324`.

## Review Focus

- Una sesion valida de Auth sin fila administrativa debe ser cerrada por el cliente y rechazada por RLS.
- Un administrador desactivado mientras conserva su JWT debe perder las operaciones de base de datos en la siguiente solicitud.
- `anon` no debe obtener ejecucion de `es_administrador_activo()` ni privilegios de tabla o secuencia.
- La tabla `usuarios_administrativos` no debe ser legible ni modificable por un administrador desde la Data API.
- Un enlace de recuperacion con una contrasena vacia, corta o no coincidente no debe llamar a `updateUser`.

---

## File Structure

- `supabase/migrations/20260924000200_add_admin_auth_policies.sql`: funcion de autorizacion, privilegios y politicas RLS permitidas.
- `supabase/tests/database/05_admin_auth_security.test.sql`: pruebas pgTAP de funcion, privilegios y RLS por actor.
- `supabase/config.toml`: URLs locales de retorno de Auth y registro publico deshabilitado.
- `src/auth.js`: llamadas a Supabase Auth y comprobacion de autorizacion de la sesion.
- `src/main.js`: renderizado y control de eventos para los estados de acceso, recuperacion y sesion autorizada.
- `src/styles.css`: estilos responsive y accesibles de la superficie administrativa.
- `index.html`: metadatos y contenedor de aplicacion administrativa.
- `docs/development/mvp-implementation-roadmap.md`: evidencia del Incremento 2 cuando se valide.
- `.ai/current-context.md`: estado siguiente y evidencia real cuando se valide.

### Task 1: Configurar Auth local para invitaciones y recuperacion

**Files:**
- Modify: `supabase/config.toml:154-229`

**Interfaces:**
- Consumes: Vite en `http://localhost:5173` y Mailpit en `http://127.0.0.1:55324`.
- Produces: Auth local sin registro publico y con retorno permitido para recuperacion en Vite.

- [ ] **Step 1: Registrar el comportamiento actual de Auth local**

Run: `npm run supabase:status`

Expected: Supabase local informa sus URLs y Mailpit permanece disponible en el puerto `55324`.

- [ ] **Step 2: Deshabilitar el registro publico y configurar las URLs de retorno**

En `[auth]`, establecer `site_url = "http://localhost:5173"`, añadir `http://localhost:5173` y `http://127.0.0.1:5173` a `additional_redirect_urls`, y establecer `enable_signup = false`. Mantener `[auth.email].enable_signup = true`: activa el proveedor de correo que utiliza la recuperación, pero no habilita registro público mientras `[auth].enable_signup` siga en `false`. Mantener `local_smtp.enabled = true`.

- [ ] **Step 3: Reiniciar Supabase y comprobar la configuracion**

Run: `npm run supabase:stop` seguido de `npm run supabase:start`

Expected: los servicios reinician correctamente; Studio y Mailpit responden en los puertos configurados. Crear usuarios mediante la opcion de invitacion de Studio, no mediante registro desde la aplicacion.

### Task 2: Crear la autorizacion SQL y las politicas RLS administrativas

**Files:**
- Create: `supabase/migrations/20260924000200_add_admin_auth_policies.sql`
- Modify: `supabase/tests/database/03_catalog_security.test.sql:3-29`

**Interfaces:**
- Consumes: `public.usuarios_administrativos(id uuid, activo boolean)` y las cuatro tablas de catalogo creadas por `20260924000100_create_catalog_core.sql`.
- Produces: `public.es_administrador_activo() returns boolean`, ejecutable solo por `authenticated`, y politicas `administrador_activo_gestiona_<tabla>`.

- [ ] **Step 1: Escribir las pruebas estructurales que fallen**

Ampliar `03_catalog_security.test.sql` para verificar que existe `es_administrador_activo`, que `anon` no puede ejecutarla, que `authenticated` si puede, que `usuarios_administrativos` sigue sin privilegios para `authenticated`, y que `authenticated` recibe los privilegios necesarios sobre `categorias`, `productos`, `presentaciones` e `imagenes_producto`.

```sql
select has_function('public', 'es_administrador_activo', array[]::text[], 'Existe la funcion de autorizacion');
select ok(not has_function_privilege('anon', 'public.es_administrador_activo()', 'EXECUTE'), 'anon no ejecuta la funcion');
select ok(has_function_privilege('authenticated', 'public.es_administrador_activo()', 'EXECUTE'), 'authenticated ejecuta la funcion');
select ok(not has_table_privilege('authenticated', 'public.usuarios_administrativos', 'SELECT'), 'authenticated no lee autorizaciones');
select ok(has_table_privilege('authenticated', 'public.categorias', 'INSERT'), 'authenticated tiene privilegio sujeto a RLS');
```

Actualizar el valor de `plan(...)` para contar exactamente las aserciones nuevas.

- [ ] **Step 2: Ejecutar la prueba para confirmar el fallo**

Run: `npm run supabase:reset; npm test`

Expected: falla porque no existe la funcion, no se conceden los privilegios administrativos y no hay politicas permisivas.

- [ ] **Step 3: Implementar la funcion, privilegios y politicas minimas**

Crear la migracion con este patron exacto; aplicar el mismo bloque de politica a cada tabla del catalogo.

```sql
create function public.es_administrador_activo()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.usuarios_administrativos
    where id = (select auth.uid())
      and activo
  );
$$;

revoke all on function public.es_administrador_activo() from public, anon;
grant execute on function public.es_administrador_activo() to authenticated;

grant select, insert, update, delete on public.categorias to authenticated;
grant usage, select on sequence public.categorias_id_seq to authenticated;

create policy administrador_activo_gestiona_categorias
on public.categorias
for all to authenticated
using ((select public.es_administrador_activo()))
with check ((select public.es_administrador_activo()));
```

No conceder privilegios, secuencias ni politicas a `anon`; no modificar los `revoke` existentes sobre `usuarios_administrativos`.

- [ ] **Step 4: Ejecutar las pruebas estructurales**

Run: `npm run supabase:reset; npm test`

Expected: las pruebas de estructura y seguridad pasan, incluida la comprobacion de que la tabla administrativa sigue cerrada.

### Task 3: Probar RLS contra administrador activo, no autorizado e inactivo

**Files:**
- Create: `supabase/tests/database/05_admin_auth_security.test.sql`

**Interfaces:**
- Consumes: `es_administrador_activo()` y politicas creadas en Task 2.
- Produces: evidencia pgTAP de autorizacion real por JWT simulado.

- [ ] **Step 1: Escribir pruebas que cambien el contexto JWT**

Crear tres UUID fijos: administrador activo, usuario autenticado sin registro y administrador inactivo. Insertar las filas administrativa activa e inactiva con `set local role postgres`; para cada actor usar `set local role authenticated` y `select set_config('request.jwt.claim.sub', '<uuid>', true)`.

Incluir pruebas equivalentes a estas:

```sql
select is(public.es_administrador_activo(), true, 'Administrador activo reconocido');
select lives_ok($$ insert into public.categorias (nombre) values ('Prueba activa') $$, 'Administrador activo inserta categoria');
select is(public.es_administrador_activo(), false, 'Usuario no autorizado rechazado por funcion');
select throws_ok($$ select * from public.categorias $$, '42501', null, 'Usuario no autorizado no consulta categorias');
select is(public.es_administrador_activo(), false, 'Administrador inactivo rechazado por funcion');
select throws_ok($$ update public.categorias set activo = false $$, '42501', null, 'Administrador inactivo no modifica categorias');
```

Probar `SELECT`, `INSERT`, `UPDATE` y `DELETE` exitosos del activo distribuidos entre las cuatro tablas, y al menos una lectura o escritura rechazada por cada actor no permitido. Probar que incluso el activo recibe rechazo al consultar o modificar `usuarios_administrativos`. Ajustar `plan(...)` al numero real de aserciones.

- [ ] **Step 2: Ejecutar la nueva prueba para confirmar el fallo antes de completar las politicas**

Run: `npm run supabase:reset; npm run supabase:test-db -- --file supabase/tests/database/05_admin_auth_security.test.sql`

Expected: falla inicialmente si falta alguna politica, privilegio o proteccion de tabla administrativa.

- [ ] **Step 3: Corregir solo la migracion si una asercion expone un permiso incompleto o excesivo**

Mantener como criterio: las cuatro tablas del catalogo permiten CRUD a administrador activo; `usuarios_administrativos` no permite acceso directo a ningun rol de aplicacion; `anon`, no registrado e inactivo no obtienen datos ni escrituras.

- [ ] **Step 4: Ejecutar la suite SQL completa desde una base limpia**

Run: `npm run supabase:reset; npm test`

Expected: todas las pruebas pgTAP terminan correctamente, con la nueva evidencia de RLS por actor.

### Task 4: Implementar las operaciones de Auth del cliente

**Files:**
- Create: `src/auth.js`
- Modify: `src/supabase.js:1-10`

**Interfaces:**
- Consumes: `supabase` y los métodos `signInWithPassword`, `signOut`, `resetPasswordForEmail`, `updateUser`, `getSession` y `onAuthStateChange`.
- Produces: `getAuthorizedSession()`, `signIn(email, password)`, `signOut()`, `requestPasswordRecovery(email)`, `updatePassword(password)` y `observeSession(listener)`.


- [ ] **Step 1: Definir el contrato del modulo de Auth**

Crear `src/auth.js` con funciones asincronas que devuelvan `{ data, error }` desde Supabase. `getAuthorizedSession()` debe obtener la sesion y llamar al RPC `es_administrador_activo`; si el RPC falla o devuelve `false`, debe ejecutar `supabase.auth.signOut()` y devolver `{ session: null, authorized: false }`.

```js
export async function getAuthorizedSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return { session: null, authorized: false };

  const { data: authorized, error: authorizationError } = await supabase
    .rpc('es_administrador_activo');

  if (authorizationError || !authorized) await supabase.auth.signOut();
  return { session: authorized ? session : null, authorized: Boolean(authorized) };
}
```

- [ ] **Step 2: Implementar inicio, cierre y recuperacion con retorno al origen**

Usar `signInWithPassword({ email, password })`, `signOut()`, `resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/` })` y `updateUser({ password })`. `observeSession(listener)` debe envolver `supabase.auth.onAuthStateChange` y devolver la funcion de cancelacion.

- [ ] **Step 3: Comprobar manualmente las llamadas de Auth contra Supabase local**

Crear un usuario por invitacion en Studio y registrar su UUID como administrador mediante SQL ejecutado como `postgres`. Confirmar en la consola de red que una cuenta no autorizada no obtiene una sesion administrativa y que ninguna clave secreta llega al bundle.

### Task 5: Crear la superficie administrativa y sus estados

**Files:**
- Modify: `index.html:1-19`
- Modify: `src/main.js:1-2`
- Modify: `src/styles.css:1-30`

**Interfaces:**
- Consumes: las funciones exportadas por `src/auth.js`.
- Produces: interfaz accesible para carga, acceso, recuperacion, nueva contrasena y sesion autorizada.

- [ ] **Step 1: Reemplazar el mensaje de preparacion por un contenedor de aplicacion**

En `index.html`, conservar `<main>` y darle `id="app"`; actualizar el titulo y la descripcion para identificar el acceso administrativo. No incluir formularios con contrasenas directamente en HTML: `main.js` los genera segun el estado.

- [ ] **Step 2: Implementar el renderizado de estados en `main.js`**

Mantener un unico estado `view` con valores `loading`, `sign-in`, `recovery-request`, `password-update` y `authorized`. Renderizar formularios con etiquetas asociadas, `autocomplete="email"`, `autocomplete="current-password"` o `autocomplete="new-password"`, region `aria-live="polite"` para resultados y botones deshabilitados durante envios.

Los manejadores deben:

```js
// Inicio: evita enviar campos vacios y muestra un error generico de Auth.
await signIn(email.value.trim(), password.value);

// Recuperacion: solo solicita el correo; siempre confirma que se revise el buzón.
await requestPasswordRecovery(email.value.trim());

// Nueva contrasena: exige valor no vacio, minimo de 6 caracteres y confirmacion identica.
await updatePassword(password.value);
```

Al cargar, determinar `password-update` cuando la URL contenga el flujo de recuperacion de Supabase; en los demas casos usar `getAuthorizedSession()`. Suscribirse con `observeSession` y volver a validar autorizacion cuando cambie la sesion. Al cerrar sesion, volver a `sign-in`.

- [ ] **Step 3: Aplicar estilos mobile-first y estados visibles**

Extender `styles.css` con una tarjeta centrada de ancho maximo, campos y botones con contraste suficiente, foco visible, mensajes de error y exito distinguibles tambien por texto, y una disposicion que funcione desde 320 px. Reutilizar la paleta actual; no crear un sistema visual adicional.

- [ ] **Step 4: Verificar manualmente cada flujo con Vite y Mailpit**

Run: `npm run dev`

Comprobar en navegador:

1. Administrador invitado y autorizado inicia sesion, recarga y conserva la vista autorizada.
2. Usuario invitado sin fila administrativa vuelve a acceso con mensaje generico.
3. Cerrar sesion elimina la vista autorizada.
4. Recuperacion envia correo a Mailpit; el enlace vuelve a Vite y permite cambiar contrasena.
5. Contrasena vacia, menor de seis caracteres o confirmacion distinta no invoca `updateUser`.
6. La vista es navegable por teclado, los campos tienen etiqueta y el foco es visible.

### Task 6: Validar el incremento y actualizar evidencia real

**Files:**
- Modify: `docs/development/mvp-implementation-roadmap.md:92-107, 269-284`
- Modify: `.ai/current-context.md:3-16`

**Interfaces:**
- Consumes: resultados reales de la suite SQL, compilacion y recorridos manuales.
- Produces: estado trazable del Incremento 2 sin afirmar validaciones no realizadas.

- [ ] **Step 1: Ejecutar la reconstruccion, pruebas y compilacion finales**

Run: `npm run supabase:reset`

Expected: migraciones y seed se aplican desde cero.

Run: `npm test`

Expected: todas las pruebas pgTAP pasan.

Run: `npm run build`

Expected: Vite produce el bundle sin errores.

- [ ] **Step 2: Repetir y registrar los recorridos manuales reales**

Completar los seis recorridos de Task 5, incluyendo el correo recibido en Mailpit. Registrar solo los resultados observados, las cuentas de prueba usadas sin contrasenas y cualquier limitacion, por ejemplo la configuracion pendiente de URLs de Auth y correo SMTP en el proyecto remoto.

- [ ] **Step 3: Actualizar el estado del proyecto**

En la hoja de ruta, marcar el Incremento 2 como completado solo si las pruebas y recorridos anteriores fueron correctos; incluir nombres de migracion, suite y fecha real. En `.ai/current-context.md`, actualizar fase, evidencia y siguiente trabajo recomendado: Incremento 3, CRUD administrativo de categorias. No declarar aplicada la migracion remota.

- [ ] **Step 4: Actualizar el grafo del repositorio**

Run: `graphify update .`

Expected: el grafo incremental incorpora la migracion, pruebas, modulo de Auth y documentacion; informar cualquier analizador omitido.

## Self-Review

- Cobertura de especificacion: Task 1 cubre invitacion sin registro y retorno de recuperacion; Tasks 2 y 3 cubren funcion, privilegios y RLS; Tasks 4 y 5 cubren inicio, restauracion, rechazo, cierre y actualizacion de contrasena; Task 6 cubre evidencia y limites remotos.
- Sin placeholders: cada tarea especifica archivos, comandos, contratos y criterios de aceptacion.
- Consistencia: el cliente usa la funcion `es_administrador_activo()` mediante RPC; la tabla administrativa no se expone al cliente.
- Review focus: cuenta sin autorizacion y administrador inactivo se prueban en Task 3 y Task 5; permisos anonimos y tabla cerrada se prueban en Task 2 y Task 3; validacion de nueva contrasena se comprueba en Task 5.
