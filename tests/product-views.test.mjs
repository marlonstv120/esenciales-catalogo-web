import test from 'node:test';
import assert from 'node:assert/strict';
import { presentationFormView, presentationRowView, productSaveConfirmation, publicationSummary } from '../src/product-views.mjs';
import { productImageEditorView } from '../src/product-image-views.mjs';

const validPresentation = {
  activo: true,
  etiqueta: '100 ml',
  precio_normal: 90000,
  stock: 2,
  modo_disponibilidad: 'venta_inmediata',
};

test('marks a product without an image as not publishable', () => {
  const summary = publicationSummary({
    activo: true,
    categoria: { activo: true },
    imagenes_producto: [],
    presentaciones: [validPresentation],
  });
  assert.match(summary, /No publicable/);
  assert.match(summary, /Imagen pendiente/);
});

test('shows agotado from immediate-sale stock zero', () => {
  assert.match(presentationRowView({ ...validPresentation, stock: 0 }), /Agotado/);
});

test('keeps a promotional price after a database constraint error', () => {
  const view = presentationFormView({
    values: { precio_promocional: '50000' },
    error: 'La promocion debe ser menor al precio normal.',
  });
  assert.match(view, /value="50000"/);
  assert.match(view, /La promocion debe ser menor al precio normal/);
});

test('shows a neutral product image editor with editable alternative text', () => {
  const view = productImageEditorView({ product: { id: 4, nombre: 'Aroma' }, image: null });
  assert.match(view, /Imagen no disponible/);
  assert.match(view, /name="texto_alternativo"/);
  assert.match(view, /value="Aroma"/);
});

test('keeps the fallback available when an existing image fails to load', () => {
  const view = productImageEditorView({ product: { id: 4, nombre: 'Aroma' }, image: { url: 'https://example.test/aroma.jpg' } });
  assert.match(view, /data-image-placeholder hidden/);
});

test('offers an explicit action to save an existing image alternative text', () => {
  const view = productImageEditorView({ product: { id: 4, nombre: 'Aroma' }, image: { id: 3, url: 'https://example.test/aroma.jpg' } });
  assert.match(view, /data-image-alt-save/);
});

test('offers public product link only after saving a publishable product with a valid id', () => {
  const product = {
    id: 4, activo: true, categorias: { activo: true }, nombre: 'Aroma', descripcion: 'Descripción',
    imagenes_producto: [{ id: 1 }], presentaciones: [validPresentation],
  };
  const view = productSaveConfirmation(product);
  assert.match(view, /Producto guardado correctamente/);
  assert.match(view, /href="\/producto\/4" target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(productSaveConfirmation({ ...product, imagenes_producto: [] }), /Ver producto en la tienda/);
  assert.doesNotMatch(productSaveConfirmation({ ...product, id: 'bad' }), /Ver producto en la tienda/);
});
