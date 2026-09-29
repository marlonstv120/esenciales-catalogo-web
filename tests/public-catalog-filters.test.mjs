import test from 'node:test';
import assert from 'node:assert/strict';
import { getCatalogFilterCount, parseCatalogFilters, removeCatalogFilter, serializeCatalogFilters, validateCatalogFilters } from '../src/public-catalog-filters.mjs';
import { loadFilteredCatalog, refineCatalogRows } from '../src/public-catalog.mjs';

test('URL filters retain valid repeated criteria and persistent order', () => {
  const filters = parseCatalogFilters('?q=%20%C3%81mbar%20&categoria=5&disponibilidad=en-stock&disponibilidad=bajo-pedido&genero=hombre&genero=hombre&clasificacion=uno_a_uno&min=70000&max=90000&orden=precio-desc');
  assert.deepEqual(filters, { busqueda: 'Ámbar', categoria: 5, disponibilidades: ['en-stock', 'bajo-pedido'], generos: ['hombre'], clasificaciones: ['uno_a_uno'], precioMinimo: '70000', precioMaximo: '90000', orden: 'precio-desc' });
  assert.deepEqual(parseCatalogFilters(`?${serializeCatalogFilters(filters)}`), filters);
  assert.equal(getCatalogFilterCount(filters), 6);
  assert.deepEqual(removeCatalogFilter(filters, 'disponibilidades', 'en-stock').disponibilidades, ['bajo-pedido']);
});

test('invalid prices are rejected before data loading', () => {
  assert.match(validateCatalogFilters({ ...parseCatalogFilters(''), precioMinimo: '90000', precioMaximo: '70000' }), /mínimo/i);
  assert.match(validateCatalogFilters({ ...parseCatalogFilters(''), precioMinimo: '-1' }), /precio/i);
  assert.equal(validateCatalogFilters(parseCatalogFilters('')), null);
});

test('catalog refines availability and uses deterministic ordering', () => {
  const rows = [{ nombre: 'B', precio_referencia: 20, destacado: false, disponibilidad: 'Bajo pedido' }, { nombre: 'A', precio_referencia: 10, destacado: true, disponibilidad: 'Disponible' }, { nombre: 'C', precio_referencia: 15, destacado: false, disponibilidad: 'Agotado' }];
  assert.deepEqual(refineCatalogRows(rows, { disponibilidades: ['en-stock', 'agotado'], orden: 'precio-desc' }).map(({ nombre }) => nombre), ['C', 'A']);
  assert.deepEqual(refineCatalogRows(rows, { disponibilidades: [], orden: 'destacados' }).map(({ nombre }) => nombre), ['A', 'B', 'C']);
});

test('filtered RPC preserves the public database contract', async () => {
  const calls = []; const client = { rpc: async (...args) => { calls.push(args); return { data: [], error: null }; } };
  await loadFilteredCatalog(client, parseCatalogFilters('?genero=hombre&clasificacion=original&min=70000'));
  assert.deepEqual(calls, [['buscar_catalogo_publico', { busqueda: null, categoria: null, generos: ['hombre'], clasificaciones: ['original'], precio_minimo: 70000, precio_maximo: null }]]);
});
