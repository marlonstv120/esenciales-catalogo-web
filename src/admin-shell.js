const routes = ['categorias', 'productos', 'inventario'];

export function getAdminRoute(hash) {
  const route = hash.slice(1);
  return routes.includes(route) ? route : 'categorias';
}

function shellView(route) {
  const label = route[0].toUpperCase() + route.slice(1);
  return `<a class="skip-link" href="#admin-content">Saltar a contenido</a>
    <div class="admin-shell">
      <aside class="admin-navigation" aria-label="Administracion">
        <p class="eyebrow">ESENCIALES</p><h1>Administracion</h1>
        <nav><a href="#categorias" ${route === 'categorias' ? 'aria-current="page"' : ''}>Categorias</a><a href="#productos" ${route === 'productos' ? 'aria-current="page"' : ''}>Productos</a><a href="#inventario" ${route === 'inventario' ? 'aria-current="page"' : ''}>Inventario</a></nav>
        <button class="secondary-button" type="button" id="sign-out">Cerrar sesion</button>
      </aside>
      <main class="admin-main" id="admin-content" tabindex="-1"><header class="admin-header"><div><p class="eyebrow">Administracion</p><h2>${label}</h2></div></header><div data-admin-outlet></div></main>
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
    app.querySelector('#sign-out').addEventListener('click', onSignOut);
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
