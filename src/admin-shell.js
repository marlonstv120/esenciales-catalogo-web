const routes = ['categorias', 'productos', 'inventario'];

export function getAdminRoute(hash) {
  const route = hash.slice(1);
  return routes.includes(route) ? route : 'categorias';
}

export function shellView(route) {
  const labels = { categorias: 'Categorías', productos: 'Productos', inventario: 'Inventario' };
  const label = labels[route] || labels.categorias;
  const navigation = `<a href="#categorias" ${route === 'categorias' ? 'aria-current="page"' : ''}>Categorías</a><a href="#productos" ${route === 'productos' ? 'aria-current="page"' : ''}>Productos</a><a href="#inventario" ${route === 'inventario' ? 'aria-current="page"' : ''}>Inventario</a>`;
  const shopLink = `<a class="admin-shop-link" href="/" target="_blank" rel="noopener noreferrer">Ver tienda <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6m0-6-9 9"/><path d="M20 14v6H4V4h6"/></svg></a>`;
  return `<a class="skip-link" href="#admin-content">Saltar a contenido</a>
    <div class="admin-shell">
      <aside class="admin-navigation" aria-label="Administración">
        <a class="admin-navigation__brand" href="#categorias" aria-label="ESENCIALES — Categorías"><img src="/assets/brand/esenciales-logo-horizontal.png" alt=""></a>
        <nav class="admin-navigation__links" aria-label="Secciones administrativas">${navigation}</nav>
        <div class="admin-navigation__actions">${shopLink}<button class="secondary-button" type="button" data-sign-out>Cerrar sesión</button></div>
        <details class="admin-mobile-menu"><summary aria-label="Menú administrativo">Menú</summary><div class="admin-mobile-menu__panel"><nav aria-label="Secciones administrativas">${navigation}</nav><div class="admin-mobile-menu__actions">${shopLink}<button class="secondary-button" type="button" data-sign-out>Cerrar sesión</button></div></div></details>
      </aside>
      <main class="admin-main" id="admin-content" tabindex="-1"><div class="admin-main__inner"><header class="admin-header"><div><p class="eyebrow">Administración</p><h1>${label}</h1></div></header><div data-admin-outlet></div></div></main>
    </div>`;
}

export function startAdminShell({ app, generation, isCurrentGeneration, onSignOut }) {
  let active = true;
  const context = { app, generation, isCurrentGeneration, render: renderRoute };
  const renderers = {
    categorias: () => import('./categories-controller.js').then(({ renderCategoriesScreen }) => renderCategoriesScreen),
    productos: () => import('./products-controller.js').then(({ renderProductsScreen }) => renderProductsScreen),
    inventario: () => import('./inventory-controller.js').then(({ renderInventoryScreen }) => renderInventoryScreen),
  };

  async function renderRoute() {
    if (!active || !isCurrentGeneration()) return;
    const route = getAdminRoute(window.location.hash);
    app.innerHTML = shellView(route);
    app.querySelectorAll('[data-sign-out]').forEach((button) => button.addEventListener('click', onSignOut));
    const screen = await renderers[route]();
    if (!active || !isCurrentGeneration()) return;
    await screen({ ...context, outlet: app.querySelector('[data-admin-outlet]') });
  }

  const onHashChange = () => renderRoute();
  window.addEventListener('hashchange', onHashChange);
  if (!window.location.hash || !routes.includes(window.location.hash.slice(1))) window.location.hash = '#categorias';
  else renderRoute();

  return () => { active = false; window.removeEventListener('hashchange', onHashChange); };
}
