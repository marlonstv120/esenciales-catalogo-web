# Hoja de ruta de implementacion del MVP

**Proyecto:** Sistema web para la gestion y publicacion del catalogo de productos para la empresa ESENCIALES
**Fecha base:** 24 de septiembre de 2026
**Estado:** aprobado para ejecucion incremental

## 1. Objetivo

Organizar la construccion completa del MVP en incrementos verticales, pequenos y verificables. Cada incremento debe entregar una capacidad demostrable, conservar la seguridad de los datos y dejar evidencia suficiente para continuar sin depender de supuestos no validados.

Esta hoja de ruta define el orden general. Los pasos tecnicos exactos se escriben en planes separados bajo [`plans/`](plans/) antes de implementar cada incremento.

## 2. Documentos rectores

- [Estrategia de implementacion](../superpowers/specs/2026-09-24-mvp-implementation-strategy-design.md).
- [Alcance funcional MVP V1](../project/functional-scope.md).
- [Requisitos](../project/requirements.md).
- [Reglas de negocio](../project/business-rules.md).
- [Actores y flujos](../project/actors-and-flows.md).
- [Arquitectura](../architecture/overview.md).
- [Modelo logico de datos](../architecture/data-model.md).

Si estos documentos entran en conflicto, se aplicara la prioridad definida en `AGENTS.md`. Una decision pendiente no se tratara como requisito confirmado.

## 3. Principios de ejecucion

1. Implementar primero requisitos MUST; los SHOULD no bloquearan el flujo principal.
2. Completar y validar un incremento antes de iniciar el siguiente.
3. Probar migraciones localmente desde una base limpia antes de considerar cambios remotos.
4. Mantener las reglas criticas en PostgreSQL, RLS o funciones RPC, no solo en el navegador.
5. No exponer claves de servicio ni credenciales administrativas en el frontend.
6. No documentar como implementado o probado algo que aun no tenga evidencia.
7. Actualizar solamente la documentacion afectada por cada incremento.
8. Mantener fuera del MVP pagos, cuentas de clientes, reportes de ventas, multiemprendimiento y las demas exclusiones confirmadas.

## 4. Estado inicial

| Area | Estado al iniciar |
| --- | --- |
| Frontend | Vite, HTML5, CSS3 y JavaScript base; sin funcionalidades conectadas. |
| Cliente Supabase | Configurado mediante `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`. |
| Supabase CLI | Inicializada y vinculada al proyecto remoto. |
| Desarrollo local | Requiere Docker Desktop en ejecucion. |
| Base de datos | Sin migraciones de negocio. |
| Datos iniciales | `supabase/seed.sql` sin datos. |
| Seguridad | Sin politicas RLS de negocio. |
| RPC | Sin funciones de dominio. |
| Storage | Servicio habilitado, sin bucket ni politicas de productos. |
| Pruebas | Sin suite automatizada del proyecto. |

## 5. Mapa de incrementos

| Numero | Incremento | Entrega principal | Depende de |
| --- | --- | --- | --- |
| 1 | Base de datos del catalogo | Esquema reproducible de catalogo y pruebas SQL | Infraestructura actual |
| 2 | Seguridad y autenticacion | Acceso administrativo autorizado y RLS | 1 |
| 3 | Categorias | Primer CRUD administrativo completo | 2 |
| 4 | Productos y presentaciones | Gestion del nucleo comercial e inventario | 3 |
| 5 | Imagenes | Storage y asociacion segura de imagenes | 4 |
| 6 | Catalogo publico | Inicio, tarjetas, destacados y detalle | 5 |
| 7 | Busqueda y filtros | Nombre, categoria y disponibilidad | 6 |
| 8 | Carrito | Preparacion local de una solicitud | 7 |
| 9 | Registro de solicitudes | Persistencia transaccional y WhatsApp | 8 |
| 10 | Administracion de solicitudes | Estados e inventario transaccional | 9 |
| 11 | Endurecimiento y validacion | MVP probado de extremo a extremo | 10 |
| 12 | Despliegue y evidencia | Produccion y resultados verificables | 11 |

## 6. Incrementos

### 1. Base de datos del catalogo

**Objetivo:** materializar el modelo minimo que necesitan la autenticacion y el catalogo.

**Incluye:**

- `usuarios_administrativos`;
- `categorias`;
- `productos`;
- `presentaciones`;
- `imagenes_producto`;
- claves, restricciones, indices y marcas de tiempo;
- RLS habilitado en modo cerrado;
- cinco categorias iniciales;
- pruebas SQL reproducibles.

**Requisitos y reglas relacionados:** RF-04, RF-06, RF-09 a RF-20; RN-05, RN-08, RN-12, RN-13, RN-19 a RN-24; RNF-04 a RNF-06.

**Puerta de salida:** `supabase db reset` y `supabase test db` terminan correctamente en local; ninguna tabla nueva concede acceso accidental a `anon` o `authenticated`.

**Plan ejecutable:** [01-catalog-database.md](plans/01-catalog-database.md).

### 2. Seguridad y autenticacion administrativa

**Objetivo:** identificar al administrador y autorizar de forma explicita sus operaciones.

**Incluye:**

- inicio y cierre de sesion;
- recuperacion de contrasena por correo;
- alta controlada del administrador inicial;
- funcion reutilizable para comprobar administradores activos;
- RLS administrativa para las tablas del catalogo;
- proteccion de vistas y estados de sesion en el cliente.

**Requisitos:** RF-01 a RF-03, RF-56, RNF-04.

**Puerta de salida:** administrador activo permitido; visitante, usuario no autenticado y usuario autenticado no autorizado rechazados; recuperacion comprobada localmente mediante el servidor de correo de Supabase.

### 3. Administracion de categorias

**Objetivo:** entregar el primer flujo vertical administrativo completo.

**Incluye:** listado, creacion, edicion, activacion, desactivacion, validaciones, carga, vacio, error y confirmaciones necesarias.

**Requisitos:** RF-04 a RF-07; RN-20; RNF-01 a RNF-06.

**Puerta de salida:** el administrador gestiona categorias desde movil y escritorio; las operaciones no autorizadas fallan en la base, aunque se invoquen fuera de la interfaz.

### 4. Administracion de productos y presentaciones

**Objetivo:** gestionar la informacion comercial y de inventario del catalogo.

**Incluye:**

- productos y su categoria principal;
- presentaciones, precios, stock y disponibilidad;
- activacion y desactivacion;
- clasificacion y genero opcionales;
- seleccion manual de destacados;
- validacion visual y en PostgreSQL.

**Requisitos:** RF-08 a RF-13, RF-16 a RF-20; RN-05, RN-08, RN-09, RN-11 a RN-13, RN-21 a RN-24.

**Puerta de salida:** un administrador crea y mantiene un producto con una presentacion valida; no se admiten precios, stock, modos o combinaciones invalidas.

### 5. Imagenes de productos

**Objetivo:** completar la condicion minima de publicacion mediante imagenes administradas con seguridad.

**Incluye:** bucket, tipos y tamano permitidos, politicas Storage, carga, asociacion, texto alternativo, posicion y retiro seguro.

**Requisitos:** RF-14, RF-15; RF-17; RN-19; RNF-04, RNF-07, RNF-08.

**Puerta de salida:** solo un administrador autorizado modifica imagenes; un visitante puede leer las imagenes publicas necesarias; retirar una imagen no deja referencias incoherentes.

### 6. Catalogo publico

**Objetivo:** permitir la consulta publica y mobile-first del catalogo publicable.

**Incluye:** portada minima, categorias activas, productos destacados, tarjetas, precio de referencia, resumen de disponibilidad y detalle por presentacion.

**Requisitos:** RF-17, RF-21 a RF-26; RN-11, RN-12, RN-19 a RN-24; RNF-01 a RNF-03, RNF-07, RNF-08.

**Puerta de salida:** un visitante sin sesion solo ve productos publicables y comprende precio y disponibilidad sin depender unicamente del color.

### 7. Busqueda y filtros obligatorios

**Objetivo:** encontrar productos por los mecanismos MUST.

**Incluye:** busqueda por nombre, categoria y disponibilidad, combinacion de criterios, limpieza de filtros y estados sin resultados.

**Requisitos:** RF-28, RF-29; RN-11; RNF-01 a RNF-03, RNF-07.

**Puerta de salida:** los resultados cumplen la semantica por presentacion y no muestran productos no publicables.

### 8. Carrito

**Objetivo:** preparar una solicitud sin modificar inventario ni requerir cuenta de cliente.

**Incluye:** agregar presentacion, cantidades de 1 a 99, limite por stock inmediato, combinacion con bajo pedido, edicion, retiro, subtotales y total de productos.

**Requisitos:** RF-32 a RF-36; RN-01 a RN-06; RNF-01 a RNF-03, RNF-06.

**Puerta de salida:** el visitante prepara y revisa un carrito valido; agotados y no disponibles no pueden agregarse; ningun cambio local descuenta stock.

### 9. Registro de solicitudes y WhatsApp

**Objetivo:** registrar de manera atomica la intencion de compra y ofrecer la continuacion voluntaria por WhatsApp.

**Incluye:**

- tablas `solicitudes` y `detalles_solicitud`;
- codigo `ES-00001` basado en secuencia;
- nombre, telefono, ciudad y observaciones;
- terminos, politica, versiones y fecha de aceptacion;
- revalidacion completa mediante RPC;
- precios historicos;
- mensaje de WhatsApp posterior al registro.

**Requisitos:** RF-38 a RF-44, RF-57 a RF-59; RN-01 a RN-06, RN-13, RN-14, RN-26; RNF-04 a RNF-06.

**Puerta de salida:** una solicitud valida se registra completa una sola vez; entradas invalidas no dejan cabecera ni lineas parciales; no se descuenta stock; abrir WhatsApp es opcional.

### 10. Administracion transaccional de solicitudes

**Objetivo:** gestionar solicitudes e inventario sin inconsistencias.

**Incluye:** listado, detalle, edicion permitida de Nueva, confirmacion, entrega, cancelacion, bloqueos y restitucion exacta.

**Requisitos:** RF-45 a RF-53; RN-06 a RN-10, RN-15 a RN-18; RNF-04 a RNF-06.

**Puerta de salida:** las transiciones invalidas fallan; una solicitud confirmada es inmutable; concurrencia no produce stock negativo ni doble descuento; cancelar restituye solo `cantidad_descontada`.

### 11. Endurecimiento y validacion integral

**Objetivo:** comprobar el criterio general de aceptacion del MVP y corregir defectos del recorrido completo.

**Incluye:** pruebas funcionales, RLS, concurrencia, errores, accesibilidad basica, navegadores objetivo, movil, compilacion y revision de funcionalidades SHOULD que sean viables.

**Requisitos:** criterio general de aceptacion del alcance; RNF-01 a RNF-08.

**Puerta de salida:** recorrido de aceptacion documentado con resultados reales; defectos bloqueantes corregidos; limitaciones restantes declaradas.

### 12. Despliegue y evidencia academica

**Objetivo:** publicar la aplicacion y producir evidencia verificable.

**Incluye:** proveedor aprobado, variables de entorno, flujo de migraciones, configuracion de Auth y Storage, frontend desplegado, pruebas de humo y registro de resultados.

**Requisitos:** RNF-09 y objetivo especifico de validacion.

**Puerta de salida:** aplicacion accesible en produccion, base PostgreSQL definitiva, secretos protegidos y evidencia incorporada a la documentacion academica sin resultados inventados.

## 7. Trabajo SHOULD y COULD

Las siguientes capacidades se evaluaran despues de estabilizar los MUST relacionados:

- varias imagenes y orden visual;
- precio promocional;
- filtros por genero, marca y precio;
- ordenamiento;
- persistencia local del carrito;
- dashboard sencillo;
- familia olfativa;
- contenido ampliado de inicio y contacto;
- configuracion editable de redes y WhatsApp.

Su inclusion requiere que no comprometan seguridad, pruebas, despliegue ni la fecha academica. Las definiciones publicas de clasificaciones comerciales requieren validacion previa de ESENCIALES.

## 8. Decisiones que deben resolverse en el momento adecuado

| Decision | Limite para resolverla |
| --- | --- |
| Segundo rol autenticado | Antes de cerrar el Incremento 2 |
| Definiciones de `Original`, `1.1` e `Inspiracion` | Antes de publicar su explicacion |
| Datos e imagenes reales | Antes de la validacion integral |
| Bucket, limites y formatos de imagen | Durante el plan del Incremento 5 |
| Formato tecnico de telefono | Durante el plan del Incremento 9 |
| Versiones legales vigentes | Antes de cerrar el Incremento 9 |
| Numero de WhatsApp y textos de entrega | Antes de cerrar el Incremento 9 |
| Proveedor de despliegue | Antes del Incremento 12 |

## 9. Validacion comun

Cada plan ejecutable debe incluir, segun corresponda:

- prueba que falle antes de implementar el comportamiento;
- implementacion minima que satisfaga el requisito;
- prueba positiva y prueba de rechazo;
- `supabase db reset` para cambios de base de datos;
- `supabase test db` para SQL, RLS o RPC;
- `npm run build` para cambios del cliente;
- comprobacion manual de estados de carga, vacio, exito y error;
- revision de seguridad por actor;
- actualizacion de documentacion afectada.

## 10. Control de avance

Un incremento solo cambia a completado cuando cumple su puerta de salida y cuenta con evidencia reciente. La tabla siguiente se actualizara durante la ejecucion:

| Incremento | Estado | Evidencia |
| --- | --- | --- |
| 1. Base de datos del catalogo | Completado | Migración `20260924000100_create_catalog_core.sql`, seed reproducible y 95 pruebas pgTAP locales. |
| 2. Seguridad y autenticacion | Pendiente | Se definira al cerrar el Incremento 1 |
| 3. Categorias | Pendiente | Se definira al cerrar el Incremento 2 |
| 4. Productos y presentaciones | Pendiente | Se definira al cerrar el Incremento 3 |
| 5. Imagenes | Pendiente | Se definira al cerrar el Incremento 4 |
| 6. Catalogo publico | Pendiente | Se definira al cerrar el Incremento 5 |
| 7. Busqueda y filtros | Pendiente | Se definira al cerrar el Incremento 6 |
| 8. Carrito | Pendiente | Se definira al cerrar el Incremento 7 |
| 9. Registro de solicitudes | Pendiente | Se definira al cerrar el Incremento 8 |
| 10. Administracion de solicitudes | Pendiente | Se definira al cerrar el Incremento 9 |
| 11. Endurecimiento y validacion | Pendiente | Se definira al cerrar el Incremento 10 |
| 12. Despliegue y evidencia | Pendiente | Se definira al cerrar el Incremento 11 |

## 11. Regla para los planes siguientes

Antes de escribir cada nuevo plan se revisaran el incremento anterior, el estado real del codigo, las pruebas y las decisiones pendientes que ahora sean necesarias. No se crearan por adelantado doce planes detallados que puedan quedar desactualizados.
