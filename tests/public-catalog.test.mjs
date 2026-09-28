import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPublicCatalog, loadPublicProduct } from '../src/public-catalog.mjs';

test('loads catalog data through the public RPC and retains active empty categories', async () => {
  const categories = [{ categoria_id: 7, categoria_nombre: 'Otros', producto_id: null }];
  const calls = [];
  const client = { rpc: async (...args) => { calls.push(args); return { data: categories, error: null }; } };

  assert.deepEqual(await loadPublicCatalog(client), { data: categories, error: null });
  assert.deepEqual(calls, [['obtener_catalogo_publico']]);
});

test('rejects invalid product ids without querying Supabase', async () => {
  const client = { rpc: () => { throw new Error('RPC must not run'); } };

  assert.deepEqual(await loadPublicProduct(client, '0'), { data: null, error: 'Producto no encontrado.' });
  assert.deepEqual(await loadPublicProduct(client, 'abc'), { data: null, error: 'Producto no encontrado.' });
});

test('loads a product detail through the public RPC', async () => {
  const product = { producto_id: 12, presentaciones: [] };
  const calls = [];
  const client = { rpc: async (...args) => { calls.push(args); return { data: product, error: null }; } };

  assert.deepEqual(await loadPublicProduct(client, '12'), { data: product, error: null });
  assert.deepEqual(calls, [['obtener_producto_publico', { producto_id: 12 }]]);
});

test('returns generic public errors without exposing backend details', async () => {
  const client = { rpc: async () => ({ data: null, error: { message: 'internal database secret' } }) };

  assert.deepEqual(await loadPublicCatalog(client), { data: [], error: 'No fue posible cargar el catalogo.' });
  assert.deepEqual(await loadPublicProduct(client, 3), { data: null, error: 'No fue posible cargar el producto.' });
});
