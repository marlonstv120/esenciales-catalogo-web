# Diseno del Incremento 5: imagen principal de producto

**Fecha:** 26 de septiembre de 2026

## Objetivo

Permitir que un administrador activo cargue, reemplace y retire una imagen principal por producto mediante Supabase Storage, dejando al producto en condiciones de cumplir RN-19 sin impedir que existan productos incompletos.

## Decisiones confirmadas

- El producto puede crearse y permanecer sin imagen; en ese estado es `No publicable`.
- La interfaz administrativa muestra `Imagen no disponible` como respaldo neutral. No es imagen comercial ni habilita publicacion.
- Se administra una imagen principal en `imagenes_producto.posicion = 0`. El modelo actual conserva compatibilidad con multiples imagenes futuras.
- Bucket publico `productos` para lectura publica futura. Carga, actualizacion y eliminacion solo para administradores activos.
- Se aceptan JPEG, PNG y WebP de hasta 5 MiB.
- El texto alternativo inicia con el nombre del producto y puede editarse.

## Arquitectura y consistencia

Una migracion crea el bucket `productos`, limita MIME/tamano y define politicas sobre `storage.objects` basadas en `public.es_administrador_activo()`. El cliente usa rutas unicas `productos/<producto-id>/<uuid>.<extension>`.

Para cargar o reemplazar: validar archivo, subir objeto, insertar o actualizar el registro `imagenes_producto`, y eliminar el objeto anterior solo tras persistir el nuevo registro. Si falla PostgreSQL, borrar el nuevo objeto como compensacion. Si falla la limpieza del objeto anterior, conservar el registro correcto y mostrar error recuperable.

Para retirar: eliminar primero el registro para que la imagen deje de estar referenciada y despues eliminar el objeto. Un fallo de Storage deja un objeto huerfano no expuesto; el usuario recibe una accion de reintento de limpieza.

## Interfaz

La seccion Imagen del editor de producto muestra previsualizacion `4 / 5`, texto alternativo, selector de archivo, accion de reemplazo y retiro. Sin archivo, muestra el estado neutral aprobado. La carga bloquea envios duplicados, comunica progreso y conserva datos recuperables. Se reutilizan tokens, contrastes, foco y responsive de `docs/project/DESIGN.md`.

## Validacion

- Pruebas pgTAP para bucket y politicas de Storage si el entorno las permite.
- Pruebas Node limitadas a validacion de tipo/tamano y construccion de ruta.
- `npm test` y `npm run build`.
- El equipo ejecuta el recorrido manual de carga, reemplazo, retiro, error, teclado y responsive; no se declarara realizado sin evidencia.

## Fuera de alcance

- Carga multiple, ordenamiento y galeria.
- Transformacion automatica de imagenes.
- Catalogo publico y optimizacion medida de imagenes.
- Cambios remotos de Supabase o despliegue sin autorizacion expresa.
