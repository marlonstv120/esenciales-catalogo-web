import test from 'node:test';
import assert from 'node:assert/strict';
import { readDraft, removeDraft, writeDraft } from '../src/form-drafts.mjs';

function storage() {
  const values = new Map();
  return { setItem: (key, value) => values.set(key, value), getItem: (key) => values.get(key) || null, removeItem: (key) => values.delete(key) };
}

test('persists drafts with schema metadata and rejects incompatible data', () => {
  const store = storage();
  const metadata = { version: 1, form: 'admin-product-new' };
  assert.equal(writeDraft(store, 'vehimarcas:draft:admin:producto:nuevo', { ...metadata, values: { nombre: 'Hilux SRX' } }), true);
  assert.deepEqual(readDraft(store, 'vehimarcas:draft:admin:producto:nuevo', metadata).values, { nombre: 'Hilux SRX' });
  assert.equal(readDraft(store, 'vehimarcas:draft:admin:producto:nuevo', { version: 2, form: metadata.form }), null);
  removeDraft(store, 'vehimarcas:draft:admin:producto:nuevo');
  assert.equal(readDraft(store, 'vehimarcas:draft:admin:producto:nuevo', metadata), null);
});
