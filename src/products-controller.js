import { retryImageCleanup, removeImage, replaceImage, updateImageAlt, uploadImage, validateImage } from './images.js';
import { listCategories } from './categories.js';
import { productImageEditorView } from './product-image-views.mjs';
import { productFormView, productSaveConfirmation, presentationFormView } from './product-views.mjs';
import { listProducts, savePresentation, saveProduct } from './products.js';
import { filterInventory, sortInventory } from './inventory-utils.mjs';
import { inventoryDashboardView } from './inventory-views.mjs';
import { supabase } from './supabase.js';

let state = {
  products: [], categories: [], editor: null, presentation: null, values: {}, error: '', loading: true, saved: false,
  query: '', category: '', status: '', image: null, imageAlt: '', imageBusy: false, imageError: '', cleanupPath: '',
  filters: { query: '', category: '', brand: '', gender: '', classification: '', family: '', status: '', featured: false, availability: '', minPrice: '', maxPrice: '', order: '', page: 1 }, drawerOpen: false, expandedId: null,
};

const formValues = (form) => Object.fromEntries(new FormData(form));
const databaseError = (error) => error?.code === '23514' ? 'Verifica la familia olfativa para perfumes, el precio, la promoción, el stock y la disponibilidad.' : 'No fue posible guardar. Inténtalo de nuevo.';
const currentImage = (product) => product?.imagenes_producto?.find((image) => image.posicion === 0) || null;

export async function renderProductsScreen({ outlet, isCurrentGeneration }) {
  const filterKeys = ['query', 'category', 'brand', 'gender', 'classification', 'family', 'status', 'availability', 'minPrice', 'maxPrice', 'order', 'page'];
  const filtersFromHash = () => {
    const query = window.location.hash.split('?')[1] || '';
    const params = new URLSearchParams(query);
    return filterKeys.reduce((filters, key) => ({ ...filters, [key]: key === 'page' ? Math.max(1, Number(params.get(key)) || 1) : params.get(key) || '' }), { ...state.filters, featured: params.get('featured') === 'true' });
  };
  const syncFiltersToHash = () => {
    const params = new URLSearchParams();
    filterKeys.forEach((key) => { if (state.filters[key] && !(key === 'page' && state.filters[key] === 1)) params.set(key, state.filters[key]); });
    if (state.filters.featured) params.set('featured', 'true');
    const nextHash = `#inventario${params.size ? `?${params}` : ''}`;
    if (window.location.hash !== nextHash) window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}${nextHash}`);
  };
  if (!state.inventoryInitialized) state = { ...state, filters: filtersFromHash(), inventoryInitialized: true };
  const resetPage = (nextFilters) => ({ ...nextFilters, page: 1 });
  const filteredProducts = () => sortInventory(filterInventory(state.products, state.filters), state.filters.order);
  const openProduct = (productId) => {
    const editor = state.products.find((product) => String(product.id) === String(productId));
    if (!editor) return;
    const image = currentImage(editor);
    state = { ...state, editor, values: {}, error: '', image, imageAlt: image?.texto_alternativo || editor.nombre, imageError: '', cleanupPath: '', saved: false };
    draw();
  };
  const draw = () => {
    outlet.innerHTML = state.editor
      ? productFormView({ product: state.editor, categories: state.categories, values: state.values, error: state.error })
        + (state.saved ? productSaveConfirmation(state.editor) : '')
        + productImageEditorView({ product: state.editor, image: state.image, altText: state.imageAlt, busy: state.imageBusy, error: state.imageError, cleanupPath: state.cleanupPath })
        + (state.presentation ? presentationFormView({ presentation: state.presentation, values: state.values, error: state.error }) : '')
      : inventoryDashboardView({ products: { all: state.products, filtered: filteredProducts() }, categories: state.categories, filters: state.filters, expandedId: state.expandedId, loading: state.loading, error: state.error, drawerOpen: state.drawerOpen });
    if (!state.editor) syncFiltersToHash();
    bind();
  };

  async function load() {
    state = { ...state, loading: true };
    draw();
    const [{ data: products, error }, { data: categories }] = await Promise.all([listProducts(supabase), listCategories(supabase)]);
    if (!isCurrentGeneration()) return;
    state = { ...state, products: products || [], categories: categories || [], error: error ? 'No fue posible cargar los productos.' : '', loading: false };
    draw();
  }

  async function saveCurrent(form) {
    const values = { ...formValues(form), destacado: form.elements.destacado.checked, activo: form.elements.activo.checked };
    const category = state.categories.find((item) => String(item.id) === String(values.categoria_id));
    if (category?.nombre.toLowerCase() === 'perfumes / lociones' && !values.familia_olfativa?.trim()) {
      state = { ...state, values, error: 'Ingresa la familia olfativa para Perfumes / Lociones.', saved: false };
      draw();
      return;
    }
    const { data, error } = await saveProduct(supabase, state.editor?.id, values);
    if (error) {
      state = { ...state, values, error: databaseError(error), saved: false };
      draw();
      return;
    }
    const image = currentImage(state.editor);
    state = { ...state, editor: { ...data, categorias: state.categories.find((category) => category.id === data.categoria_id), presentaciones: state.editor?.presentaciones || [], imagenes_producto: state.editor?.imagenes_producto || [] }, values: {}, error: '', image, imageAlt: image?.texto_alternativo || data.nombre, saved: true };
    draw();
  }

  async function saveCurrentPresentation(form) {
    const values = { ...formValues(form), producto_id: state.editor.id, activo: form.elements.activo.checked };
    const { error } = await savePresentation(supabase, state.presentation?.id, values);
    if (error) {
      state = { ...state, values, error: databaseError(error) };
      draw();
      return;
    }
    state = { ...state, presentation: null, values: {}, error: '' };
    await load();
    state.editor = state.products.find((product) => product.id === state.editor.id);
    state.image = currentImage(state.editor);
    draw();
  }

  async function saveImage(file, altText) {
    if (state.imageBusy) return;
    try {
      validateImage(file);
    } catch (error) {
      state = { ...state, imageError: error.message, imageAlt: altText };
      draw();
      return;
    }

    state = { ...state, imageBusy: true, imageError: '', imageAlt: altText, cleanupPath: '' };
    draw();
    try {
      const image = state.image
        ? await replaceImage(supabase, state.image, file, altText)
        : await uploadImage(supabase, state.editor.id, file, altText);
      state = { ...state, image, imageBusy: false, imageError: '', cleanupPath: '', editor: { ...state.editor, imagenes_producto: [image] } };
    } catch (error) {
      state = { ...state, imageBusy: false, imageError: error.message, cleanupPath: error.cleanupPath || '' };
    }
    draw();
  }

  async function deleteImage() {
    if (state.imageBusy || !state.image) return;
    state = { ...state, imageBusy: true, imageError: '', cleanupPath: '' };
    draw();
    try {
      await removeImage(supabase, state.image);
      state = { ...state, image: null, imageBusy: false, imageError: '', editor: { ...state.editor, imagenes_producto: [] } };
    } catch (error) {
      const removedReference = Boolean(error.cleanupPath);
      state = { ...state, image: removedReference ? null : state.image, imageBusy: false, imageError: error.message, cleanupPath: error.cleanupPath || '', editor: { ...state.editor, imagenes_producto: removedReference ? [] : state.editor.imagenes_producto } };
    }
    draw();
  }

  async function saveImageAlt(altText) {
    if (state.imageBusy || !state.image) return;
    state = { ...state, imageBusy: true, imageError: '', imageAlt: altText };
    draw();
    try {
      const image = await updateImageAlt(supabase, state.image, altText);
      state = { ...state, image, imageBusy: false, imageError: '', editor: { ...state.editor, imagenes_producto: [image] } };
    } catch (error) {
      state = { ...state, imageBusy: false, imageError: error.message };
    }
    draw();
  }

  async function cleanUpImage() {
    if (!state.cleanupPath || state.imageBusy) return;
    state = { ...state, imageBusy: true };
    draw();
    try {
      await retryImageCleanup(supabase, state.cleanupPath);
      state = { ...state, imageBusy: false, imageError: '', cleanupPath: '' };
    } catch (error) {
      state = { ...state, imageBusy: false, imageError: error.message, cleanupPath: error.cleanupPath || state.cleanupPath };
    }
    draw();
  }

  function bind() {
    outlet.querySelector('[data-products-retry]')?.addEventListener('click', load);
    outlet.querySelector('[data-product-create]')?.addEventListener('click', () => { state = { ...state, editor: {}, values: {}, error: '', image: null, imageAlt: '', imageError: '', cleanupPath: '', saved: false }; draw(); });
    outlet.querySelectorAll('[data-product-edit]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); openProduct(button.dataset.productEdit); }));
    outlet.querySelector('[data-product-close]')?.addEventListener('click', () => { state = { ...state, editor: null, presentation: null, values: {}, error: '', image: null, imageAlt: '', imageError: '', cleanupPath: '' }; draw(); });
    outlet.querySelector('#product-form')?.addEventListener('submit', (event) => { event.preventDefault(); if (event.currentTarget.checkValidity()) saveCurrent(event.currentTarget); else event.currentTarget.reportValidity(); });
    outlet.querySelector('[data-presentation-create]')?.addEventListener('click', () => { state = { ...state, presentation: {}, values: {}, error: '' }; draw(); });
    outlet.querySelectorAll('[data-presentation-edit]').forEach((button) => button.addEventListener('click', () => { state = { ...state, presentation: state.editor.presentaciones.find((presentation) => String(presentation.id) === button.dataset.presentationEdit), values: {}, error: '' }; draw(); }));
    outlet.querySelector('[data-presentation-cancel]')?.addEventListener('click', () => { state = { ...state, presentation: null, values: {}, error: '' }; draw(); });
    outlet.querySelector('#presentation-form')?.addEventListener('submit', (event) => { event.preventDefault(); if (event.currentTarget.checkValidity()) saveCurrentPresentation(event.currentTarget); else event.currentTarget.reportValidity(); });
    outlet.querySelector('[data-image-upload]')?.addEventListener('click', () => saveImage(outlet.querySelector('#product-image-file').files[0], outlet.querySelector('#product-image-alt').value));
    outlet.querySelector('[data-image-alt-save]')?.addEventListener('click', () => saveImageAlt(outlet.querySelector('#product-image-alt').value));
    outlet.querySelector('[data-image-remove]')?.addEventListener('click', deleteImage);
    outlet.querySelector('[data-image-cleanup]')?.addEventListener('click', cleanUpImage);
    outlet.querySelector('[data-image-preview]')?.addEventListener('error', (event) => { event.currentTarget.hidden = true; outlet.querySelector('[data-image-placeholder]')?.removeAttribute('hidden'); });
    outlet.querySelector('[data-categories-open]')?.addEventListener('click', () => { window.location.hash = '#categorias'; });
    outlet.querySelector('[data-inventory-retry]')?.addEventListener('click', load);
    outlet.querySelector('#inventory-search')?.addEventListener('input', (event) => { state = { ...state, filters: resetPage({ ...state.filters, query: event.target.value }) }; draw(); });
    outlet.querySelector('[data-inventory-drawer-open]')?.addEventListener('click', () => { state = { ...state, drawerOpen: true }; draw(); outlet.querySelector('[data-inventory-drawer-close]')?.focus(); });
    outlet.querySelectorAll('[data-inventory-drawer-close]').forEach((button) => button.addEventListener('click', () => { state = { ...state, drawerOpen: false }; draw(); outlet.querySelector('[data-inventory-drawer-open]')?.focus(); }));
    outlet.querySelector('#inventory-filter-form')?.addEventListener('submit', (event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); state = { ...state, filters: resetPage({ ...state.filters, ...values, featured: event.currentTarget.elements.featured.checked }), drawerOpen: false }; draw(); outlet.querySelector('[data-inventory-drawer-open]')?.focus(); });
    outlet.querySelector('#inventory-filter-form')?.addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.preventDefault(); state = { ...state, drawerOpen: false }; draw(); outlet.querySelector('[data-inventory-drawer-open]')?.focus(); } if (event.key === 'Tab') { const focusable = [...event.currentTarget.querySelectorAll('button, input, select')].filter((element) => !element.disabled); const first = focusable[0]; const last = focusable.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } } });
    outlet.querySelectorAll('[data-inventory-availability]').forEach((button) => button.addEventListener('click', () => { const availability = state.filters.availability === button.dataset.inventoryAvailability ? '' : button.dataset.inventoryAvailability; state = { ...state, filters: resetPage({ ...state.filters, availability }) }; draw(); }));
    outlet.querySelectorAll('[data-inventory-status]').forEach((button) => button.addEventListener('click', () => { const status = state.filters.status === button.dataset.inventoryStatus ? '' : button.dataset.inventoryStatus; state = { ...state, filters: resetPage({ ...state.filters, status }) }; draw(); }));
    outlet.querySelector('[data-inventory-featured]')?.addEventListener('click', () => { state = { ...state, filters: resetPage({ ...state.filters, featured: !state.filters.featured }) }; draw(); });
    outlet.querySelectorAll('[data-inventory-filter-clear]').forEach((button) => button.addEventListener('click', () => { state = { ...state, filters: { query: '', category: '', brand: '', gender: '', classification: '', family: '', status: '', featured: false, availability: '', minPrice: '', maxPrice: '', order: '', page: 1 }, drawerOpen: false }; draw(); }));
    outlet.querySelectorAll('[data-inventory-page]').forEach((button) => button.addEventListener('click', () => { state = { ...state, filters: { ...state.filters, page: Number(button.dataset.inventoryPage) } }; draw(); }));
    outlet.querySelectorAll('[data-inventory-sort]').forEach((button) => button.addEventListener('click', () => { const field = button.dataset.inventorySort; const order = state.filters.order === `${field}-asc` ? `${field}-desc` : `${field}-asc`; state = { ...state, filters: resetPage({ ...state.filters, order }) }; draw(); }));
    outlet.querySelectorAll('[data-product-open]').forEach((row) => {
      row.addEventListener('dblclick', (event) => { if (!event.target.closest('button, a, input, select')) openProduct(row.dataset.productOpen); });
      row.addEventListener('click', (event) => { if (!event.target.closest('button, a, input, select') && window.matchMedia('(max-width: 63.9375rem)').matches) openProduct(row.dataset.productOpen); });
      row.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProduct(row.dataset.productOpen); } });
    });
  }

  await load();
}
