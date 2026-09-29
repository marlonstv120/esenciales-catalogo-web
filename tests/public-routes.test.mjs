import test from 'node:test';
import assert from 'node:assert/strict';
import { getApplicationArea, getPublicRoute } from '../src/public-routes.mjs';

test('resolves the public routes and product ids', () => {
  assert.deepEqual(getPublicRoute('/'), { name: 'home' });
  assert.deepEqual(getPublicRoute('/catalogo'), { name: 'catalog' });
  assert.deepEqual(getPublicRoute('/carrito'), { name: 'cart' });
  assert.deepEqual(getPublicRoute('/producto/12'), { name: 'product', productId: 12 });
  assert.deepEqual(getPublicRoute('/producto/0'), { name: 'not-found' });
  assert.deepEqual(getPublicRoute('/producto/abc'), { name: 'not-found' });
  assert.deepEqual(getPublicRoute('/otra-ruta'), { name: 'not-found' });
});

test('keeps admin routes and Auth invitation or recovery links out of public routing', () => {
  assert.deepEqual(getPublicRoute('/admin'), { name: 'admin' });
  assert.deepEqual(getPublicRoute('/admin/productos'), { name: 'admin' });
  assert.deepEqual(getPublicRoute('/admin/inventario'), { name: 'admin' });
  assert.equal(getApplicationArea({ pathname: '/admin/productos', href: 'http://localhost/admin/productos' }), 'admin');
  assert.equal(getApplicationArea({ pathname: '/admin', href: 'http://localhost/admin#access_token=x&type=invite' }), 'admin-auth');
  assert.equal(getApplicationArea({ pathname: '/admin', href: 'http://localhost/admin#access_token=x&type=recovery' }), 'admin-auth');
  assert.equal(getApplicationArea({ pathname: '/', href: 'http://localhost/' }), 'public');
});

test('resolves public and admin routes below the GitHub Pages project path', () => {
  const basePath = '/esenciales-catalogo-web/';
  assert.deepEqual(getPublicRoute('/esenciales-catalogo-web/catalogo', basePath), { name: 'catalog' });
  assert.deepEqual(getPublicRoute('/esenciales-catalogo-web/producto/12', basePath), { name: 'product', productId: 12 });
  assert.equal(getApplicationArea({
    pathname: '/esenciales-catalogo-web/admin',
    href: 'https://marlonstv120.github.io/esenciales-catalogo-web/admin',
  }, basePath), 'admin');
});
