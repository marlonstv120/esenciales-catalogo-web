import test from 'node:test';
import assert from 'node:assert/strict';
import { purchaseRequestDetailView, purchaseRequestsView } from '../src/request-views.mjs';

const request = { id: 3, codigo: 'ES-00003', nombre_cliente: 'Ana', telefono: '3000000000', ciudad: 'Cali', observaciones: 'Llamar antes', estado: 'nueva', creado_en: '2026-10-01T12:00:00Z', detalles_solicitud: [{ id: 8, cantidad: 2, precio_unitario: 50000, subtotal: 100000, presentaciones: { etiqueta: '100 ml', stock: 2, modo_disponibilidad: 'venta_inmediata', productos: { nombre: 'Brisa' } } }] };

test('lists requests with accessible detail actions, quantities, and status filters', () => {
  const view = purchaseRequestsView({ requests: [request], filters: { query: '', status: '' } });
  assert.match(view, /Buscar por código, cliente o teléfono/);
  assert.match(view, /data-request-open="3"/);
  assert.match(view, /data-request-row="3"/);
  assert.match(view, /aria-label="Ver detalle de la solicitud ES-00003"/);
  assert.match(view, /title="Ver detalle"/);
  assert.match(view, /<th scope="col">Productos<\/th>/);
  assert.match(view, /<td class="request-products">2<\/td>/);
  assert.match(view, /Nueva/);
  assert.match(view, /100\.000/);
  assert.match(view, /class="request-card__payment"><span>Pago:<\/span><span class="payment-status/);
  assert.match(view, /class="request-card__footer">[\s\S]*request-card__payment[\s\S]*request-card__action/);
});

test('keeps a clean new request editable without a separate changes section', () => {
  const view = purchaseRequestDetailView(request);
  assert.match(view, /id="request-edit-form"/);
  assert.match(view, /name="cantidad-8"/);
  assert.match(view, /data-request-quantity-change="8"/);
  assert.match(view, /data-request-line-remove="8"/);
  assert.match(view, /aria-label="Retirar producto Brisa · 100 ml"/);
  assert.match(view, /Precio histórico/);
  assert.match(view, /Datos del cliente/);
  assert.doesNotMatch(view, /Cambios en esta solicitud/);
  assert.match(view, /data-request-edit-actions hidden/);
  assert.match(view, /Descartar cambios/);
  assert.match(view, /data-request-save/);
  assert.match(view, /Máx\. disponible: 2/);
  assert.match(view, /data-request-quantity-step="1"[^>]*disabled/);
  assert.match(view, /Confirmar solicitud/);
  assert.match(view, /Otras acciones/);
  assert.match(view, /Cancelar solicitud/);
  assert.doesNotMatch(view, /<p class="eyebrow">Solicitud<\/p>/);
  assert.doesNotMatch(view, /Marcar como entregada/);

  const changedView = purchaseRequestDetailView(request, { dirty: true, values: { lineas: [{ ...request.detalles_solicitud[0], cantidad: 3 }] } });
  assert.match(changedView, /150\.000/);
  assert.doesNotMatch(changedView, /data-request-edit-actions hidden/);
  assert.doesNotMatch(changedView, /data-request-save[^>]*disabled/);
  assert.match(changedView, /Descartar cambios/);
  assert.match(changedView, /data-request-transition="confirm" disabled/);
  assert.match(changedView, /data-request-transition="cancel" disabled/);
});

test('keeps customer data editable but locks request lines during pending proof review', () => {
  const view = purchaseRequestDetailView({ ...request, pagos_solicitud: { estado: 'comprobante_enviado', monto: 82000, comprobante_path: 'private/proof.png', enviado_en: '2026-10-02T18:50:00Z' } });
  assert.match(view, /class="payment-admin-section__heading"><h3>Pago<\/h3><span class="payment-status payment-status--comprobante_enviado">Comprobante enviado/);
  assert.match(view, /Pendiente de revisión/);
  assert.match(view, /Bre-B/);
  assert.match(view, /82\.000/);
  assert.match(view, /Enviado/);
  assert.match(view, /data-payment-proof-open aria-label="Ver comprobante de pago" title="Ver comprobante"/);
  assert.match(view, /Al aprobar el pago, la solicitud se confirmará y quedará en solo lectura/);
  assert.match(view, /Revisa el comprobante y cualquier dato pendiente antes de continuar/);
  assert.match(view, /class="payment-review-actions">[\s\S]*data-payment-verify[\s\S]*data-payment-reject/);
  assert.match(view, /Aprobar pago y confirmar solicitud/);
  assert.match(view, /Puedes corregir los datos del cliente antes de aprobar el pago/);
  assert.match(view, /Para modificar productos o cantidades debes rechazar primero el comprobante/);
  assert.match(view, /name="nombre_cliente"/);
  assert.doesNotMatch(view, /data-request-quantity-change/);
  assert.doesNotMatch(view, /data-request-line-remove/);
  assert.match(view, /data-request-edit-actions hidden/);
  assert.doesNotMatch(view, /data-request-transition="confirm"/);
  assert.match(view, /Otras acciones[\s\S]*data-request-transition="cancel"/);
});

test('blocks payment approval while pending customer changes have not been saved', () => {
  const view = purchaseRequestDetailView({ ...request, pagos_solicitud: { estado: 'comprobante_enviado', monto: 100000, comprobante_path: 'private/proof.png' } }, { dirty: true, values: { nombre_cliente: 'Ana corregida' } });
  assert.match(view, /data-request-edit-actions(?! hidden)/);
  assert.match(view, /data-payment-verify disabled/);
  assert.match(view, /Guarda o descarta los cambios antes de confirmar la solicitud/);
  assert.match(view, /data-payment-dirty-hint(?! hidden)/);
  assert.match(view, /data-payment-reject/);
});

test('shows loading only on the operation that is actually running', () => {
  const pendingRequest = { ...request, pagos_solicitud: { estado: 'comprobante_enviado', monto: 100000, comprobante_path: 'private/proof.png' } };
  const savingView = purchaseRequestDetailView(pendingRequest, { dirty: true, operation: 'saving', values: { nombre_cliente: 'Ana corregida' } });
  assert.match(savingView, /Guardando\.\.\./);
  assert.match(savingView, /Aprobar pago y confirmar solicitud/);
  assert.doesNotMatch(savingView, /data-payment-verify[^>]*aria-busy/);
  assert.doesNotMatch(savingView, /Procesando\.\.\./);

  const verifyingView = purchaseRequestDetailView(pendingRequest, { operation: 'verifyingPayment' });
  assert.match(verifyingView, /data-payment-verify[^>]*aria-busy="true"/);
  assert.match(verifyingView, /Procesando\.\.\./);
  assert.match(verifyingView, /data-request-save[^>]*>Guardar cambios<\/button>/);
});

test('renders a verified confirmed request as read-only with only allowed transitions', () => {
  const view = purchaseRequestDetailView({ ...request, estado: 'confirmada', pagos_solicitud: { estado: 'verificado', monto: 100000, comprobante_path: 'private/proof.png', enviado_en: '2026-10-02T18:50:00Z' } });
  assert.doesNotMatch(view, /id="request-edit-form"/);
  assert.match(view, /Verificado/);
  assert.match(view, /data-payment-proof-open/);
  assert.doesNotMatch(view, /data-payment-verify/);
  assert.doesNotMatch(view, /data-payment-reject/);
  assert.match(view, /Marcar como entregada/);
  assert.match(view, /Otras acciones[\s\S]*Cancelar solicitud/);
  assert.match(view, /Las solicitudes Confirmada son de solo lectura/);
});

test('renders manual confirmation without claiming that a proof was verified', () => {
  const view = purchaseRequestDetailView({ ...request, estado: 'confirmada', pagos_solicitud: { estado: 'validado_manualmente', metodo: 'externo', monto: 100000 } });
  assert.match(view, /Validado manualmente/);
  assert.match(view, /Validación externa/);
  assert.match(view, /confirmada por el administrador sin comprobante en la plataforma/);
  assert.doesNotMatch(view, /data-payment-proof-open|data-payment-verify|data-payment-reject/);
});

test('keeps cancelled and delivered requests read-only without transition actions', () => {
  const cancelledView = purchaseRequestDetailView({ ...request, estado: 'cancelada', pagos_solicitud: { estado: 'rechazado' } });
  assert.doesNotMatch(cancelledView, /data-request-transition|data-payment-verify|data-payment-reject|data-request-save/);
  const terminalView = purchaseRequestDetailView({ ...request, estado: 'entregada' });
  assert.doesNotMatch(terminalView, /data-request-transition|data-payment-verify|data-payment-reject|data-request-save/);
});
