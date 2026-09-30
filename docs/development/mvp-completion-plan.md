# Cierre funcional del MVP: solicitudes e inventario

**Fecha de elaboración:** 29 de septiembre de 2026
**Estado:** plan de trabajo; no acredita implementación ni validación.
**Fuentes rectoras:** [alcance](../project/functional-scope.md), [requisitos](../project/requirements.md), [reglas](../project/business-rules.md), [flujos](../project/actors-and-flows.md) y [modelo lógico](../architecture/data-model.md). Complementa la [hoja de ruta](mvp-implementation-roadmap.md) desde los incrementos 8–12.

## Decisiones y estado de partida

- **Confirmado:** catálogo público, filtros y carrito local tienen implementación en `src/`. La migración `20260929000100_add_public_requestable_quantity_limit.sql`, aplicada al remoto el 30 de septiembre de 2026, añade `maximo_solicitable` de 0 a 99 al detalle público; el detalle permite agregar con ese límite y el carrito lo conserva. Al abrir el carrito, el cliente consulta el detalle público actual de cada producto y marca líneas agotadas, no disponibles, con cantidad excesiva o precio/estado cambiado; no borra ni ajusta cantidades automáticamente. Carrito y catálogo requieren revisión manual; pgTAP queda pendiente porque Docker Desktop estaba detenido. `supabase/migrations/` aún no contiene tablas ni funciones de solicitudes. La navegación administrativa solo tiene Inventario.
- **Aprobado para el siguiente incremento:** número comercial de WhatsApp **+57 317 4645670** (para `wa.me`: `573174645670`); validación telefónica sin letras, admitiendo solo dígitos y separadores telefónicos razonables; identificador único de intento para reintentos idempotentes; ante cambio de precio, requerir revisión y confirmación explícita del nuevo resumen antes de registrar.
- **Pendiente de validación:** [términos](../project/terms-and-conditions-draft.md) y [política](../project/personal-data-policy-draft.md) propuestos; textos públicos finales de entrega/envío y aprobación de versiones legales. El responsable informado es Daniel Steven Contreras Lopez, CC 1007603114, domicilio Cra 26b1 #89-60, correo essentialsformen0122@gmail.com y WhatsApp +57 317 4645670. El propietario ajustará presentaciones, aportará imágenes y activará las fichas candidatas verificadas. Sin esas aprobaciones no habilitar el formulario de solicitudes en producción.
- **Fuera de este cierre:** segundo rol y debate sobre máximo académico de funcionalidades, pagos, cuentas de clientes, ventas/reportes financieros, dirección web y WhatsApp Business API. La pregunta académica permanece anotada en su fuente, sin bloquear este plan.

## Contrato de datos mínimo

Ya existen `auth.users → usuarios_administrativos`, `categorias → productos → presentaciones` y `productos → imagenes_producto`. Se necesitan **dos tablas** y una secuencia de código:

| Objeto | Campos y restricciones necesarias | Relaciones/acceso |
| --- | --- | --- |
| `solicitudes` | `id`, `codigo` único (`ES-00001` desde secuencia, con huecos permitidos), `identificador_intento` único no vacío, nombre, teléfono, ciudad opcional, observaciones opcionales, versiones vigentes de términos y política, `aceptado_en`, estado `nueva/confirmada/entregada/cancelada`, fechas de creación, actualización, confirmación, entrega y cancelación. | Sin cuenta de cliente; prohibir lectura/escritura directa a `anon`. Solo lectura administrativa autorizada; mutaciones mediante RPC. |
| `detalles_solicitud` | `id`, `solicitud_id`, `presentacion_id`, cantidad 1–99, precio unitario efectivo histórico > 0, subtotal derivado, `cantidad_descontada` >= 0 (inicialmente 0); unicidad `(solicitud_id, presentacion_id)`. | FK a solicitud y presentación; nunca borrar en la aplicación. Evitar cascadas que destruyan historial. Solo lectura administrativa autorizada y mutaciones controladas. |

`solicitudes 1 → N detalles_solicitud` y `presentaciones 1 → N detalles_solicitud`. No crear tablas separadas de clientes, aceptación, inventario o auditoría. El total se calcula desde detalles; los nombres históricos no se congelan según el modelo aprobado, pero sí los precios. Definir índices prácticos para código, intento, estado/fecha y FK. Mantener SQL versionado, restricciones de integridad, RLS y privilegios explícitos; confirmar que `authenticated` no implica ser administrador. No depender solo de la UI para ninguna regla crítica.

**Idempotencia:** un intento nace una sola vez al iniciar un envío y se conserva para reintentar tras falla de red o respuesta incierta. PostgreSQL asegura unicidad. Una repetición con el mismo identificador y el mismo contenido debe devolver el resultado ya registrado sin generar código ni líneas nuevos; un mismo identificador con contenido distinto debe rechazarse. Especificar cómo comparar el contenido normalizado de forma segura y cómo distinguir una respuesta incierta de un fallo de validación; no exponer por este mecanismo datos de otra solicitud. La UI genera un nuevo intento cuando el visitante cambia el carrito o los datos y vuelve a confirmar. Probar envío simultáneo con el mismo identificador.

**Versiones legales:** la RPC toma las versiones vigentes desde configuración controlada en servidor, nunca desde un valor inventado por el navegador. El navegador comunica aceptación expresa para *esas* versiones; si cambian entre visualización y envío, se exige volver a mostrar los documentos y aceptar. Publicar URLs estables por versión y conservar copia del texto aceptado fuera de la tabla (por ejemplo archivos versionados publicados), sin sustituirla silenciosamente. El almacenamiento exacto de la configuración se decide con los textos aprobados; no asumir vigentes los borradores actuales.

## Bloque 0 — Cerrar catálogo y carrito existentes

**Trabajo restante:** revisión manual de catálogo, disponibilidad, filtros combinados y URL/atrás/adelante, detalle y carrito en 390, 768 y 1440 px, teclado y zoom 200 %. La selección de presentación, cantidad y agregado desde detalle están implementados. Revisar corrupción de almacenamiento y cambios de catálogo; no considerar fiables precios, modo ni límites guardados localmente. `maximo_solicitable` limita la interfaz entre 0 y 99, pero la futura RPC de solicitud sigue siendo la autoridad definitiva.

**Salida:** navegación completa entre catálogo, detalle y carrito, agotados/no disponibles no agregables, cantidades 1–99 y stock inmediato respetado donde pueda verificarse; errores/reintento accesibles y capturas de validación manual. Registrar defectos reales antes de marcar incremento 8 terminado.

## Bloque 1 — Contenido y contrato de registro

**Trabajo:** obtener aprobación del propietario de los dos textos legales, identidad y contacto, versión y fecha; revisar las propuestas de contacto y entrega indicadas más abajo. Diseñar entradas de RPC (identificador de intento, nombre, teléfono, ciudad, observaciones, líneas por presentación y cantidad, aceptación de versiones mostradas) y salida mínima (código, líneas, precios históricos y total), sin confiar en precios/cantidades disponibles del carrito local. Teléfono como `text` para conservar `+` y ceros iniciales; en formulario y servidor admitir solo dígitos, espacios, `+`, paréntesis y guiones, validar longitud razonable de dígitos y rechazar letras y símbolos ajenos. No imponer indicativo colombiano. Resolver límites de tamaño para campos libres y mensaje claro para rechazo.

**Salida:** contrato y contenido acordados, casos de error enumerados: producto despublicado, presentación inactiva/agotada/no disponible, stock insuficiente, precio cambiado, aceptación ausente/desactualizada, teléfono inválido, duplicado, red incierta. No marcar textos legales como vigentes antes de su aprobación.

## Bloque 2 — Esquema y seguridad

**Trabajo:** migración versionada con tablas, secuencia, restricciones, FK/índices, timestamps, RLS y permisos mínimos. Prohibir mutaciones directas del detalle y transiciones directas de estado incluso para usuarios administrativos; canalizar mutaciones por funciones. La lectura administrativa puede realizarse por RLS o por RPC autorizada. Conceder solo `EXECUTE` necesario a cada actor, fijar `search_path` y evitar exposición accidental por privilegios predeterminados.

**Salida:** pruebas pgTAP con administrador activo, usuario autenticado no autorizado y anónimo; datos personales inaccesibles para visitantes, filas históricas conservadas, checks y FK efectivos. Aplicar localmente sin borrar datos; inspeccionar migración antes de sincronizar el remoto.

## Bloque 3 — Registro atómico e idempotente

**Trabajo:** RPC pública con límites de tamaño, normalización y autorización explícita; rechazar carrito vacío, IDs/cantidades duplicados o inválidos, presentación/producto/categoría no activos o no publicables y modo no solicitable. Bloquear o serializar las filas relevantes para revalidar coherentemente precios y stock (sin reservarlo); calcular precio efectivo en PostgreSQL, código y subtotal/total; insertar solicitud Nueva y líneas con `cantidad_descontada = 0` en una transacción. Implementar idempotencia y rechazo de reutilización del token con contenido distinto. Asegurar que una diferencia de precios devuelva el resumen actual para pedir nueva confirmación **sin crear solicitud en ese primer intento**.

**Salida:** casos positivos inmediatos, bajo pedido y mixtos; tests de stock/cambio de precio, aceptación y permisos; rollback sin cabecera huérfana; reintentos y concurrencia no duplican solicitudes ni consumen dos códigos por el mismo registro exitoso (los huecos de secuencia se permiten). No hay descuento en Nueva.

## Bloque 4 — Registro público, confirmación y WhatsApp

**Trabajo:** formulario en `/carrito` con nombre/teléfono, ciudad y observaciones opcionales, enlaces a versiones vigentes y casilla desmarcada; resumen, carga, errores de validación y reintento idempotente. Si cambia precio, mostrar diferencia y exigir acción explícita de revisión antes de nuevo envío; si cambia stock/disponibilidad, permitir corregir líneas. Tras respuesta exitosa mostrar código, resumen devuelto por servidor y valor total de productos; solo entonces retirar el carrito (guardar confirmación temporal para evitar pérdida por recarga accidental). Botón optativo «Continuar por WhatsApp» con `https://wa.me/573174645670?text=...`; construir texto codificado desde datos confirmados, sin envío automático ni acceso a datos de terceros. Si no abre WhatsApp, la solicitud sigue registrada. Mostrar costo de envío por confirmar.

**Salida:** recorrido manual en móvil y escritorio, sin doble envío, no vaciar carrito ante error, aceptación bloqueante y enlace a documentos correctos; comprobar URL y mensaje, ausencia de pagos e importes de envío inventados.

## Bloque 5 — Gestión administrativa de solicitudes

**Trabajo:** sección «Solicitudes» en shell; listado por fecha/estado y detalle con cliente, líneas, precios históricos, totales y marcas de tiempo. RPC de edición de Nueva bloquea la cabecera y valida datos y cantidades; admite solo corregir cliente/ciudad/observaciones, modificar cantidades y retirar líneas existentes, jamás agregar, duplicar, cambiar presentación o precio ni dejar la solicitud vacía. Recalcular subtotales/total a partir del precio histórico. Proteger operaciones y mensajes de error.

**Salida:** Nuevas editables bajo reglas; Confirmadas/Entregadas/Canceladas de solo lectura; pruebas de acceso y de todas las prohibiciones, estados de carga/vacío/error en pantalla.

## Bloque 6 — Estados e inventario transaccional

**Trabajo:** RPC administrativas para confirmar, entregar y cancelar. Al confirmar bloquear solicitud y presentaciones en orden estable; exigir Nueva, actividad de categoría/producto/presentación, modo vigente y stock suficiente; descontar solo venta inmediata y registrar `cantidad_descontada` por línea; bajo pedido no descuenta. Al cancelar Nueva no hay restitución; al cancelar Confirmada restituir *exactamente* cada `cantidad_descontada` incluso si el modo o actividad cambió; Entregada es terminal. Registrar fechas. Evitar actualización directa que salte transiciones; serializar con edición y cambios administrativos de stock.

**Salida:** tests de stock agotado, mixtos, modos cambiados, cancelación, doble clic y dos confirmaciones concurrentes; nunca stock negativo, doble descuento/restauración ni transacción parcial. Nueva → Confirmada/Cancelada; Confirmada → Entregada/Cancelada y ninguna otra transición.

## Bloque 7 — Integración, contenido real y producción

**Trabajo:** pruebas Node y pgTAP, build y recorrido manual de extremo a extremo con cuenta administrativa real y anónimo; revisar RLS/privilegios RPC, recuperación Auth, Storage, URLs GitHub Pages, teclado, foco, formularios, contraste, fallos de red y responsive. El propietario revisa fichas candidatas, corrige precio/presentación/stock, carga imágenes y activa solo productos verificados. Aplicar migraciones al remoto tras revisión y respaldo apropiado; probar allí registro → consulta → edición → confirmación → cancelación/restitución y entrega alternativa. Registrar evidencia real y actualizar `README.md`, arquitectura, requisitos, historia, contexto y material académico afectado; nunca reportar como probados pasos no ejecutados.

**Salida final:** un visitante encuentra un producto, combina venta inmediata y bajo pedido, acepta documentos vigentes y obtiene un único código incluso tras reintento; puede omitir WhatsApp. El administrador lo atiende, confirma descontando únicamente el inventario correspondiente, entrega o cancela con restitución precisa. Sitio público con contenido real y enlaces legales aprobados y accesibles.

## Textos básicos propuestos para interfaz (por aprobar)

- **Contacto:** «¿Tienes dudas sobre un producto o tu solicitud? Escríbenos por WhatsApp al +57 317 4645670.»
- **Antes de registrar:** «Esta es una solicitud de compra, no un pago ni una venta confirmada. El valor total corresponde solo a productos. Confirmaremos disponibilidad, entrega y costo de envío según tu ubicación.»
- **Bajo pedido:** «Disponibilidad y tiempo de entrega sujetos a confirmación con ESENCIALES.»
- **Después de registrar:** «Recibimos tu solicitud {código}. Puedes continuar por WhatsApp si deseas coordinar los detalles. Tu solicitud ya quedó registrada aunque no abras WhatsApp.»
- **Mensaje prellenado:** «Hola, ESENCIALES. Registré la solicitud {código} a nombre de {nombre}. Productos: {líneas con presentación, cantidad y precio unitario}. Valor total de productos: {total}. Quisiera confirmar disponibilidad y entrega.» No incluir teléfono u observaciones salvo necesidad validada.
- **Entrega:** «La entrega, cobertura, plazos y costo de envío se confirman directamente con ESENCIALES según el destino y la disponibilidad. No se cobran en este sitio.»

## Verificación y mantenimiento documental

Por bloque: pruebas focalizadas de lógica y permisos, `npm run supabase:test-db` cuando haya SQL (el script apunta al proyecto vinculado; comprobar destino antes de usarlo), `npm run test:auth`, `npm run build`; aplicar migraciones primero en entorno local autorizado sin reset involuntario. Validar manualmente la UI en navegador. Tras modificar código ejecutar `graphify update .`. Corregir las contradicciones del README, roadmap y alcance sobre carrito y filtro de disponibilidad al cerrar el bloque pertinente; no alterar retrospectivamente documentos de decisiones históricas. Los textos legales son borradores hasta aprobación expresa, publicación versionada y verificación de sus enlaces.
