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
