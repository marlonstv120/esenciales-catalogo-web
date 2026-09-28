import test from 'node:test';
import assert from 'node:assert/strict';
import { startPublicCatalog } from '../src/public-catalog-controller.mjs';

test('catalog ignores older filtered responses after navigating through history', async () => {
  const listeners = {};
  const app = {
    innerHTML: '',
    addEventListener(name, handler) { listeners[name] = handler; },
    removeEventListener(name) { delete listeners[name]; },
    querySelectorAll() { return []; },
    querySelector() { return null; },
  };
  const windowListeners = {};
  const windowRef = {
    location: { pathname: '/catalogo', search: '?q=viejo', hash: '', href: 'http://localhost/catalogo?q=viejo', origin: 'http://localhost' },
    addEventListener(name, handler) { windowListeners[name] = handler; },
    removeEventListener(name) { delete windowListeners[name]; },
  };
  let resolveOld;
  const client = { rpc: async (name, filters) => {
    if (name === 'obtener_catalogo_publico') return { data: [{ categoria_id: 1, categoria_nombre: 'Aromas', producto_id: 1, nombre: 'Base' }], error: null };
    if (filters.busqueda === 'viejo') return new Promise((resolve) => { resolveOld = resolve; });
    return { data: [{ categoria_id: 1, categoria_nombre: 'Aromas', producto_id: 3, nombre: 'Nuevo', precio_referencia: 70000, disponibilidad: 'Disponible' }], error: null };
  } };
  const stop = startPublicCatalog({ app, client, route: { name: 'catalog' }, windowRef, documentRef: { title: '', activeElement: null, querySelector: () => null } });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(typeof resolveOld, 'function');
  windowRef.location.search = '?q=nuevo';
  windowListeners.popstate();
  await new Promise((resolve) => setTimeout(resolve, 0));
  resolveOld({ data: [{ categoria_id: 1, categoria_nombre: 'Aromas', producto_id: 2, nombre: 'Viejo', precio_referencia: 10000 }], error: null });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.match(app.innerHTML, /Nuevo/);
  assert.doesNotMatch(app.innerHTML, /Viejo/);
  stop();
});
