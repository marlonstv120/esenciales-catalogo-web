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
});

test('edits a new request and offers its allowed state transitions', () => {
  const view = purchaseRequestDetailView(request);
  assert.match(view, /id="request-edit-form"/);
  assert.match(view, /name="cantidad-8"/);
  assert.match(view, /data-request-quantity-change="8"/);
  assert.match(view, /data-request-line-remove="8"/);
  assert.match(view, /aria-label="Retirar producto Brisa · 100 ml"/);
  assert.match(view, /Precio histórico/);
  assert.match(view, /Datos del cliente/);
  assert.match(view, /Descartar cambios/);
  assert.match(view, /data-request-save[^>]*disabled/);
  assert.match(view, /Máx\. disponible: 2/);
  assert.match(view, /data-request-quantity-step="1"[^>]*disabled/);
  assert.match(view, /Confirmar solicitud/);
  assert.match(view, /Cancelar solicitud/);
  assert.doesNotMatch(view, /<p class="eyebrow">Solicitud<\/p>/);
  assert.doesNotMatch(view, /Marcar como entregada/);

  const changedView = purchaseRequestDetailView(request, { dirty: true, values: { lineas: [{ ...request.detalles_solicitud[0], cantidad: 3 }] } });
  assert.match(changedView, /150\.000/);
  assert.doesNotMatch(changedView, /data-request-save[^>]*disabled/);
  assert.match(changedView, /data-request-transition="confirm" disabled/);
});

test('renders requests outside Nueva as read-only with only allowed transitions', () => {
  const view = purchaseRequestDetailView({ ...request, estado: 'confirmada' });
  assert.doesNotMatch(view, /id="request-edit-form"/);
  assert.match(view, /Marcar como entregada/);
  assert.match(view, /Cancelar solicitud/);
  assert.match(view, /Las solicitudes Confirmada son de solo lectura/);
  const terminalView = purchaseRequestDetailView({ ...request, estado: 'entregada' });
  assert.doesNotMatch(terminalView, /data-request-transition/);
});
