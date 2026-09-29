import test from 'node:test';
import assert from 'node:assert/strict';
import {
  categoriesView,
  categoryFormView,
  deactivationDialogView,
  categoryDrawerView,
} from '../src/category-views.mjs';

test('renders category name, textual status, and available action', () => {
  const view = categoriesView([{ id: 1, nombre: 'Splash', activo: true }]);

  assert.match(view, /Splash/);
  assert.match(view, /Activa/);
  assert.match(view, /Desactivar/);
  assert.match(view, /data-category-edit="1"/);
});

test('renders an accessible searchable category drawer with textual states', () => {
  const view = categoryDrawerView({ categories: [{ id: 1, nombre: 'Splash', activo: true }, { id: 2, nombre: 'Cremas', activo: false }], query: 'spl' });
  assert.match(view, /role="dialog"/);
  assert.match(view, /aria-modal="true"/);
  assert.match(view, /Buscar categoría/);
  assert.match(view, /Splash/);
  assert.match(view, /Activa/);
  assert.doesNotMatch(view, /Cremas/);
  assert.match(view, /data-category-drawer-close/);
});

test('renders category edit controls, state and destructive confirmation', () => {
  const view = categoryDrawerView({ mode: 'edit', selected: { id: 2, nombre: 'Cremas', activo: false }, confirmDelete: true });
  assert.match(view, /Volver a todas las categorías/);
  assert.match(view, /name="activo"/);
  assert.match(view, /Eliminar categoría/);
  assert.match(view, /¿Eliminar categoría/);
});

test('renders activation for an inactive category', () => {
  const view = categoriesView([{ id: 2, nombre: 'Cremas', activo: false }]);

  assert.match(view, /Inactiva/);
  assert.match(view, /data-category-activate="2"/);
});

test('marks category details and action variants for responsive styling', () => {
  const activeView = categoriesView([{ id: 1, nombre: 'Splash', activo: true }]);
  const inactiveView = categoriesView([{ id: 2, nombre: 'Cremas', activo: false }]);

  assert.match(activeView, /class="category-details"/);
  assert.match(activeView, /class="table-action table-action--edit"/);
  assert.match(activeView, /class="table-action table-action--deactivate"/);
  assert.match(inactiveView, /class="table-action table-action--activate"/);
});

test('renders a labeled required category form and preserves its value', () => {
  const view = categoryFormView({ nombre: 'Cremas', error: 'Ese nombre ya existe.' });

  assert.match(view, /<label for="category-name">Nombre de la categoría<\/label>/);
  assert.match(view, /id="category-name"[^>]*required/);
  assert.match(view, /value="Cremas"/);
  assert.match(view, /role="alert">Ese nombre ya existe/);
});

test('renders a deactivation warning and confirmation controls', () => {
  const view = deactivationDialogView({ id: 1, nombre: 'Splash' });

  assert.match(view, /sus productos se ocultarán del catálogo público/);
  assert.match(view, /data-category-confirm-deactivate="1"/);
  assert.match(view, /data-category-cancel-dialog/);
});

test('marks a pending deactivation as busy and disables confirmation', () => {
  const view = deactivationDialogView({ id: 1, nombre: 'Splash' }, { busy: true });

  assert.match(view, /aria-busy="true"/);
  assert.match(view, /data-category-confirm-deactivate="1"[^>]*disabled/);
});

test('renders loading, empty, and retry states', () => {
  assert.match(categoriesView([], { loading: true }), /aria-busy="true"/);
  assert.match(categoriesView([], { error: 'Sin conexion.' }), /data-category-retry/);
  assert.match(categoriesView([]), /Aún no hay categorías/);
});

test('escapes category names before rendering them', () => {
  const view = categoriesView([{ id: 1, nombre: '<script>alert(1)</script>', activo: true }]);

  assert.doesNotMatch(view, /<script>/);
  assert.match(view, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});
