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

test('adding the only presentation from home keeps the visitor on home', async () => {
  const listeners = {};
  const app = {
    innerHTML: '',
    addEventListener(name, handler) { listeners[name] = handler; },
    removeEventListener(name) { delete listeners[name]; },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    insertAdjacentHTML() {},
  };
  const windowListeners = {};
  const storage = { getItem: () => null, setItem() {} };
  const windowRef = {
    location: { pathname: '/', search: '', hash: '', href: 'http://localhost/', origin: 'http://localhost' },
    localStorage: storage,
    setTimeout,
    addEventListener(name, handler) { windowListeners[name] = handler; },
    removeEventListener(name) { delete windowListeners[name]; },
  };
  const product = {
    producto_id: 1,
    nombre: 'Brisa',
    destacado: true,
    categoria_nombre: 'Aromas',
    precio_referencia: 50000,
    disponibilidad: 'Disponible',
    presentaciones: [{ id: 10, etiqueta: '100 ml', estado: 'Disponible', precio_normal: 50000, maximo_solicitable: 5 }],
  };
  const client = {
    rpc: async (name) => name === 'obtener_producto_publico'
      ? { data: product, error: null }
      : { data: [product], error: null },
  };
  const stop = startPublicCatalog({ app, client, route: { name: 'home' }, windowRef, documentRef: { title: '', activeElement: null, querySelector: () => null } });
  await new Promise((resolve) => setTimeout(resolve, 0));

  const addButton = {
    dataset: { productAdd: '1' },
    disabled: false,
    setAttribute() {},
    removeAttribute() {},
    closest(selector) { return selector === '[data-product-add]' ? this : null; },
  };
  listeners.click({ target: addButton });
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(windowRef.location.pathname, '/');
  assert.match(app.innerHTML, /Tu aroma, siempre contigo\./);
  assert.doesNotMatch(app.innerHTML, /El catálogo está vacío/);
  stop();
});

test('restores page scroll after a re-rendered cart drawer closes', async () => {
  const listeners = {};
  let drawer = null;
  const app = {
    innerHTML: '',
    addEventListener(name, handler) { listeners[name] = handler; },
    removeEventListener(name) { delete listeners[name]; },
    querySelector(selector) { return selector === '[data-cart-drawer]' ? drawer : null; },
    querySelectorAll() { return []; },
    insertAdjacentHTML(_position, markup) {
      if (markup.includes('data-cart-drawer')) drawer = { remove() { drawer = null; }, set outerHTML(_value) {} };
    },
  };
  const storage = {
    getItem(key) {
      if (key !== 'esenciales.cart.v2') return null;
      return JSON.stringify({ version: 2, items: [{ presentationId: 10, productId: 1, name: 'Brisa', label: '100 ml', status: 'Disponible', price: 50000, maxQuantity: 2, quantity: 1 }] });
    },
    setItem() {},
  };
  const windowListeners = {};
  const windowRef = {
    location: { pathname: '/catalogo', search: '', hash: '', href: 'http://localhost/catalogo', origin: 'http://localhost' },
    localStorage: storage,
    sessionStorage: storage,
    matchMedia: () => ({ matches: false }),
    addEventListener(name, handler) { windowListeners[name] = handler; },
    removeEventListener(name) { delete windowListeners[name]; },
  };
  const documentRef = { body: { style: { overflow: '' } }, title: '', activeElement: null, querySelector: () => null, addEventListener() {}, removeEventListener() {} };
  const product = { producto_id: 1, nombre: 'Brisa', categoria_nombre: 'Aromas', precio_referencia: 50000, disponibilidad: 'Disponible', presentaciones: [{ id: 10, etiqueta: '100 ml', estado: 'Disponible', precio_normal: 50000, maximo_solicitable: 2 }] };
  const client = { rpc: async (name) => ({ data: name === 'obtener_producto_publico' ? product : [product], error: null }) };
  const stop = startPublicCatalog({ app, client, route: { name: 'catalog' }, windowRef, documentRef });
  await new Promise((resolve) => setTimeout(resolve, 0));

  const open = { closest: (selector) => selector === '[data-cart-drawer-open]' ? open : null, focus() {} };
  listeners.click({ target: open });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(documentRef.body.style.overflow, 'hidden');

  const close = { closest: (selector) => selector === '[data-cart-drawer-close]' ? close : null };
  listeners.click({ target: close });
  assert.equal(documentRef.body.style.overflow, '');
  assert.equal(drawer, null);
  stop();
});
