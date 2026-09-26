# Diseno del Incremento 3: administracion de categorias

**Fecha:** 26 de septiembre de 2026

## Objetivo

Entregar el primer CRUD administrativo completo del MVP. Un administrador activo podra consultar, crear, editar, activar y desactivar categorias desde una interfaz responsive; los demas actores seguiran rechazados por RLS.

Este incremento satisface RF-04 a RF-07, RN-20 y RNF-01 a RNF-06. No incluye productos, imagenes, catalogo publico ni eliminacion fisica.

## Comportamiento confirmado

- Las cinco categorias iniciales se administran igual que las creadas posteriormente: pueden renombrarse, activarse y desactivarse.
- Las categorias no se eliminan desde la aplicacion.
- El nombre es obligatorio, se guarda sin espacios exteriores y permanece unico sin distinguir mayusculas y minusculas.
- Desactivar una categoria conserva sus datos y relaciones. Cuando exista catalogo publico, ocultara tambien sus productos sin alterar su historial.
- La base de datos y RLS son la autoridad; la validacion del navegador solo mejora la experiencia.

## Arquitectura del cliente

- `src/categories.js` encapsula las operaciones Supabase para listar, crear y actualizar categorias.
- `src/category-views.mjs` genera las vistas puras del espacio administrativo, listado, formulario, confirmacion y estados de datos.
- `src/main.js` coordina sesion, navegacion, eventos y transiciones de estado sin contener consultas a Supabase.
- Los estilos compartidos permanecen en `src/styles.css` y reutilizan los tokens aprobados en `docs/project/DESIGN.md`.

No se agregan dependencias, framework ni gestor de estado. El flujo usa la tabla `public.categorias` y la politica RLS administrativa existente.

## Interfaz administrativa

La interfaz adopta el modo de workspace definido para administracion: superficies claras, densidad moderada, negro para la accion principal y dorado o bronce como acento limitado.

En escritorio mostrara navegacion lateral, encabezado contextual `Categorias`, accion `Nueva categoria`, tabla compacta y panel lateral para crear o editar. En movil usara encabezado y lista estructurada; el panel se convertira en una vista de ancho completo. No se ocultaran acciones o datos esenciales.

Cada registro mostrara nombre, estado textual `Activa` o `Inactiva` y las acciones `Editar`, `Activar` o `Desactivar`. El mismo formulario servira para crear y editar, con nombre y estado. Las acciones principales mantendran objetivos tactiles suficientes y foco visible.

## Flujo y estados

1. El cliente valida la sesion administrativa antes de cargar datos.
2. Consulta todas las categorias ordenadas por nombre, incluidas las inactivas.
3. Crear o editar valida el nombre, bloquea envios duplicados y conserva el dato ante errores recuperables.
4. Desactivar exige confirmacion y explica su impacto futuro sobre el catalogo publico.
5. Activar se confirma de forma breve y mantiene el registro.
6. Una operacion correcta actualiza el listado y anuncia el resultado sin recargar la pagina.

La vista cubrira: cargando, listado, vacio, error con reintento, formulario nuevo, formulario de edicion, validacion, guardando, exito, confirmacion y sesion vencida. Los errores de unicidad se traduciran a un mensaje comprensible sin exponer detalles internos de PostgreSQL.

## Accesibilidad y responsive

- HTML semantico, etiquetas visibles, mensajes asociados y regiones de estado anunciables.
- Operacion completa con teclado, foco visible y devolucion del foco al cerrar paneles o confirmaciones.
- Estado comunicado mediante texto ademas de color.
- Sin desplazamiento horizontal para formularios o navegacion.
- Verificacion representativa a 390 px, 768 px y escritorio, ademas de zoom y texto ampliado cuando sea posible.

## Validacion

- Pruebas unitarias de vistas y funciones de estado con `node:test`.
- Pruebas del modulo de datos mediante cliente inyectable o funciones pequenas que permitan comprobar consultas, datos normalizados y errores sin agregar dependencias.
- Pruebas pgTAP que confirmen integridad del nombre y acceso RLS por actor; no se duplicaran pruebas ya cubiertas sin una regresion concreta.
- Validacion final con `npm test` y `npm run build`.
- Comprobacion manual del flujo principal y estados responsive; cualquier estado no observado se declarara pendiente.

## Fuera de alcance

- Eliminacion fisica de categorias.
- Busqueda o filtros administrativos de categorias, porque no son necesarios para el volumen inicial.
- Productos, presentaciones, inventario, imagenes y Storage.
- Lectura publica del catalogo.
- Dashboard o metricas.
- Aplicar cambios al proyecto remoto sin autorizacion expresa.
