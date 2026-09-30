import { loadFilteredCatalog, loadPublicCatalog, loadPublicProduct, refineCatalogRows } from './public-catalog.mjs';
import { addCartItem, emptyCart, loadCart, removeCartItem, saveCart, updateCartItemQuantity } from './public-cart.mjs';
import { hasCatalogFilters, parseCatalogFilters, removeCatalogFilter, serializeCatalogFilters, validateCatalogFilters } from './public-catalog-filters.mjs';
import { getPublicRoute } from './public-routes.mjs';
import { appPath } from './app-paths.mjs';
import { copDigits, formatCopInput, formatCopInputElement } from './cop-input.mjs';
import { loadingView, presentationSelectorView, publicShellView, renderPublicRoute } from './public-views.mjs';

export function getDocumentMetadata(route, product = null) {
  if (route.name === 'product' && product?.nombre) return { title: `${product.nombre} | ESENCIALES`, description: `Consulta presentaciones y disponibilidad de ${product.nombre}.` };
  if (route.name === 'catalog') return { title: 'Catálogo | ESENCIALES', description: 'Consulta el catálogo de productos de ESENCIALES.' };
  if (route.name === 'cart') return { title: 'Carrito | ESENCIALES', description: 'Presentaciones seleccionadas del catálogo de ESENCIALES.' };
  return { title: 'ESENCIALES | Catálogo de productos', description: 'Explora el catálogo de productos de ESENCIALES.' };
}

export function attachImageFallbacks(root) {
  root.querySelectorAll('[data-public-image]').forEach((image) => { image.onerror = () => { image.hidden = true; const fallback = image.parentElement.querySelector('[data-public-image-fallback]'); if (fallback) fallback.hidden = false; }; });
  root.querySelectorAll('[data-category-image]').forEach((image) => { image.onerror = () => { image.hidden = true; }; });
}

const loadingLabel = (route) => route.name === 'product' ? 'Cargando producto...' : 'Cargando catálogo...';
const focusable = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled])';

export function startPublicCatalog({ app, client, route, windowRef = window, documentRef = document }) {
  let active = true; let requestId = 0; let currentRoute = route; let baseRows = null; let lastFilteredRows = []; let filterPanelOpen = false; let cart = loadCart(windowRef.localStorage); let selectorProduct = null; let overlayTrigger = null;
  const announce = (message) => { const region = app.querySelector('.public-live-region'); if (region) region.textContent = message; };
  const setMetadata = (nextRoute, product) => { const metadata = getDocumentMetadata(nextRoute, product); documentRef.title = metadata.title; documentRef.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description); };
  const renderShell = (content, routeName = currentRoute.name) => {
    app.innerHTML = publicShellView(content, routeName, cart); attachImageFallbacks(app); app.querySelectorAll('[name="precioMinimo"], [name="precioMaximo"]').forEach(formatCopInputElement);
    const menu = app.querySelector('.public-mobile-menu'); const trigger = menu?.querySelector('summary');
    menu?.addEventListener('toggle', () => {
      const open = menu.open;
      trigger?.setAttribute('aria-expanded', String(open));
      trigger?.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    });
  };
  const renderCatalog = (filters, state = {}) => {
    renderShell(renderPublicRoute({ name: 'catalog' }, { catalogState: { baseRows: baseRows || [], filteredRows: lastFilteredRows, filters, panelOpen: filterPanelOpen, ...state } }), 'catalog');
  };
  const persistCart = () => { if (!saveCart(cart, windowRef.localStorage)) announce('El carrito se mantendrá durante esta sesión, pero no pudo guardarse en este navegador.'); };
  const closeOverlay = () => { const trigger = overlayTrigger; selectorProduct = null; filterPanelOpen = false; overlayTrigger = null; if (currentRoute.name === 'catalog') renderCatalog(parseCatalogFilters(windowRef.location.search)); else renderRoute(currentRoute); queueMicrotask(() => trigger?.focus()); };
  const trapFocus = (event) => {
    if (event.key !== 'Tab') return;
    const overlay = app.querySelector('[data-presentation-selector], [data-filter-panel]:not([hidden])');
    if (!overlay) return;
    const controls = [...overlay.querySelectorAll(focusable)]; if (!controls.length) return;
    const first = controls[0]; const last = controls.at(-1);
    if (event.shiftKey && documentRef.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && documentRef.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  const loadCatalog = async (filters, { refreshBase = false } = {}) => {
    const validation = validateCatalogFilters(filters); if (validation) { renderCatalog(filters, { validation }); return; }
    const currentRequest = ++requestId; if (refreshBase) baseRows = null; renderCatalog(filters, { loading: true });
    const base = baseRows === null ? await loadPublicCatalog(client) : { data: baseRows, error: null };
    if (!active || currentRequest !== requestId) return; if (base.error) { renderCatalog(filters, { error: base.error }); return; }
    baseRows = base.data; const remote = hasCatalogFilters({ ...filters, disponibilidades: [], orden: 'destacados' }) ? await loadFilteredCatalog(client, filters) : base;
    if (!active || currentRequest !== requestId) return;
    if (!remote.error) lastFilteredRows = refineCatalogRows(remote.data, filters);
    renderCatalog(filters, remote.error ? { error: remote.error } : {});
  };
  const updateFilters = (filters) => {
    const validation = validateCatalogFilters(filters); if (validation) { renderCatalog(filters, { validation }); return; }
    const query = serializeCatalogFilters(filters); windowRef.history.pushState({}, '', appPath(`/catalogo${query ? `?${query}` : ''}`)); loadCatalog(filters);
  };
  const readFormFilters = () => {
    const data = new FormData(app.querySelector('[data-catalog-form]'));
    return { busqueda: String(data.get('busqueda') || '').trim(), categoria: data.get('categoria') ? Number(data.get('categoria')) : null, disponibilidades: data.getAll('disponibilidades'), generos: data.getAll('generos'), clasificaciones: data.getAll('clasificaciones'), precioMinimo: copDigits(data.get('precioMinimo')), precioMaximo: copDigits(data.get('precioMaximo')), orden: 'destacados' };
  };
  const addPresentation = (product, presentationId) => {
    const presentation = product.presentaciones?.find((item) => Number(item.id) === Number(presentationId)); const next = addCartItem(cart, product, presentation);
    if (next === cart) { announce('Esta presentación ya no está disponible para agregar.'); return; }
    cart = next; persistCart(); closeOverlay(); announce(`${product.nombre} fue añadido al carrito.`);
  };
  const openPresentationSelector = async (productId, trigger) => {
    trigger.disabled = true; trigger.setAttribute('aria-busy', 'true');
    const result = await loadPublicProduct(client, productId); trigger.disabled = false; trigger.removeAttribute('aria-busy');
    if (result.error || !result.data) { announce('No fue posible consultar las presentaciones. Inténtalo de nuevo.'); return; }
    const available = result.data.presentaciones?.filter((item) => ['Disponible', 'Bajo pedido'].includes(item.estado)) || [];
    if (available.length === 1) { cart = addCartItem(cart, result.data, available[0]); persistCart(); renderCatalog(parseCatalogFilters(windowRef.location.search)); announce(`${result.data.nombre} fue añadido al carrito.`); return; }
    if (!available.length) { announce('Este producto ya no tiene presentaciones disponibles para agregar.'); return; }
    selectorProduct = result.data; overlayTrigger = trigger; app.insertAdjacentHTML('beforeend', presentationSelectorView(result.data)); app.querySelector('[data-presentation-selector] button[data-presentation-close]')?.focus();
  };
  const renderRoute = async (nextRoute) => {
    currentRoute = nextRoute; const currentRequest = ++requestId; setMetadata(nextRoute);
    if (nextRoute.name === 'catalog') { loadCatalog(parseCatalogFilters(windowRef.location.search)); return; }
    if (nextRoute.name === 'cart' || nextRoute.name === 'not-found') { renderShell(renderPublicRoute(nextRoute, { cart }), nextRoute.name); return; }
    renderShell(loadingView(loadingLabel(nextRoute)), nextRoute.name); const result = nextRoute.name === 'product' ? await loadPublicProduct(client, nextRoute.productId) : await loadPublicCatalog(client);
    if (!active || currentRequest !== requestId) return; renderShell(renderPublicRoute(nextRoute, result), nextRoute.name); if (nextRoute.name === 'product' && result.data) setMetadata(nextRoute, result.data);
  };
  const onClick = (event) => {
    if ((selectorProduct || filterPanelOpen) && !event.target.closest?.('[data-presentation-selector], [data-filter-panel], [data-filter-toggle]')) { closeOverlay(); return; }
    if (event.target.closest?.('[data-filter-toggle]')) { overlayTrigger = event.target.closest('[data-filter-toggle]'); filterPanelOpen = true; renderCatalog(parseCatalogFilters(windowRef.location.search)); app.querySelector('[data-filter-panel] button')?.focus(); return; }
    if (event.target.closest?.('[data-filter-close], [data-presentation-close]')) { closeOverlay(); return; }
    const add = event.target.closest?.('[data-product-add]'); if (add) { openPresentationSelector(Number(add.dataset.productAdd), add); return; }
    const selected = event.target.closest?.('[data-presentation-add]'); if (selected && selectorProduct) { addPresentation(selectorProduct, selected.dataset.presentationAdd); return; }
    const remove = event.target.closest?.('[data-filter-remove]'); if (remove) { updateFilters(removeCatalogFilter(parseCatalogFilters(windowRef.location.search), remove.dataset.filterRemove, remove.dataset.filterValue)); return; }
    if (event.target.closest?.('[data-clear-search]')) { updateFilters({ ...parseCatalogFilters(windowRef.location.search), busqueda: '' }); return; }
    if (event.target.closest?.('[data-clear-filters]')) { filterPanelOpen = false; updateFilters(parseCatalogFilters('')); return; }
    const cartRemove = event.target.closest?.('[data-cart-remove]'); if (cartRemove) { cart = removeCartItem(cart, cartRemove.dataset.cartRemove); persistCart(); renderRoute(currentRoute); announce('Producto retirado del carrito.'); return; }
    const retry = event.target.closest?.('[data-public-retry]'); if (retry) { event.preventDefault(); if (currentRoute.name === 'catalog') loadCatalog(parseCatalogFilters(windowRef.location.search), { refreshBase: true }); else renderRoute(currentRoute); return; }
    const link = event.target.closest?.('a[href]'); if (!link) return; const target = new URL(link.href, windowRef.location.href);
    if (target.origin !== windowRef.location.origin || target.pathname === windowRef.location.pathname && target.hash) return; const nextRoute = getPublicRoute(target.pathname); if (nextRoute.name === 'admin' || nextRoute.name === 'not-found') return;
    event.preventDefault(); windowRef.history.pushState({}, '', `${target.pathname}${target.search}`); renderRoute(nextRoute);
  };
  const onSubmit = (event) => { if (!event.target.matches?.('[data-catalog-form]')) return; event.preventDefault(); filterPanelOpen = false; updateFilters(readFormFilters()); };
  const onInput = (event) => { if (event.target.matches?.('[name="precioMinimo"], [name="precioMaximo"]')) event.target.value = formatCopInput(event.target.value); };
  const onChange = (event) => { if (event.target.matches?.('[data-cart-quantity]')) { cart = updateCartItemQuantity(cart, event.target.dataset.cartQuantity, event.target.value); persistCart(); renderRoute(currentRoute); announce('Cantidad actualizada.'); } };
  const onKeyDown = (event) => { if (event.key === 'Escape' && (selectorProduct || filterPanelOpen)) { event.preventDefault(); closeOverlay(); } else trapFocus(event); };
  const onPopState = () => renderRoute(getPublicRoute(windowRef.location.pathname));
  app.addEventListener('click', onClick); app.addEventListener('submit', onSubmit); app.addEventListener('input', onInput); app.addEventListener('change', onChange); documentRef.addEventListener?.('keydown', onKeyDown); windowRef.addEventListener('popstate', onPopState); renderRoute(route);
  return () => { active = false; requestId += 1; app.removeEventListener('click', onClick); app.removeEventListener('submit', onSubmit); app.removeEventListener('input', onInput); app.removeEventListener('change', onChange); documentRef.removeEventListener?.('keydown', onKeyDown); windowRef.removeEventListener('popstate', onPopState); };
}
