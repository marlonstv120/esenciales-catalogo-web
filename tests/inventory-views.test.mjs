import test from 'node:test';
import assert from 'node:assert/strict';
import { inventoryDashboardView } from '../src/inventory-views.mjs';

const product = {
  id: 1, nombre: 'Producto con un nombre deliberadamente largo', marca: 'Marca', activo: true,
  categorias: { nombre: 'Perfumes / Lociones' }, presentaciones: [], imagenes_producto: [],
};

const filters = { query: '', category: '', brand: '', gender: '', classification: '', family: '', status: '', featured: false, availability: '', minPrice: '', maxPrice: '', order: '', page: 1 };

test('renders a compact inventory row with a single accessible manage action', () => {
  const html = inventoryDashboardView({ products: { all: [product], filtered: [product] }, categories: [], filters, loading: false, error: '', drawerOpen: false });
  assert.match(html, /data-product-open="1"/);
  assert.match(html, /data-product-edit="1"/);
  assert.match(html, /aria-label="Gestionar Producto con un nombre deliberadamente largo"/);
  assert.doesNotMatch(html, />Ver</);
  assert.doesNotMatch(html, /Ver todos/);
  assert.match(html, /title="Sin precio válido">—/);
});
