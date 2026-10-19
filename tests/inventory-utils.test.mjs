import test from 'node:test';
import assert from 'node:assert/strict';
import { filterInventory, inventoryMetrics, paginateInventory, productPriceRange, sortInventory } from '../src/inventory-utils.mjs';

const product = {
  id: 1, nombre: 'Loción Ámbar', marca: 'Éclat', categoria_id: 1, activo: true, destacado: true,
  presentaciones: [
    { etiqueta: '100 ml', precio_normal: 50000, precio_promocional: 42000, stock: 2, modo_disponibilidad: 'venta_inmediata', activo: true },
    { etiqueta: '250 ml', precio_normal: 80000, precio_promocional: null, stock: 4, modo_disponibilidad: 'venta_inmediata', activo: true },
  ],
};

test('matches inventory search partially without case or accents', () => {
  assert.deepEqual(filterInventory([product], { query: 'ambar' }), [product]);
  assert.deepEqual(filterInventory([product], { query: 'ÉCLA' }), [product]);
  assert.deepEqual(filterInventory([product], { query: '250' }), [product]);
});

test('calculates metrics and effective price range from active presentations', () => {
  assert.deepEqual(productPriceRange(product), { min: 42000, max: 80000 });
  assert.deepEqual(inventoryMetrics([product]), { products: 1, units: 6, value: 404000 });
});

test('paginates products and clamps an invalid page', () => {
  const products = Array.from({ length: 21 }, (_, index) => ({ id: index }));
  assert.equal(paginateInventory(products, 2).items.length, 1);
  assert.equal(paginateInventory(products, 99).page, 2);
});

test('keeps products without a valid price after priced products in either price order', () => {
  const withoutPrice = { id: 2, nombre: 'Sin precio', presentaciones: [] };
  assert.equal(sortInventory([withoutPrice, product], 'price-asc').at(-1), withoutPrice);
  assert.equal(sortInventory([withoutPrice, product], 'price-desc').at(-1), withoutPrice);
});

test('orders inventory by newest product first by default', () => {
  const oldest = { id: 1, nombre: 'Anterior', creado_en: '2026-10-01T10:00:00Z' };
  const newest = { id: 2, nombre: 'Reciente', creado_en: '2026-10-02T10:00:00Z' };

  assert.deepEqual(sortInventory([oldest, newest]).map(({ id }) => id), [2, 1]);
});
