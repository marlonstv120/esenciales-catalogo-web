# Actores y flujos

Este documento detalla los actores y recorridos aprobados en el [alcance funcional MVP V1](functional-scope.md).

## Actores confirmados

### Administrador o propietario de Esenciales

Usuario autenticado responsable de:

- Gestionar categorías.
- Gestionar productos, presentaciones e imágenes.
- Actualizar precios, promociones, stock y disponibilidad.
- Marcar productos destacados.
- Consultar y gestionar solicitudes de compra.
- Corregir solicitudes Nuevas dentro de los límites permitidos.
- Confirmar, entregar o cancelar solicitudes.

No se incluye inicialmente registro público de administradores, recuperación automática de contraseña ni permisos avanzados.

### Cliente o visitante

Usuario público que puede:

- Consultar el sitio y el catálogo sin cuenta.
- Buscar y filtrar productos.
- Consultar detalles y presentaciones.
- Preparar y modificar el carrito.
- Registrar una solicitud de compra.
- Decidir si continúa hacia WhatsApp.

El cliente no paga, inicia sesión ni consulta públicamente el estado de solicitudes dentro del MVP.

## Actor pendiente de validación académica

### Colaborador

Solo se incorporará si el profesor confirma que se requieren dos roles autenticados con permisos diferentes.

Permisos mínimos propuestos:

- Consultar productos.
- Actualizar inventario.
- Consultar solicitudes.
- Realizar transiciones de estado expresamente permitidas.

Sin permisos para gestionar usuarios, eliminar categorías o modificar configuraciones sensibles. Esta propuesta no es un requisito confirmado.

## Flujo principal del cliente

```text
Instagram / TikTok / WhatsApp / enlace
        ↓
Página inicial o catálogo
        ↓
Buscar y filtrar
        ↓
Abrir detalle del producto
        ↓
Elegir presentación y cantidad
        ↓
Agregar al carrito
        ↓
Revisar carrito y valor total de productos
        ↓
Ingresar nombre, teléfono y datos opcionales
        ↓
Backend revalida la solicitud
        ↓
Registrar solicitud y precios históricos en PostgreSQL
        ↓
Generar código de referencia
        ↓
Mostrar confirmación
        ↓
Cliente decide si continúa por WhatsApp
```

La solicitud queda registrada incluso si el cliente no abre o no envía el mensaje de WhatsApp.

## Flujo principal administrativo

```text
Administrador inicia sesión
        ↓
Gestiona categorías, productos y presentaciones
        ↓
Actualiza precio, promoción, stock y disponibilidad
        ↓
Marca productos destacados cuando corresponda
        ↓
El catálogo público refleja información publicable
        ↓
Consulta solicitudes Nuevas
        ↓
Corrige datos o cantidades permitidas si el cliente lo solicita
        ↓
Confirma la solicitud
        ↓
Backend revalida y descuenta inventario inmediato
        ↓
Marca la solicitud como Entregada o Cancelada
```

## Flujo de ajuste antes de confirmar

Mientras la solicitud esté Nueva:

1. El cliente informa por WhatsApp un error o cambio.
2. El administrador puede corregir datos del cliente.
3. El administrador puede modificar cantidades o retirar líneas existentes.
4. El sistema conserva los precios históricos.
5. El sistema impide agregar o duplicar líneas, cambiar presentaciones, alterar precios o dejar la solicitud vacía.
6. El backend vuelve a validar cantidades y stock.
7. La solicitud corregida puede confirmarse o cancelarse.

## Flujo de cambio después de confirmar

Una solicitud Confirmada es inmutable. Si el acuerdo cambia:

1. El administrador cancela la solicitud confirmada.
2. El sistema restituye exactamente el inventario descontado.
3. El cliente registra una nueva solicitud con la selección correcta.
4. La nueva solicitud sigue el flujo ordinario.

## Estados y transiciones

| Estado | Significado | Acciones siguientes |
| --- | --- | --- |
| Nueva | Solicitud registrada, todavía ajustable y sin descuento de stock. | Confirmar o cancelar. |
| Confirmada | Solicitud aceptada; se descontó el inventario inmediato correspondiente. | Entregar o cancelar. |
| Entregada | Solicitud finalizada. | Ninguna transición ordinaria. |
| Cancelada | Solicitud terminada sin entrega; restituye stock si antes fue confirmado. | Ninguna transición ordinaria. |

## Límites del flujo

- El sistema no procesa pagos.
- WhatsApp continúa siendo el canal de conversación comercial.
- No hay seguimiento público por código.
- No se editan solicitudes confirmadas o entregadas.
- No se reservan unidades al agregar al carrito o registrar una solicitud Nueva.
