import test from 'node:test';
import assert from 'node:assert/strict';
import { getAdminRoute } from '../src/admin-shell.js';

test('uses products as the active screen for the productos hash', () => {
  assert.equal(getAdminRoute('#productos'), 'productos');
  assert.equal(getAdminRoute('#otra-ruta'), 'categorias');
});
