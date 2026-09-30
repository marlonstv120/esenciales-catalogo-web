import { appPath } from './app-paths.mjs';

const routes = ['inventario', 'solicitudes'];
const legacyProductRoutes = ['productos', 'producto', 'products'];

export function getAdminRoute(hash) {
  const route = hash.slice(1).split('?')[0];
  return legacyProductRoutes.includes(route) || route === 'categorias' ? 'inventario' : routes.includes(route) ? route : 'inventario';
}

export function shellView(route) {
  const labels = { inventario: 'Inventario', solicitudes: 'Solicitudes' };
  const label = labels[route] || labels.inventario;
  const navigation = `<a href="#inventario" ${route === 'inventario' ? 'aria-current="page"' : ''}><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5h16v14H4z"/><path d="M8 9h8m-8 4h8"/></svg>Inventario</a><a href="#solicitudes" ${route === 'solicitudes' ? 'aria-current="page"' : ''}><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 4h14v16H5z"/><path d="M8 8h8m-8 4h8m-8 4h5"/></svg>Solicitudes</a>`;
  const shopLink = `<a class="admin-shop-link" href="${appPath('/')}" target="_blank" rel="noopener noreferrer"><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6m0-6-9 9"/><path d="M20 14v6H4V4h6"/></svg>Ver catálogo</a>`;
  return `<a class="skip-link" href="#admin-content">Saltar a contenido</a>
    <div class="admin-shell">
      <aside class="admin-navigation" aria-label="Administración">
        <a class="admin-navigation__brand" href="#inventario" aria-label="ESENCIALES — Inventario"><img src="${appPath('/assets/brand/esenciales-logo-horizontal.png')}" alt=""></a>
        <nav class="admin-navigation__links" aria-label="Secciones administrativas">${navigation}</nav>
        <div class="admin-navigation__actions">${shopLink}<button class="admin-sign-out" type="button" data-sign-out><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 17l5-5-5-5M15 12H3m9-8h7v16h-7"/></svg>Cerrar sesión</button></div>
        <details class="admin-mobile-menu"><summary aria-label="Menú administrativo">Menú</summary><div class="admin-mobile-menu__panel"><nav aria-label="Secciones administrativas">${navigation}</nav><div class="admin-mobile-menu__actions">${shopLink}<button class="admin-sign-out" type="button" data-sign-out>Cerrar sesión</button></div></div></details>
      </aside>
      <main class="admin-main" id="admin-content" tabindex="-1"><div class="admin-main__inner"><header class="admin-header"><div><h1>${label}</h1></div></header><div data-admin-outlet></div></div></main>
    </div>`;
}

export function startAdminShell({ app, generation, isCurrentGeneration, onSignOut }) {
  let active = true;
  const context = { app, generation, isCurrentGeneration, render: renderRoute };
  const renderers = {
    inventario: () => import('./products-controller.js').then(({ renderProductsScreen }) => renderProductsScreen),
    solicitudes: () => import('./requests-controller.js').then(({ renderRequestsScreen }) => renderRequestsScreen),
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
  if (!window.location.hash) window.location.hash = '#inventario';
  else renderRoute();

  return () => { active = false; window.removeEventListener('hashchange', onHashChange); };
}
