# ADR-006: Almacenamiento externo de imágenes de producto

## Estado

Accepted

## Contexto

Un producto publicado debe tener al menos una imagen. PostgreSQL está destinado a conservar los datos relacionales del catálogo y las solicitudes, pero no es necesario almacenar directamente los archivos de imagen en la base de datos. El proveedor de despliegue aún no ha sido seleccionado.

## Decisión

Almacenar los archivos de imágenes de producto en un servicio externo especializado o de almacenamiento de objetos. PostgreSQL conservará la URL y los metadatos mínimos necesarios para asociar cada imagen con un producto y definir su orden cuando se implemente la funcionalidad correspondiente.

El proveedor concreto se elegirá antes de implementar la carga de imágenes y deberá ser compatible con el despliegue seleccionado.

La selección posterior de Supabase Storage como proveedor se registra en [ADR-007](ADR-007-servicios-backend-con-supabase.md).

## Motivos

- Evita depender del disco local o efímero del servidor de la aplicación.
- Simplifica el respaldo, la entrega y una posible migración de despliegue.
- Mantiene PostgreSQL enfocado en datos relacionales y facilita publicar imágenes desde el catálogo.
- Permite evaluar el proveedor según costo temporal, facilidad de uso y compatibilidad con el entorno final.

## Alternativas consideradas

- Guardar archivos en el disco del servidor de la aplicación.
- Almacenar archivos binarios dentro de PostgreSQL.

No se seleccionan inicialmente porque requieren resolver persistencia, copias de seguridad y migración de archivos junto con el servidor, sin aportar una ventaja confirmada para el MVP.

## Consecuencias

- La carga de imágenes requerirá validación de tipo y tamaño de archivo antes de enviarlas al proveedor.
- Las credenciales del servicio externo se gestionarán mediante variables de entorno y nunca se incluirán en el repositorio.
- El diseño del modelo lógico incluirá una entidad o tabla para las imágenes de producto.
- La aplicación deberá manejar errores de carga y conservar la coherencia entre el proveedor y los datos registrados.
