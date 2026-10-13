import test from 'node:test';
import assert from 'node:assert/strict';
import { presentationFormView, presentationRowView, productFormView, productSaveConfirmation, presentationStatus, publicationSummary } from '../src/product-views.mjs';
import { productImageEditorView } from '../src/product-image-views.mjs';

const validPresentation = {
  activo: true,
  etiqueta: 'Automática',
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

test('keeps product and presentation actions separated and exposes required fields', () => {
  const product = { categoria_id: 1, activo: true, destacado: false, presentaciones: [], imagenes_producto: [] };
  const view = productFormView({ product, categories: [{ id: 1, nombre: 'Vehículos', activo: true }] });
  assert.match(view, /Nuevo vehículo/);
  assert.match(view, /Modelo \/ Especificación/);
  assert.match(view, /aria-required="true"/);
  assert.match(view, /<span>Volver al inventario<\/span>/);
  assert.match(view, /Guardar vehículo/);
  const presentation = presentationFormView({ presentation: {} });
  assert.match(presentation, /Guardar versión/);
  assert.match(presentation, /Cancelar edición/);
});

test('shows saving feedback while product and presentation forms are busy', () => {
  const product = productFormView({ product: { activo: true, destacado: false, presentaciones: [], imagenes_producto: [] }, saving: true });
  const presentation = presentationFormView({ presentation: {}, saving: true });

  assert.match(product, /Guardando\.\.\./);
  assert.match(presentation, /Guardando\.\.\./);
  assert.match(presentation, /disabled/);
});

test('shows agotado from immediate-sale stock zero', () => {
  assert.match(presentationRowView({ ...validPresentation, stock: 0 }), /Agotado/);
});

test('shows vendido as a presentation mode and hides a sold vehicle from the catalog', () => {
  const sold = { ...validPresentation, modo_disponibilidad: 'vendido', stock: 0 };
  assert.equal(presentationStatus(sold), 'Vendido');
  assert.match(presentationRowView(sold), /Vendido/);
  assert.doesNotMatch(presentationRowView(sold), /· Vendido/);
  assert.match(presentationFormView({ presentation: { ...validPresentation, modo_disponibilidad: 'vendido' } }), /value="vendido" checked/);
  const product = {
    id: 5, activo: true, categorias: { activo: true }, nombre: 'Hilux', descripcion: 'Vendida',
    imagenes_producto: [{ id: 1 }], presentaciones: [sold],
  };
  assert.match(publicationSummary(product), /No publicable/);
  assert.match(publicationSummary(product), /Vehículo vendido/);
  assert.doesNotMatch(productSaveConfirmation(product), /Ver producto en la tienda/);
});

test('keeps a promotional price after a database constraint error', () => {
  const view = presentationFormView({
    values: { precio_promocional: '50000' },
    error: 'La promocion debe ser menor al precio normal.',
  });
  assert.match(view, /value="50000"/);
  assert.match(view, /La promocion debe ser menor al precio normal/);
});

test('uses the empty gallery area as an accessible multiple file selector', () => {
  const view = productImageEditorView({ product: { id: 4, nombre: 'Hilux' }, images: [] });
  assert.match(view, /data-image-select/);
  assert.match(view, /Agregar fotografías/);
  assert.match(view, /JPG, PNG o WebP/);
  assert.match(view, /id="product-image-file" class="visually-hidden" type="file"[^>]*multiple/);
  assert.doesNotMatch(view, /Imagen no disponible/);
  assert.doesNotMatch(view, /data-image-upload/);
  assert.doesNotMatch(view, /name="texto_alternativo"/);
});

test('groups gallery actions and summarizes alternative text for the selected image', () => {
  const image = { id: 3, posicion: 0, url: 'https://example.test/hilux.jpg' };
  const view = productImageEditorView({ product: { id: 4, nombre: 'Hilux' }, images: [image], image });
  assert.match(view, /image-editor__image-actions/);
  assert.match(view, /Portada del catálogo/);
  assert.match(view, /Eliminar/);
  assert.match(view, /Texto alternativo/);
  assert.match(view, /Se usa para describir la imagen/);
  assert.match(view, /data-image-alt-edit/);
  assert.doesNotMatch(view, /<details/);
});

test('renders compact inline controls while editing alternative text', () => {
  const image = { id: 3, posicion: 0, url: 'https://example.test/hilux.jpg' };
  const view = productImageEditorView({ product: { id: 4, nombre: 'Hilux' }, images: [image], image, altEditing: true });
  assert.match(view, /name="texto_alternativo"/);
  assert.match(view, /Si lo dejas vacío, se utilizará «Hilux»/);
  assert.match(view, /data-image-alt-cancel/);
  assert.match(view, /data-image-alt-save/);
  assert.match(view, />Guardar</);
});

test('keeps the fallback available when an existing image fails to load', () => {
  const image = { id: 3, posicion: 0, url: 'https://example.test/hilux.jpg' };
  const view = productImageEditorView({ product: { id: 4, nombre: 'Hilux' }, images: [image], image });
  assert.match(view, /data-image-placeholder hidden/);
  assert.match(view, /data-image-select/);
});

test('disables saving an unchanged alternative text', () => {
  const image = { id: 3, posicion: 0, url: 'https://example.test/hilux.jpg' };
  const view = productImageEditorView({ product: { id: 4, nombre: 'Hilux' }, images: [image], image, altEditing: true });
  assert.match(view, /data-image-alt-save/);
  assert.match(view, /data-image-alt-save disabled/);
});

test('renders ordered thumbnails, cover action and the fourteen image limit', () => {
  const images = [
    { id: 2, posicion: 1, url: 'https://example.test/2.jpg' },
    { id: 1, posicion: 0, url: 'https://example.test/1.jpg' },
  ];
  const view = productImageEditorView({ product: { id: 4, nombre: 'Hilux' }, images, image: images[0] });
  assert.match(view, /2 de 14 archivos/);
  assert.match(view, /Usar como portada/);
  assert.doesNotMatch(view, /Agregar imágenes/);
  assert.doesNotMatch(view, /data-image-move/);
  assert.doesNotMatch(view, /Anterior|Siguiente/);
  assert.ok(view.indexOf('data-image-select-id="1"') < view.indexOf('data-image-select-id="2"'));
});

test('offers public product link only for a visible product with a valid id', () => {
  const product = {
    id: 4, activo: true, categorias: { activo: true }, nombre: 'Hilux', descripcion: 'Descripción',
    imagenes_producto: [{ id: 1 }], presentaciones: [validPresentation],
  };
  const view = productSaveConfirmation(product);
  assert.match(view, /href="\/producto\/4" target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(productSaveConfirmation({ ...product, imagenes_producto: [] }), /Ver producto en la tienda/);
  assert.doesNotMatch(productSaveConfirmation({ ...product, id: 'bad' }), /Ver producto en la tienda/);
});

test('accepts videos in the gallery and never uses one as the catalog cover', () => {
  const video = { id: 5, posicion: 0, tipo: 'video', url: 'https://example.test/hilux.mp4' };
  const image = { id: 6, posicion: 1, tipo: 'imagen', url: 'https://example.test/hilux.jpg' };
  const view = productImageEditorView({ product: { id: 4, nombre: 'Hilux' }, images: [video, image], image: video });
  assert.match(view, /accept="image\/jpeg,image\/png,image\/webp,video\/mp4,video\/webm,video\/quicktime"/);
  assert.match(view, /data-image-preview[^>]*controls/);
  assert.match(view, /Video 1 de 2/);
  assert.match(view, /data-image-select-id="5"[^>]*>.*Video/);
  assert.match(view, /data-image-select-id="6"[^>]*>.*Portada/);
  assert.doesNotMatch(view, /Usar como portada/);
  const imageSelected = productImageEditorView({ product: { id: 4, nombre: 'Hilux' }, images: [video, image], image });
  assert.match(imageSelected, /Portada del catálogo/);
  assert.doesNotMatch(imageSelected, /Usar como portada/);
});

test('requires a photo, not only videos, to publish a vehicle', () => {
  const summary = publicationSummary({
    activo: true,
    categorias: { activo: true },
    nombre: 'Hilux',
    descripcion: 'Camioneta',
    imagenes_producto: [{ id: 1, tipo: 'video' }],
    presentaciones: [validPresentation],
  });
  assert.match(summary, /No publicable/);
  assert.match(summary, /Imagen pendiente/);
});
