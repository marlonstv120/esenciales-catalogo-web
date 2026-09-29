import test from 'node:test';
import assert from 'node:assert/strict';
import { getAdminRoute, shellView } from '../src/admin-shell.js';

test('resolves legacy product hashes and unknown hashes to inventory', () => {
  assert.equal(getAdminRoute('#productos'), 'inventario');
  assert.equal(getAdminRoute('#productos?query=aroma'), 'inventario');
  assert.equal(getAdminRoute('#otra-ruta'), 'inventario');
});

test('offers inventory as the only primary section and a safe catalog link', () => {
  const html = shellView('inventario');
  assert.match(html, /esenciales-logo-horizontal\.png/);
  assert.match(html, /<h1>Inventario<\/h1>/);
  assert.match(html, /href="#inventario" aria-current="page"/);
  assert.doesNotMatch(html, />Productos</);
  assert.match(html, /<details class="admin-mobile-menu">/);
  assert.equal((html.match(/href="\/" target="_blank" rel="noopener noreferrer"/g) || []).length, 2);
  assert.equal((html.match(/data-sign-out/g) || []).length, 2);
  assert.match(html, /admin-shop-link[^>]*><svg[^>]*>.*?<\/svg>Ver catálogo/);
});
