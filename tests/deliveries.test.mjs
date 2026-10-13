import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteDelivery, deliveryVehicleName, findDeliveryByProduct, listDeliveries, normalizeEntrega, orderedDeliveryMedia, saveDelivery } from '../src/deliveries.js';

function client(overrides = {}) {
  const calls = {};
  function builder(table) {
    const record = { ops: [] };
    calls[table] = record;
    const api = {
      select(columns) { record.ops.push(['select', columns]); return api; },
      order(column, options) { record.ops.push(['order', column, options]); return Promise.resolve(overrides.list || { data: [], error: null }); },
      eq(column, value) { record.ops.push(['eq', column, value]); return api; },
      insert(data) { record.ops.push(['insert', data]); return api; },
      update(data) { record.ops.push(['update', data]); return api; },
      delete() { record.ops.push(['delete']); return api; },
      single() { return Promise.resolve(overrides.single || { data: null, error: null }); },
    };
    return api;
  }
  return { calls, from: builder };
}

test('normalizes a sale gallery keeping the sold vehicle id and trimmed fields', () => {
  assert.deepEqual(normalizeEntrega({ producto_id: '7', titulo: '  Entrega  ', descripcion: '   ', publicado: false }), { producto_id: 7, titulo: 'Entrega', descripcion: null, publicado: false });
  assert.deepEqual(normalizeEntrega({ producto_id: 3, titulo: 'X' }), { producto_id: 3, titulo: 'X', descripcion: null, publicado: true });
});

test('orders sale media by position and reads the vehicle from the producto embed', () => {
  const delivery = { archivos_entrega: [{ id: 2, posicion: 1 }, { id: 1, posicion: 0 }, { id: 3, posicion: 0 }] };
  assert.deepEqual(orderedDeliveryMedia(delivery).map((media) => media.id), [1, 3, 2]);
  assert.equal(deliveryVehicleName({ productos: { nombre: 'Hilux' } }), 'Hilux');
  assert.equal(deliveryVehicleName({ vehiculo: 'Prado' }), 'Prado');
  assert.equal(deliveryVehicleName(null), '');
});

test('creates a sale gallery through a normalized insert', async () => {
  const api = client({ single: { data: { id: 5 }, error: null } });
  await saveDelivery(api, undefined, { producto_id: '9', titulo: ' Entrega ', descripcion: '', publicado: true });
  assert.deepEqual(api.calls.entregas.ops[0], ['insert', { producto_id: 9, titulo: 'Entrega', descripcion: null, publicado: true }]);
  assert.equal(api.calls.entregas.ops[1][0], 'select');
});

test('updates only the editable gallery fields by id', async () => {
  const api = client({ single: { data: { id: 5 }, error: null } });
  await saveDelivery(api, 5, { producto_id: 9, titulo: 'X', descripcion: 'Y', publicado: false });
  assert.deepEqual(api.calls.entregas.ops[0], ['update', { producto_id: 9, titulo: 'X', descripcion: 'Y', publicado: false }]);
  assert.deepEqual(api.calls.entregas.ops[1], ['eq', 'id', 5]);
});

test('lists sale galleries newest first embedding the sold vehicle', async () => {
  const api = client({ list: { data: [{ id: 1 }], error: null } });
  const deliveries = await listDeliveries(api);
  assert.match(api.calls.entregas.ops[0][1], /archivos_entrega/);
  assert.match(api.calls.entregas.ops[0][1], /productos/);
  assert.deepEqual(api.calls.entregas.ops[1], ['order', 'creado_en', { ascending: false }]);
  assert.deepEqual(deliveries.data, [{ id: 1 }]);
});

test('finds the gallery of a sold vehicle filtering client-side', async () => {
  const api = client({ list: { data: [{ id: 1, producto_id: 3 }, { id: 2, producto_id: 7 }], error: null } });
  assert.equal((await findDeliveryByProduct(api, 7)).data.id, 2);
  assert.equal((await findDeliveryByProduct(api, 99)).data, null);
  assert.equal((await findDeliveryByProduct(api, 7)).error, null);
  const failed = client({ list: { data: null, error: { message: 'boom', code: 'X' } } });
  const fallback = await findDeliveryByProduct(failed, 7);
  assert.equal(fallback.data, null);
  assert.deepEqual(fallback.error, { message: 'boom', code: 'X' });
});

test('deletes a sale gallery by id', async () => {
  const api = client();
  await deleteDelivery(api, 12);
  assert.deepEqual(api.calls.entregas.ops, [['delete'], ['eq', 'id', 12]]);
});