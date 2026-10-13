import test from 'node:test';
import assert from 'node:assert/strict';
import { purchaseRequestDetailView, purchaseRequestsView } from '../src/request-views.mjs';

const request = { id: 3, codigo: 'VM-00003', nombre_cliente: 'Ana', telefono: '3000000000', ciudad: 'Cali', observaciones: 'Llamar antes', estado: 'nueva', creado_en: '2026-10-01T12:00:00Z', detalles_solicitud: [{ id: 8, cantidad: 2, precio_unitario: 50000, subtotal: 100000, presentaciones: { etiqueta: 'Automática', stock: 2, modo_disponibilidad: 'venta_inmediata', productos: { nombre: 'Brisa' } } }] };

test('lists requests with accessible detail actions, quantities, and status filters', () => {
  const view = purchaseRequestsView({ requests: [request], filters: { query: '', status: '' } });
  assert.match(view, /Buscar por código, cliente o teléfono/);
  assert.match(view, /data-request-open="3"/);
  assert.match(view, /data-request-row="3"/);
  assert.match(view, /aria-label="Ver detalle de la solicitud VM-00003"/);
  assert.match(view, /title="Ver detalle"/);
  assert.match(view, /<th scope="col">Productos<\/th>/);
  assert.match(view, /<td class="request-products">2<\/td>/);
  assert.match(view, /Nueva/);
  assert.match(view, /100\.000/);
  assert.doesNotMatch(view, /request-card__payment|<th scope="col">Pago<\/th>/);
  assert.match(view, /class="request-card__footer">[\s\S]*request-card__action/);
});

test('keeps a clean new request editable without a separate changes section', () => {
  const view = purchaseRequestDetailView(request);
  assert.match(view, /id="request-edit-form"/);
  assert.match(view, /name="cantidad-8"/);
  assert.match(view, /data-request-quantity-change="8"/);
  assert.match(view, /data-request-line-remove="8"/);
  assert.match(view, /aria-label="Retirar producto Brisa · Automática"/);
  assert.match(view, /Precio histórico/);
  assert.match(view, /Datos del cliente/);
  assert.doesNotMatch(view, /Cambios en esta solicitud/);
  assert.match(view, /data-request-edit-actions hidden/);
  assert.match(view, /Descartar cambios/);
  assert.match(view, /data-request-save/);
  assert.match(view, /Máx\. disponible: 2/);
  assert.match(view, /data-request-quantity-step="1"[^>]*disabled/);
  assert.match(view, /Confirmar solicitud/);
  assert.doesNotMatch(view, /Otras acciones/);
  assert.doesNotMatch(view, /Cancelar solicitud/);
  assert.match(view, /Observaciones[\s\S]*Responder por WhatsApp/);
  assert.match(view, /https:\/\/wa\.me\/573000000000\?text=/)
  assert.doesNotMatch(view, /<p class="eyebrow">Solicitud<\/p>/);
  assert.doesNotMatch(view, /Marcar como entregada/);

  const changedView = purchaseRequestDetailView(request, { dirty: true, values: { lineas: [{ ...request.detalles_solicitud[0], cantidad: 3 }] } });
  assert.match(changedView, /150\.000/);
  assert.doesNotMatch(changedView, /data-request-edit-actions hidden/);
  assert.doesNotMatch(changedView, /data-request-save[^>]*disabled/);
  assert.match(changedView, /Descartar cambios/);
  assert.match(changedView, /data-request-transition="confirm" disabled/);
  assert.doesNotMatch(changedView, /data-request-transition="cancel"/);
});

test('does not render payment review UI for a request with a legacy payment record', () => {
  const view = purchaseRequestDetailView({ ...request, pagos_solicitud: { estado: 'comprobante_enviado', monto: 82000, comprobante_path: 'private/proof.png', enviado_en: '2026-10-02T18:50:00Z' } });
  assert.doesNotMatch(view, /payment-admin-section|payment-review-actions|data-payment-verify|data-payment-reject|data-payment-proof-open|payment-status/);
  assert.doesNotMatch(view, /Aprobar pago|Comprobante enviado|Bre-B|Pago/);
  assert.match(view, /id="request-edit-form"/);
  assert.match(view, /data-request-quantity-change/);
  assert.match(view, /data-request-transition="confirm"/);
  assert.match(view, /Responder por WhatsApp/);
  assert.doesNotMatch(view, /data-request-transition="cancel"/);
});

test('disables transitions while a new request has unsaved changes', () => {
  const view = purchaseRequestDetailView(request, { dirty: true, values: { nombre_cliente: 'Ana corregida' } });
  assert.match(view, /data-request-edit-actions(?! hidden)/);
  assert.match(view, /data-request-transition="confirm" disabled/);
  assert.doesNotMatch(view, /data-request-transition="cancel"/);
  assert.match(view, /Guarda o descarta los cambios para continuar/);
  assert.doesNotMatch(view, /data-payment-verify|data-payment-reject|data-payment-dirty-hint/);
});

test('shows loading only on the operation that is actually running', () => {
  const savingView = purchaseRequestDetailView(request, { dirty: true, operation: 'saving', values: { nombre_cliente: 'Ana corregida' } });
  assert.match(savingView, /Guardando\.\.\./);
  assert.match(savingView, /data-request-transition="confirm" disabled/);
  assert.doesNotMatch(savingView, /Procesando\.\.\./);

  const confirmingView = purchaseRequestDetailView(request, { operation: 'confirm' });
  assert.match(confirmingView, /data-request-transition="confirm"[^>]*aria-busy="true"/);
  assert.match(confirmingView, /Procesando\.\.\./);
  assert.match(confirmingView, /data-request-save[^>]*>Guardar cambios<\/button>/);
});

test('renders a confirmed request as read-only with only allowed transitions', () => {
  const view = purchaseRequestDetailView({ ...request, estado: 'confirmada', pagos_solicitud: { estado: 'verificado', monto: 100000, comprobante_path: 'private/proof.png', enviado_en: '2026-10-02T18:50:00Z' } });
  assert.doesNotMatch(view, /id="request-edit-form"/);
  assert.doesNotMatch(view, /payment-admin-section|payment-status|Verificado|data-payment-proof-open|data-payment-verify|data-payment-reject/);
  assert.match(view, /Marcar como entregada/);
  assert.doesNotMatch(view, /Otras acciones|Cancelar solicitud/);
  assert.match(view, /Responder por WhatsApp/);
  assert.match(view, /Las solicitudes Confirmada son de solo lectura/);
});

test('does not render payment details for a manually validated request', () => {
  const view = purchaseRequestDetailView({ ...request, estado: 'confirmada', pagos_solicitud: { estado: 'validado_manualmente', metodo: 'externo', monto: 100000 } });
  assert.doesNotMatch(view, /Validado manualmente|Validación externa|payment-admin-section|data-payment-proof-open|data-payment-verify|data-payment-reject/);
  assert.match(view, /Las solicitudes Confirmada son de solo lectura/);
});

test('keeps cancelled and delivered requests read-only without transition actions', () => {
  const cancelledView = purchaseRequestDetailView({ ...request, estado: 'cancelada', pagos_solicitud: { estado: 'rechazado' } });
  assert.doesNotMatch(cancelledView, /data-request-transition|data-payment-verify|data-payment-reject|data-request-save/);
  const terminalView = purchaseRequestDetailView({ ...request, estado: 'entregada' });
  assert.doesNotMatch(terminalView, /data-request-transition|data-payment-verify|data-payment-reject|data-request-save/);
});
