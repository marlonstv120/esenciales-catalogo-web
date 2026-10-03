import assert from 'node:assert/strict';
import test from 'node:test';
import { backButton, backLink } from '../src/back-navigation.mjs';

const arrowPath = 'M19 12H5m6-6-6 6 6 6';

test('renders every back button with the shared arrow and text structure', () => {
  const view = backButton({ label: 'Volver a solicitudes', attributes: 'data-request-back' });

  assert.match(view, /class="back-navigation"/);
  assert.match(view, new RegExp(arrowPath));
  assert.match(view, /<span>Volver a solicitudes<\/span>/);
  assert.match(view, /data-request-back/);
});

test('renders back links with the same shared arrow and text structure', () => {
  const view = backLink({ href: '/catalogo', label: 'Volver al catálogo' });

  assert.match(view, /<a class="back-navigation" href="\/catalogo"/);
  assert.match(view, new RegExp(arrowPath));
  assert.match(view, /<span>Volver al catálogo<\/span>/);
});
