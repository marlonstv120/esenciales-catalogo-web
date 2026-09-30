import test from 'node:test';
import assert from 'node:assert/strict';
import { purchaseRequestDetailView, purchaseRequestsView } from '../src/request-views.mjs';

const request = { id: 3, codigo: 'ES-00003', nombre_cliente: 'Ana', telefono: '3000000000', ciudad: 'Cali', observaciones: 'Llamar antes', estado: 'nueva', creado_en: '2026-10-01T12:00:00Z', detalles_solicitud: [{ id: 8, cantidad: 2, precio_unitario: 50000, subtotal: 100000, presentaciones: { etiqueta: '100 ml', productos: { nombre: 'Brisa' } } }] };

test('lists requests with accessible detail actions and status filters', () => {
  const view = purchaseRequestsView({ requests: [request], filters: { query: '', status: '' } });
  assert.match(view, /Buscar por código, cliente o teléfono/);
  assert.match(view, /data-request-open="3"/);
  assert.match(view, /Nueva/);
  assert.match(view, /100\.000/);
});

test('edits only a new request without state transition actions', () => {
  const view = purchaseRequestDetailView(request);
  assert.match(view, /id="request-edit-form"/);
  assert.match(view, /name="cantidad-8"/);
  assert.match(view, /data-request-line-remove="8"/);
  assert.match(view, /Precio histórico/);
  assert.doesNotMatch(view, /Confirmar solicitud|Cancelar solicitud|Marcar como entregada/);
});

test('renders requests outside Nueva as read-only', () => {
  const view = purchaseRequestDetailView({ ...request, estado: 'confirmada' });
  assert.doesNotMatch(view, /id="request-edit-form"/);
  assert.match(view, /Las solicitudes Confirmada son de solo lectura/);
});
