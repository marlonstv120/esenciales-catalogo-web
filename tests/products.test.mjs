import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePresentation, normalizeProduct } from '../src/products.js';

test('normalizes optional product fields before saving', () => {
  const { nombre, descripcion, marca, referencia } = normalizeProduct({ nombre: '  Aroma  ', descripcion: '  Descripcion  ', marca: ' ', referencia: ' REF-1 ' });
  assert.deepEqual({ nombre, descripcion, marca, referencia }, {
    nombre: 'Aroma', descripcion: 'Descripcion', marca: null, referencia: 'REF-1',
  });
});

test('forces stock zero for bajo pedido', () => {
  assert.equal(normalizePresentation({ stock: 8, modo_disponibilidad: 'bajo_pedido' }).stock, 0);
});
