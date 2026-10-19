import test from 'node:test';
import assert from 'node:assert/strict';
import { getAdminRoute, shellView } from '../src/admin-shell.js';

test('resolves legacy product hashes and unknown hashes to inventory', () => {
  assert.equal(getAdminRoute('#productos'), 'inventario');
  assert.equal(getAdminRoute('#productos?query=aroma'), 'inventario');
  assert.equal(getAdminRoute('#otra-ruta'), 'inventario');
});

test('offers inventory and requests sections with a safe catalog link', () => {
  const html = shellView('inventario');
  assert.match(html, /esenciales-logo-horizontal\.png/);
  assert.match(html, /<h1>Inventario<\/h1>/);
  assert.match(html, /href="#inventario" aria-current="page"/);
  assert.match(html, /href="#solicitudes"/);
  assert.doesNotMatch(html, />Productos</);
  assert.match(html, /<details class="admin-mobile-menu">/);
  assert.match(html, /<summary aria-label="Abrir menú"><svg aria-hidden="true"[^>]*><path d="M4 6h16M4 12h16M4 18h16"\/><\/svg><\/summary>/);
  assert.doesNotMatch(html, /<summary[^>]*>Menú<\/summary>/);
  assert.equal((html.match(/href="\/" target="_blank" rel="noopener noreferrer"/g) || []).length, 2);
  assert.equal((html.match(/data-sign-out/g) || []).length, 2);
  assert.match(html, /admin-shop-link[^>]*><svg[^>]*>.*?<\/svg>Ver catálogo/);
});

test('resolves the requests route and marks it as current', () => {
  assert.equal(getAdminRoute('#solicitudes'), 'solicitudes');
  assert.match(shellView('solicitudes'), /<h1>Solicitudes<\/h1>/);
  assert.match(shellView('solicitudes'), /href="#solicitudes" aria-current="page"/);
});
