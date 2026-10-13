import test from 'node:test';
import assert from 'node:assert/strict';
import { classificationLabel, effectivePrice, formatPresentationLabel, listProducts, normalizePresentation, normalizeProduct, splitPresentationLabel } from '../src/products.js';
import { productFormView } from '../src/product-views.mjs';

test('normalizes model / specification and excludes legacy product reference from writes', () => {
  const result = normalizeProduct({ nombre: '  Duster  ', descripcion: '  Camioneta  ', marca: ' ', modelo: ' Iconic 4x4 ', referencia: 'REF-1' });
  assert.equal(result.nombre, 'Duster');
  assert.equal(result.descripcion, 'Camioneta');
  assert.equal(result.marca, null);
  assert.equal(result.modelo, 'Iconic 4x4');
  assert.equal(Object.hasOwn(result, 'referencia'), false);
});

test('administrative product form requests model / specification without showing reference', () => {
  const html = productFormView({ categories: [{ id: 1, nombre: 'Vehículos', activo: true }] });
  assert.match(html, /name="modelo"/);
  assert.doesNotMatch(html, /name="referencia"/);
});

test('forces stock zero for bajo pedido', () => {
  assert.equal(normalizePresentation({ stock: 8, modo_disponibilidad: 'bajo_pedido' }).stock, 0);
});

test('forces stock zero for a sold presentation', () => {
  assert.equal(normalizePresentation({ stock: 3, modo_disponibilidad: 'vendido' }).stock, 0);
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
  assert.equal(formatPresentationLabel(' 2000 ', 'cc'), '2000 cc');
  assert.equal(formatPresentationLabel('50000', 'km'), '50000 km');
  assert.equal(formatPresentationLabel('Automática 4x4', ''), 'Automática 4x4');
});

test('splits existing unit labels and preserves labels without a unit', () => {
  assert.deepEqual(splitPresentationLabel('2000 CC'), { value: '2000', unit: 'cc' });
  assert.deepEqual(splitPresentationLabel('Automática 4x4'), { value: 'Automática 4x4', unit: '' });
});

test('uses a valid promotion as the effective price', () => {
  assert.equal(effectivePrice({ precio_normal: 50000, precio_promocional: 42000 }), 42000);
  assert.equal(effectivePrice({ precio_normal: 50000, precio_promocional: 60000 }), 50000);
});

test('uses the established commercial classification labels', () => {
  assert.equal(classificationLabel('uno_a_uno'), 'Usado');
  assert.equal(classificationLabel('inspiracion'), 'Semi-nuevo');
});

test('loads inventory products from newest to oldest', () => {
  const calls = [];
  const client = { from: (table) => ({ select: () => ({ order: (column, options) => { calls.push({ table, column, options }); return 'listed'; } }) }) };

  assert.equal(listProducts(client), 'listed');
  assert.deepEqual(calls, [{ table: 'productos', column: 'creado_en', options: { ascending: false } }]);
});
