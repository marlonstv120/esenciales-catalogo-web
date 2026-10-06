# Validación final con usuarios seleccionados y propietario

## Identificación

- **Tipo de validación:** funcional y cualitativa sobre la versión desplegada.
- **Participantes externos:** tres usuarios ajenos al equipo académico.
- **Dispositivo de los usuarios externos:** celular.
- **Participante del negocio:** propietario de ESENCIALES e integrante del equipo académico.
- **Fecha exacta de ejecución:** no suministrada.
- **Evidencia de respaldo:** conversaciones conservadas en `pruebas-usuarios/`.

Las conversaciones se conservan como soporte de la validación y no se utilizan como figuras en el cuerpo del informe. Los resultados se presentan de forma descriptiva; la cantidad de participantes no permite construir porcentajes, estadísticas de satisfacción ni generalizaciones sobre toda la población usuaria.

## Usuarios externos

| Participante | Recorrido realizado | Resultado y observaciones |
| --- | --- | --- |
| Usuario 1 | Revisó principalmente la disponibilidad y el carrito. Intentó agregar un producto no disponible. | El sistema no permitió agregar el producto no disponible. No reportó otros inconvenientes. |
| Usuario 2 | Consultó el catálogo y el producto, agregó al carrito, registró una solicitud y llegó hasta la etapa de pago sin enviar comprobante. | Completó el recorrido previsto sin reportar inconvenientes. |
| Usuario 3 | Ingresó desde las categorías de la página principal, utilizó el carrito y registró una solicitud. | Algunas categorías mostraron el catálogo sin resultados porque no tenían productos cargados. Indicó que necesitó dos intentos para registrar la solicitud. El equipo revisó después ese comportamiento y no logró reproducirlo, por lo que se conserva como observación aislada y no como falla persistente confirmada. |

## Propietario de ESENCIALES

El propietario probó funciones administrativas de productos y presentaciones. Su participación durante el desarrollo no se confunde con la aprobación previa del briefing ni con la aprobación posterior de los contenidos Bre-B.

| Observación | Análisis | Corrección o mejora comprobada |
| --- | --- | --- |
| Después de crear o actualizar información, el botón podía permanecer mostrando `Guardando...`, aunque los datos sí quedaban almacenados. | La persistencia finalizaba, pero la interfaz no actualizaba correctamente su estado después de la operación. | Al completarse el guardado, la interfaz desactiva el estado de carga, actualiza la información y comunica el resultado. Si la operación informa un error de conexión, conserva los valores escritos, vuelve a habilitar la acción e informa al administrador para que pueda reintentar. |
| Se solicitó indicar la unidad asociada a la etiqueta o tamaño de una presentación. | El campo libre permitía escribir la unidad, pero no ofrecía una selección explícita y consistente. | Se incorporó junto al valor un selector compacto con las opciones `Sin unidad`, `ml` y `oz`. La unidad elegida se integra en la etiqueta que se almacena y se presenta en las vistas administrativas y públicas. |

## Comprobación de las correcciones

La implementación vigente restablece el estado de guardado tanto cuando la operación termina correctamente como cuando devuelve un error, conserva los valores del formulario en el segundo caso y vuelve a dibujar la interfaz con la acción habilitada. También construye y normaliza la etiqueta de presentación a partir del valor y la unidad seleccionada. Las pruebas Node verifican la representación del estado de guardado y el formato y separación de unidades; la ejecución vigente aprobó 152 pruebas.

No se conserva una conversación posterior en la que el propietario vuelva a ejecutar y aceptar expresamente las dos correcciones. Por ello, la evidencia de cierre de estos hallazgos corresponde a la implementación actual y a sus pruebas automatizadas, mientras las conversaciones respaldan las observaciones que originaron los cambios.

## Archivos de respaldo

- `pruebas-usuarios/WhatsApp Image 2026-10-04 at 10.39.13 PM.jpeg`.
- `pruebas-usuarios/WhatsApp Image 2026-10-04 at 10.39.12 PM (3).jpeg`.
- `pruebas-usuarios/WhatsApp Image 2026-10-04 at 10.39.12 PM (2).jpeg`.
- `pruebas-usuarios/propietario-esenciales-feedback.jpeg`.
- `pruebas-usuarios/propietario-esenciales-feedback2.jpeg`.

Los nombres de archivo se utilizan solo para localizar el respaldo y no se toman como prueba de la fecha exacta de ejecución.
