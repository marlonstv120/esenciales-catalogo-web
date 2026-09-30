import { loadFilteredCatalog, loadPublicCatalog, loadPublicProduct, refineCatalogRows } from './public-catalog.mjs';
import { addCartItem, emptyCart, loadCart, removeCartItem, revalidateCart, saveCart, toggleCartItemSelection, updateCartItemQuantity } from './public-cart.mjs';
import { hasCatalogFilters, parseCatalogFilters, removeCatalogFilter, serializeCatalogFilters, validateCatalogFilters } from './public-catalog-filters.mjs';
import { getPublicRoute } from './public-routes.mjs';
import { appPath } from './app-paths.mjs';
import { copDigits, formatCopInput, formatCopInputElement } from './cop-input.mjs';
import { applyPriceReview, clearPurchaseConfirmation, emptyRequestForm, loadPurchaseConfirmation, registerPurchaseRequest, savePurchaseConfirmation } from './public-purchase-request.mjs';
import { legalModalView, loadingView, presentationSelectorView, publicShellView, renderPublicRoute, toastView } from './public-views.mjs';

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
const focusable = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe';

export function startPublicCatalog({ app, client, route, windowRef = window, documentRef = document }) {
  let active = true; let requestId = 0; let currentRoute = route; let currentProduct = null; let baseRows = null; let lastFilteredRows = []; let filterPanelOpen = false; let cart = loadCart(windowRef.localStorage); let selectorProduct = null; let overlayTrigger = null; let legalModal = null; let cartState = { ready: false }; let requestForm = emptyRequestForm(); let requestState = { form: requestForm, errors: {}, error: null, busy: false, priceReview: null }; let attemptId = null; let confirmation = loadPurchaseConfirmation(windowRef.localStorage); let toastTimer = null;
  const announce = (message) => { const region = app.querySelector('.public-live-region'); if (region) region.textContent = message; };
  const setMetadata = (nextRoute, product) => { const metadata = getDocumentMetadata(nextRoute, product); documentRef.title = metadata.title; documentRef.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description); };
  const renderShell = (content, routeName = currentRoute.name) => {
    app.innerHTML = publicShellView(content, routeName, cart, legalModalView(legalModal)); attachImageFallbacks(app); app.querySelectorAll('[name="precioMinimo"], [name="precioMaximo"]').forEach(formatCopInputElement);
    const filterToggle = app.querySelector('[data-filter-toggle]'); const filterPanel = app.querySelector('[data-filter-panel]'); const filterTitle = filterPanel?.querySelector('h2');
    filterToggle?.setAttribute('aria-controls', 'catalog-filter-panel'); filterPanel?.setAttribute('id', 'catalog-filter-panel'); filterPanel?.setAttribute('role', 'dialog'); filterPanel?.setAttribute('aria-modal', 'true'); filterPanel?.setAttribute('aria-labelledby', 'catalog-filter-title'); filterTitle?.setAttribute('id', 'catalog-filter-title'); filterTitle?.setAttribute('tabindex', '-1');
    const menu = app.querySelector('.public-mobile-menu'); const trigger = menu?.querySelector('summary');
    menu?.addEventListener('toggle', () => {
      const open = menu.open;
      trigger?.setAttribute('aria-expanded', String(open));
      trigger?.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    });
    if (legalModal) queueMicrotask(() => app.querySelector('[data-legal-close]')?.focus());
  };
  const renderCart = () => renderShell(renderPublicRoute({ name: 'cart' }, { cart, cartState: { ...cartState, confirmation, requestState } }), 'cart');
  const renderCatalog = (filters, state = {}) => {
    renderShell(renderPublicRoute({ name: 'catalog' }, { catalogState: { baseRows: baseRows || [], filteredRows: lastFilteredRows, filters, panelOpen: filterPanelOpen, ...state } }), 'catalog');
  };
  const persistCart = () => { if (!saveCart(cart, windowRef.localStorage)) announce('El carrito se mantendrá durante esta sesión, pero no pudo guardarse en este navegador.'); };
  const showToast = (message) => {
    app.querySelector('[data-cart-toast]')?.remove();
    app.insertAdjacentHTML('beforeend', toastView(message));
    clearTimeout(toastTimer);
    toastTimer = (windowRef.setTimeout || setTimeout)(() => app.querySelector('[data-cart-toast]')?.remove(), 4000);
  };
  const closeOverlay = () => { const trigger = overlayTrigger; selectorProduct = null; filterPanelOpen = false; legalModal = null; overlayTrigger = null; if (currentRoute.name === 'catalog') renderCatalog(parseCatalogFilters(windowRef.location.search)); else if (currentRoute.name === 'cart') renderCart(); else renderRoute(currentRoute); queueMicrotask(() => trigger?.focus()); };
  const trapFocus = (event) => {
    if (event.key !== 'Tab') return;
    const overlay = app.querySelector('[data-presentation-selector], [data-filter-panel]:not([hidden]), [data-legal-modal-dialog]');
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
  const addPresentation = (product, presentationId, quantity = 1) => {
    const presentation = product.presentaciones?.find((item) => Number(item.id) === Number(presentationId)); const next = addCartItem(cart, product, presentation, quantity);
    if (next === cart) { announce('La cantidad seleccionada ya no está disponible para agregar.'); return; }
    cart = next; persistCart(); closeOverlay(); announce(`${product.nombre} fue añadido al carrito.`); showToast(`${product.nombre} se agregó al carrito.`);
  };
  const openPresentationSelector = async (productId, trigger) => {
    trigger.disabled = true; trigger.setAttribute('aria-busy', 'true');
    const result = await loadPublicProduct(client, productId); trigger.disabled = false; trigger.removeAttribute('aria-busy');
    if (result.error || !result.data) { announce('No fue posible consultar las presentaciones. Inténtalo de nuevo.'); return; }
    const available = result.data.presentaciones?.filter((item) => ['Disponible', 'Bajo pedido'].includes(item.estado)) || [];
    if (available.length === 1) { cart = addCartItem(cart, result.data, available[0]); persistCart(); renderCatalog(parseCatalogFilters(windowRef.location.search)); announce(`${result.data.nombre} fue añadido al carrito.`); showToast(`${result.data.nombre} se agregó al carrito.`); return; }
    if (!available.length) { announce('Este producto ya no tiene presentaciones disponibles para agregar.'); return; }
    selectorProduct = result.data; overlayTrigger = trigger; app.insertAdjacentHTML('beforeend', presentationSelectorView(result.data)); app.querySelector('[data-presentation-selector] button[data-presentation-close]')?.focus();
  };
  const renderRoute = async (nextRoute) => {
    currentRoute = nextRoute; const currentRequest = ++requestId; setMetadata(nextRoute);
    if (nextRoute.name === 'catalog') { loadCatalog(parseCatalogFilters(windowRef.location.search)); return; }
    if (nextRoute.name === 'cart') {
      currentProduct = null;
      if (confirmation) { renderCart(); return; }
      if (!cart.items.length) { cartState = { ready: false }; renderCart(); return; }
      cartState = { loading: true, ready: false }; renderCart();
      const checks = await Promise.all([...new Set(cart.items.map((item) => Number(item.productId)))].map(async (productId) => ({ productId, result: await loadPublicProduct(client, productId) })));
      if (!active || currentRequest !== requestId) return;
      if (checks.some(({ result }) => result.error)) { cartState = { error: 'No pudimos verificar la disponibilidad actual. Inténtalo de nuevo.', ready: false }; renderCart(); return; }
      const revalidated = revalidateCart(cart, new Map(checks.map(({ productId, result }) => [productId, result.data])));
      cart = revalidated.cart; persistCart(); cartState = revalidated; renderCart(); return;
    }
    if (nextRoute.name === 'not-found') { currentProduct = null; renderShell(renderPublicRoute(nextRoute, { cart }), nextRoute.name); return; }
    renderShell(loadingView(loadingLabel(nextRoute)), nextRoute.name); const result = nextRoute.name === 'product' ? await loadPublicProduct(client, nextRoute.productId) : await loadPublicCatalog(client);
    if (!active || currentRequest !== requestId) return; currentProduct = nextRoute.name === 'product' ? result.data : null; renderShell(renderPublicRoute(nextRoute, result), nextRoute.name); if (nextRoute.name === 'product' && result.data) setMetadata(nextRoute, result.data);
  };
  const onClick = (event) => {
    if ((selectorProduct || filterPanelOpen || legalModal) && !event.target.closest?.('[data-presentation-selector], [data-filter-panel], [data-filter-toggle], [data-legal-modal-dialog], [data-legal-modal]')) { closeOverlay(); return; }
    const legal = event.target.closest?.('[data-legal-modal]'); if (legal) { overlayTrigger = legal; legalModal = legal.dataset.legalModal; if (currentRoute.name === 'cart') renderCart(); else renderRoute(currentRoute); return; }
    if (event.target.closest?.('[data-legal-close]')) { closeOverlay(); return; }
    if (event.target.closest?.('[data-filter-toggle]')) { overlayTrigger = event.target.closest('[data-filter-toggle]'); if (filterPanelOpen) { closeOverlay(); return; } filterPanelOpen = true; renderCatalog(parseCatalogFilters(windowRef.location.search)); app.querySelector('[data-filter-panel] button')?.focus(); return; }
    if (event.target.closest?.('[data-filter-close], [data-presentation-close]')) { closeOverlay(); return; }
    const add = event.target.closest?.('[data-product-add]'); if (add) { openPresentationSelector(Number(add.dataset.productAdd), add); return; }
    const selected = event.target.closest?.('[data-presentation-add]'); if (selected && selectorProduct) { addPresentation(selectorProduct, selected.dataset.presentationAdd); return; }
    const remove = event.target.closest?.('[data-filter-remove]'); if (remove) { updateFilters(removeCatalogFilter(parseCatalogFilters(windowRef.location.search), remove.dataset.filterRemove, remove.dataset.filterValue)); return; }
    if (event.target.closest?.('[data-clear-search]')) { updateFilters({ ...parseCatalogFilters(windowRef.location.search), busqueda: '' }); return; }
    if (event.target.closest?.('[data-clear-filters]')) { filterPanelOpen = false; updateFilters(parseCatalogFilters('')); return; }
    const cartRemove = event.target.closest?.('[data-cart-remove]'); if (cartRemove) { cart = removeCartItem(cart, cartRemove.dataset.cartRemove); attemptId = null; requestState = { ...requestState, priceReview: null, error: null }; persistCart(); renderRoute(currentRoute); announce('Producto retirado del carrito.'); return; }
    const cartSelect = event.target.closest?.('[data-cart-select]'); if (cartSelect) { cart = toggleCartItemSelection(cart, cartSelect.dataset.cartSelect); attemptId = null; requestState = { ...requestState, priceReview: null, error: null }; persistCart(); renderCart(); return; }
    const cartQuantity = event.target.closest?.('[data-cart-quantity-change]'); if (cartQuantity) { const item = cart.items.find((current) => current.presentationId === Number(cartQuantity.dataset.cartQuantityChange)); const next = updateCartItemQuantity(cart, cartQuantity.dataset.cartQuantityChange, item.quantity + Number(cartQuantity.dataset.cartQuantityStep)); if (next === cart) return; cart = next; attemptId = null; requestState = { ...requestState, priceReview: null, error: null }; persistCart(); renderCart(); return; }
    const detailQuantity = event.target.closest?.('[data-detail-quantity-change]'); if (detailQuantity) { const input = app.querySelector('[data-detail-quantity]'); if (input) { input.value = String(Math.max(1, Math.min(Number(input.max), Number(input.value) + Number(detailQuantity.dataset.detailQuantityStep)))); const control = detailQuantity.closest('.quantity-control'); control?.querySelector('[data-quantity-value]')?.replaceChildren(input.value); control?.querySelectorAll('[data-detail-quantity-change]').forEach((button) => { button.disabled = Number(button.dataset.detailQuantityStep) < 0 ? Number(input.value) <= 1 : Number(input.value) >= Number(input.max); }); } return; }
    if (event.target.closest?.('[data-request-new]')) { clearPurchaseConfirmation(windowRef.localStorage); confirmation = null; requestForm = emptyRequestForm(); requestState = { form: requestForm, errors: {}, error: null, busy: false, priceReview: null }; attemptId = null; renderRoute(currentRoute); return; }
    const retry = event.target.closest?.('[data-public-retry]'); if (retry) { event.preventDefault(); if (currentRoute.name === 'catalog') loadCatalog(parseCatalogFilters(windowRef.location.search), { refreshBase: true }); else renderRoute(currentRoute); return; }
    const link = event.target.closest?.('a[href]'); if (!link) return; const target = new URL(link.href, windowRef.location.href);
    if (target.origin !== windowRef.location.origin || target.pathname === windowRef.location.pathname && target.hash) return; const nextRoute = getPublicRoute(target.pathname); if (nextRoute.name === 'admin' || nextRoute.name === 'not-found') return;
    event.preventDefault(); windowRef.history.pushState({}, '', `${target.pathname}${target.search}`); renderRoute(nextRoute);
  };
  const onSubmit = (event) => {
    if (event.target.matches?.('[data-catalog-form]')) { event.preventDefault(); filterPanelOpen = false; updateFilters(readFormFilters()); return; }
    if (event.target.matches?.('[data-request-form]')) {
      event.preventDefault();
      const data = new FormData(event.target);
      requestForm = { nombre: data.get('nombre'), telefono: data.get('telefono'), ciudad: data.get('ciudad'), observaciones: data.get('observaciones'), aceptaTerminos: data.get('aceptaTerminos') === 'on', aceptaPoliticaDatos: data.get('aceptaPoliticaDatos') === 'on' };
      requestState = { ...requestState, form: requestForm, errors: {}, error: null, busy: true };
      attemptId ||= globalThis.crypto?.randomUUID?.();
      if (!attemptId) { requestState = { ...requestState, busy: false, error: 'No fue posible iniciar el registro. Inténtalo de nuevo.' }; renderCart(); return; }
      renderCart();
      registerPurchaseRequest(client, attemptId, requestForm, cart).then((result) => {
        if (!active || currentRoute.name !== 'cart') return;
        if (result.errors && Object.keys(result.errors).length) { requestState = { ...requestState, busy: false, errors: result.errors }; renderCart(); queueMicrotask(() => app.querySelector('[data-request-form] input[aria-describedby]')?.focus()); return; }
        if (result.error) { requestState = { ...requestState, busy: false, error: result.error }; renderRoute(currentRoute); return; }
        if (result.data?.requiere_revision_precio) { cart = applyPriceReview(cart, result.data); persistCart(); requestState = { ...requestState, busy: false, priceReview: result.data }; cartState = { ...cartState, ready: true }; renderCart(); return; }
        confirmation = result.data; savePurchaseConfirmation(confirmation, windowRef.localStorage); cart = emptyCart(); persistCart(); requestState = { form: emptyRequestForm(), errors: {}, error: null, busy: false, priceReview: null }; attemptId = null; renderCart();
      }).catch(() => { if (!active || currentRoute.name !== 'cart') return; requestState = { ...requestState, busy: false, error: 'No fue posible registrar la solicitud. Inténtalo de nuevo.' }; renderCart(); });
      return;
    }
    if (!event.target.matches?.('[data-product-detail-form]')) return;
    event.preventDefault();
    const presentation = event.target.querySelector('[data-detail-presentation]:checked');
    const quantity = event.target.querySelector('[data-detail-quantity]');
    if (!currentProduct || !presentation || !quantity) { announce('Selecciona una presentación disponible.'); return; }
    addPresentation(currentProduct, presentation.dataset.detailPresentation, quantity.value);
  };
  const onInput = (event) => { if (event.target.matches?.('[name="precioMinimo"], [name="precioMaximo"]')) event.target.value = formatCopInput(event.target.value); if (event.target.closest?.('[data-request-form]')) { attemptId = null; requestState = { ...requestState, priceReview: null, error: null, errors: {} }; } };
  const onChange = (event) => {
    if (event.target.matches?.('[data-detail-presentation]')) {
      const quantity = app.querySelector('[data-detail-quantity]'); const maximum = Number(event.target.dataset.presentationMaximum);
      if (quantity) { quantity.max = String(maximum); if (Number(quantity.value) > maximum) quantity.value = String(maximum); }
      const control = app.querySelector('.public-detail-add .quantity-control');
      if (control && quantity) { control.querySelector('[data-quantity-value]')?.replaceChildren(quantity.value); control.querySelectorAll('[data-detail-quantity-change]').forEach((button) => { button.disabled = Number(button.dataset.detailQuantityStep) < 0 ? Number(quantity.value) <= 1 : Number(quantity.value) >= maximum; }); }
      return;
    }
    if (event.target.closest?.('[data-request-form]')) { attemptId = null; requestState = { ...requestState, priceReview: null, error: null, errors: {} }; }
    if (event.target.matches?.('[data-cart-quantity]')) { const next = updateCartItemQuantity(cart, event.target.dataset.cartQuantity, event.target.value); if (next === cart) { announce('La cantidad debe respetar la disponibilidad actual de esta presentación.'); return; } cart = next; attemptId = null; requestState = { ...requestState, priceReview: null, error: null }; persistCart(); renderRoute(currentRoute); announce('Cantidad actualizada.'); }
  };
  const onKeyDown = (event) => { if (event.key === 'Escape' && (selectorProduct || filterPanelOpen || legalModal)) { event.preventDefault(); closeOverlay(); } else trapFocus(event); };
  const onPopState = () => renderRoute(getPublicRoute(windowRef.location.pathname));
  app.addEventListener('click', onClick); app.addEventListener('submit', onSubmit); app.addEventListener('input', onInput); app.addEventListener('change', onChange); documentRef.addEventListener?.('keydown', onKeyDown); windowRef.addEventListener('popstate', onPopState); renderRoute(route);
  return () => { active = false; requestId += 1; app.removeEventListener('click', onClick); app.removeEventListener('submit', onSubmit); app.removeEventListener('input', onInput); app.removeEventListener('change', onChange); documentRef.removeEventListener?.('keydown', onKeyDown); windowRef.removeEventListener('popstate', onPopState); };
}
