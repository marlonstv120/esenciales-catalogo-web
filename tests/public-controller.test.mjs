import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPublicRoute } from '../src/public-views.mjs';
import { attachImageFallbacks, getDocumentMetadata } from '../src/public-catalog-controller.mjs';

test('renders route states and retry affordances from public load results', () => {
  assert.match(renderPublicRoute({ name: 'home' }, { data: [], error: null }), /Tu aroma, siempre contigo\./);
  assert.match(renderPublicRoute({ name: 'product', productId: 4 }, { data: null, error: 'No fue posible cargar el producto.' }), /data-public-retry/);
  assert.match(renderPublicRoute({ name: 'product', productId: 4 }, { data: null, error: null }), /No encontrado/);
  assert.match(renderPublicRoute({ name: 'cart' }), /Carrito/);
});

test('maps route titles and image failures to accessible page metadata and fallback copy', () => {
  assert.deepEqual(getDocumentMetadata({ name: 'product' }, { nombre: 'Brisa' }), {
    title: 'Brisa | ESENCIALES',
    description: 'Consulta presentaciones y disponibilidad de Brisa.',
  });

  let imageHidden = false;
  let fallbackHidden = true;
  const image = {
    hidden: false,
    parentElement: {
      querySelector: () => ({ set hidden(value) { fallbackHidden = value; } }),
    },
    setAttribute() {},
  };
  const root = { querySelectorAll: (selector) => selector === '[data-public-image]' ? [image] : [] };
  attachImageFallbacks(root);
  image.onerror();
  imageHidden = image.hidden;

  assert.equal(imageHidden, true);
  assert.equal(fallbackHidden, false);
});

test('hides a broken illustrative category image while keeping its text link', () => {
  const image = { hidden: false };
  attachImageFallbacks({ querySelectorAll: (selector) => selector === '[data-category-image]' ? [image] : [] });
  image.onerror();
  assert.equal(image.hidden, true);
});
