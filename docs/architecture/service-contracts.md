# Contratos de servicios

El frontend consume directamente los servicios de Supabase. No existe una API propia basada en Express: PostgreSQL expone las operaciones de dominio mediante funciones RPC, Supabase Auth protege la administracion y una Edge Function recibe los comprobantes de pago.

Las migraciones versionadas en [`supabase/migrations/`](../../supabase/migrations/) son la fuente ejecutable y definitiva de estos contratos. Las pruebas relacionadas se encuentran en [`supabase/tests/database/`](../../supabase/tests/database/).

## Catalogo publico

Las tablas del catalogo no conceden lectura ni escritura directa a `anon`.

| Servicio | Entrada principal | Salida y comportamiento |
| --- | --- | --- |
| `obtener_catalogo_publico` | Ninguna | Categorias activas y productos publicables. Incluye precio de referencia y disponibilidad textual; conserva categorias activas sin productos publicables. |
| `buscar_catalogo_publico` | Busqueda y filtros permitidos | Productos publicables que cumplen los filtros combinados. Las reglas de publicacion y precios se aplican en PostgreSQL. |
| `obtener_producto_publico` | `producto_id integer` | Objeto JSONB o `NULL`. Incluye metadatos, galeria y presentaciones activas con precio, disponibilidad y limite solicitable; no expone el stock numerico completo. |

Un producto publicable esta activo, pertenece a una categoria activa, tiene al menos una imagen y una presentacion activa valida con precio.

## Solicitudes publicas

`registrar_solicitud_compra` valida y registra atomicamente los datos del cliente, aceptaciones legales, productos, presentaciones, cantidades, precios y disponibilidad. Conserva precios historicos, asigna un codigo legible y no descuenta inventario mientras la solicitud permanece Nueva.

`obtener_solicitud_publica_segura` permite recuperar la informacion publica limitada de una solicitud mediante su codigo y token aleatorio. El codigo por si solo no autoriza la consulta.

Los errores internos de PostgreSQL no se muestran directamente al visitante. El frontend presenta mensajes publicos genericos y estados de reintento.

## Pago manual

La Edge Function `submit-payment-proof` recibe comprobantes de solicitudes elegibles. Valida codigo, token, elegibilidad, tipo, extension, firma y tamano antes de guardar el archivo en el bucket privado `comprobantes-pago`.

La funcion utiliza RPC restringidas a `service_role` para validar el envio y registrar sus metadatos. El navegador nunca recibe la clave `service_role`.

## Administracion

Las operaciones administrativas requieren una sesion de Supabase Auth y autorizacion mediante `es_administrador_activo()`, RLS y privilegios de funciones.

El cliente administrativo consume estas RPC de dominio:

- `actualizar_solicitud_nueva`
- `confirmar_solicitud_compra`
- `entregar_solicitud_compra`
- `cancelar_solicitud_compra`
- `rechazar_comprobante_pago`
- `verificar_pago_y_confirmar_solicitud`

Las transiciones criticas revalidan estado, actividad, disponibilidad e inventario dentro de PostgreSQL. La confirmacion y la verificacion de pago aplican el descuento correspondiente de forma transaccional; cancelar una solicitud Confirmada restituye exactamente `cantidad_descontada`.

## Evolucion del contrato

Los cambios de esquema o comportamiento se agregan mediante migraciones nuevas. No se editan migraciones que ya fueron aplicadas. Un servicio solo se considera implementado cuando existe en las migraciones, tiene permisos definidos y cuenta con pruebas acordes con su riesgo.
