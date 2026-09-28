import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCatalogFilters, serializeCatalogFilters, toggleFilterValue, validateCatalogFilters, hasCatalogFilters } from '../src/public-catalog-filters.mjs';
import { loadFilteredCatalog } from '../src/public-catalog.mjs';

test('URL filters round trip, de-duplicate values and ignore unknown parameters', () => {
  const filters = parseCatalogFilters('?q=%20%C3%81mbar%20&categoria=5&genero=hombre&genero=mujer&genero=hombre&clasificacion=uno_a_uno&min=70000&max=90000&genero=extra');
  assert.deepEqual(filters, { busqueda: 'Ámbar', categoria: 5, generos: ['hombre', 'mujer'], clasificaciones: ['uno_a_uno'], precioMinimo: '70000', precioMaximo: '90000' });
  assert.deepEqual(parseCatalogFilters(`?${serializeCatalogFilters(filters)}`), filters);
  assert.equal(hasCatalogFilters(filters), true);
  assert.equal(hasCatalogFilters(parseCatalogFilters('')), false);
});

test('quick values toggle independently and invalid prices cannot query', () => {
  const filters = parseCatalogFilters('');
  assert.deepEqual(toggleFilterValue(toggleFilterValue(filters, 'generos', 'hombre'), 'clasificaciones', 'original'), { ...filters, generos: ['hombre'], clasificaciones: ['original'] });
  assert.deepEqual(toggleFilterValue(toggleFilterValue(filters, 'generos', 'hombre'), 'generos', 'hombre'), filters);
  assert.match(validateCatalogFilters({ ...filters, precioMinimo: '90000', precioMaximo: '70000' }), /mínimo/i);
  assert.match(validateCatalogFilters({ ...filters, precioMinimo: '-1' }), /precio/i);
  assert.match(validateCatalogFilters({ ...filters, precioMaximo: '1.5' }), /precio/i);
  assert.equal(validateCatalogFilters(filters), null);
});

test('filtered RPC uses public contract and returns generic errors', async () => {
  const calls = [];
  const client = { rpc: async (...args) => { calls.push(args); return { data: [], error: null }; } };
  await loadFilteredCatalog(client, parseCatalogFilters('?genero=hombre&clasificacion=original&min=70000'));
  assert.deepEqual(calls, [['buscar_catalogo_publico', { busqueda: null, categoria: null, generos: ['hombre'], clasificaciones: ['original'], precio_minimo: 70000, precio_maximo: null }]]);
  assert.deepEqual(await loadFilteredCatalog({ rpc: async () => ({ data: null, error: { message: 'private' } }) }, parseCatalogFilters('')), { data: [], error: 'No fue posible cargar el catálogo.' });
});
