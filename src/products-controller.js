import { retryImageCleanup, removeImage, replaceImage, updateImageAlt, uploadImage, validateImage } from './images.js';
import { listCategories } from './categories.js';
import { productImageEditorView } from './product-image-views.mjs';
import { productFormView, productsView, presentationFormView } from './product-views.mjs';
import { listProducts, savePresentation, saveProduct } from './products.js';
import { supabase } from './supabase.js';

let state = {
  products: [], categories: [], editor: null, presentation: null, values: {}, error: '', loading: true,
  query: '', category: '', status: '', image: null, imageAlt: '', imageBusy: false, imageError: '', cleanupPath: '',
};

const formValues = (form) => Object.fromEntries(new FormData(form));
const databaseError = (error) => error?.code === '23505' ? 'La referencia ya esta registrada.' : error?.code === '23514' ? 'Verifica precio, promocion, stock y disponibilidad.' : 'No fue posible guardar. Intentalo de nuevo.';
const currentImage = (product) => product?.imagenes_producto?.find((image) => image.posicion === 0) || null;

export async function renderProductsScreen({ outlet, isCurrentGeneration }) {
  const draw = () => {
    outlet.innerHTML = state.editor
      ? productFormView({ product: state.editor, categories: state.categories, values: state.values, error: state.error })
        + productImageEditorView({ product: state.editor, image: state.image, altText: state.imageAlt, busy: state.imageBusy, error: state.imageError, cleanupPath: state.cleanupPath })
        + (state.presentation ? presentationFormView({ presentation: state.presentation, values: state.values, error: state.error }) : '')
      : `<section class="admin-page"><div class="page-toolbar"><div class="field"><label for="product-search">Buscar por nombre</label><input id="product-search" value="${state.query}"></div><div class="field"><label for="product-category-filter">Categoria</label><select id="product-category-filter"><option value="">Todas</option>${state.categories.map((category) => `<option value="${category.id}" ${state.category === String(category.id) ? 'selected' : ''}>${category.nombre}</option>`).join('')}</select></div><div class="field"><label for="product-status-filter">Estado</label><select id="product-status-filter"><option value="">Todos</option><option value="true" ${state.status === 'true' ? 'selected' : ''}>Activos</option><option value="false" ${state.status === 'false' ? 'selected' : ''}>Inactivos</option></select></div><button class="primary-button" type="button" data-product-create>Nuevo producto</button></div>${productsView(state.products, state)}</section>`;
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
    const { data, error } = await saveProduct(supabase, state.editor?.id, values);
    if (error) {
      state = { ...state, values, error: databaseError(error) };
      draw();
      return;
    }
    const image = currentImage(state.editor);
    state = { ...state, editor: { ...data, categorias: state.categories.find((category) => category.id === data.categoria_id), presentaciones: state.editor?.presentaciones || [], imagenes_producto: state.editor?.imagenes_producto || [] }, values: {}, error: '', image, imageAlt: image?.texto_alternativo || data.nombre };
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
    outlet.querySelector('[data-product-create]')?.addEventListener('click', () => { state = { ...state, editor: {}, values: {}, error: '', image: null, imageAlt: '', imageError: '', cleanupPath: '' }; draw(); });
    outlet.querySelectorAll('[data-product-edit]').forEach((button) => button.addEventListener('click', () => { const editor = state.products.find((product) => String(product.id) === button.dataset.productEdit); const image = currentImage(editor); state = { ...state, editor, values: {}, error: '', image, imageAlt: image?.texto_alternativo || editor.nombre, imageError: '', cleanupPath: '' }; draw(); }));
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
    ['product-search', 'product-category-filter', 'product-status-filter'].forEach((id) => outlet.querySelector(`#${id}`)?.addEventListener('input', (event) => { state = { ...state, [id === 'product-search' ? 'query' : id === 'product-category-filter' ? 'category' : 'status']: event.target.value }; draw(); }));
  }

  await load();
}
