import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCategory,
  listCategories,
  updateCategory,
} from '../src/categories.js';

function fakeClient() {
  const calls = [];
  const result = { data: [{ id: 1, nombre: 'Splash', activo: true }], error: null };

  const query = {
    select(columns) {
      calls.push({ method: 'select', columns });
      return query;
    },
    order(column, options) {
      calls.push({ method: 'order', column, options });
      return result;
    },
    single() {
      calls.push({ method: 'single' });
      return result;
    },
    eq(column, value) {
      calls.push({ method: 'eq', column, value });
      return query;
    },
  };

  return {
    calls,
    result,
    from(table) {
      calls.push({ method: 'from', table });
      return {
        select: query.select,
        insert(payload) {
          calls.push({ method: 'insert', payload });
          return query;
        },
        update(payload) {
          calls.push({ method: 'update', payload });
          return query;
        },
      };
    },
  };
}

test('lists every category alphabetically', () => {
  const client = fakeClient();

  const response = listCategories(client);

  assert.equal(response, client.result);
  assert.deepEqual(client.calls, [
    { method: 'from', table: 'categorias' },
    { method: 'select', columns: 'id, nombre, activo' },
    { method: 'order', column: 'nombre', options: { ascending: true } },
  ]);
});

test('trims a new category name before saving it', () => {
  const client = fakeClient();

  createCategory(client, '  Splash  ');

  assert.deepEqual(client.calls[1], { method: 'insert', payload: { nombre: 'Splash' } });
});

test('does not submit an empty category name', () => {
  const client = fakeClient();

  const response = createCategory(client, '   ');

  assert.deepEqual(response, {
    data: null,
    error: { code: 'category_name_required' },
  });
  assert.deepEqual(client.calls, []);
});

test('trims a renamed category and targets its identifier', () => {
  const client = fakeClient();

  updateCategory(client, 7, { nombre: '  Cremas  ', activo: false });

  assert.deepEqual(client.calls, [
    { method: 'from', table: 'categorias' },
    { method: 'update', payload: { nombre: 'Cremas', activo: false } },
    { method: 'eq', column: 'id', value: 7 },
    { method: 'select', columns: 'id, nombre, activo' },
    { method: 'single' },
  ]);
});
