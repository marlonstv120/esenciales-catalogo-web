import { retryImageCleanup, removeImage, replaceImage, updateImageAlt, uploadImage, validateImage } from './images.js';
import { createCategory, deleteCategory, listCategories, updateCategory } from './categories.js';
import { categoryDrawerView } from './category-views.mjs';
import { productImageEditorView } from './product-image-views.mjs';
import { presentationFormView, presentationRowView, productFormView } from './product-views.mjs';
import { formatPresentationLabel, listProducts, savePresentation, saveProduct, splitPresentationLabel } from './products.js';
import { filterInventory, sortInventory } from './inventory-utils.mjs';
import { inventoryDashboardView } from './inventory-views.mjs';
import { supabase } from './supabase.js';
import { copDigits, formatCopInput, formatCopInputElement } from './cop-input.mjs';
import { createDraftSaver, readDraft } from './form-drafts.mjs';
import { showNotification } from './notifications.mjs';

const emptyFilters = { query: '', category: '', brand: '', gender: '', classification: '', family: '', status: '', featured: false, availability: '', minPrice: '', maxPrice: '', order: 'newest', page: 1 };
const NEW_PRODUCT_DRAFT_KEY = 'esenciales:draft:admin:producto:nuevo';
const NEW_PRODUCT_DRAFT = { version: 1, form: 'admin-product-new' };
const initialState = () => ({ products: [], categories: [], loading: true, loadError: '', filters: { ...emptyFilters }, filtersPanelOpen: false, categoriesPanelOpen: false, editor: null, productValues: {}, productError: '', productBusy: false, productDirty: false, saved: false, presentation: null, presentationValues: {}, presentationError: '', presentationBusy: false, presentationDirty: false, image: null, imageAlt: '', imageAltDirty: false, imageAltEditing: false, imageBusy: false, imageError: '', cleanupPath: '', categoryDrawer: { mode: 'list', selected: null, query: '', values: {}, error: '', message: '', busy: false, confirmDelete: false, dirty: false } });

const formValues = (form) => Object.fromEntries(new FormData(form));
const databaseError = (error) => error?.code === '23514' ? 'Verifica la familia olfativa para perfumes, el precio, la promoción, el stock y la disponibilidad.' : error?.code === '23505' ? 'Ya existe un registro con ese nombre.' : 'No fue posible guardar. Inténtalo de nuevo.';
const currentImage = (product) => product?.imagenes_producto?.find((image) => image.posicion === 0) || null;

export async function renderProductsScreen({ outlet, isCurrentGeneration, openRoot = false }) {
  let state = initialState();
  const hasUnsavedChanges = () => state.productDirty || state.presentationDirty;
  const draftSaver = createDraftSaver(window.localStorage, NEW_PRODUCT_DRAFT_KEY, NEW_PRODUCT_DRAFT);
  let previousBodyOverflow = '';
  const filterKeys = ['query', 'category', 'brand', 'gender', 'classification', 'family', 'status', 'availability', 'minPrice', 'maxPrice', 'order', 'page'];
  const resetPage = (filters) => ({ ...filters, page: 1 });
  const filteredProducts = () => sortInventory(filterInventory(state.products, state.filters), state.filters.order);
  const setEditor = (product) => {
    const image = currentImage(product);
    state = { ...state, editor: product, productValues: {}, productError: '', productBusy: false, productDirty: false, saved: false, presentation: null, presentationValues: {}, presentationError: '', presentationDirty: false, image, imageAlt: image?.texto_alternativo || product?.nombre || '', imageAltEditing: false, imageError: '', cleanupPath: '' };
  };
  const categoriesPanel = () => state.categoriesPanelOpen ? categoryDrawerView({ categories: state.categories, ...state.categoryDrawer }) : '';
  const productManagement = () => {
    if (!state.editor) return '';
    const list = state.editor.presentaciones?.length ? `<ul class="presentation-list">${state.editor.presentaciones.map(presentationRowView).join('')}</ul>` : '<p class="empty-state">Aún no hay presentaciones. Agrega la primera para registrar precio, stock y disponibilidad.</p>';
    return `<div class="product-management-grid">${productImageEditorView({ product: state.editor, image: state.image, altText: state.imageAlt, altChanged: state.imageAltDirty, altEditing: state.imageAltEditing, busy: state.imageBusy, error: state.imageError, cleanupPath: state.cleanupPath })}<section class="presentations-section"><header><div><h3>Presentaciones</h3><p>Precio, stock y disponibilidad se administran por presentación.</p></div><button class="secondary-button" type="button" data-presentation-create>Agregar presentación</button></header>${list}${state.presentation ? presentationFormView({ presentation: state.presentation, values: state.presentationValues, error: state.presentationError, saving: state.presentationBusy }) : ''}</section></div>`;
  };
  const syncPageScrollLock = () => {
    const body = outlet.ownerDocument?.body;
    const locked = state.categoriesPanelOpen || state.filtersPanelOpen;
    if (!body?.style) return;
    if (locked && body.style.overflow !== 'hidden') { previousBodyOverflow = body.style.overflow; body.style.overflow = 'hidden'; }
    if (!locked && body.style.overflow === 'hidden') body.style.overflow = previousBodyOverflow;
  };
  const draw = () => {
    const content = state.editor
      ? `${productFormView({ product: state.editor, categories: state.categories, values: state.productValues, error: state.productError, saving: state.productBusy, dirty: state.productDirty })}${productManagement()}`
      : `${inventoryDashboardView({ products: { all: state.products, filtered: filteredProducts() }, categories: state.categories, filters: state.filters, loading: state.loading, error: state.loadError, drawerOpen: state.filtersPanelOpen }).replaceAll('Sin stock', 'Con presentación agotada')}${categoriesPanel()}`;
    outlet.innerHTML = content;
    bind(); syncPageScrollLock(); outlet.querySelectorAll('[name="precio_normal"], [name="precio_promocional"], [name="minPrice"], [name="maxPrice"]').forEach(formatCopInputElement);
  };
  const closeEditor = () => { if (hasUnsavedChanges() && !window.confirm('Hay cambios sin guardar. ¿Quieres descartarlos y salir?')) return; if (!state.editor?.id) draftSaver.clear(); state = { ...state, editor: null, presentation: null, productValues: {}, productDirty: false, presentationDirty: false, productError: '', presentationError: '' }; draw(); };
  const closeCategoryDrawer = () => {
    const drawer = state.categoryDrawer;
    if (drawer.dirty && !window.confirm('Hay cambios sin guardar en la categoría. ¿Quieres cerrar?')) return;
    state = { ...state, categoriesPanelOpen: false, categoryDrawer: { mode: 'list', selected: null, query: '', values: {}, error: '', message: '', busy: false, confirmDelete: false, dirty: false } };
    draw();
    outlet.querySelector('[data-categories-open]')?.focus();
  };
  const closeFiltersDrawer = () => {
    state.filtersPanelOpen = false;
    draw();
    outlet.querySelector('[data-inventory-drawer-open]')?.focus();
  };
  const showNotice = (message, tone = 'success') => showNotification(message, { tone, documentRef: outlet.ownerDocument });
  async function load() {
    state = { ...state, loading: true, loadError: '' }; draw();
    const [{ data: products, error: productsError }, { data: categories, error: categoriesError }] = await Promise.all([listProducts(supabase), listCategories(supabase)]);
    if (!isCurrentGeneration()) return;
    state = { ...state, products: products || [], categories: categories || [], loading: false, loadError: productsError || categoriesError ? 'No fue posible cargar el inventario completo. Inténtalo de nuevo.' : '' };
    const draft = !openRoot && !state.editor && readDraft(window.localStorage, NEW_PRODUCT_DRAFT_KEY, NEW_PRODUCT_DRAFT);
    if (draft) state = { ...state, editor: { activo: true, destacado: false, presentaciones: [], imagenes_producto: [] }, productValues: draft.values, productDirty: true };
    draw();
    if (draft) showNotice('Recuperamos los cambios que estabas realizando.', 'info');
  }
  async function saveCurrent(form) {
    if (state.productBusy) return;
    const values = { ...formValues(form), destacado: form.elements.destacado.checked, activo: form.elements.activo.checked };
    const category = state.categories.find((item) => String(item.id) === String(values.categoria_id));
    if (category?.nombre.toLocaleLowerCase('es') === 'perfumes / lociones' && !values.familia_olfativa?.trim()) { state = { ...state, productValues: values, productError: 'Ingresa la familia olfativa para Perfumes / Lociones.' }; draw(); return; }
    state = { ...state, productBusy: true, productValues: values, productError: '' }; draw();
    let result;
    try { result = await saveProduct(supabase, state.editor?.id, values); } catch { state = { ...state, productBusy: false, productValues: values, productError: 'No fue posible guardar. Revisa tu conexión e inténtalo de nuevo.' }; draw(); return; }
    const { data, error } = result;
    if (error) { state = { ...state, productBusy: false, productValues: values, productError: databaseError(error) }; draw(); return; }
    const existing = state.editor || {};
    if (!existing.id) draftSaver.clear();
    const product = { ...existing, ...data, categorias: state.categories.find((item) => String(item.id) === String(data.categoria_id)), presentaciones: existing.presentaciones || [], imagenes_producto: existing.imagenes_producto || [] };
    state = { ...state, editor: product, productValues: {}, productBusy: false, productDirty: false, productError: '', saved: true, image: currentImage(product), imageAlt: currentImage(product)?.texto_alternativo || product.nombre, imageAltDirty: false };
    state.products = state.products.some((item) => item.id === product.id) ? state.products.map((item) => item.id === product.id ? product : item) : [product, ...state.products];
    draw();
    showNotice('Producto guardado correctamente.');
  }
  async function saveCurrentPresentation(form) {
    if (state.presentationBusy || !state.editor?.id) return;
    const formData = formValues(form);
    const values = { ...formData, etiqueta: formatPresentationLabel(formData.etiqueta_valor, formData.etiqueta_unidad), producto_id: state.editor.id, activo: form.elements.activo.checked };
    state = { ...state, presentationBusy: true, presentationValues: values, presentationError: '' }; draw();
    let result;
    try { result = await savePresentation(supabase, state.presentation?.id, values); } catch { state = { ...state, presentationBusy: false, presentationValues: values, presentationError: 'No fue posible guardar. Revisa tu conexión e inténtalo de nuevo.' }; draw(); return; }
    const { data, error } = result;
    if (error) { state = { ...state, presentationBusy: false, presentationValues: values, presentationError: databaseError(error) }; draw(); return; }
    const presentations = state.presentation?.id ? state.editor.presentaciones.map((item) => item.id === data.id ? data : item) : [...(state.editor.presentaciones || []), data];
    const editor = { ...state.editor, presentaciones: presentations };
    state = { ...state, editor, products: state.products.map((item) => item.id === editor.id ? editor : item), presentation: null, presentationValues: {}, presentationError: '', presentationBusy: false, presentationDirty: false };
    draw();
    showNotice('Presentación guardada correctamente.');
  }
  async function saveImage(file, altText) {
    if (state.imageBusy || !state.editor?.id) return;
    try { validateImage(file); } catch (error) { state = { ...state, imageError: error.message, imageAlt: altText }; draw(); showNotice(error.message, 'error'); return; }
    state = { ...state, imageBusy: true, imageError: '', imageAlt: altText, cleanupPath: '' }; draw();
    let saved = false;
    let uploadError = '';
    try {
      const image = state.image ? await replaceImage(supabase, state.image, file, altText) : await uploadImage(supabase, state.editor.id, file, altText);
      const images = [...(state.editor.imagenes_producto || []).filter((item) => item.id !== state.image?.id), image];
      const editor = { ...state.editor, imagenes_producto: images };
      state = { ...state, image, imageAlt: image.texto_alternativo || editor.nombre || '', imageAltDirty: false, imageAltEditing: false, editor, products: state.products.map((item) => item.id === editor.id ? editor : item) };
      saved = true;
    } catch (error) {
      state = { ...state, imageError: error.message, cleanupPath: error.cleanupPath || '' };
      uploadError = error.message;
    } finally {
      state = { ...state, imageBusy: false };
      draw();
    }
    if (saved) showNotice('Imagen guardada correctamente.');
    else showNotice(`No fue posible subir la imagen: ${uploadError}`, 'error');
  }
  async function removeCurrentImage() { if (!state.image || state.imageBusy) return; state = { ...state, imageBusy: true, imageError: '' }; draw(); try { await removeImage(supabase, state.image); state = { ...state, image: null, imageBusy: false, editor: { ...state.editor, imagenes_producto: state.editor.imagenes_producto.filter((item) => item.id !== state.image.id) } }; } catch (error) { state = { ...state, imageBusy: false, imageError: error.message, cleanupPath: error.cleanupPath || '' }; } draw(); }
  async function updateCurrentImageAlt(altText) { if (!state.image || state.imageBusy) return; state = { ...state, imageBusy: true, imageError: '' }; draw(); try { const image = await updateImageAlt(supabase, state.image, altText); state = { ...state, image, imageAlt: altText || state.editor.nombre || '', imageAltDirty: false, imageAltEditing: false, imageBusy: false, editor: { ...state.editor, imagenes_producto: state.editor.imagenes_producto.map((item) => item.id === image.id ? image : item) } }; } catch (error) { state = { ...state, imageBusy: false, imageError: error.message }; } draw(); }
  async function saveCategory(form) { if (state.categoryDrawer.busy) return; const nombre = new FormData(form).get('nombre'); const activo = form.elements.activo.checked; const drawer = { ...state.categoryDrawer, busy: true, values: { nombre, activo }, error: '' }; state = { ...state, categoryDrawer: drawer }; draw(); const operation = drawer.selected ? updateCategory(supabase, drawer.selected.id, { nombre, activo }) : createCategory(supabase, nombre, activo); const { data, error } = await operation; if (error) { state = { ...state, categoryDrawer: { ...drawer, busy: false, error: databaseError(error) } }; draw(); return; } const categories = drawer.selected ? state.categories.map((item) => item.id === data.id ? data : item) : [...state.categories, data].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')); state = { ...state, categories, categoryDrawer: { mode: 'list', selected: null, query: '', values: {}, error: '', message: '', busy: false, confirmDelete: false, dirty: false } }; draw(); showNotice('Categoría guardada correctamente.'); }
  async function deleteCurrentCategory() { const category = state.categoryDrawer.selected; if (!category || state.categoryDrawer.busy) return; if (state.products.some((product) => String(product.categoria_id) === String(category.id))) { state = { ...state, categoryDrawer: { ...state.categoryDrawer, confirmDelete: false, error: 'No se puede eliminar esta categoría porque tiene productos relacionados. Reasígnalos primero o desactiva la categoría.' } }; draw(); return; } state = { ...state, categoryDrawer: { ...state.categoryDrawer, busy: true, error: '' } }; draw(); const { error } = await deleteCategory(supabase, category.id); if (error) { state = { ...state, categoryDrawer: { ...state.categoryDrawer, busy: false, confirmDelete: false, error: 'No fue posible eliminar la categoría. Verifica que no tenga productos relacionados.' } }; draw(); return; } state = { ...state, categories: state.categories.filter((item) => item.id !== category.id), categoryDrawer: { mode: 'list', selected: null, query: '', values: {}, error: '', message: '', busy: false, confirmDelete: false, dirty: false } }; showNotice('Categoría eliminada correctamente.'); }
  function trapFocus(event, dialog) { if (event.key !== 'Tab') return; const nodes = [...dialog.querySelectorAll('button, input, select, textarea, [href]')].filter((node) => !node.disabled); const first = nodes[0]; const last = nodes.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } }
  function bind() {
    const presentationLabel = outlet.querySelector('#presentation-label');
    if (presentationLabel) {
      const { value, unit } = splitPresentationLabel(presentationLabel.value);
      const group = document.createElement('div');
      group.className = 'presentation-label-control';
      presentationLabel.before(group);
      presentationLabel.name = 'etiqueta_valor';
      presentationLabel.value = value;
      presentationLabel.placeholder = 'Ej. 100';
      presentationLabel.inputMode = 'decimal';
      group.append(presentationLabel);

      const unitSelect = document.createElement('select');
      unitSelect.name = 'etiqueta_unidad';
      unitSelect.className = 'presentation-label-control__unit';
      unitSelect.setAttribute('aria-label', 'Unidad de presentación');
      unitSelect.innerHTML = '<option value="">Sin unidad</option><option value="ml">ml</option><option value="oz">oz</option>';
      unitSelect.value = unit || (value ? '' : 'ml');
      group.append(unitSelect);
    }
    outlet.querySelector('[data-products-retry], [data-inventory-retry]')?.addEventListener('click', load);
    outlet.querySelector('[data-product-create]')?.addEventListener('click', () => { const draft = readDraft(window.localStorage, NEW_PRODUCT_DRAFT_KEY, NEW_PRODUCT_DRAFT); setEditor({ activo: true, destacado: false, presentaciones: [], imagenes_producto: [] }); if (draft) { state = { ...state, productValues: draft.values, productDirty: true }; } draw(); if (draft) showNotice('Recuperamos los cambios que estabas realizando.', 'info'); outlet.querySelector('#product-name')?.focus(); });
    outlet.querySelectorAll('[data-product-edit]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); const product = state.products.find((item) => String(item.id) === button.dataset.productEdit); if (product) { setEditor(product); draw(); } }));
    outlet.querySelectorAll('[data-product-open]').forEach((row) => { row.addEventListener('dblclick', (event) => { if (!event.target.closest('button, a, input, select')) { const product = state.products.find((item) => String(item.id) === row.dataset.productOpen); if (product) { setEditor(product); draw(); } } }); row.addEventListener('click', (event) => { if (!event.target.closest('button, a, input, select') && window.matchMedia('(max-width: 63.9375rem)').matches) { const product = state.products.find((item) => String(item.id) === row.dataset.productOpen); if (product) { setEditor(product); draw(); } } }); row.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); const product = state.products.find((item) => String(item.id) === row.dataset.productOpen); if (product) { setEditor(product); draw(); } } }); });
    outlet.querySelectorAll('[data-product-close]').forEach((button) => button.addEventListener('click', closeEditor));
    const captureProductValues = (form) => {
      const values = { ...formValues(form), destacado: form.elements.destacado.checked, activo: form.elements.activo.checked };
      state = { ...state, productValues: values, productDirty: true };
      if (!state.editor?.id) draftSaver.save(values);
    };
    outlet.querySelector('#product-form')?.addEventListener('input', (event) => captureProductValues(event.currentTarget));
    outlet.querySelector('#product-form')?.addEventListener('change', (event) => captureProductValues(event.currentTarget));
    outlet.querySelector('#product-form')?.addEventListener('submit', (event) => { event.preventDefault(); event.currentTarget.checkValidity() ? saveCurrent(event.currentTarget) : event.currentTarget.reportValidity(); });
    outlet.querySelector('[data-presentation-create]')?.addEventListener('click', () => { state = { ...state, presentation: { activo: true, modo_disponibilidad: 'venta_inmediata', stock: 0 }, presentationValues: {}, presentationError: '', presentationDirty: false }; draw(); outlet.querySelector('#presentation-label')?.focus(); });
    outlet.querySelectorAll('[data-presentation-edit]').forEach((button) => button.addEventListener('click', () => { state = { ...state, presentation: state.editor.presentaciones.find((item) => String(item.id) === button.dataset.presentationEdit), presentationValues: {}, presentationError: '', presentationDirty: false }; draw(); outlet.querySelector('#presentation-label')?.focus(); }));
    outlet.querySelector('[data-presentation-cancel]')?.addEventListener('click', () => { if (state.presentationDirty && !window.confirm('Hay cambios sin guardar en la presentación. ¿Quieres cancelar?')) return; state = { ...state, presentation: null, presentationValues: {}, presentationError: '', presentationDirty: false }; draw(); });
    outlet.querySelector('#presentation-form')?.addEventListener('input', (event) => { if (event.target.matches('[name="precio_normal"], [name="precio_promocional"]')) event.target.value = formatCopInput(event.target.value); state.presentationDirty = true; }); outlet.querySelector('#presentation-form')?.addEventListener('change', () => { state.presentationDirty = true; }); outlet.querySelector('#presentation-form')?.addEventListener('submit', (event) => { event.preventDefault(); event.currentTarget.checkValidity() ? saveCurrentPresentation(event.currentTarget) : event.currentTarget.reportValidity(); });
    outlet.querySelector('[data-image-select]')?.addEventListener('click', () => outlet.querySelector('#product-image-file')?.click());
    outlet.querySelector('#product-image-file')?.addEventListener('change', (event) => saveImage(event.currentTarget.files[0], outlet.querySelector('#product-image-alt')?.value || state.imageAlt || state.editor?.nombre || ''));
    outlet.querySelector('#product-image-alt')?.addEventListener('input', (event) => { state = { ...state, imageAlt: event.target.value, imageAltDirty: event.target.value !== (state.image?.texto_alternativo || state.editor.nombre || '') }; });
    outlet.querySelector('[data-image-alt-edit]')?.addEventListener('click', () => { state = { ...state, imageAltEditing: true, imageAltDirty: false }; draw(); outlet.querySelector('#product-image-alt')?.focus(); });
    outlet.querySelector('[data-image-alt-cancel]')?.addEventListener('click', () => { state = { ...state, imageAlt: state.image?.texto_alternativo || state.editor.nombre || '', imageAltDirty: false, imageAltEditing: false }; draw(); });
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
    outlet.querySelectorAll('[data-inventory-drawer-close]').forEach((button) => button.addEventListener('click', closeFiltersDrawer));
    outlet.querySelector('#inventory-filter-form')?.addEventListener('input', (event) => { if (event.target.matches('[name="minPrice"], [name="maxPrice"]')) event.target.value = formatCopInput(event.target.value); });
    outlet.querySelector('#inventory-filter-form')?.addEventListener('submit', (event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); state.filters = resetPage({ ...state.filters, ...values, minPrice: copDigits(values.minPrice), maxPrice: copDigits(values.maxPrice), featured: event.currentTarget.elements.featured.checked }); closeFiltersDrawer(); });
    outlet.querySelectorAll('[data-inventory-availability]').forEach((button) => button.addEventListener('click', () => { state.filters = resetPage({ ...state.filters, availability: state.filters.availability === button.dataset.inventoryAvailability ? '' : button.dataset.inventoryAvailability }); draw(); }));
    outlet.querySelectorAll('[data-inventory-status]').forEach((button) => button.addEventListener('click', () => { state.filters = resetPage({ ...state.filters, status: state.filters.status === button.dataset.inventoryStatus ? '' : button.dataset.inventoryStatus }); draw(); }));
    outlet.querySelector('[data-inventory-featured]')?.addEventListener('click', () => { state.filters = resetPage({ ...state.filters, featured: !state.filters.featured }); draw(); });
    outlet.querySelectorAll('[data-inventory-filter-clear]').forEach((button) => button.addEventListener('click', () => { state.filters = { ...emptyFilters }; state.filtersPanelOpen = false; draw(); }));
    const filtersDrawer = outlet.querySelector('.inventory-drawer'); if (filtersDrawer) filtersDrawer.addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.preventDefault(); closeFiltersDrawer(); } else trapFocus(event, filtersDrawer); });
    outlet.querySelectorAll('[data-inventory-page]').forEach((button) => button.addEventListener('click', () => { state.filters.page = Number(button.dataset.inventoryPage); draw(); }));
    outlet.querySelectorAll('[data-inventory-sort]').forEach((button) => button.addEventListener('click', () => { const field = button.dataset.inventorySort; state.filters = resetPage({ ...state.filters, order: state.filters.order === `${field}-asc` ? `${field}-desc` : `${field}-asc` }); draw(); }));
  }
  const beforeUnload = (event) => { if (!hasUnsavedChanges()) return; event.preventDefault(); event.returnValue = ''; };
  const flushDraft = () => { if (!state.editor?.id && state.productDirty) draftSaver.flush(); };
  const onVisibilityChange = () => { if (document.visibilityState === 'hidden') flushDraft(); };
  window.addEventListener('beforeunload', beforeUnload);
  window.addEventListener('pagehide', flushDraft);
  document.addEventListener('visibilitychange', onVisibilityChange);
  await load();
  return {
    canLeave: () => !hasUnsavedChanges() || window.confirm('Hay cambios sin guardar. ¿Quieres descartarlos y salir?'),
    cleanup: () => { const body = outlet.ownerDocument?.body; if (body?.style?.overflow === 'hidden') body.style.overflow = previousBodyOverflow; flushDraft(); draftSaver.destroy(); window.removeEventListener('beforeunload', beforeUnload); window.removeEventListener('pagehide', flushDraft); document.removeEventListener('visibilitychange', onVisibilityChange); },
  };
}
