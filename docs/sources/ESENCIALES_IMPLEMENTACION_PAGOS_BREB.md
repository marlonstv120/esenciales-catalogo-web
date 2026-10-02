# ESENCIALES — Especificación de implementación de pagos por Bre-B y comprobantes

> **Documento de trabajo para OpenCode**
>
> Este documento define la implementación funcional, técnica, de seguridad, base de datos, UI/UX y pruebas necesarias para incorporar a ESENCIALES un flujo de pago manual mediante **QR / llave Bre-B**, sin integrar una pasarela de tarjetas.
>
> La intención es que OpenCode pueda leer este archivo, inspeccionar el proyecto actual y comenzar la implementación siguiendo estas reglas, sin inventar decisiones de negocio.
>
> **Importante:** antes de modificar código, OpenCode debe contrastar este documento con la implementación real del repositorio. Si un nombre de archivo, función, tabla, ruta o componente cambió, debe adaptar la implementación al código actual sin alterar el objetivo funcional.

---

# 1. Objetivo

Agregar al flujo actual de ESENCIALES un mecanismo de pago manual por transferencia mediante Bre-B que permita:

1. Registrar primero la solicitud de compra.
2. Mostrar al cliente una opción para pagar mediante QR / llave Bre-B.
3. Permitir que el cliente adjunte un comprobante.
4. Guardar el comprobante de forma privada.
5. Mantener separado el **estado de la solicitud** del **estado del pago**.
6. Permitir al administrador revisar el comprobante.
7. Verificar o rechazar el pago.
8. Mantener intactas las reglas actuales de inventario.
9. Permitir que el cliente registre una solicitud sin estar obligado a pagar inmediatamente.
10. Mantener WhatsApp como canal complementario.
11. Permitir recuperar una solicitud de manera segura si posteriormente se decide pagar o reenviar un comprobante.
12. No implementar tarjetas débito/crédito ni una pasarela bancaria.

Este módulo **no convierte a ESENCIALES en una pasarela de pagos**. La transferencia ocurre en la aplicación bancaria del cliente. ESENCIALES únicamente:

- muestra el QR / llave;
- registra la intención y estado del pago;
- recibe un comprobante;
- permite la revisión administrativa.

---

# 2. Arquitectura actual que debe preservarse

La implementación existente, verificada antes de diseñar este módulo, utiliza:

- Frontend: Vite + HTML5 + CSS3 + JavaScript sin framework.
- Backend: Supabase.
- Base de datos: PostgreSQL en Supabase.
- Cliente: `@supabase/supabase-js`.
- Catálogo público mediante RPC.
- Solicitudes públicas mediante `registrar_solicitud_compra`.
- Administración mediante tablas protegidas con RLS y RPC administrativas.
- Imágenes de producto en Supabase Storage.
- Carrito persistido en `localStorage`.
- Borrador de solicitud en `sessionStorage`.

El flujo actual es:

```text
Catálogo
  ↓
Detalle / presentación
  ↓
Agregar al carrito
  ↓
Drawer / carrito
  ↓
Revalidar disponibilidad y precios
  ↓
Continuar solicitud
  ↓
Datos del cliente
  ↓
Registrar solicitud
  ↓
RPC registrar_solicitud_compra
  ↓
solicitudes + detalles_solicitud
  ↓
Código ES-XXXXX
  ↓
Confirmación
  ↓
WhatsApp / seguir comprando / registrar otra solicitud
```

La nueva implementación debe **extender** este flujo. No debe reemplazarlo innecesariamente.

---

# 3. Reglas actuales de solicitudes que NO deben romperse

Los estados actuales de una solicitud son:

```text
nueva
confirmada
entregada
cancelada
```

Reglas actuales:

## `nueva`

- Se crea al registrar la solicitud pública.
- Puede editarse desde administración.
- Puede confirmarse.
- Puede cancelarse.
- No descuenta inventario.
- No reserva inventario.

## `confirmada`

- Se obtiene al confirmar una solicitud nueva.
- Para líneas `venta_inmediata`, descuenta inventario.
- Para líneas `bajo_pedido`, no descuenta inventario.
- No permite editar la solicitud.
- Puede pasar a entregada.
- Puede cancelarse.

## `entregada`

- Estado final operativo.
- No permite edición ni cancelación.

## `cancelada`

- Puede provenir de `nueva` o `confirmada`.
- Si provenía de `confirmada`, restituye inventario descontado.
- No permite nuevas transiciones en la implementación actual.

Estas reglas continúan existiendo independientemente del estado del pago.

---

# 4. Principio fundamental: solicitud y pago son conceptos diferentes

NO agregar valores como:

```text
pagada
pago_pendiente
comprobante_enviado
```

al campo `solicitudes.estado`.

Debe existir un estado independiente para el pago.

Ejemplo válido:

```text
Solicitud:
estado = nueva

Pago:
estado = comprobante_enviado
```

Posteriormente:

```text
Solicitud:
estado = confirmada

Pago:
estado = verificado
```

Esto evita mezclar:

- operación logística;
- inventario;
- entrega;
- dinero;
- revisión del comprobante.

---

# 5. Estados propuestos para el pago

Crear un modelo de pago con los siguientes estados:

```text
pendiente
comprobante_enviado
verificado
rechazado
```

## `pendiente`

Significa:

- existe la solicitud;
- todavía no existe un comprobante activo aprobado;
- el cliente puede pagar posteriormente si la solicitud es elegible.

NO significa que el cliente haya pagado.

## `comprobante_enviado`

Significa:

- el cliente afirmó haber realizado la transferencia;
- adjuntó un comprobante;
- el administrador todavía debe revisarlo.

NO mostrar al cliente frases como:

> Pago aprobado.

Usar:

> Comprobante enviado. Pendiente de verificación.

## `verificado`

Significa:

- un administrador revisó el comprobante;
- la operación fue aceptada como pago válido;
- debe quedar registrado quién y cuándo realizó la revisión.

## `rechazado`

Significa:

- el comprobante no pudo aprobarse;
- debe existir una razón de revisión;
- el cliente puede cargar un nuevo comprobante si la solicitud sigue habilitada.

---

# 6. Método de pago inicial

La primera versión solo implementará:

```text
bre_b
```

El diseño puede permitir futuros métodos, pero NO deben implementarse ahora métodos ficticios como:

- tarjeta;
- PSE;
- PayPal;
- Nequi;
- Daviplata;
- efectivo;
- otros.

No crear UI para métodos que no forman parte del alcance.

---

# 7. Flujo público recomendado

El flujo final debe ser:

```text
CATÁLOGO
   ↓
CARRITO
   ↓
DATOS DEL CLIENTE
   ↓
REGISTRAR SOLICITUD
   ↓
SOLICITUD ES-XXXXX CREADA
   ↓
   ├── Pagar ahora
   │      ↓
   │   Revalidar elegibilidad
   │      ↓
   │   Mostrar QR / llave Bre-B
   │      ↓
   │   Cliente transfiere
   │      ↓
   │   Adjunta comprobante
   │      ↓
   │   Enviar comprobante
   │      ↓
   │   Comprobante enviado
   │   Pendiente de verificación
   │
   └── Pagar después
          ↓
       Solicitud permanece registrada
          ↓
       WhatsApp / seguimiento
```

La solicitud debe existir **antes** de iniciar el paso de pago.

No enviar un comprobante sin una solicitud asociada.

---

# 8. La solicitud debe poder registrarse SIN pago

El pago NO es obligatorio para crear la solicitud.

Después de registrar exitosamente la solicitud, el cliente puede:

1. pagar ahora;
2. pagar posteriormente;
3. continuar por WhatsApp;
4. seguir viendo productos.

No bloquear `registrar_solicitud_compra` por no existir pago.

No agregar QR al formulario inicial de nombre, teléfono, ciudad y observaciones.

El pago comienza después de que el backend devuelve un código válido como:

```text
ES-00021
```

---

# 9. Integración con la confirmación actual del drawer

La confirmación actual del drawer debe evolucionar.

## Estado inicial después de registrar

Ejemplo:

```text
✓ Solicitud registrada

ES-00021

2 × 9 PM · 100 ml                  $180.000

Total                              $180.000


¿Cómo quieres continuar?

[ Pagar ahora ]

Pagar después

────────────────────────────────────

Continuar por WhatsApp
Seguir viendo productos
```

No eliminar las acciones actuales sin una razón funcional.

---

# 10. Segundo paso del drawer: pago Bre-B

Al pulsar `Pagar ahora`, el mismo drawer puede cambiar de paso.

Ejemplo conceptual:

```text
← Volver

Pagar solicitud ES-00021

Total a transferir
$180.000

        ┌───────────────┐
        │               │
        │   QR Bre-B    │
        │               │
        └───────────────┘

Llave Bre-B
XXXXXXXXXXXX

[ Copiar llave ]

Realiza la transferencia desde la aplicación de tu banco.

─────────────────────────────────────

Comprobante de pago

[ Seleccionar archivo ]

JPG, PNG, WebP o PDF
Máximo 5 MiB

[ Enviar comprobante ]

Pagaré después
```

El monto mostrado debe provenir del resultado real de la solicitud / backend.

NO confiar en un total enviado por el navegador.

---

# 11. QR Bre-B: regla para OpenCode

OpenCode NO debe inventar ni generar un QR ficticio.

Debe utilizar la imagen real proporcionada por el propietario del proyecto.

## Paso obligatorio antes de implementar el QR

OpenCode debe inspeccionar:

- `public/`;
- carpetas actuales de assets;
- convenciones usadas para imágenes estáticas;
- referencias de assets existentes.

Después debe decidir la ruta más coherente dentro del proyecto.

### Requisito de salida

Antes o durante la implementación, OpenCode debe informar claramente al usuario:

```text
Guarda la imagen real del QR Bre-B en:

<RUTA EXACTA DEL PROYECTO>
```

Ejemplo **solo si no existe una convención mejor**:

```text
public/assets/pagos/bre-b-qr.png
```

OpenCode debe preferir la convención ya existente.

Si no existe una carpeta apropiada, puede crear una como:

```text
public/assets/pagos/
```

pero debe comunicarlo.

## Nombre recomendado

```text
bre-b-qr.png
```

Evitar nombres como:

```text
qr1.png
foto.png
imagenfinal.png
```

## La imagen del QR

- puede ser pública porque está diseñada para que el cliente la vea;
- NO debe mezclarse con comprobantes;
- NO debe almacenarse en el bucket privado de comprobantes;
- NO debe ser reemplazada por una imagen generada por IA;
- NO debe contener datos ficticios.

---

# 12. Configuración pública de Bre-B

La aplicación necesita conocer:

- tipo de llave;
- valor visible de la llave;
- ruta del QR;
- nombre del método.

Estos datos son visibles para el cliente, por lo que NO son secretos.

OpenCode debe revisar cómo maneja el proyecto configuraciones públicas.

Si no existe una convención, crear un módulo pequeño y explícito, por ejemplo:

```text
src/payment-config.mjs
```

con una estructura conceptual similar a:

```js
export const PAYMENT_CONFIG = {
  method: 'bre_b',
  methodLabel: 'Bre-B',
  keyType: '...',
  keyValue: '...',
  qrSrc: '/assets/pagos/bre-b-qr.png'
}
```

Los valores reales deben proporcionarse/configurarse, no inventarse.

No usar variables `VITE_*` pretendiendo que son secretos. Todo `VITE_*` enviado al frontend es público.

Si se decide usar `.env` por conveniencia de despliegue, documentar explícitamente que estos valores son públicos.

---

# 13. Elegibilidad para pagar inmediatamente

La primera versión debe manejar con especial cuidado:

```text
venta_inmediata
bajo_pedido
```

## Solicitudes compuestas solamente por `venta_inmediata`

Pueden mostrar `Pagar ahora`.

Antes de mostrar o habilitar definitivamente el flujo de pago:

- revalidar que producto, presentación y categoría sigan activos;
- revalidar disponibilidad;
- revalidar stock;
- revalidar total de la solicitud.

## Solicitudes que contienen al menos una línea `bajo_pedido`

NO ofrecer pago inmediato en esta primera versión.

Mostrar algo como:

> **Pago pendiente de confirmación**
>
> Tu solicitud contiene uno o más productos bajo pedido. ESENCIALES debe confirmar su disponibilidad antes de coordinar el pago.

Acción principal:

```text
Continuar por WhatsApp
```

Esto evita cobrar automáticamente por artículos cuya disponibilidad todavía debe confirmarse.

---

# 14. Riesgo actual de inventario y alcance del MVP

La implementación actual:

- no reserva inventario al registrar;
- no descuenta inventario al registrar;
- permite múltiples solicitudes `nueva` sobre el mismo stock;
- detecta finalmente el conflicto al confirmar.

Ejemplo:

```text
Stock = 2

Cliente A registra 2
Stock sigue = 2

Cliente B registra 2
Stock sigue = 2
```

Esto crea un riesgo si ambos pagan.

## Decisión para esta fase

La implementación del pago debe:

1. revalidar stock inmediatamente antes de permitir el paso de pago;
2. revalidar nuevamente al realizar la acción administrativa final;
3. NO considerar el comprobante como una reserva de inventario;
4. documentar que esta versión no implementa reservas temporales de stock.

## Limitación conocida del MVP

Puede existir una ventana de concurrencia entre:

- mostrar el QR;
- realizar la transferencia;
- verificar el pago;
- confirmar la solicitud.

No ocultar esta limitación en la documentación del proyecto.

## Evolución futura opcional

Una versión posterior podría implementar:

- reserva temporal;
- expiración;
- liberación automática de stock;
- `pg_cron` o mecanismo equivalente.

NO implementar reservas temporales en esta tarea salvo que el proyecto ya tenga infraestructura preparada y el usuario lo solicite expresamente.

---

# 15. Modelo de datos propuesto

Crear una migración nueva.

NO modificar migraciones históricas ya ejecutadas.

## 15.1. Token público seguro de la solicitud

Agregar a `solicitudes` un identificador no predecible para recuperación pública.

Propuesta:

```sql
token_cliente uuid not null default gen_random_uuid()
```

Agregar restricción única.

El código:

```text
ES-00021
```

NO debe funcionar por sí solo como credencial de acceso.

El código es secuencial y predecible.

## 15.2. Tabla `pagos_solicitud`

Crear una tabla separada.

Estructura conceptual:

```text
pagos_solicitud
------------------------------
id
solicitud_id
metodo
estado
monto
comprobante_path
comprobante_mime
comprobante_bytes
comprobante_nombre_original
enviado_en
revisado_en
revisado_por
observacion_revision
creado_en
actualizado_en
```

### Reglas recomendadas

`solicitud_id`

- FK a `solicitudes.id`;
- `unique`;
- una solicitud tiene como máximo un pago activo en esta versión.

`metodo`

```text
bre_b
```

`estado`

```text
pendiente
comprobante_enviado
verificado
rechazado
```

`monto`

- entero;
- moneda COP;
- no aceptar monto arbitrario enviado por cliente;
- calcular a partir de `detalles_solicitud`.

`comprobante_path`

- ruta interna del objeto privado;
- nunca URL pública.

`revisado_por`

- identidad del administrador que realizó la revisión.

`observacion_revision`

- necesaria especialmente en rechazo;
- máximo razonable de caracteres.

## 15.3. Creación del registro de pago

Puede crearse:

A. al crear la solicitud, con estado `pendiente`; o  
B. al entrar por primera vez al flujo de pago.

Preferencia para simplicidad administrativa:

```text
crear pago pendiente junto con la solicitud
```

siempre que la implementación mantenga la atomicidad de `registrar_solicitud_compra`.

Si agregarlo a la RPC complica innecesariamente el flujo existente, se permite creación lazy al iniciar el pago.

OpenCode debe elegir la alternativa que mejor preserve la atomicidad existente.

---

# 16. Total del pago

El navegador NO determina el monto final.

El backend debe calcular:

```text
SUM(detalles_solicitud.subtotal)
```

para la solicitud correspondiente.

Al mostrar el pago:

- frontend recibe monto validado;
- backend vuelve a comprobarlo.

Al guardar `pagos_solicitud.monto`, este debe representar el monto asociado al comprobante enviado.

---

# 17. Cambios de una solicitud y comprobantes existentes

Hay que evitar que un administrador cambie productos o cantidades después de que el cliente envió un comprobante correspondiente a otro total.

## Regla

### Pago `pendiente`

La solicitud `nueva` puede seguir editándose según las reglas actuales.

Si cambia el total:

- no hay problema porque aún no existe comprobante;
- el monto mostrado posteriormente debe ser el actualizado.

### Pago `comprobante_enviado`

Bloquear modificaciones de:

- productos;
- cantidades;
- precios históricos;
- datos que alteren el total;

hasta resolver el comprobante.

El administrador debe:

- verificar; o
- rechazar el comprobante.

Después de un rechazo, se puede permitir nuevamente la edición si la solicitud sigue `nueva`.

### Pago `verificado`

No permitir edición de líneas.

La operación ya debe continuar por el flujo de confirmación.

---

# 18. Revisión administrativa: relación pago + confirmación

Una imagen adjunta NO equivale a pago verificado.

El administrador debe revisar el comprobante.

## Recomendación principal

Cuando exista:

```text
solicitud.estado = nueva
pago.estado = comprobante_enviado
```

la acción administrativa principal debe ser:

```text
Verificar pago y confirmar solicitud
```

Esta acción debe realizarse de manera transaccional en PostgreSQL siempre que sea posible.

Debe:

1. validar administrador activo;
2. bloquear la solicitud;
3. comprobar `estado = nueva`;
4. comprobar pago `comprobante_enviado`;
5. recalcular total;
6. comprobar que el monto registrado corresponde;
7. bloquear presentaciones relacionadas;
8. revalidar productos/presentaciones;
9. validar stock de `venta_inmediata`;
10. descontar inventario exactamente como lo hace la confirmación actual;
11. marcar `pagos_solicitud.estado = verificado`;
12. asignar `revisado_en`;
13. asignar `revisado_por`;
14. cambiar solicitud a `confirmada`;
15. asignar `confirmado_en`.

Si falla una línea:

- NO verificar pago en BD;
- NO confirmar parcialmente;
- NO descontar parcialmente.

Mantener el comportamiento transaccional actual.

---

# 19. ¿Qué ocurre si ya pagó pero no hay stock?

Debido a que el MVP no implementa reserva, este escenario es posible.

Si la RPC administrativa detecta falta de stock:

- no confirmar;
- no marcar pago como verificado;
- mantener `comprobante_enviado`;
- mostrar al administrador un mensaje específico;
- permitir que el administrador contacte al cliente y defina devolución/cambio.

NO automatizar reembolsos.

No existe integración bancaria para devolver dinero.

Documentar este escenario como limitación del MVP.

---

# 20. Rechazar comprobante

Agregar acción administrativa:

```text
Rechazar comprobante
```

Debe solicitar una razón.

Ejemplos válidos de razón:

- valor no coincide;
- comprobante ilegible;
- transferencia no identificada;
- archivo incorrecto.

No hardcodear estas razones si no es necesario; puede ser texto libre validado.

Al rechazar:

```text
pago.estado = rechazado
```

guardar:

- fecha;
- administrador;
- observación.

La solicitud no debe cancelarse automáticamente.

---

# 21. Reenvío después de rechazo

Si:

```text
pago.estado = rechazado
solicitud.estado = nueva
```

el cliente puede enviar un nuevo comprobante.

Al subir uno nuevo:

```text
estado = comprobante_enviado
```

y debe limpiarse el estado visual de rechazo anterior para la nueva revisión, conservando la trazabilidad mínima que decida el proyecto.

## MVP recomendado

Mantener solo el comprobante activo:

1. subir nuevo archivo;
2. confirmar que la subida terminó;
3. actualizar la BD;
4. eliminar el archivo anterior;
5. nunca borrar el archivo anterior antes de que el nuevo upload sea exitoso.

Si se desea auditoría completa posteriormente, crear una tabla histórica separada.

---

# 22. Storage de comprobantes

NO utilizar el bucket público actual de productos.

Crear un bucket diferente:

```text
comprobantes-pago
```

## Propiedades

- privado;
- no public URL;
- máximo recomendado: 5 MiB;
- tipos aceptados:

```text
image/jpeg
image/png
image/webp
application/pdf
```

NO permitir:

```text
text/html
image/svg+xml
JavaScript
archivos ejecutables
```

## Ruta interna recomendada

No usar el código secuencial como único identificador.

Ejemplo:

```text
solicitudes/<solicitud-id>/<uuid>.<ext>
```

o una variante segura equivalente.

El nombre de archivo debe generarlo el sistema.

Nunca usar directamente el nombre proporcionado por el usuario como object path.

---

# 23. Upload público seguro

Actualmente el cliente público no tiene autenticación.

Por ello NO abrir una política genérica como:

```text
anon puede insertar en comprobantes-pago
```

sin validación.

## Implementación recomendada

Crear una Supabase Edge Function dedicada, por ejemplo:

```text
supabase/functions/submit-payment-proof/
```

Nombre exacto a adaptar a la convención del repositorio.

Responsabilidades:

1. recibir:
   - código/ID público de solicitud;
   - token de cliente;
   - archivo;
2. validar token;
3. validar que la solicitud exista;
4. validar estado permitido;
5. validar elegibilidad de pago;
6. validar tamaño;
7. validar MIME;
8. calcular monto real desde la BD;
9. generar object path seguro;
10. subir al bucket privado usando credenciales server-side;
11. actualizar `pagos_solicitud`;
12. devolver únicamente información pública necesaria.

No exponer `SUPABASE_SERVICE_ROLE_KEY` al navegador.

La service role solo puede existir en el entorno de servidor / Edge Function.

---

# 24. No confiar en la extensión del archivo

Validar:

- MIME declarado;
- extensión permitida;
- tamaño;
- cuando sea viable, firma/magic bytes.

Como mínimo:

- rechazar tipos fuera de la allowlist;
- renombrar el archivo con UUID;
- no ejecutar ni renderizar HTML.

Al mostrar PDF o imagen al admin:

- usar URL firmada;
- no insertar contenido arbitrario como HTML.

---

# 25. Visualización administrativa del comprobante

El administrador autenticado puede ver el comprobante.

Preferencia:

1. obtener URL firmada temporal;
2. vencimiento corto;
3. abrir preview/modal o nueva pestaña según tipo.

NO guardar URLs firmadas permanentes en BD.

NO convertir el bucket a público.

---

# 26. RLS y permisos

## Tablas de pago

`anon`

- no puede `select` directo;
- no puede `insert` directo;
- no puede `update` directo;
- no puede `delete`.

`authenticated`

- tampoco debe obtener acceso por estar autenticado solamente;
- debe validarse `es_administrador_activo()`.

## Administración

Permitir acceso únicamente a administradores activos según la lógica ya existente.

## Cliente público

Debe usar:

- RPC `security definer` cuidadosamente limitada; y/o
- Edge Function;

pero nunca acceso libre a tablas internas.

---

# 27. Token público de recuperación

Actualmente `ES-00021` es predecible.

No permitir:

```text
/solicitud/ES-00021
```

como mecanismo suficiente para consultar o subir comprobantes.

Usar:

```text
codigo + token_cliente
```

El token debe ser aleatorio.

## Propuesta

Al registrar la solicitud, la RPC retorna:

```json
{
  "codigo": "ES-00021",
  "token_cliente": "uuid-no-predecible",
  ...
}
```

El token no debe mostrarse visualmente como dato técnico.

---

# 28. Ruta pública de seguimiento

Para permitir `Pagar después`, agregar una vista pública de seguimiento.

Ruta conceptual:

```text
/solicitud/:codigo
```

El token puede recuperarse:

- desde almacenamiento local seguro para este MVP; y/o
- desde un enlace con fragmento.

Ejemplo conceptual:

```text
/solicitud/ES-00021#t=<token>
```

El fragmento tiene la ventaja de no enviarse al servidor HTTP como query string.

OpenCode debe adaptar esto al router actual.

## Esta vista permite

- ver código;
- ver productos;
- ver total;
- ver estado público de la solicitud;
- ver estado del pago;
- pagar si corresponde;
- subir o reemplazar comprobante permitido;
- continuar por WhatsApp.

## Esta vista NO permite

- editar la solicitud;
- cambiar cantidades;
- cambiar datos del cliente;
- consultar otras solicitudes;
- realizar acciones administrativas.

---

# 29. Persistencia local del acceso a la solicitud

Después de registrar exitosamente:

- guardar código + token de recuperación de forma controlada;
- reutilizar la infraestructura existente de confirmación si resulta apropiado;
- revisar las funciones `savePurchaseConfirmation()` / `loadPurchaseConfirmation()` ya existentes antes de crear otra solución.

Actualmente la confirmación depende en gran medida de memoria.

La nueva funcionalidad debe sobrevivir un reload razonable para que el cliente no pierda inmediatamente el acceso al pago recién creado.

No guardar comprobantes en `localStorage`.

---

# 30. RPC pública de consulta limitada

Crear una RPC pública, por ejemplo conceptualmente:

```text
obtener_solicitud_publica_segura
```

Parámetros:

```text
codigo
token
```

Debe devolver únicamente:

- código;
- fecha;
- estado público;
- líneas;
- cantidades;
- precio histórico;
- subtotales;
- total;
- estado del pago;
- razón pública de rechazo si corresponde;
- elegibilidad para pago.

NO devolver:

- IDs internos innecesarios;
- `identificador_intento`;
- metadata administrativa;
- rutas privadas;
- `revisado_por`;
- información de otros clientes.

---

# 31. Interfaz pública después de enviar comprobante

Ejemplo:

```text
✓ Comprobante enviado

Solicitud ES-00021

Estado del pago
Pendiente de verificación

Recibimos tu comprobante.
ESENCIALES lo revisará antes de confirmar el pago.

[ Continuar por WhatsApp ]
[ Seguir viendo productos ]
```

No utilizar:

```text
Pago exitoso
Compra confirmada
Pago aprobado
```

hasta que realmente haya revisión.

---

# 32. WhatsApp

WhatsApp continúa siendo voluntario.

## Sin comprobante

Mensaje aproximado:

```text
Hola, ESENCIALES.

Registré la solicitud ES-00021 por $180.000.
Quisiera coordinar el pago y la entrega.
```

## Con comprobante enviado

Mensaje aproximado:

```text
Hola, ESENCIALES.

Registré la solicitud ES-00021 por $180.000
y ya envié el comprobante de pago desde la página.

Quedo atento(a) a la verificación y entrega.
```

No incluir token de recuperación en el mensaje.

No incluir rutas privadas de Storage.

---

# 33. UI administrativa: listado de solicitudes

Agregar información de pago sin sobrecargar la tabla.

Desktop recomendado:

```text
Solicitud | Cliente | Productos | Total | Solicitud | Pago | Acción
```

o adaptar la tabla actual si ya existe una columna `Estado`.

Badge de pago:

```text
Pendiente
Comprobante
Verificado
Rechazado
```

No mostrar el nombre del archivo.

En móvil incluir el estado de pago dentro de la tarjeta/fila responsive.

---

# 34. UI administrativa: detalle

Agregar sección:

```text
Pago
```

Ejemplo:

```text
Pago
────────────────────────────────────

Método                 Bre-B
Estado                 Comprobante enviado
Monto                  $180.000
Enviado                1/10/2026 · 8:15 p. m.

[ Ver comprobante ]

[ Verificar pago y confirmar solicitud ]
[ Rechazar comprobante ]
```

Si `pendiente`:

```text
Estado: Pendiente
Todavía no se ha enviado comprobante.
```

Si `verificado`:

```text
✓ Pago verificado
Fecha ...
Revisado por ...
```

Si `rechazado`:

```text
Comprobante rechazado
Motivo: ...
```

---

# 35. Relación con edición administrativa

Si hay `comprobante_enviado`:

- deshabilitar edición de productos/cantidades;
- explicar:

> Existe un comprobante pendiente de revisión. Verifícalo o recházalo antes de modificar la solicitud.

No usar un toast para información permanente.

Si el pago está `pendiente`, conservar edición normal.

---

# 36. Botones administrativos

Mantener la jerarquía ya definida:

## Cambios en esta solicitud

- Descartar cambios
- Guardar cambios

## Acciones de la solicitud

Según estado de pago:

### Pago pendiente

- Confirmar solicitud, si la regla actual lo permite.
- Cancelar solicitud.

### Comprobante enviado

- Verificar pago y confirmar solicitud.
- Rechazar comprobante.
- Cancelar solicitud solo si el negocio lo permite y se comunica claramente.

### Verificado

- no volver a verificar;
- solicitud debería quedar confirmada por la misma operación transaccional.

---

# 37. Confirmación sin pago en plataforma

No romper el proceso existente.

Puede existir un cliente que:

- no utilice Bre-B;
- coordine pago por WhatsApp;
- requiera confirmación manual.

La acción actual `Confirmar solicitud` puede seguir existiendo cuando el pago está `pendiente`.

Si existe `comprobante_enviado`, no permitir ignorarlo silenciosamente.

Primero debe resolverse.

---

# 38. Cancelación y pagos

## Solicitud nueva + pago pendiente

Cancelar normalmente.

## Solicitud nueva + comprobante enviado

Antes de cancelar, advertir:

> Existe un comprobante de pago pendiente de revisión.

No borrar automáticamente el comprobante al cancelar.

## Solicitud confirmada + pago verificado

La cancelación puede restituir inventario según la regla actual, pero NO equivale automáticamente a devolver dinero.

Mostrar al administrador:

> La cancelación del sistema no realiza reembolsos bancarios. Verifica si debes coordinar una devolución manual.

No implementar reembolsos.

---

# 39. Productos `bajo_pedido`

En esta fase:

```text
si cualquier línea = bajo_pedido
→ no ofrecer Pagar ahora
```

Mostrar:

```text
Pago por coordinar

Esta solicitud incluye productos bajo pedido.
ESENCIALES confirmará disponibilidad antes de coordinar el pago.
```

El flujo existente por WhatsApp sigue disponible.

No cambiar `maximo_solicitable = 99` por razones relacionadas con pagos.

---

# 40. Archivo del QR vs comprobantes

Diferenciar claramente:

## QR Bre-B del negocio

- asset público;
- estable;
- lo ve cualquier cliente;
- ruta dentro del proyecto frontend;
- proporcionado por el propietario.

## Comprobante del cliente

- archivo privado;
- Supabase Storage;
- bucket privado;
- acceso controlado;
- ruta aleatoria;
- nunca asset público del frontend.

No confundir ambos sistemas.

---

# 41. Privacidad

Los comprobantes pueden contener:

- nombre;
- entidad financiera;
- valor;
- referencia;
- datos parciales de cuenta;
- fecha/hora.

Por ello:

- bucket privado;
- solo administradores autorizados pueden visualizarlos;
- no indexarlos;
- no incluirlos en URLs públicas;
- no incluirlos en logs;
- no mostrarlos en el listado público;
- no enviarlos a servicios externos de IA;
- no aplicar OCR automáticamente.

Actualizar:

```text
public/legal/terminos-v1.html
public/legal/politica-datos-v1.html
```

o las versiones actuales equivalentes.

Agregar finalidad:

- recepción;
- revisión;
- validación del pago asociado a la solicitud.

No inventar un período legal de retención si el proyecto no ha definido uno.

Documentar esta decisión pendiente si no existe.

---

# 42. No almacenar datos de tarjetas

Este proyecto NO debe pedir:

- número de tarjeta;
- CVV;
- fecha de vencimiento;
- claves bancarias;
- usuario bancario;
- OTP;
- claves dinámicas.

La transferencia se realiza fuera del sitio.

---

# 43. Validación del comprobante en frontend

Antes de enviar:

- tipo permitido;
- tamaño <= 5 MiB;
- archivo requerido;
- preview solo para imágenes;
- para PDF mostrar nombre/tipo;
- botón para retirar/reemplazar antes de enviar.

Mensajes claros:

```text
El archivo supera el máximo de 5 MiB.
```

```text
Formato no permitido. Usa JPG, PNG, WebP o PDF.
```

No esperar al backend para todos los errores simples.

El backend debe validar nuevamente.

---

# 44. Toasts

Usar el sistema de toast existente si ya fue implementado.

Casos apropiados:

- comprobante enviado correctamente;
- error al subir;
- error de validación;
- error de red;
- pago verificado;
- comprobante rechazado.

No usar toast como único lugar para mostrar estados permanentes.

---

# 45. Manejo de errores de red

Si el archivo se subió pero falló la actualización de la BD:

- no dejar objetos huérfanos permanentemente;
- la Edge Function debe intentar limpieza;
- registrar internamente el error sin exponer datos sensibles.

Si la BD se actualizó pero falla la respuesta al cliente:

- el flujo debe ser idempotente;
- reconsultar estado antes de duplicar uploads.

---

# 46. Idempotencia

El proyecto ya utiliza `identificador_intento` al registrar solicitudes.

Para comprobantes:

- evitar que doble clic cree múltiples pagos;
- usar `busy` / disabled mientras sube;
- identificar una solicitud de forma única;
- antes de crear un nuevo registro, consultar/upsert el pago existente.

Una solicitud no debe tener dos pagos activos por doble envío accidental.

---

# 47. Accesibilidad

QR:

- `alt` descriptivo, no redundante;
- ejemplo: `Código QR para pago por Bre-B`.

Botones:

- `Copiar llave`;
- `Seleccionar comprobante`;
- `Enviar comprobante`;
- `Ver comprobante`;
- `Rechazar comprobante`.

Usar:

- focus visible;
- labels;
- `aria-live` para mensajes donde corresponda;
- no depender únicamente del color.

---

# 48. Diseño móvil

El flujo de pago debe diseñarse mobile-first porque es probable que el usuario:

1. tenga la web abierta;
2. copie la llave o vea el QR;
3. cambie a la app bancaria;
4. realice la transferencia;
5. vuelva al navegador;
6. adjunte el comprobante.

Por esto es especialmente importante:

- que el drawer conserve el estado;
- que el acceso a la solicitud se pueda recuperar;
- que el formulario no se pierda por remount/reload;
- que el botón de adjuntar sea grande;
- que el QR sea legible;
- que no haya scroll horizontal;
- que el estado `Comprobante enviado` sea evidente.

---

# 49. Persistencia al cambiar de aplicación móvil

El navegador móvil puede:

- congelar la página;
- desmontarla;
- descartarla de memoria;
- recargarla al volver.

El nuevo flujo NO puede depender únicamente de estado en memoria.

Una vez creada la solicitud:

- código + token deben persistir de forma suficiente;
- el estado real se recupera desde backend;
- el comprobante seleccionado pero todavía NO enviado no puede garantizarse después de un reload porque `File` no debe serializarse en localStorage;
- si se pierde la selección, informar al usuario y permitir seleccionar de nuevo.

Nunca almacenar el contenido del comprobante como Base64 en `localStorage`.

---

# 50. QR y cambio de aplicación

La UI debe incluir una acción:

```text
Copiar llave
```

porque en un teléfono el cliente puede copiar la llave y cambiar a la app bancaria.

Opcionalmente:

```text
Descargar / ampliar QR
```

solo si el QR real puede utilizarse de esa manera y no rompe la experiencia.

No implementar deep links bancarios ficticios.

---

# 51. Recuperación del pago después de reload

Al volver a cargar la ruta de solicitud:

1. recuperar código;
2. recuperar token;
3. consultar backend;
4. renderizar el estado real;
5. NO confiar en el estado que había en memoria.

Ejemplo:

```text
Antes del reload:
comprobante enviado

Después:
consultar servidor
→ pago = comprobante_enviado
→ renderizar correctamente
```

---

# 52. Archivos / módulos que probablemente deberán modificarse

OpenCode debe revisar primero las versiones reales.

Probablemente:

```text
supabase/migrations/
supabase/tests/database/
src/public-purchase-request.mjs
src/public-catalog-controller.mjs
src/public-views.mjs
src/public-routes.mjs
src/requests.js
src/requests-controller.js
src/request-views.mjs
src/auth.js
public/legal/...
docs/project/...
docs/architecture/decisions/...
```

Para comprobantes:

```text
supabase/functions/submit-payment-proof/
```

y posiblemente un nuevo módulo frontend:

```text
src/payment-config.mjs
src/public-payment.mjs
src/payment-proof.mjs
```

Los nombres son orientativos.

Reutilizar módulos existentes cuando sea coherente.

No fragmentar innecesariamente el proyecto.

---

# 53. Migraciones

Crear migraciones nuevas y ordenadas.

Una secuencia razonable:

1. token público;
2. tabla de pagos;
3. constraints/indexes;
4. funciones/RPC;
5. bucket/policies;
6. funciones administrativas.

Pero puede consolidarse en una sola migración si el proyecto acostumbra a agrupar cambios por feature.

No editar migraciones antiguas ya aplicadas.

---

# 54. Constraints recomendados

Ejemplos conceptuales:

```text
pagos_solicitud.estado in (
  'pendiente',
  'comprobante_enviado',
  'verificado',
  'rechazado'
)
```

```text
pagos_solicitud.metodo in ('bre_b')
```

```text
monto > 0
```

```text
solicitud_id unique
```

Agregar índices sobre:

- `solicitud_id`;
- `estado`;
- `token_cliente` si no queda cubierto por unique.

---

# 55. RPC / funciones sugeridas

Nombres a adaptar.

## Pública

```text
obtener_solicitud_publica_segura
```

## Elegibilidad / información de pago

```text
obtener_pago_publico_solicitud
```

Puede combinarse con la anterior para evitar duplicación.

## Admin

```text
rechazar_comprobante_pago
```

```text
verificar_pago_y_confirmar_solicitud
```

No duplicar la lógica de confirmación actual sin necesidad.

Idealmente extraer una función SQL interna reutilizable o adaptar cuidadosamente la RPC actual.

No reducir las validaciones actuales.

---

# 56. Reutilización de `confirmar_solicitud_compra`

OpenCode debe inspeccionar esta RPC.

Evitar copiar/pegar 100% de su lógica a otra función si puede reutilizarse de forma segura.

Pero la verificación del pago + confirmación debe ser atómica.

Si PostgreSQL no permite una reutilización limpia debido a chequeos de permisos o retornos, refactorizar a una función interna privada puede ser apropiado.

Toda refactorización debe conservar las pruebas actuales.

---

# 57. Total y precio histórico

El pago corresponde al precio histórico guardado en:

```text
detalles_solicitud.precio_unitario
```

y subtotales de la solicitud.

NO recalcular el cobro usando el precio actual del catálogo después del registro.

Si antes de registrar el precio cambia, ya existe revalidación.

Después de registrada:

```text
precio histórico de la solicitud
```

es la referencia del monto.

---

# 58. Cambios de precio después de crear la solicitud

Una modificación posterior del catálogo NO debe cambiar automáticamente el valor ya registrado.

El pago usa:

```text
SUM(detalles_solicitud.subtotal)
```

No:

```text
presentaciones.precio_actual
```

---

# 59. UI de pago rechazada

Vista pública:

```text
Comprobante rechazado

No pudimos validar el comprobante enviado.

Motivo:
<texto público de revisión>

[ Enviar nuevo comprobante ]
[ Continuar por WhatsApp ]
```

No mostrar datos internos del administrador.

---

# 60. UI de pago verificado

Vista pública:

```text
✓ Pago verificado

Solicitud ES-00021

Tu pago fue verificado por ESENCIALES.

Estado de la solicitud:
Confirmada
```

Si la acción de verificar también confirma, ambos estados deben quedar sincronizados.

---

# 61. Solicitud cancelada

Si el cliente abre una solicitud cancelada:

- mostrar estado;
- no permitir nuevo comprobante;
- no mostrar `Pagar ahora`.

Si tenía un pago verificado:

- no afirmar que existe reembolso;
- indicar que debe contactar a ESENCIALES.

---

# 62. Solicitud entregada

- mostrar estado final;
- pago solo lectura;
- no permitir upload.

---

# 63. Configuración de la llave

OpenCode debe pedir o marcar claramente como pendiente los datos reales que no pueden inferirse:

```text
Tipo de llave Bre-B
Valor de la llave
Imagen real del QR
```

NO inventar:

- teléfono;
- correo;
- identificación;
- código;
- banco.

El código puede quedar preparado con placeholders de configuración de desarrollo, pero la UI de producción no debe presentar una llave falsa.

---

# 64. No generar QR automáticamente

Esta versión utiliza un QR proporcionado por el negocio.

NO agregar librerías de QR para codificar la llave salvo requerimiento posterior.

No se conoce si el QR entregado por la entidad financiera contiene payload adicional propio.

Usar la imagen oficial entregada.

---

# 65. Gestión del asset QR

Después de inspeccionar el repositorio, OpenCode debe entregar una instrucción exacta como:

```text
Para activar el QR real, guarda el archivo aquí:

C:\...\proyecto\public\assets\pagos\bre-b-qr.png
```

o una ruta relativa:

```text
public/assets/pagos/bre-b-qr.png
```

Debe aclarar:

- formato esperado;
- nombre exacto;
- si puede ser PNG/JPG/WebP;
- si el código ya referencia ese path.

Si el usuario todavía no lo colocó:

- no inventar QR;
- dejar fallback visual de desarrollo;
- informar claramente que falta el asset.

---

# 66. Componente de QR

El componente/vista debe:

- mantener aspect ratio;
- no estirar;
- tamaño cómodo en móvil;
- permitir ampliación si es necesario;
- tener borde/fondo limpio;
- no incluir sombras que dificulten escaneo;
- no aplicar filtros CSS sobre el QR.

---

# 67. Seguridad del token

El token público funciona como credencial bearer.

Reglas:

- no mostrarlo en pantalla;
- no incluirlo en WhatsApp;
- no loguearlo;
- no incluirlo en mensajes de error;
- no enviarlo a analytics;
- no usar el código secuencial como reemplazo.

Para una versión futura se puede almacenar hash del token.

Para el MVP, UUID aleatorio con tablas protegidas y RPC/Edge Function limitadas es aceptable.

---

# 68. CORS / Edge Function

Si se crea una Edge Function:

- aceptar únicamente orígenes necesarios cuando sea viable;
- responder correctamente a `OPTIONS`;
- no usar `*` indiscriminadamente en producción si hay una configuración más restrictiva;
- nunca devolver service role.

Adaptar a la estrategia actual de despliegue.

---

# 69. Límites y protección básica

Para upload:

- máximo 5 MiB;
- un archivo por intento;
- tipos limitados;
- impedir doble submit;
- no permitir uploads si solicitud no está habilitada.

Si resulta sencillo:

- limitar frecuencia por solicitud/token.

No añadir infraestructura compleja de rate limiting si está fuera del alcance académico.

---

# 70. Observabilidad

Errores técnicos:

- registrar contexto mínimo;
- no registrar archivo;
- no registrar token;
- no registrar datos bancarios visibles.

UI:

- mensajes comprensibles;
- detalles técnicos solo en consola de desarrollo cuando corresponda.

---

# 71. Mensajes de error públicos

Ejemplos:

```text
No pudimos cargar la información de esta solicitud.
```

```text
Esta solicitud ya no admite comprobantes.
```

```text
La disponibilidad cambió. Comunícate con ESENCIALES antes de realizar el pago.
```

```text
No pudimos enviar el comprobante. Intenta nuevamente.
```

Evitar:

```text
SQLSTATE 23514
```

```text
RLS violation
```

o mensajes internos.

---

# 72. Pruebas de base de datos

Agregar pruebas para:

## Tokens

- token generado;
- único;
- código sin token no permite consulta pública;
- token incorrecto no permite consulta.

## Pago

- estado inicial válido;
- transición pendiente → comprobante_enviado;
- comprobante_enviado → verificado;
- comprobante_enviado → rechazado;
- rechazado → comprobante_enviado;
- no permitir transiciones ilegales.

## Administración

- anon no verifica;
- usuario authenticated no administrador no verifica;
- admin activo sí.

## Confirmación

- pago + confirmación atómicos;
- stock suficiente descuenta;
- stock insuficiente aborta todo;
- bajo pedido conserva reglas existentes.

---

# 73. Pruebas de Storage

Comprobar:

- bucket privado;
- URL pública no disponible;
- anon no puede listar;
- anon no puede leer;
- admin autorizado puede obtener acceso temporal;
- MIME inválido rechazado;
- >5 MiB rechazado;
- path generado por servidor.

---

# 74. Pruebas frontend

## Registro sin pagar

1. agregar producto;
2. registrar solicitud;
3. seleccionar `Pagar después`;
4. solicitud permanece creada;
5. WhatsApp funciona.

## Pago ahora

1. registrar;
2. pulsar pagar;
3. QR visible;
4. llave copiable;
5. adjuntar JPG;
6. enviar;
7. estado = comprobante enviado.

## Archivo inválido

- `.exe`;
- HTML;
- archivo demasiado grande.

## Mobile

- abrir pago;
- cambiar de aplicación;
- volver;
- recuperar solicitud;
- continuar sin perder el estado enviado.

---

# 75. Pruebas administrativas

## Pendiente

- visualizar `Pago pendiente`.

## Comprobante

- ver badge;
- abrir comprobante;
- rechazar;
- verificar.

## Verificar con stock

- pago verificado;
- solicitud confirmada;
- stock descontado.

## Verificar sin stock

- operación falla;
- pago sigue sin verificar;
- solicitud sigue nueva;
- stock intacto.

---

# 76. Pruebas de concurrencia

Simular:

```text
Stock 2
Solicitud A = 2
Solicitud B = 2
```

Ambas pueden existir nuevas.

Al verificar/confirmar A:

```text
stock = 0
```

Al verificar B:

- debe fallar la confirmación;
- no marcar B como pago verificado;
- no stock negativo.

Documentar que el dinero ya transferido requeriría gestión manual.

---

# 77. Pruebas de productos bajo pedido

Solicitud con:

```text
1 línea bajo_pedido
```

Resultado:

- no mostrar `Pagar ahora`;
- mostrar explicación;
- WhatsApp disponible.

Solicitud mixta:

```text
venta_inmediata + bajo_pedido
```

Resultado:

- tratar toda la solicitud como no elegible para pago inmediato.

No dividir el pago por líneas en esta versión.

---

# 78. Pruebas de reload

Después de crear solicitud:

- reload;
- recuperar código/token;
- consultar servidor;
- mostrar estado.

Después de enviar comprobante:

- reload;
- mostrar `Pendiente de verificación`.

No depender de `confirmation` solo en memoria.

---

# 79. UX móvil de adjunto

Tarjeta compacta:

```text
Comprobante de pago

[ + Adjuntar archivo ]

comprobante.jpg
1.4 MB

[ Cambiar ] [ Quitar ]

[ Enviar comprobante ]
```

No mostrar un input file nativo enorme si puede envolverse de manera accesible.

---

# 80. Indicador de upload

Mientras sube:

```text
Enviando comprobante...
```

- bloquear doble clic;
- spinner discreto;
- no permitir cerrar accidentalmente si existe upload en curso, cuando sea razonable.

Después:

```text
Comprobante enviado correctamente.
```

---

# 81. Documentación del proyecto

Actualizar los documentos de alcance.

Especialmente si existen:

```text
docs/project/scope.md
docs/project/requirements.md
docs/project/business-rules.md
docs/project/actors-and-flows.md
docs/architecture/decisions/
```

Registrar que el MVP ahora incluye:

- pago manual Bre-B;
- comprobante;
- revisión;
- NO pasarela de tarjetas;
- NO validación bancaria automática;
- NO reembolsos;
- NO reservas temporales de stock.

---

# 82. ADR recomendada

Crear una decisión de arquitectura breve:

```text
ADR: Pago manual Bre-B y almacenamiento privado de comprobantes
```

Debe explicar:

- por qué no tarjeta;
- por qué pago separado de solicitud;
- por qué bucket privado;
- por qué Edge Function para upload público;
- limitación de inventario sin reservas.

---

# 83. Legal / textos visibles

En el paso de pago incluir texto breve:

> El envío del comprobante no implica aprobación automática. ESENCIALES verificará la transferencia antes de confirmar el pago.

Para `bajo_pedido`:

> La disponibilidad debe confirmarse antes de realizar el pago.

No afirmar:

> pago seguro garantizado

si no existe una pasarela certificada.

---

# 84. No alterar el carrito

Mantener:

- `esenciales.cart.v2`;
- selección de líneas;
- máximos;
- revalidación;
- productos no seleccionados permanecen después de registrar.

La funcionalidad de pago comienza después de crear la solicitud.

---

# 85. Limpieza del carrito

Actualmente las líneas seleccionadas se eliminan después de registrar exitosamente la solicitud.

Mantener este comportamiento.

El pago no debe ser requisito para eliminar esas líneas porque la solicitud ya existe.

---

# 86. Intent ID

Conservar `attemptId` y la idempotencia actual del registro.

Agregar pagos no debe provocar que la misma solicitud se registre dos veces.

---

# 87. Error de precio

Mantener el flujo existente:

- si `registrar_solicitud_compra` responde revisión de precio;
- no crear solicitud;
- actualizar carrito;
- pedir nueva confirmación.

No mostrar QR hasta que exista una solicitud real.

---

# 88. Estado visual del pago en confirmación

Después de registrar:

```text
Pago: Pendiente
```

Después de upload:

```text
Pago: Comprobante enviado
```

Después de admin:

```text
Pago: Verificado
```

Si rechazo:

```text
Pago: Rechazado
```

Usar badges consistentes con el admin actual.

---

# 89. Color y diseño

Preservar identidad:

- negro;
- crema;
- dorado;
- estados semánticos discretos.

No convertir el paso de pago en una interfaz bancaria falsa.

QR debe destacar por claridad, no por decoración.

---

# 90. Responsive

Desktop:

- QR y datos de pago pueden convivir en dos columnas si hay espacio.

Mobile:

- una columna;
- QR centrado;
- llave debajo;
- botón copiar;
- adjunto;
- CTA.

Anchos a verificar:

```text
320
375
390
430
```

---

# 91. Acciones que NO debe implementar OpenCode

No agregar:

- Stripe;
- Mercado Pago;
- PayU;
- Wompi;
- tarjetas;
- PSE;
- OAuth bancario;
- scraping bancario;
- OCR para aprobar comprobantes;
- validación automática por imagen;
- deep links inventados;
- reembolsos automáticos.

---

# 92. Secuencia de implementación recomendada

OpenCode debe ejecutar en este orden aproximado.

## Fase A — Inspección

1. revisar estructura actual;
2. confirmar archivos;
3. confirmar router;
4. confirmar migraciones;
5. confirmar Storage;
6. confirmar tests;
7. identificar ruta del QR.

## Fase B — Base de datos

1. token;
2. tabla pago;
3. constraints;
4. RPC públicas;
5. RPC admin;
6. RLS.

## Fase C — Storage

1. bucket privado;
2. Edge Function upload;
3. validaciones.

## Fase D — Frontend público

1. config Bre-B;
2. confirmación;
3. paso de pago;
4. recovery route;
5. upload;
6. estados.

## Fase E — Admin

1. pago en listado;
2. sección detalle;
3. signed URL;
4. rechazo;
5. verificación + confirmación.

## Fase F — Legal/docs

## Fase G — Tests

---

# 93. Preflight obligatorio de OpenCode

Antes de cambiar archivos, OpenCode debe producir internamente una lista equivalente a:

```text
Encontré:
- registro solicitud: ...
- vista confirmación: ...
- admin detalle: ...
- migraciones: ...
- assets públicos: ...
- Storage: ...
- tests: ...
```

No necesita detenerse para pedir confirmación si todo coincide con este documento.

Debe detenerse únicamente si encuentra una contradicción que haga inseguro implementar la funcionalidad.

---

# 94. Ruta del QR: requisito explícito para el resultado de OpenCode

Al terminar la inspección, y nuevamente en su resumen final, OpenCode DEBE indicar:

```text
Ruta exacta donde debes guardar el QR:
<ruta>
```

También:

```text
Nombre esperado:
bre-b-qr.png
```

y:

```text
Configuración donde se define la llave:
<archivo>
```

Si todavía falta el QR real, debe decir:

```text
La funcionalidad quedó preparada, pero falta colocar el QR real en <ruta>.
```

No ocultar este pendiente.

---

# 95. Datos que OpenCode no puede inventar

Marcar como configuración pendiente si no se proporcionan:

- QR real;
- llave Bre-B;
- tipo de llave;
- nombre bancario si se desea mostrar;
- política real de retención de comprobantes.

La aplicación puede compilar sin mostrar datos falsos.

---

# 96. Criterios de aceptación funcional

La funcionalidad se considera terminada si:

1. se puede registrar solicitud sin pagar;
2. se obtiene código;
3. solicitudes elegibles muestran `Pagar ahora`;
4. bajo pedido no permite pago inmediato;
5. QR real se carga desde ruta documentada;
6. llave se puede copiar;
7. se puede adjuntar comprobante válido;
8. comprobante queda en bucket privado;
9. cliente ve `Pendiente de verificación`;
10. admin ve estado de pago;
11. admin puede abrir comprobante con acceso temporal;
12. admin puede rechazar;
13. cliente puede reenviar después de rechazo;
14. admin puede verificar y confirmar;
15. stock se descuenta con reglas actuales;
16. operación de verificar/confirmar es atómica;
17. no hay acceso público a comprobantes;
18. reload no pierde acceso a solicitud;
19. mobile funciona;
20. no se rompe WhatsApp;
21. no se rompe carrito;
22. no se rompe administración actual.

---

# 97. Criterios de aceptación de seguridad

1. código secuencial no autoriza acceso.
2. se exige token.
3. comprobantes privados.
4. no service role en frontend.
5. MIME/tamaño validados backend.
6. no nombres de archivo confiables.
7. no URL pública de comprobante.
8. anon no consulta tabla de pagos.
9. authenticated no admin no consulta.
10. admin activo sí.
11. no tarjetas/credenciales bancarias.
12. token fuera de logs/WhatsApp.

---

# 98. Criterios de aceptación UX

1. pago ocurre después de registro.
2. el cliente entiende que comprobante ≠ verificación.
3. puede pagar después.
4. QR legible.
5. copiar llave fácil.
6. feedback de upload visible.
7. estados claros.
8. bajo pedido no induce a pagar antes de disponibilidad.
9. admin distingue solicitud vs pago.
10. mensajes funcionan desde cualquier scroll.
11. mobile sin overflow.

---

# 99. Informe final que OpenCode debe entregar

Después de implementar, responder con este formato:

```markdown
# Implementación Bre-B completada

## 1. Arquitectura aplicada

## 2. Migraciones creadas

## 3. Tablas/campos nuevos

## 4. RPC nuevas o modificadas

## 5. Storage y seguridad

## 6. Flujo público

## 7. Flujo administrativo

## 8. Manejo de stock

## 9. Productos bajo pedido

## 10. Recuperación de solicitud

## 11. Pruebas realizadas

## 12. Ruta exacta del QR

Guarda el archivo aquí:
`...`

Nombre:
`bre-b-qr.png`

## 13. Configuración de llave Bre-B

Archivo:
`...`

Campos pendientes:
- tipo:
- valor:

## 14. Pendientes externos

- QR real proporcionado por el negocio
- llave real
- cualquier configuración de despliegue

## 15. Limitaciones conocidas

...
```

---

# 100. Instrucción final para OpenCode

Implementa esta funcionalidad respetando las reglas actuales del proyecto.

No simplifiques la seguridad de comprobantes para terminar más rápido.

No uses el bucket público de productos.

No uses únicamente el código `ES-XXXXX` como autenticación.

No marques un pago como aprobado solo porque existe una imagen.

No obligues al cliente a pagar para registrar su solicitud.

No permitas pago inmediato cuando la solicitud tenga productos `bajo_pedido`.

Conserva la lógica actual de inventario y usa una operación transaccional para la verificación final + confirmación.

Revisa visualmente desktop y móvil.

Al terminar, entrega el informe solicitado y especifica de forma inequívoca la ruta exacta donde el usuario debe guardar la imagen real del QR Bre-B.

---

# Apéndice A — Flujo visual completo

```text
┌─────────────────────────┐
│       CATÁLOGO          │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│        CARRITO          │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│ DATOS DEL CLIENTE       │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│ REGISTRAR SOLICITUD     │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│ ES-00021 · NUEVA        │
│ Pago: pendiente         │
└───────────┬─────────────┘
            ↓
      ¿Bajo pedido?
        /       \
      Sí         No
      ↓           ↓
 WhatsApp    ¿Pagar ahora?
 confirm.      /       \
            No          Sí
            ↓            ↓
        WhatsApp       QR Bre-B
                         ↓
                    Transferencia
                         ↓
                    Comprobante
                         ↓
                comprobante_enviado
                         ↓
                       ADMIN
                         ↓
                  Revisar archivo
                    /          \
               Rechazar       Verificar
                  ↓              ↓
              rechazado      validar stock
                  ↓              ↓
               reenviar     pago verificado
                                 +
                          solicitud confirmada
                                 ↓
                         descuento inventario
                                 ↓
                              entrega
```

---

# Apéndice B — Matriz simplificada de estados

| Solicitud | Pago | Edición admin | Upload cliente | Acción principal |
|---|---|---:|---:|---|
| nueva | pendiente | Sí | Sí si elegible | Pagar / Confirmar manualmente |
| nueva | comprobante_enviado | No | No hasta revisión | Revisar |
| nueva | rechazado | Sí | Sí | Reenviar comprobante |
| confirmada | verificado | No | No | Entregar |
| confirmada | pendiente | No | Según flujo manual | Coordinar |
| cancelada | cualquiera | No | No | Solo lectura |
| entregada | cualquiera | No | No | Solo lectura |

> OpenCode debe ajustar cualquier combinación que contradiga reglas reales del proyecto encontradas durante la inspección, explicando el ajuste.

---

# Apéndice C — Decisiones explícitas del MVP

- Pago manual por Bre-B.
- Sin tarjetas.
- Sin pasarela.
- QR estático real proporcionado por el negocio.
- Comprobante privado.
- Revisión manual.
- Solicitud puede existir sin pago.
- Pago es estado separado.
- Bajo pedido no se paga inmediatamente.
- Sin reserva temporal de inventario.
- Sin devolución automática.
- Sin OCR.
- Sin validación bancaria automática.
- Recuperación pública protegida por token no predecible.
