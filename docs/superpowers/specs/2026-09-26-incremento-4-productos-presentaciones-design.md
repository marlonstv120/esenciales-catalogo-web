# Diseno del Incremento 4: productos y presentaciones

**Fecha:** 26 de septiembre de 2026

## Objetivo

Entregar la administracion completa de productos y presentaciones para un administrador activo: crear, consultar, editar, activar y desactivar productos; administrar sus presentaciones; y actualizar rapidamente precio, promocion, stock y modo de disponibilidad.

El incremento satisface RF-08, RF-09, RF-11, RF-12, RF-16, RF-18 y RF-20; incorpora RF-13 y RF-19 como alcance confirmado. Aplica RN-05, RN-08, RN-09, RN-11 a RN-13 y RN-21 a RN-24. No implementa familia olfativa, imagenes o Storage, catalogo publico, solicitudes ni inventario transaccional.

## Decisiones confirmadas

- El administrador puede guardar productos incompletos. Se muestran como `No publicable` hasta cumplir RN-19; no existe una columna de publicacion.
- La creacion es secuencial: primero se guarda el producto; despues se habilita la administracion de sus presentaciones en la misma pantalla.
- Se incluye precio promocional opcional. Familia olfativa se aplaza.
- Los listados administrativos incluyen busqueda y filtros basicos. Productos filtra por nombre, categoria y estado; inventario por producto, categoria, modo y estado.
- Productos y presentaciones se conservan mediante desactivacion, sin eliminacion desde la aplicacion.
- Una categoria inactiva no puede seleccionarse para un producto nuevo o editado. Un producto de categoria inactiva conserva sus datos y se marca no publicable.

## Arquitectura

La aplicacion adopta un workspace administrativo modular con rutas hash `#categorias`, `#productos` e `#inventario`. El shell controla autenticacion, navegacion, sesion y cancelacion de cargas obsoletas. Cada modulo de dominio concentra sus consultas Supabase, estado local, vistas y eventos.

- `src/admin-shell.js`: workspace, navegacion hash y proteccion de sesion.
- `src/categories-controller.js`: traslado del CRUD actual de categorias sin cambios funcionales.
- `src/products.js` y `src/product-views.mjs`: consultas y vistas de productos/presentaciones.
- `src/products-controller.js`: listado, formulario de producto y presentaciones asociadas.
- `src/inventory-controller.js`: listado y actualizacion rapida de presentaciones.
- `src/main.js`: solo inicializa Auth y el shell cuando la sesion esta autorizada.

Se reutilizan Supabase, RLS, esquema, tokens y componentes existentes. No se agregan dependencias ni se usa `service_role`.

## Producto y presentaciones

El formulario de producto contiene nombre, descripcion, categoria activa, marca, genero, referencia, clasificacion, destacado y activo. Nombre, descripcion y categoria son obligatorios. Marca y referencia se normalizan a `null` cuando estan vacias. Genero solo admite hombre, mujer o unisex; clasificacion usa los valores de base de datos y se etiqueta visualmente como Original, 1.1 e Inspiracion sin definir contenido comercial no confirmado.

Tras guardar, la seccion Presentaciones permite crear, editar, activar y desactivar registros. Cada una requiere etiqueta, precio normal COP entero positivo, stock entero no negativo y modo. Promocion es opcional, positiva y menor al precio normal. Bajo pedido mantiene stock cero; Venta inmediata muestra Disponible o Agotado segun stock; No disponible conserva el registro sin admitir solicitudes futuras. Una presentacion inactiva no participa en los resumenes posteriores del catalogo.

El resumen `No publicable` enumera condiciones faltantes: producto inactivo, categoria inactiva, imagen pendiente o falta de presentacion activa valida. Las imagenes no se simulan ni se suben en este incremento.

## Interfaz y accesibilidad

Administracion usa superficies blancas, densidad moderada, negro como accion principal y oro o bronce como acento discreto, conforme a `docs/project/DESIGN.md`. En escritorio, el shell usa navegacion lateral y tablas donde comparen producto, precio, stock y modo; en movil, encabezado accesible, navegacion compacta y listas estructuradas sin ocultar acciones.

El editor de producto ocupa una vista o panel de tarea a ancho completo en movil. Las presentaciones se administran dentro del producto ya creado. Inventario ofrece edicion breve por presentacion sin repetir el formulario completo. Campos tienen etiqueta, ayuda y error asociado; estados se comunican con texto y color. Paneles y confirmaciones incluyen foco inicial, trampa de foco, Escape cuando sea seguro y devolucion de foco.

Se cubren cargando, vacio, sin resultados, error/reintento, validacion, procesando, exito, confirmacion y sesion vencida. Cargas o mutaciones obsoletas nunca pueden volver a mostrar datos despues de que la sesion se invalida.

## Datos, seguridad y validacion

El cliente valida tipos, campos requeridos y relaciones para mejorar la experiencia. PostgreSQL conserva la autoridad mediante restricciones ya existentes y RLS autoriza unicamente a administradores activos. Los errores `23505` de referencia se muestran sin detalles internos; errores de restricciones se traducen a mensajes accionables.

Se agregan solo pruebas nuevas para normalizacion y reglas de cliente que no esten cubiertas por pgTAP. La validacion automatizada final ejecuta `npm test` y `npm run build`. El recorrido manual en 390 px, 768 px y escritorio, junto con teclado, zoom, datos largos y estados de error, queda pendiente de ejecucion por el equipo y no se declarara realizado sin evidencia.

## Fuera de alcance

- Familia olfativa.
- Carga, reemplazo, orden o retiro de imagenes y Supabase Storage.
- Vista publica, filtros publicos, carrito y solicitudes.
- Movimientos de almacen, costos internos, reportes o dashboard.
- Eliminacion fisica de productos o presentaciones.
- Cambios remotos de base de datos o despliegue sin autorizacion explicita.
