import { retryImageCleanup, removeImage, replaceImage, updateImageAlt, uploadImage, validateImage } from './images.js';
import { createCategory, deleteCategory, listCategories, updateCategory } from './categories.js';
import { categoryDrawerView } from './category-views.mjs';
import { productImageEditorView } from './product-image-views.mjs';
import { presentationFormView, presentationRowView, productFormView } from './product-views.mjs';
import { listProducts, savePresentation, saveProduct } from './products.js';
import { filterInventory, sortInventory } from './inventory-utils.mjs';
import { inventoryDashboardView } from './inventory-views.mjs';
import { supabase } from './supabase.js';

const emptyFilters = { query: '', category: '', brand: '', gender: '', classification: '', family: '', status: '', featured: false, availability: '', minPrice: '', maxPrice: '', order: '', page: 1 };
let state = { products: [], categories: [], loading: true, loadError: '', filters: { ...emptyFilters }, filtersPanelOpen: false, categoriesPanelOpen: false, editor: null, productValues: {}, productError: '', productBusy: false, productDirty: false, saved: false, productNotice: '', presentation: null, presentationValues: {}, presentationError: '', presentationBusy: false, presentationDirty: false, image: null, imageAlt: '', imageAltDirty: false, imageBusy: false, imageError: '', cleanupPath: '', categoryDrawer: { mode: 'list', selected: null, query: '', values: {}, error: '', message: '', busy: false, confirmDelete: false, dirty: false } };

const formValues = (form) => Object.fromEntries(new FormData(form));
const databaseError = (error) => error?.code === '23514' ? 'Verifica la familia olfativa para perfumes, el precio, la promoción, el stock y la disponibilidad.' : error?.code === '23505' ? 'Ya existe un registro con ese nombre.' : 'No fue posible guardar. Inténtalo de nuevo.';
const currentImage = (product) => product?.imagenes_producto?.find((image) => image.posicion === 0) || null;
const hasUnsavedChanges = () => state.productDirty || state.presentationDirty;

export async function renderProductsScreen({ outlet, isCurrentGeneration }) {
  const filterKeys = ['query', 'category', 'brand', 'gender', 'classification', 'family', 'status', 'availability', 'minPrice', 'maxPrice', 'order', 'page'];
  const resetPage = (filters) => ({ ...filters, page: 1 });
  const filteredProducts = () => sortInventory(filterInventory(state.products, state.filters), state.filters.order);
  const setEditor = (product) => {
    const image = currentImage(product);
    state = { ...state, editor: product, productValues: {}, productError: '', productBusy: false, productDirty: false, saved: false, presentation: null, presentationValues: {}, presentationError: '', presentationDirty: false, image, imageAlt: image?.texto_alternativo || product?.nombre || '', imageError: '', cleanupPath: '' };
  };
  const categoriesPanel = () => state.categoriesPanelOpen ? categoryDrawerView({ categories: state.categories, ...state.categoryDrawer }) : '';
  const productManagement = () => {
    if (!state.editor) return '';
    const list = state.editor.presentaciones?.length ? `<ul class="presentation-list">${state.editor.presentaciones.map(presentationRowView).join('')}</ul>` : '<p class="empty-state">Aún no hay presentaciones. Agrega la primera para registrar precio, stock y disponibilidad.</p>';
    return `<div class="product-management-grid">${productImageEditorView({ product: state.editor, image: state.image, altText: state.imageAlt, altChanged: state.imageAltDirty, busy: state.imageBusy, error: state.imageError, cleanupPath: state.cleanupPath })}<section class="presentations-section"><header><div><h3>Presentaciones</h3><p>Precio, stock y disponibilidad se administran por presentación.</p></div><button class="secondary-button" type="button" data-presentation-create>Agregar presentación</button></header>${list}${state.presentation ? presentationFormView({ presentation: state.presentation, values: state.presentationValues, error: state.presentationError, saving: state.presentationBusy }) : ''}</section></div>`;
  };
  const draw = () => {
    outlet.innerHTML = state.editor
      ? `${state.productNotice ? `<p class="admin-toast" role="status">${state.productNotice}</p>` : ''}${productFormView({ product: state.editor, categories: state.categories, values: state.productValues, error: state.productError, saving: state.productBusy, dirty: state.productDirty })}${productManagement()}`
      : `${inventoryDashboardView({ products: { all: state.products, filtered: filteredProducts() }, categories: state.categories, filters: state.filters, loading: state.loading, error: state.loadError, drawerOpen: state.filtersPanelOpen })}${categoriesPanel()}`;
    bind();
  };
  const closeEditor = () => { if (hasUnsavedChanges() && !window.confirm('Hay cambios sin guardar. ¿Quieres salir de todas formas?')) return; state = { ...state, editor: null, presentation: null, productDirty: false, presentationDirty: false, productError: '', presentationError: '' }; draw(); };
  const closeCategoryDrawer = () => {
    const drawer = state.categoryDrawer;
    if (drawer.dirty && !window.confirm('Hay cambios sin guardar en la categoría. ¿Quieres cerrar?')) return;
    state = { ...state, categoriesPanelOpen: false, categoryDrawer: { mode: 'list', selected: null, query: '', values: {}, error: '', message: '', busy: false, confirmDelete: false, dirty: false } };
    draw();
    outlet.querySelector('[data-categories-open]')?.focus();
  };
  async function load() {
    state = { ...state, loading: true, loadError: '' }; draw();
    const [{ data: products, error: productsError }, { data: categories, error: categoriesError }] = await Promise.all([listProducts(supabase), listCategories(supabase)]);
    if (!isCurrentGeneration()) return;
    state = { ...state, products: products || [], categories: categories || [], loading: false, loadError: productsError || categoriesError ? 'No fue posible cargar el inventario completo. Inténtalo de nuevo.' : '' };
    draw();
  }
  async function saveCurrent(form) {
    if (state.productBusy) return;
    const values = { ...formValues(form), destacado: form.elements.destacado.checked, activo: form.elements.activo.checked };
    const category = state.categories.find((item) => String(item.id) === String(values.categoria_id));
    if (category?.nombre.toLocaleLowerCase('es') === 'perfumes / lociones' && !values.familia_olfativa?.trim()) { state = { ...state, productValues: values, productError: 'Ingresa la familia olfativa para Perfumes / Lociones.' }; draw(); return; }
    state = { ...state, productBusy: true, productValues: values, productError: '' }; draw();
    const { data, error } = await saveProduct(supabase, state.editor?.id, values);
    if (error) { state = { ...state, productBusy: false, productValues: values, productError: databaseError(error) }; draw(); return; }
    const existing = state.editor || {};
    const product = { ...existing, ...data, categorias: state.categories.find((item) => String(item.id) === String(data.categoria_id)), presentaciones: existing.presentaciones || [], imagenes_producto: existing.imagenes_producto || [] };
    state = { ...state, editor: product, productValues: {}, productBusy: false, productDirty: false, productError: '', saved: true, productNotice: 'Producto guardado correctamente.', image: currentImage(product), imageAlt: currentImage(product)?.texto_alternativo || product.nombre, imageAltDirty: false };
    state.products = state.products.some((item) => item.id === product.id) ? state.products.map((item) => item.id === product.id ? product : item) : [product, ...state.products];
    draw();
    window.setTimeout(() => { if (state.productNotice) { state = { ...state, productNotice: '' }; draw(); } }, 4000);
  }
  async function saveCurrentPresentation(form) {
    if (state.presentationBusy || !state.editor?.id) return;
    const values = { ...formValues(form), producto_id: state.editor.id, activo: form.elements.activo.checked };
    state = { ...state, presentationBusy: true, presentationValues: values, presentationError: '' }; draw();
    const { data, error } = await savePresentation(supabase, state.presentation?.id, values);
    if (error) { state = { ...state, presentationBusy: false, presentationValues: values, presentationError: databaseError(error) }; draw(); return; }
    const presentations = state.presentation?.id ? state.editor.presentaciones.map((item) => item.id === data.id ? data : item) : [...(state.editor.presentaciones || []), data];
    const editor = { ...state.editor, presentaciones: presentations };
    state = { ...state, editor, products: state.products.map((item) => item.id === editor.id ? editor : item), presentation: null, presentationValues: {}, presentationError: '', presentationBusy: false, presentationDirty: false };
    draw();
  }
  async function saveImage(file, altText) {
    if (state.imageBusy || !state.editor?.id) return;
    try { validateImage(file); } catch (error) { state = { ...state, imageError: error.message, imageAlt: altText }; draw(); return; }
    state = { ...state, imageBusy: true, imageError: '', imageAlt: altText, cleanupPath: '' }; draw();
    try { const image = state.image ? await replaceImage(supabase, state.image, file, altText) : await uploadImage(supabase, state.editor.id, file, altText); const images = [...(state.editor.imagenes_producto || []).filter((item) => item.id !== state.image?.id), image]; state = { ...state, image, imageAltDirty: false, imageBusy: false, editor: { ...state.editor, imagenes_producto: images } }; } catch (error) { state = { ...state, imageBusy: false, imageError: error.message, cleanupPath: error.cleanupPath || '' }; }
    draw();
  }
  async function removeCurrentImage() { if (!state.image || state.imageBusy) return; state = { ...state, imageBusy: true, imageError: '' }; draw(); try { await removeImage(supabase, state.image); state = { ...state, image: null, imageBusy: false, editor: { ...state.editor, imagenes_producto: state.editor.imagenes_producto.filter((item) => item.id !== state.image.id) } }; } catch (error) { state = { ...state, imageBusy: false, imageError: error.message, cleanupPath: error.cleanupPath || '' }; } draw(); }
  async function updateCurrentImageAlt(altText) { if (!state.image || state.imageBusy) return; state = { ...state, imageBusy: true, imageError: '' }; draw(); try { const image = await updateImageAlt(supabase, state.image, altText); state = { ...state, image, imageAlt: altText, imageAltDirty: false, imageBusy: false, editor: { ...state.editor, imagenes_producto: state.editor.imagenes_producto.map((item) => item.id === image.id ? image : item) } }; } catch (error) { state = { ...state, imageBusy: false, imageError: error.message }; } draw(); }
  async function saveCategory(form) { if (state.categoryDrawer.busy) return; const nombre = new FormData(form).get('nombre'); const activo = form.elements.activo.checked; const drawer = { ...state.categoryDrawer, busy: true, values: { nombre, activo }, error: '' }; state = { ...state, categoryDrawer: drawer }; draw(); const operation = drawer.selected ? updateCategory(supabase, drawer.selected.id, { nombre, activo }) : createCategory(supabase, nombre); const { data, error } = await operation; if (error) { state = { ...state, categoryDrawer: { ...drawer, busy: false, error: databaseError(error) } }; draw(); return; } const categories = drawer.selected ? state.categories.map((item) => item.id === data.id ? data : item) : [...state.categories, data].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')); state = { ...state, categories, categoryDrawer: { mode: 'list', selected: null, query: '', values: {}, error: '', message: 'Categoría guardada correctamente.', busy: false, confirmDelete: false, dirty: false } }; draw(); }
  async function deleteCurrentCategory() { const category = state.categoryDrawer.selected; if (!category || state.categoryDrawer.busy) return; if (state.products.some((product) => String(product.categoria_id) === String(category.id))) { state = { ...state, categoryDrawer: { ...state.categoryDrawer, confirmDelete: false, error: 'No se puede eliminar esta categoría porque tiene productos relacionados. Reasígnalos primero o desactiva la categoría.' } }; draw(); return; } state = { ...state, categoryDrawer: { ...state.categoryDrawer, busy: true, error: '' } }; draw(); const { error } = await deleteCategory(supabase, category.id); if (error) { state = { ...state, categoryDrawer: { ...state.categoryDrawer, busy: false, confirmDelete: false, error: 'No fue posible eliminar la categoría. Verifica que no tenga productos relacionados.' } }; draw(); return; } state = { ...state, categories: state.categories.filter((item) => item.id !== category.id), categoryDrawer: { mode: 'list', selected: null, query: '', values: {}, error: '', message: 'Categoría eliminada correctamente.', busy: false, confirmDelete: false, dirty: false } }; draw(); }
  function trapFocus(event, dialog) { if (event.key !== 'Tab') return; const nodes = [...dialog.querySelectorAll('button, input, select, textarea, [href]')].filter((node) => !node.disabled); const first = nodes[0]; const last = nodes.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } }
  function bind() {
    outlet.querySelector('[data-products-retry], [data-inventory-retry]')?.addEventListener('click', load);
    outlet.querySelector('[data-product-create]')?.addEventListener('click', () => { setEditor({ activo: true, destacado: false, presentaciones: [], imagenes_producto: [] }); draw(); outlet.querySelector('#product-name')?.focus(); });
    outlet.querySelectorAll('[data-product-edit]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); const product = state.products.find((item) => String(item.id) === button.dataset.productEdit); if (product) { setEditor(product); draw(); } }));
    outlet.querySelectorAll('[data-product-open]').forEach((row) => { row.addEventListener('dblclick', (event) => { if (!event.target.closest('button, a, input, select')) { const product = state.products.find((item) => String(item.id) === row.dataset.productOpen); if (product) { setEditor(product); draw(); } } }); row.addEventListener('click', (event) => { if (!event.target.closest('button, a, input, select') && window.matchMedia('(max-width: 63.9375rem)').matches) { const product = state.products.find((item) => String(item.id) === row.dataset.productOpen); if (product) { setEditor(product); draw(); } } }); row.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); const product = state.products.find((item) => String(item.id) === row.dataset.productOpen); if (product) { setEditor(product); draw(); } } }); });
    outlet.querySelectorAll('[data-product-close]').forEach((button) => button.addEventListener('click', closeEditor));
    outlet.querySelector('#product-form')?.addEventListener('input', () => { state.productDirty = true; });
    outlet.querySelector('#product-form')?.addEventListener('change', () => { state.productDirty = true; });
    outlet.querySelector('#product-form')?.addEventListener('submit', (event) => { event.preventDefault(); event.currentTarget.checkValidity() ? saveCurrent(event.currentTarget) : event.currentTarget.reportValidity(); });
    outlet.querySelector('[data-presentation-create]')?.addEventListener('click', () => { state = { ...state, presentation: { activo: true, modo_disponibilidad: 'venta_inmediata', stock: 0 }, presentationValues: {}, presentationError: '', presentationDirty: false }; draw(); outlet.querySelector('#presentation-label')?.focus(); });
    outlet.querySelectorAll('[data-presentation-edit]').forEach((button) => button.addEventListener('click', () => { state = { ...state, presentation: state.editor.presentaciones.find((item) => String(item.id) === button.dataset.presentationEdit), presentationValues: {}, presentationError: '', presentationDirty: false }; draw(); outlet.querySelector('#presentation-label')?.focus(); }));
    outlet.querySelector('[data-presentation-cancel]')?.addEventListener('click', () => { if (state.presentationDirty && !window.confirm('Hay cambios sin guardar en la presentación. ¿Quieres cancelar?')) return; state = { ...state, presentation: null, presentationValues: {}, presentationError: '', presentationDirty: false }; draw(); });
    outlet.querySelector('#presentation-form')?.addEventListener('input', () => { state.presentationDirty = true; }); outlet.querySelector('#presentation-form')?.addEventListener('change', () => { state.presentationDirty = true; }); outlet.querySelector('#presentation-form')?.addEventListener('submit', (event) => { event.preventDefault(); event.currentTarget.checkValidity() ? saveCurrentPresentation(event.currentTarget) : event.currentTarget.reportValidity(); });
    outlet.querySelector('[data-image-upload]')?.addEventListener('click', () => saveImage(outlet.querySelector('#product-image-file')?.files[0], outlet.querySelector('#product-image-alt')?.value));
    outlet.querySelector('#product-image-alt')?.addEventListener('input', (event) => { state = { ...state, imageAlt: event.target.value, imageAltDirty: event.target.value !== (state.image?.texto_alternativo || state.editor.nombre || '') }; });
    outlet.querySelector('[data-image-alt-save]')?.addEventListener('click', () => updateCurrentImageAlt(outlet.querySelector('#product-image-alt').value)); outlet.querySelector('[data-image-remove]')?.addEventListener('click', removeCurrentImage); outlet.querySelector('[data-image-preview]')?.addEventListener('error', (event) => { event.currentTarget.hidden = true; outlet.querySelector('[data-image-placeholder]')?.removeAttribute('hidden'); }); outlet.querySelector('[data-image-cleanup]')?.addEventListener('click', async () => { try { await retryImageCleanup(supabase, state.cleanupPath); state = { ...state, cleanupPath: '', imageError: '' }; } catch (error) { state = { ...state, imageError: error.message }; } draw(); });
    outlet.querySelector('[data-categories-open]')?.addEventListener('click', () => { state = { ...state, categoriesPanelOpen: true, filtersPanelOpen: false, categoryDrawer: { mode: 'list', selected: null, query: '', values: {}, error: '', message: '', busy: false, confirmDelete: false, dirty: false } }; draw(); outlet.querySelector('#category-search')?.focus(); });
    outlet.querySelectorAll('[data-category-drawer-close]').forEach((button) => button.addEventListener('click', closeCategoryDrawer)); outlet.querySelector('[data-category-drawer-create]')?.addEventListener('click', () => { state.categoryDrawer = { ...state.categoryDrawer, mode: 'create', selected: null, values: { activo: true }, error: '', dirty: false }; draw(); outlet.querySelector('#drawer-category-name')?.focus(); }); outlet.querySelectorAll('[data-category-drawer-edit]').forEach((button) => button.addEventListener('click', () => { const selected = state.categories.find((item) => String(item.id) === button.dataset.categoryDrawerEdit); state.categoryDrawer = { ...state.categoryDrawer, mode: 'edit', selected, values: {}, error: '', dirty: false }; draw(); outlet.querySelector('#drawer-category-name')?.focus(); }));
    outlet.querySelector('#category-search')?.addEventListener('input', (event) => { state.categoryDrawer.query = event.target.value; draw(); outlet.querySelector('#category-search')?.focus(); }); outlet.querySelector('#category-drawer-form')?.addEventListener('input', () => { state.categoryDrawer.dirty = true; }); outlet.querySelector('#category-drawer-form')?.addEventListener('change', () => { state.categoryDrawer.dirty = true; }); outlet.querySelector('#category-drawer-form')?.addEventListener('submit', (event) => { event.preventDefault(); event.currentTarget.checkValidity() ? saveCategory(event.currentTarget) : event.currentTarget.reportValidity(); }); outlet.querySelectorAll('[data-category-drawer-back]').forEach((button) => button.addEventListener('click', () => { if (state.categoryDrawer.dirty && !window.confirm('Hay cambios sin guardar. ¿Quieres volver?')) return; state.categoryDrawer = { ...state.categoryDrawer, mode: 'list', selected: null, values: {}, error: '', dirty: false, confirmDelete: false }; draw(); outlet.querySelector('#category-search')?.focus(); })); outlet.querySelector('[data-category-delete]')?.addEventListener('click', () => { state.categoryDrawer.confirmDelete = true; draw(); outlet.querySelector('[data-category-delete-cancel]')?.focus(); }); outlet.querySelector('[data-category-delete-cancel]')?.addEventListener('click', () => { state.categoryDrawer.confirmDelete = false; draw(); }); outlet.querySelector('[data-category-delete-confirm]')?.addEventListener('click', deleteCurrentCategory);
    const drawer = outlet.querySelector('.category-drawer'); if (drawer) drawer.addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.preventDefault(); closeCategoryDrawer(); } else trapFocus(event, drawer); });
    outlet.querySelector('#inventory-search')?.addEventListener('input', (event) => {
      state.filters = resetPage({ ...state.filters, query: event.target.value }); draw();
      const input = outlet.querySelector('#inventory-search'); input?.focus(); input?.setSelectionRange(state.filters.query.length, state.filters.query.length);
    });
    outlet.querySelector('[data-inventory-drawer-open]')?.addEventListener('click', () => { state.filtersPanelOpen = true; state.categoriesPanelOpen = false; draw(); outlet.querySelector('[data-inventory-drawer-close]')?.focus(); });
    outlet.querySelectorAll('[data-inventory-drawer-close]').forEach((button) => button.addEventListener('click', () => { state.filtersPanelOpen = false; draw(); outlet.querySelector('[data-inventory-drawer-open]')?.focus(); }));
    outlet.querySelector('#inventory-filter-form')?.addEventListener('submit', (event) => { event.preventDefault(); state.filters = resetPage({ ...state.filters, ...Object.fromEntries(new FormData(event.currentTarget)), featured: event.currentTarget.elements.featured.checked }); state.filtersPanelOpen = false; draw(); });
    outlet.querySelectorAll('[data-inventory-availability]').forEach((button) => button.addEventListener('click', () => { state.filters = resetPage({ ...state.filters, availability: state.filters.availability === button.dataset.inventoryAvailability ? '' : button.dataset.inventoryAvailability }); draw(); }));
    outlet.querySelectorAll('[data-inventory-status]').forEach((button) => button.addEventListener('click', () => { state.filters = resetPage({ ...state.filters, status: state.filters.status === button.dataset.inventoryStatus ? '' : button.dataset.inventoryStatus }); draw(); }));
    outlet.querySelector('[data-inventory-featured]')?.addEventListener('click', () => { state.filters = resetPage({ ...state.filters, featured: !state.filters.featured }); draw(); });
    outlet.querySelectorAll('[data-inventory-filter-clear]').forEach((button) => button.addEventListener('click', () => { state.filters = { ...emptyFilters }; state.filtersPanelOpen = false; draw(); }));
    outlet.querySelectorAll('[data-inventory-page]').forEach((button) => button.addEventListener('click', () => { state.filters.page = Number(button.dataset.inventoryPage); draw(); }));
    outlet.querySelectorAll('[data-inventory-sort]').forEach((button) => button.addEventListener('click', () => { const field = button.dataset.inventorySort; state.filters = resetPage({ ...state.filters, order: state.filters.order === `${field}-asc` ? `${field}-desc` : `${field}-asc` }); draw(); }));
  }
  const beforeUnload = (event) => { if (!hasUnsavedChanges()) return; event.preventDefault(); event.returnValue = ''; };
  window.addEventListener('beforeunload', beforeUnload);
  await load();
}
