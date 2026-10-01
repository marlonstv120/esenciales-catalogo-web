import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPurchaseRequests, listPurchaseRequests, normalizePurchaseRequest, savePurchaseRequest, transitionPurchaseRequest } from '../src/requests.js';

test('normalizes only editable request fields and existing detail quantities', () => {
  assert.deepEqual(normalizePurchaseRequest({ nombre_cliente: ' Ana ', telefono: ' 300 0000000 ', ciudad: '  Cali ', observaciones: ' ', lineas: [{ detalle_id: '7', cantidad: '3' }] }), { nombre_cliente: 'Ana', telefono: '300 0000000', ciudad: 'Cali', observaciones: null, lineas: [{ detalle_id: 7, cantidad: 3 }] });
});

test('lists requests newest first and calls the protected edit RPC', () => {
  const calls = [];
  const client = {
    from: (table) => ({ select: (columns) => ({ order: (column, options) => { calls.push({ table, columns, column, options }); return 'listed'; } }) }),
    rpc: (name, values) => { calls.push({ name, values }); return 'saved'; },
  };
  assert.equal(listPurchaseRequests(client), 'listed');
  assert.equal(savePurchaseRequest(client, 4, { nombre_cliente: 'Ana', telefono: '3000000000', lineas: [{ detalle_id: 9, cantidad: 2 }] }), 'saved');
  assert.equal(calls[0].table, 'solicitudes');
  assert.deepEqual(calls[0].options, { ascending: false });
  assert.equal(calls[1].name, 'actualizar_solicitud_nueva');
  assert.deepEqual(calls[1].values.p_lineas, [{ detalle_id: 9, cantidad: 2 }]);
});

test('filters requests by state and client, code, or phone', () => {
  const requests = [{ codigo: 'ES-00001', nombre_cliente: 'Ana', telefono: '3000000000', estado: 'nueva' }, { codigo: 'ES-00002', nombre_cliente: 'Luis', telefono: '3100000000', estado: 'confirmada' }];
  assert.deepEqual(filterPurchaseRequests(requests, { query: 'ana' }), [requests[0]]);
  assert.deepEqual(filterPurchaseRequests(requests, { query: '00002', status: 'confirmada' }), [requests[1]]);
});

test('calls only the protected RPC for each allowed request transition', () => {
  const calls = [];
  const client = { rpc: (name, values) => { calls.push({ name, values }); return 'transitioned'; } };
  assert.equal(transitionPurchaseRequest(client, 4, 'confirm'), 'transitioned');
  assert.equal(transitionPurchaseRequest(client, 4, 'deliver'), 'transitioned');
  assert.equal(transitionPurchaseRequest(client, 4, 'cancel'), 'transitioned');
  assert.deepEqual(calls.map((call) => call.name), ['confirmar_solicitud_compra', 'entregar_solicitud_compra', 'cancelar_solicitud_compra']);
  assert.deepEqual(calls.map((call) => call.values), [{ p_solicitud_id: 4 }, { p_solicitud_id: 4 }, { p_solicitud_id: 4 }]);
  assert.throws(() => transitionPurchaseRequest(client, 4, 'replace'), /no es válida/);
});
