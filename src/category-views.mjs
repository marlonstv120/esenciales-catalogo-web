import { backButton } from './back-navigation.mjs';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function categoryRowView(category) {
  const id = escapeHtml(category.id);
  const name = escapeHtml(category.nombre);
  const status = category.activo ? 'Activa' : 'Inactiva';
  const statusClass = category.activo ? 'status--active' : 'status--inactive';
  const action = category.activo
    ? `<button class="table-action table-action--deactivate" type="button" data-category-deactivate="${id}">Desactivar</button>`
    : `<button class="table-action table-action--activate" type="button" data-category-activate="${id}">Activar</button>`;

  return `
    <li class="category-item">
      <div class="category-details"><strong>${name}</strong><span class="category-status ${statusClass}">${status}</span></div>
      <div class="category-actions">
        <button class="table-action table-action--edit" type="button" data-category-edit="${id}">Editar</button>
        ${action}
      </div>
    </li>`;
}

export function categoriesView(categories, state = {}) {
  if (state.loading) {
    return '<section class="category-content" aria-busy="true"><p class="loading-state" role="status">Cargando categorías...</p></section>';
  }

  if (state.error) {
    return `<section class="category-content"><p class="message message--error" role="alert">${escapeHtml(state.error)}</p><button class="secondary-button" type="button" data-category-retry>Reintentar</button></section>`;
  }

  if (!categories.length) {
    return '<section class="category-content"><p class="empty-state">Aún no hay categorías. Crea la primera para organizar el catálogo.</p></section>';
  }

  return `<section class="category-content"><ul class="category-list">${categories.map(categoryRowView).join('')}</ul></section>`;
}

export function categoryFormView({ category, nombre = '', error = '' } = {}) {
  const value = nombre || category?.nombre || '';
  const title = category ? 'Editar categoría' : 'Nueva categoría';

  return `
    <aside class="category-panel" aria-labelledby="category-panel-title">
      <div class="category-panel-header"><h2 id="category-panel-title">${title}</h2><button class="icon-button" type="button" data-category-cancel aria-label="Cerrar formulario">Cerrar</button></div>
      <form class="category-form" id="category-form" novalidate>
        <div class="field">
          <label for="category-name">Nombre de la categoría</label>
          <input id="category-name" name="nombre" type="text" required maxlength="120" value="${escapeHtml(value)}" aria-describedby="category-message">
        </div>
        <p class="message message--error" id="category-message" role="alert">${escapeHtml(error)}</p>
        <div class="category-form-actions"><button class="secondary-button" type="button" data-category-cancel>Cancelar</button><button class="primary-button" type="submit" data-busy-label="Guardando...">Guardar</button></div>
      </form>
    </aside>`;
}

export function deactivationDialogView(category, { busy = false } = {}) {
  const id = escapeHtml(category.id);
  const name = escapeHtml(category.nombre);

  return `
    <div class="category-dialog-backdrop">
      <section class="category-dialog" role="dialog" aria-modal="true" aria-labelledby="deactivate-title" aria-busy="${busy}">
        <h2 id="deactivate-title">Desactivar ${name}</h2>
        <p>La categoría se conservará, pero sus productos se ocultarán del catálogo público.</p>
        <div class="category-form-actions"><button class="secondary-button" type="button" data-category-cancel-dialog${busy ? ' disabled' : ''}>Cancelar</button><button class="danger-button" type="button" data-category-confirm-deactivate="${id}"${busy ? ' disabled' : ''}>Desactivar categoría</button></div>
      </section>
    </div>`;
}

export function categoryWorkspaceView(content, message = '') {
  return `
    <main class="admin-workspace">
      <header class="admin-header"><div><p class="eyebrow">Administracion</p><h1>Categorias</h1></div><button class="secondary-button" type="button" id="sign-out">Cerrar sesion</button></header>
      <div class="category-toolbar"><p class="message message--success" role="status">${escapeHtml(message)}</p><button class="primary-button category-create" type="button" data-category-create>Nueva categoria</button></div>
      ${content}
    </main>`;
}

const icon = (paths) => `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

export function categoryDrawerView({ categories = [], mode = 'list', selected = null, query = '', values = {}, error = '', message = '', busy = false, confirmDelete = false } = {}) {
  const matches = categories.filter((category) => category.nombre.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')));
  const v = { activo: selected?.activo ?? true, nombre: selected?.nombre ?? '', ...values };
  const form = mode !== 'list' ? `<form id="category-drawer-form" class="category-drawer__form" novalidate>
    <label class="field" for="drawer-category-name">Nombre<input id="drawer-category-name" name="nombre" required maxlength="120" value="${escapeHtml(v.nombre)}"></label>
    <label class="toggle-field"><input type="checkbox" name="activo" ${v.activo !== false ? 'checked' : ''}> <span>Activa</span><small>Las categorías inactivas no se muestran en el catálogo público.</small></label>
    ${error ? `<p class="message message--error" role="alert">${escapeHtml(error)}</p>` : ''}
    <div class="category-drawer__actions"><button class="secondary-button" type="button" data-category-drawer-back ${busy ? 'disabled' : ''}>Cancelar</button><button class="primary-button" type="submit" ${busy ? 'disabled' : ''}>${busy ? 'Guardando...' : mode === 'create' ? 'Guardar categoría' : 'Guardar cambios'}</button></div>
    ${mode === 'edit' ? `<button class="danger-link" type="button" data-category-delete ${busy ? 'disabled' : ''}>${icon('<path d="M3 6h18M9 6V4h6v2m-7 0 1 14h6l1-14"/>')}Eliminar categoría</button>` : ''}
  </form>` : `<div class="category-drawer__list"><label class="category-search" for="category-search">${icon('<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/>')}<span class="visually-hidden">Buscar categoría</span><input id="category-search" type="search" value="${escapeHtml(query)}" placeholder="Buscar categoría"></label>
    ${error ? `<p class="message message--error" role="alert">${escapeHtml(error)}</p>` : ''}
    ${!categories.length ? '<p class="empty-state">Aún no hay categorías.</p>' : !matches.length ? '<p class="empty-state">No hay categorías que coincidan con la búsqueda.</p>' : `<ul>${matches.map((category) => `<li><div><strong>${escapeHtml(category.nombre)}</strong><span class="inventory-status ${category.activo ? 'inventory-status--active' : 'inventory-status--inactive'}">${category.activo ? 'Activa' : 'Inactiva'}</span></div><button class="icon-button" type="button" data-category-drawer-edit="${escapeHtml(category.id)}" aria-label="Editar ${escapeHtml(category.nombre)}">${icon('<path d="m4 20 4-1 10-10-3-3L5 16l-1 4Z"/><path d="m13 7 3 3"/>')}</button></li>`).join('')}</ul>`}
  </div>`;
  return `<div class="category-drawer-backdrop" data-category-drawer-close></div><aside class="category-drawer" role="dialog" aria-modal="true" aria-labelledby="category-drawer-title" aria-busy="${busy}"><header>${mode === 'list' ? '<h2 id="category-drawer-title">Categorías</h2>' : backButton({ label: 'Volver a categorías', className: 'category-drawer__back', attributes: 'data-category-drawer-back' })}<button class="icon-button" type="button" data-category-drawer-close aria-label="Cerrar categorías">${icon('<path d="m6 6 12 12M18 6 6 18"/>')}</button></header>${message ? `<p class="message message--success" role="status">${escapeHtml(message)}</p>` : ''}${mode === 'list' ? '<button class="primary-button category-drawer__new" type="button" data-category-drawer-create>+ Nueva categoría</button>' : ''}${form}${confirmDelete ? `<section class="category-delete-confirmation" role="alertdialog" aria-modal="true" aria-labelledby="category-delete-title"><h3 id="category-delete-title">¿Eliminar categoría?</h3><p>Esta acción no se puede deshacer. Reasigna primero los productos relacionados.</p><div><button class="secondary-button" type="button" data-category-delete-cancel>Cancelar</button><button class="danger-button" type="button" data-category-delete-confirm ${busy ? 'disabled' : ''}>Eliminar categoría</button></div></section>` : ''}</aside>`;
}
