# Registro de validación funcional ES-00082

## Identificación

- **Solicitud controlada:** `ES-00082`.
- **Fecha de ejecución:** no suministrada.
- **Dispositivo:** celular real.
- **Producto:** `9 Pm`.
- **Presentación:** `100 ml`.
- **Cantidad:** `1`.
- **Valor:** `$90.000` COP.
- **Tipo de evidencia:** recorrido manual de extremo a extremo con datos controlados.

## Alcance y resultados

| Paso comprobado | Resultado observado | Estado |
| --- | --- | --- |
| Apertura del catálogo público en celular | El catálogo cargó y permitió consultar el producto. | Satisfactorio |
| Detalle, presentación y carrito | Se seleccionaron `9 Pm`, `100 ml` y una unidad por `$90.000`. | Satisfactorio |
| Registro de la solicitud | El sistema persistió la solicitud y generó el código `ES-00082`. | Satisfactorio |
| Instrucciones Bre-B | La solicitud elegible mostró la información de pago aprobada por el propietario. | Satisfactorio |
| Envío del comprobante | El comprobante quedó asociado a la solicitud para revisión privada. | Satisfactorio |
| Recepción administrativa | La administración mostró la solicitud y el comprobante pendiente de revisión. | Satisfactorio |
| Verificación y confirmación | La aprobación confirmó el pago y la solicitud. | Satisfactorio |
| Descuento de inventario | La existencia cambió de `3` a `2`. | Satisfactorio |
| Cancelación | La solicitud confirmada pudo cancelarse mediante la transición permitida. | Satisfactorio |
| Restitución de inventario | La existencia regresó de `2` a `3`. | Satisfactorio; sin captura disponible |
| Comportamiento bajo pedido | Se comprobaron las restricciones y mensajes aplicables a líneas bajo pedido. | Satisfactorio |

## Interpretación

El recorrido respalda el flujo principal desde la consulta pública hasta la operación administrativa y verifica que el cambio de inventario se vincula a la confirmación, no al registro inicial. La restitución posterior muestra que la cancelación utiliza la cantidad previamente descontada. El resultado se complementa con las pruebas automatizadas de seguridad, elegibilidad, transiciones e inventario y con la [validación final cualitativa](validacion-final-usuarios-propietario.md), documentada por separado porque tuvo participantes y propósitos diferentes.

## Control de evidencia

- Las capturas seleccionadas para el informe deben corresponder a `ES-00082`; no debe utilizarse la captura antigua de `ES-00016`.
- No existe captura de la restitución de inventario de `2` a `3`; este resultado solo debe citarse desde la tabla de prueba.
- Los comprobantes y datos personales deben ocultarse o recortarse antes de incorporar las imágenes al informe o la sustentación.
