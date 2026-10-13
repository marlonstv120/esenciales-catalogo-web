import { appPath } from './app-paths.mjs';
import { uiIcon } from './ui-icons.mjs';

const routes = ['inventario', 'solicitudes'];
const legacyProductRoutes = ['productos', 'producto', 'products'];

export function getAdminRoute(hash) {
  const route = hash.slice(1).split('?')[0];
  return legacyProductRoutes.includes(route) || route === 'categorias' ? 'inventario' : routes.includes(route) ? route : 'inventario';
}

export function shellView(route) {
  const labels = { inventario: 'Inventario', solicitudes: 'Solicitudes' };
  const label = labels[route] || labels.inventario;
  const navigation = `<a href="#inventario" ${route === 'inventario' ? 'aria-current="page"' : ''}>${uiIcon('clipboard-list')}Inventario</a><a href="#solicitudes" ${route === 'solicitudes' ? 'aria-current="page"' : ''}>${uiIcon('file-text')}Solicitudes</a>`;
  const shopLink = `<a class="admin-shop-link" href="${appPath('/')}" target="_blank" rel="noopener noreferrer">${uiIcon('external-link')}Ver catálogo</a>`;
  return `<a class="skip-link" href="#admin-content">Saltar a contenido</a>
    <div class="admin-shell">
      <aside class="admin-navigation" aria-label="Administración">
        <a class="admin-navigation__brand" href="#inventario" aria-label="VEHIMARCAS del Valle — Inventario"><img src="${appPath('/assets/brand/vehimarcas-logo-completo.png')}" alt="VEHIMARCAS del Valle"></a>
        <nav class="admin-navigation__links" aria-label="Secciones administrativas">${navigation}</nav>
        <div class="admin-navigation__actions">${shopLink}<button class="admin-sign-out" type="button" data-sign-out>${uiIcon('log-out')}Cerrar sesión</button></div>
        <details class="admin-mobile-menu"><summary aria-label="Abrir menú">${uiIcon('menu', { size: 24, strokeWidth: 2 })}</summary><div class="admin-mobile-menu__panel"><nav aria-label="Secciones administrativas">${navigation}</nav><div class="admin-mobile-menu__actions">${shopLink}<button class="admin-sign-out" type="button" data-sign-out>Cerrar sesión</button></div></div></details>
      </aside>
      <main class="admin-main" id="admin-content" tabindex="-1"><div class="admin-main__inner"><header class="admin-header"><div><h1>${label}</h1></div></header><div data-admin-outlet></div></div></main>
    </div>`;
}

export function startAdminShell({ app, generation, isCurrentGeneration, onSignOut }) {
  let active = true;
  let stopScreen = null;
  let scrollToTopOnNextRoute = false;
  let openRootOnNextRoute = false;
  const context = { app, generation, isCurrentGeneration, render: renderRoute };
  let canLeaveScreen = () => true;
  const renderers = {
    inventario: () => import('./products-controller.js').then(({ renderProductsScreen }) => renderProductsScreen),
    solicitudes: () => import('./requests-controller.js').then(({ renderRequestsScreen }) => renderRequestsScreen),
  };

  async function renderRoute({ scrollToTop = false, openRoot = false } = {}) {
    if (!active || !isCurrentGeneration()) return;
    stopScreen?.(); stopScreen = null;
    canLeaveScreen = () => true;
    const route = getAdminRoute(window.location.hash);
    app.innerHTML = shellView(route);
    app.querySelectorAll('[data-sign-out]').forEach((button) => button.addEventListener('click', onSignOut));
    const screen = await renderers[route]();
    if (!active || !isCurrentGeneration()) return;
    const result = await screen({ ...context, outlet: app.querySelector('[data-admin-outlet]'), openRoot });
    const cleanup = typeof result === 'function' ? result : result?.cleanup;
    if (!active || !isCurrentGeneration()) { cleanup?.(); return; }
    stopScreen = cleanup;
    canLeaveScreen = result?.canLeave || (() => true);
    if (scrollToTop) window.scrollTo({ top: 0, behavior: 'auto' });
  }

  const onHashChange = () => {
    const scrollToTop = scrollToTopOnNextRoute;
    const openRoot = openRootOnNextRoute;
    scrollToTopOnNextRoute = false;
    openRootOnNextRoute = false;
    renderRoute({ scrollToTop, openRoot });
  };
  window.addEventListener('hashchange', onHashChange);
  if (!window.location.hash) window.location.hash = '#inventario';
  else renderRoute();

  const onNavigationClick = (event) => {
    const link = event.target.closest('.admin-navigation__links a, .admin-mobile-menu__panel nav a, .admin-navigation__brand');
    if (!link) return;
    event.preventDefault();
    if (!canLeaveScreen()) return;
    const hash = link.getAttribute('href');
    scrollToTopOnNextRoute = true;
    if (window.location.hash === hash) renderRoute({ scrollToTop: true, openRoot: true });
    else { openRootOnNextRoute = true; window.location.hash = hash; }
  };
  app.addEventListener('click', onNavigationClick);

  return () => { active = false; stopScreen?.(); app.removeEventListener('click', onNavigationClick); window.removeEventListener('hashchange', onHashChange); };
}
