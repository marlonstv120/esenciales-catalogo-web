# Estrategia de implementacion del MVP

**Fecha:** 24 de septiembre de 2026
**Estado:** aprobada para planificacion
**Proyecto:** Sistema web para la gestion y publicacion del catalogo de productos para la empresa ESENCIALES

## 1. Proposito

Esta especificacion define como organizar la implementacion del MVP a partir del estado actual del repositorio. No reemplaza el alcance funcional, los requisitos, las reglas de negocio ni el modelo de datos. Su funcion es convertir esos documentos en una secuencia de incrementos pequenos, verificables y demostrables.

Fuentes rectoras:

- [Alcance funcional MVP V1](../../project/functional-scope.md).
- [Requisitos](../../project/requirements.md).
- [Reglas de negocio](../../project/business-rules.md).
- [Actores y flujos](../../project/actors-and-flows.md).
- [Arquitectura](../../architecture/overview.md).
- [Modelo logico de datos](../../architecture/data-model.md).

## 2. Estado de partida

El proyecto cuenta con:

- frontend base creado con Vite, HTML5, CSS3 y JavaScript sin framework;
- cliente `@supabase/supabase-js` configurado mediante variables de entorno;
- Supabase CLI inicializada y vinculada al proyecto remoto;
- entorno local de Supabase disponible cuando Docker Desktop esta en ejecucion;
- alcance, requisitos, reglas de negocio y modelo logico documentados;
- arquitectura confirmada con PostgreSQL, Supabase Auth, Storage, RLS y funciones RPC.

Al redactar esta estrategia todavía no existían migraciones versionadas, datos iniciales ejecutables, políticas RLS ni funcionalidades de catálogo conectadas a Supabase. El Incremento 1 ya materializó localmente el núcleo de catálogo, sus datos iniciales y RLS cerrado; las funciones RPC y las funcionalidades de catálogo conectadas al cliente siguen pendientes.

## 3. Estrategia seleccionada

La implementacion se organizara mediante **incrementos verticales funcionales**. Cada incremento debe producir una capacidad pequena que pueda probarse desde sus reglas de datos hasta su comportamiento visible, en lugar de implementar primero toda la base de datos y despues todo el frontend.

Se usaran dos niveles de planificacion:

1. Un plan maestro en `docs/development/mvp-implementation-roadmap.md`, con la secuencia completa, dependencias, requisitos cubiertos y criterios de salida.
2. Planes ejecutables por incremento en `docs/development/plans/`, con tareas tecnicas concretas, archivos, comandos, pruebas y puntos de verificacion.

Los planes ejecutables se escribiran cerca del momento de implementarlos. Asi podran incorporar lo aprendido en incrementos anteriores sin convertir supuestos iniciales en instrucciones obsoletas.

## 4. Secuencia de incrementos

### Incremento 1: base de datos del catalogo

Materializar el nucleo del modelo de catalogo mediante migraciones versionadas: usuarios administrativos, categorias, productos, presentaciones e imagenes de producto. Incluir restricciones, relaciones, indices, marcas de tiempo y categorias iniciales reproducibles.

Resultado demostrable: `supabase db reset` reconstruye el esquema local desde cero y deja disponibles las categorias iniciales, con restricciones verificadas mediante pruebas SQL.

### Incremento 2: seguridad y autenticacion administrativa

Configurar la autorizacion basada en Supabase Auth y `usuarios_administrativos`, implementar las politicas RLS iniciales y establecer el flujo de inicio, cierre y recuperacion de sesion administrativa.

Resultado demostrable: un administrador autorizado puede ingresar y un usuario anonimo o autenticado no autorizado no puede ejecutar operaciones administrativas.

### Incremento 3: administracion de categorias

Implementar el primer flujo vertical completo de consulta, creacion, edicion, activacion y desactivacion de categorias.

Resultado demostrable: el administrador gestiona categorias desde la interfaz y las categorias inactivas dejan de estar disponibles para el catalogo publico sin perderse de la administracion.

### Incremento 4: administracion de productos y presentaciones

Implementar productos, presentaciones, precios, stock, disponibilidad, activacion y seleccion manual de destacados. Aplicar las reglas obligatorias en PostgreSQL y repetir en el cliente solamente las validaciones necesarias para una experiencia comprensible.

Resultado demostrable: el administrador puede preparar un producto con una presentacion valida y controlar su precio, stock, disponibilidad y estado destacado.

### Incremento 5: imagenes de productos

Crear el bucket de Supabase Storage, sus politicas y el flujo de carga y asociacion de al menos una imagen por producto. Registrar la ruta del objeto y los metadatos necesarios en PostgreSQL.

Resultado demostrable: un administrador carga una imagen valida y el producto puede cumplir la condicion minima de publicacion.

### Incremento 6: catalogo publico

Implementar la consulta publica de productos publicables, productos destacados, tarjetas y detalle con presentaciones. La publicacion y la disponibilidad se derivaran de las reglas vigentes, no de estados duplicados editables.

Resultado demostrable: un visitante sin sesion puede consultar desde celular un producto activo y publicable, con precio y disponibilidad expresados mediante texto.

### Incremento 7: busqueda y filtros obligatorios

Agregar busqueda por nombre y filtros por categoria y disponibilidad. Mantener fuera de este incremento los filtros y ordenamientos de prioridad SHOULD.

Resultado demostrable: el visitante encuentra productos mediante los tres mecanismos obligatorios y obtiene estados vacios o de error comprensibles.

### Incremento 8: carrito

Implementar seleccion de presentacion, cantidades, combinacion de venta inmediata y bajo pedido, modificacion de lineas, subtotales y valor total de productos. La persistencia local se tratara como mejora SHOULD y no bloqueara el flujo principal.

Resultado demostrable: el visitante prepara un carrito valido sin registrar todavia una solicitud.

### Incremento 9: registro de solicitudes y WhatsApp

Crear las tablas de solicitudes y detalles, la secuencia de codigos y una funcion RPC publica con permisos limitados. La funcion revalidara el carrito y conservara precios historicos, versiones legales y fecha de aceptacion. Despues del registro, el cliente preparara el mensaje para WhatsApp como accion voluntaria.

Resultado demostrable: una solicitud valida queda registrada con codigo unico aunque el visitante no abra WhatsApp; una solicitud invalida no deja datos parciales.

### Incremento 10: administracion transaccional de solicitudes

Implementar consulta administrativa, edicion restringida de solicitudes nuevas, confirmacion, entrega y cancelacion. Las funciones RPC de PostgreSQL manejaran bloqueos, descuento y restitucion de inventario.

Resultado demostrable: el flujo de estados respeta las transiciones aprobadas y dos confirmaciones concurrentes no producen stock negativo ni doble descuento.

### Incremento 11: endurecimiento y validacion integral

Completar pruebas de seguridad, concurrencia, accesibilidad, experiencia responsive, manejo de errores y recorrido funcional de principio a fin. Las mejoras SHOULD solo se incorporaran si el nucleo obligatorio ya es estable.

Resultado demostrable: existe evidencia reproducible del cumplimiento de los criterios de aceptacion del MVP y una lista explicita de limitaciones pendientes.

### Incremento 12: despliegue y evidencia academica

Configurar el entorno de produccion, aplicar migraciones mediante el flujo acordado, desplegar el frontend y ejecutar la validacion final. Registrar unicamente resultados y evidencias realmente obtenidos.

Resultado demostrable: la aplicacion esta desplegada, utiliza PostgreSQL en el entorno definitivo y cuenta con evidencia verificable para el informe y la sustentacion.

## 5. Dependencias entre incrementos

La secuencia principal es deliberadamente lineal:

```text
Base de datos
  -> Autenticacion y seguridad
  -> Categorias
  -> Productos y presentaciones
  -> Imagenes
  -> Catalogo publico
  -> Busqueda y filtros
  -> Carrito
  -> Registro de solicitudes
  -> Administracion transaccional
  -> Validacion integral
  -> Despliegue
```

Un incremento puede preparar interfaces tecnicas para el siguiente, pero no debe implementar anticipadamente funcionalidades SHOULD o COULD que no sean necesarias para validar su resultado.

## 6. Flujo de datos y limites de responsabilidad

- El frontend ofrece navegacion, formularios, validacion de experiencia y presentacion de errores.
- Supabase Auth gestiona identidad, credenciales, sesiones y recuperacion de contrasena.
- PostgreSQL conserva el estado de negocio y aplica restricciones que no deben depender del navegador.
- RLS determina que filas puede consultar o modificar cada actor.
- Las funciones RPC concentran operaciones de negocio que requieren validacion integral, permisos controlados o atomicidad.
- Supabase Storage conserva archivos de imagen; PostgreSQL conserva sus referencias y metadatos.
- El navegador nunca recibe credenciales administrativas o claves de servicio.

## 7. Seguridad y manejo de errores

Cada incremento debe fallar de forma segura y comprensible:

- RLS estara habilitado en las tablas expuestas por la API de Supabase.
- Los permisos se concederan de forma minima a `anon` y `authenticated`.
- La pertenencia a `usuarios_administrativos` se comprobara en las operaciones administrativas.
- Las funciones con privilegios elevados fijaran un `search_path` seguro y validaran todos sus parametros.
- Los errores tecnicos se registraran para desarrollo sin exponer datos sensibles al usuario.
- El frontend distinguira carga, ausencia de datos, validacion, falta de autorizacion y error inesperado.
- Ninguna operacion transaccional podra dejar solicitudes o inventario parcialmente actualizados.

## 8. Estrategia de pruebas

La validacion se realizara por capas:

- **Migraciones:** reconstruccion completa con `supabase db reset`.
- **Pruebas SQL:** restricciones, RLS, permisos, funciones RPC y transacciones.
- **Pruebas del cliente:** logica aislable del frontend cuando exista infraestructura adecuada.
- **Pruebas de integracion:** navegador y cliente Supabase contra el entorno local.
- **Pruebas manuales:** responsive, accesibilidad basica, mensajes, navegacion y flujos completos.
- **Compilacion:** `npm run build` al cerrar cada incremento que afecte al cliente.

Las pruebas de concurrencia son obligatorias para confirmacion y cancelacion de solicitudes. La evidencia academica se producira despues de ejecutar las pruebas, nunca como resultado anticipado.

## 9. Criterio de finalizacion de un incremento

Un incremento se considera terminado solamente cuando:

1. Su comportamiento obligatorio esta implementado.
2. Las migraciones parten de un entorno local limpio.
3. Las pruebas definidas para el incremento pasan.
4. Las politicas de seguridad aplicables han sido verificadas con actores permitidos y denegados.
5. El codigo afectado fue revisado y la compilacion correspondiente es satisfactoria.
6. La documentacion afectada refleja el estado realmente implementado.
7. No se afirma como implementado ningun comportamiento pendiente o no probado.

## 10. Gestion de cambios y documentacion

- Las migraciones SQL seran la fuente tecnica del esquema implementado.
- El contrato real de consultas y RPC se documentara en `api/` a medida que exista y sea probado.
- Los datos reproducibles de desarrollo se mantendran en `supabase/seed.sql` sin datos personales reales.
- Los cambios relevantes de arquitectura requeriran actualizar el documento correspondiente o crear un ADR cuando sustituyan una decision vigente.
- `.ai/current-context.md` se mantendra breve y apuntara a las fuentes permanentes.
- Los resultados academicos se actualizaran solo cuando exista evidencia real.

## 11. Primer plan ejecutable

El primer plan detallado cubrira exclusivamente el Incremento 1. Debe especificar:

- lectura final de reglas de negocio relacionadas con catalogo y datos;
- migracion inicial para las cinco tablas del nucleo de catalogo;
- tipos, claves, restricciones, indices y mecanismo de `actualizado_en`;
- carga reproducible de las cinco categorias iniciales;
- pruebas SQL positivas y negativas;
- ejecucion de `supabase db reset` y revision del esquema local;
- actualizacion de la documentacion de estado;
- prohibicion de aplicar cambios al proyecto remoto hasta completar la validacion local.

RLS se preparara cuidadosamente en este incremento si es necesario para no exponer tablas, pero la autorizacion administrativa completa y su prueba de extremo a extremo pertenecen al Incremento 2.

## 12. Decisiones pendientes que no bloquean el inicio

No bloquean el Incremento 1:

- confirmacion academica de un segundo rol autenticado;
- definiciones publicas de clasificaciones comerciales;
- numero de WhatsApp y textos de entrega o envio;
- contenido legal definitivo;
- proveedor de despliegue;
- datos e imagenes reales.

Estas decisiones deberan resolverse antes del incremento que las consume. El modelo inicial no incluira un sistema de roles anticipado ni funcionalidades fuera del MVP.
