import test from 'node:test';
import assert from 'node:assert/strict';
import { classificationLabel, effectivePrice, formatPresentationLabel, listProducts, normalizePresentation, normalizeProduct, splitPresentationLabel } from '../src/products.js';
import { productFormView } from '../src/product-views.mjs';

test('normalizes aromatic family and excludes legacy product reference from writes', () => {
  const result = normalizeProduct({ nombre: '  Aroma  ', descripcion: '  Descripcion  ', marca: ' ', familia_olfativa: ' Floral ', referencia: 'REF-1' });
  assert.equal(result.nombre, 'Aroma');
  assert.equal(result.descripcion, 'Descripcion');
  assert.equal(result.marca, null);
  assert.equal(result.familia_olfativa, 'Floral');
  assert.equal(Object.hasOwn(result, 'referencia'), false);
});

test('administrative product form requests aromatic family without showing reference', () => {
  const html = productFormView({ categories: [{ id: 1, nombre: 'Perfumes / Lociones', activo: true }] });
  assert.match(html, /name="familia_olfativa"/);
  assert.doesNotMatch(html, /name="referencia"/);
});

test('forces stock zero for bajo pedido', () => {
  assert.equal(normalizePresentation({ stock: 8, modo_disponibilidad: 'bajo_pedido' }).stock, 0);
});

test('normalizes formatted COP presentation prices before persistence', () => {
  assert.deepEqual(normalizePresentation({ precio_normal: '$90.000', precio_promocional: '$75.000', stock: 2, modo_disponibilidad: 'venta_inmediata' }), {
    precio_normal: 90000,
    precio_promocional: 75000,
    stock: 2,
    modo_disponibilidad: 'venta_inmediata',
    etiqueta: undefined,
  });
});

test('formats presentation labels with the selected unit or no suffix', () => {
  assert.equal(formatPresentationLabel(' 100 ', 'ml'), '100 ml');
  assert.equal(formatPresentationLabel('1', 'oz'), '1 oz');
  assert.equal(formatPresentationLabel('Tamaño especial', ''), 'Tamaño especial');
});

test('splits existing unit labels and preserves labels without a unit', () => {
  assert.deepEqual(splitPresentationLabel('100 ML'), { value: '100', unit: 'ml' });
  assert.deepEqual(splitPresentationLabel('Tamaño por confirmar'), { value: 'Tamaño por confirmar', unit: '' });
});

test('uses a valid promotion as the effective price', () => {
  assert.equal(effectivePrice({ precio_normal: 50000, precio_promocional: 42000 }), 42000);
  assert.equal(effectivePrice({ precio_normal: 50000, precio_promocional: 60000 }), 50000);
});

test('uses the established commercial classification labels', () => {
  assert.equal(classificationLabel('uno_a_uno'), '1.1');
  assert.equal(classificationLabel('inspiracion'), 'Inspiración');
});

test('loads inventory products from newest to oldest', () => {
  const calls = [];
  const client = { from: (table) => ({ select: () => ({ order: (column, options) => { calls.push({ table, column, options }); return 'listed'; } }) }) };

  assert.equal(listProducts(client), 'listed');
  assert.deepEqual(calls, [{ table: 'productos', column: 'creado_en', options: { ascending: false } }]);
});
