# ADR-010: Comprobantes de pago manual privados

## Estado

Accepted

## Contexto

El pago Bre-B se realiza fuera del sitio, pero el MVP necesita recibir un comprobante asociado a una solicitud sin exponer archivos ni una clave con privilegios administrativos en el navegador.

## Decisión

- Usar `pagos_solicitud` para separar el estado de pago del estado de solicitud.
- Guardar comprobantes en el bucket privado `comprobantes-pago`.
- Recibir el archivo mediante la Edge Function `submit-payment-proof`, que valida token de cliente, tipo, firma y tamaño antes de almacenarlo con la clave de servicio en el servidor.
- Permitir URL firmada de corta duración solo para administradores autenticados.
- Confirmar pago, solicitud e inventario dentro de una RPC transaccional administrativa.
- Distinguir la verificación de un comprobante (`metodo = bre_b`, `estado = verificado`) de la confirmación administrativa sin comprobante pendiente (`metodo = externo`, `estado = validado_manualmente`). Ambas rutas confirman solicitud e inventario de forma transaccional.

## Consecuencias

No se expone una clave de servicio en el cliente ni se publican comprobantes. El despliegue debe incluir la Edge Function y sus secretos. Este mecanismo no sustituye la validación bancaria ni implementa reembolsos automáticos.
