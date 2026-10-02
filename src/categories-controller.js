import { createCategory, listCategories, updateCategory } from './categories.js';
import { categoryFormView, categoriesView, deactivationDialogView } from './category-views.mjs';
import { supabase } from './supabase.js';
import { showNotification } from './notifications.mjs';

const initialState = { categories: [], mode: null, selectedCategory: null, dialogCategory: null, formName: '', formError: '', message: '', loading: true, error: '', mutating: false };
let state = { ...initialState };

function errorMessage(error) {
  if (error?.code === 'category_name_required') return 'Ingresa un nombre para la categoría.';
  if (error?.code === '23505') return 'Ya existe una categoría con ese nombre.';
  return 'No fue posible guardar la categoría. Inténtalo de nuevo.';
}

function content() {
  const form = state.mode ? categoryFormView({ category: state.selectedCategory, nombre: state.formName, error: state.formError }) : '';
  const dialog = state.dialogCategory ? deactivationDialogView(state.dialogCategory, { busy: state.mutating }) : '';
  return `<section class="admin-page"><div class="category-toolbar"><button class="primary-button category-create" type="button" data-category-create>Nueva categoria</button></div>${categoriesView(state.categories, state)}${form}${dialog}</section>`;
}

export async function renderCategoriesScreen({ outlet, generation, isCurrentGeneration, render }) {
  const draw = () => { outlet.innerHTML = content(); bind(); };
  async function load() {
    state = { ...state, loading: true, error: '' }; draw();
    const { data, error } = await listCategories(supabase);
    if (!isCurrentGeneration() || generation !== undefined && !isCurrentGeneration()) return;
    state = error ? { ...state, loading: false, error: 'No fue posible cargar las categorías.' } : { ...state, loading: false, categories: data };
    draw();
  }
  async function save(form) {
    const nombre = new FormData(form).get('nombre');
    const operation = state.selectedCategory ? updateCategory(supabase, state.selectedCategory.id, { nombre }) : createCategory(supabase, nombre);
    form.querySelector('[type="submit"]').disabled = true;
    const { error } = await operation;
    if (error) { state = { ...state, formName: nombre, formError: errorMessage(error) }; draw(); return; }
    state = { ...initialState, categories: state.categories }; await load(); showNotification('Categoría guardada correctamente.', { documentRef: outlet.ownerDocument });
  }
  async function setActive(category, activo) {
    if (!category || state.mutating) return;
    state = { ...state, mutating: true }; draw();
    const { error } = await updateCategory(supabase, category.id, { activo });
    if (error) { state = { ...state, mutating: false, error: errorMessage(error) }; draw(); return; }
    state = { ...initialState, categories: state.categories }; await load(); showNotification(activo ? 'Categoría activada correctamente.' : 'Categoría desactivada correctamente.', { documentRef: outlet.ownerDocument });
  }
  function bind() {
    outlet.querySelector('[data-category-retry]')?.addEventListener('click', load);
    outlet.querySelector('[data-category-create]')?.addEventListener('click', () => { state = { ...state, mode: 'create' }; draw(); outlet.querySelector('#category-name')?.focus(); });
    outlet.querySelectorAll('[data-category-edit]').forEach((button) => button.addEventListener('click', () => { state = { ...state, mode: 'edit', selectedCategory: state.categories.find(({ id }) => String(id) === button.dataset.categoryEdit) }; draw(); outlet.querySelector('#category-name')?.focus(); }));
    outlet.querySelectorAll('[data-category-deactivate]').forEach((button) => button.addEventListener('click', () => { state = { ...state, dialogCategory: state.categories.find(({ id }) => String(id) === button.dataset.categoryDeactivate) }; draw(); outlet.querySelector('[data-category-cancel-dialog]')?.focus(); }));
    outlet.querySelectorAll('[data-category-activate]').forEach((button) => button.addEventListener('click', () => setActive(state.categories.find(({ id }) => String(id) === button.dataset.categoryActivate), true)));
    outlet.querySelector('[data-category-confirm-deactivate]')?.addEventListener('click', () => setActive(state.dialogCategory, false));
    outlet.querySelectorAll('[data-category-cancel], [data-category-cancel-dialog]').forEach((button) => button.addEventListener('click', () => { state = { ...state, mode: null, selectedCategory: null, dialogCategory: null, formName: '', formError: '' }; draw(); }));
    outlet.querySelector('#category-form')?.addEventListener('submit', (event) => { event.preventDefault(); if (event.currentTarget.checkValidity()) save(event.currentTarget); else event.currentTarget.reportValidity(); });
  }
  await load();
}
