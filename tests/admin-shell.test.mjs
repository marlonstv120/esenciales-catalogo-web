import test from 'node:test';
import assert from 'node:assert/strict';
import { getAdminRoute, shellView } from '../src/admin-shell.js';

test('uses products as the active screen for the productos hash', () => {
  assert.equal(getAdminRoute('#productos'), 'productos');
  assert.equal(getAdminRoute('#otra-ruta'), 'categorias');
});

test('keeps existing sections and offers a safe new-tab store link in desktop and mobile navigation', () => {
  const html = shellView('productos');
  assert.match(html, /esenciales-logo-horizontal\.png/);
  assert.match(html, /<h1>Productos<\/h1>/);
  assert.match(html, /href="#productos" aria-current="page"/);
  assert.match(html, /<details class="admin-mobile-menu">/);
  assert.equal((html.match(/href="\/" target="_blank" rel="noopener noreferrer"/g) || []).length, 2);
  assert.equal((html.match(/data-sign-out/g) || []).length, 2);
});
