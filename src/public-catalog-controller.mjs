import { loadFilteredCatalog, loadPublicCatalog, loadPublicProduct, refineCatalogRows } from './public-catalog.mjs';
import { addCartItem, loadCart, removeCartItem, removeSelectedCartItems, revalidateCart, saveCart, selectedCartIsReady, toggleCartItemSelection, updateCartItemQuantity } from './public-cart.mjs';
import { hasCatalogFilters, parseCatalogFilters, removeCatalogFilter, serializeCatalogFilters, validateCatalogFilters } from './public-catalog-filters.mjs';
import { getPublicRoute } from './public-routes.mjs';
import { appPath } from './app-paths.mjs';
import { copDigits, formatCopInput, formatCopInputElement } from './cop-input.mjs';
import { createDraftSaver } from './form-drafts.mjs';
import { showNotification } from './notifications.mjs';
import { applyPriceReview, clearPurchaseConfirmation, emptyRequestForm, loadPurchaseRequestDraft, purchaseRequestDraftMetadata, registerPurchaseRequest } from './public-purchase-request.mjs';
import { loadPublicPurchaseRequest, loadPurchaseRequestAccess, publicRequestUrl, savePurchaseRequestAccess, submitPaymentProof, tokenFromLocation } from './public-payment.mjs';
import { cartDrawerView, legalModalView, loadingView, mobileMenuDrawerView, presentationSelectorView, publicShellView, renderPublicRoute } from './public-views.mjs';
import { startPublicHeaderScroll } from './public-header-scroll.mjs';

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
  const requestDraft = createDraftSaver(windowRef.sessionStorage, purchaseRequestDraftMetadata().key, purchaseRequestDraftMetadata());
  const restoredRequestForm = loadPurchaseRequestDraft(windowRef.sessionStorage);
  let active = true; let requestId = 0; let cartValidationId = 0; let currentRoute = route; let currentProduct = null; let baseRows = null; let lastFilteredRows = []; let filterPanelOpen = false; let cart = loadCart(windowRef.localStorage); let selectorProduct = null; let overlayTrigger = null; let legalModal = null; let cartDrawerState = { open: false, step: 'cart', error: null }; let cartDrawerNeedsFocus = false; let cartState = { ready: false }; let requestForm = restoredRequestForm || emptyRequestForm(); let requestState = { form: requestForm, errors: {}, error: null, busy: false, priceReview: null }; let attemptId = null; let confirmation = null; let paymentRequest = null; let paymentState = { step: 'summary', file: null, busy: false, error: null }; let mobileMenuOpen = false; let previousBodyOverflow = ''; let pageScrollLocked = false; let touchStartY = null;
  clearPurchaseConfirmation(windowRef.localStorage);
  const announce = (message) => { const region = app.querySelector('.public-live-region'); if (region) region.textContent = message; };
  const syncFooterSections = () => { const desktop = windowRef.matchMedia?.('(min-width: 64rem)').matches ?? Number(windowRef.innerWidth) >= 1024; app.querySelectorAll('[data-footer-section]').forEach((section) => { section.open = desktop; const summary = section.querySelector('summary'); if (summary) summary.tabIndex = desktop ? -1 : 0; }); };
  const setPageScrollLocked = (locked) => {
    const body = documentRef.body;
    if (!body?.style || locked === pageScrollLocked) return;
    if (locked) { previousBodyOverflow = body.style.overflow; body.style.overflow = 'hidden'; }
    else body.style.overflow = previousBodyOverflow;
    pageScrollLocked = locked;
  };
  const syncPageScrollLock = () => setPageScrollLocked(Boolean(mobileMenuOpen || cartDrawerState.open || selectorProduct || filterPanelOpen || legalModal));
  const closeMobileMenu = ({ focusTrigger = false } = {}) => {
    if (!mobileMenuOpen) return;
    mobileMenuOpen = false;
    app.querySelector('[data-mobile-menu-drawer]')?.remove();
    const trigger = app.querySelector('[data-mobile-menu-toggle]');
    trigger?.setAttribute('aria-expanded', 'false');
    trigger?.setAttribute('aria-label', 'Abrir menú de navegación');
    if (focusTrigger) queueMicrotask(() => trigger?.focus());
    syncPageScrollLock();
  };
  const openMobileMenu = () => {
    if (mobileMenuOpen || cartDrawerState.open) return;
    mobileMenuOpen = true;
    app.insertAdjacentHTML('beforeend', mobileMenuDrawerView(currentRoute.name));
    const trigger = app.querySelector('[data-mobile-menu-toggle]');
    trigger?.setAttribute('aria-expanded', 'true');
    trigger?.setAttribute('aria-label', 'Cerrar menú de navegación');
    queueMicrotask(() => app.querySelector('[data-mobile-menu-close]')?.focus());
    syncPageScrollLock();
  };
  const setMetadata = (nextRoute, product) => { const metadata = getDocumentMetadata(nextRoute, product); documentRef.title = metadata.title; documentRef.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description); };
  const renderShell = (content, routeName = currentRoute.name) => {
    closeMobileMenu();
    app.innerHTML = publicShellView(content, routeName, cart, legalModalView(legalModal), cartDrawerView(cart, { ...cartDrawerState, cartState, requestState, confirmation })); syncFooterSections(); attachImageFallbacks(app); app.querySelectorAll('[name="precioMinimo"], [name="precioMaximo"]').forEach(formatCopInputElement);
    const filterToggle = app.querySelector('[data-filter-toggle]'); const filterPanel = app.querySelector('[data-filter-panel]'); const filterTitle = filterPanel?.querySelector('h2');
    filterToggle?.setAttribute('aria-controls', 'catalog-filter-panel'); filterPanel?.setAttribute('id', 'catalog-filter-panel'); filterPanel?.setAttribute('role', 'dialog'); filterPanel?.setAttribute('aria-modal', 'true'); filterPanel?.setAttribute('aria-labelledby', 'catalog-filter-title'); filterTitle?.setAttribute('id', 'catalog-filter-title'); filterTitle?.setAttribute('tabindex', '-1');
    if (legalModal) queueMicrotask(() => app.querySelector('[data-legal-close]')?.focus());
    if (cartDrawerNeedsFocus) { cartDrawerNeedsFocus = false; queueMicrotask(() => app.querySelector('[data-cart-drawer-close]')?.focus()); }
    syncPageScrollLock();
  };
  const renderCart = () => renderShell(renderPublicRoute({ name: 'cart' }, { cart, cartState: { ...cartState, confirmation, requestState } }), 'cart');
  const renderPaymentRequest = () => renderShell(renderPublicRoute(currentRoute, { data: paymentRequest, paymentState }), 'request');
  const renderCatalog = (filters, state = {}) => {
    renderShell(renderPublicRoute({ name: 'catalog' }, { catalogState: { baseRows: baseRows || [], filteredRows: lastFilteredRows, filters, panelOpen: filterPanelOpen, ...state } }), 'catalog');
  };
  const persistCart = () => { if (!saveCart(cart, windowRef.localStorage)) announce('El carrito se mantendrá durante esta sesión, pero no pudo guardarse en este navegador.'); };
  const dismissConfirmation = () => { confirmation = null; clearPurchaseConfirmation(windowRef.localStorage); cartDrawerState = { ...cartDrawerState, step: 'cart' }; };
  const closeCartDrawer = ({ focusTrigger = false } = {}) => {
    if (!cartDrawerState.open) return;
    dismissConfirmation();
    cartDrawerState = { ...cartDrawerState, open: false };
    app.querySelector('[data-cart-drawer]')?.remove();
    const trigger = overlayTrigger;
    overlayTrigger = null;
    syncPageScrollLock();
    if (focusTrigger) queueMicrotask(() => trigger?.focus());
  };
  const showToast = (message, tone = 'success') => showNotification(message, { tone, documentRef });
  const closeOverlay = () => { const trigger = overlayTrigger; selectorProduct = null; filterPanelOpen = false; legalModal = null; overlayTrigger = null; syncPageScrollLock(); if (currentRoute.name === 'catalog') renderCatalog(parseCatalogFilters(windowRef.location.search)); else if (currentRoute.name === 'cart') renderCart(); else renderRoute(currentRoute); queueMicrotask(() => trigger?.focus()); };
  const trapFocus = (event) => {
    if (event.key !== 'Tab') return;
    const overlay = app.querySelector('[data-mobile-menu-drawer], [data-presentation-selector], [data-filter-panel]:not([hidden]), [data-legal-modal-dialog], [data-cart-drawer]');
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
  const accessFor = (code) => {
    if (confirmation?.codigo === code && confirmation?.token_cliente) return { codigo: code, token: confirmation.token_cliente };
    const token = tokenFromLocation(windowRef.location);
    return token ? { codigo: code, token } : loadPurchaseRequestAccess(code, windowRef.localStorage);
  };
  const loadPaymentRequest = async (code, { drawer = false } = {}) => {
    const access = accessFor(code);
    if (!access) { announce('No encontramos el acceso seguro para esta solicitud.'); return; }
    const result = await loadPublicPurchaseRequest(client, code, access.token);
    if (!active || result.error || !result.data) {
      paymentState = { ...paymentState, error: result.error || 'No pudimos cargar el pago.' };
      if (drawer) { cartDrawerState = { ...cartDrawerState, paymentState }; renderDrawer(); } else renderPaymentRequest();
      return;
    }
    paymentRequest = result.data;
    paymentState = { ...paymentState, error: null };
    if (drawer) { cartDrawerState = { ...cartDrawerState, step: 'payment', paymentRequest, paymentState }; renderDrawer(); } else renderPaymentRequest();
  };
  const openPresentationSelector = async (productId, trigger) => {
    trigger.disabled = true; trigger.setAttribute('aria-busy', 'true');
    const result = await loadPublicProduct(client, productId); trigger.disabled = false; trigger.removeAttribute('aria-busy');
    if (result.error || !result.data) { announce('No fue posible consultar las presentaciones. Inténtalo de nuevo.'); return; }
    const available = result.data.presentaciones?.filter((item) => ['Disponible', 'Bajo pedido'].includes(item.estado)) || [];
    if (available.length === 1) { cart = addCartItem(cart, result.data, available[0]); persistCart(); renderRoute(currentRoute); announce(`${result.data.nombre} fue añadido al carrito.`); showToast(`${result.data.nombre} se agregó al carrito.`); return; }
    if (!available.length) { announce('Este producto ya no tiene presentaciones disponibles para agregar.'); return; }
    selectorProduct = result.data; overlayTrigger = trigger; app.insertAdjacentHTML('beforeend', presentationSelectorView(result.data)); syncPageScrollLock(); app.querySelector('[data-presentation-selector] button[data-presentation-close]')?.focus();
  };
  const renderRoute = async (nextRoute, { scrollToTop = false } = {}) => {
    closeMobileMenu();
    if (scrollToTop) windowRef.scrollTo?.({ top: 0, behavior: 'auto' });
    currentRoute = nextRoute; const currentRequest = ++requestId; setMetadata(nextRoute);
    if (nextRoute.name === 'catalog') { loadCatalog(parseCatalogFilters(windowRef.location.search)); return; }
    if (nextRoute.name === 'request') {
      currentProduct = null;
      const access = accessFor(nextRoute.code);
      if (!access) { renderShell(renderPublicRoute(nextRoute, { error: 'No encontramos un acceso seguro para esta solicitud en este navegador.' }), 'request'); return; }
      renderShell(loadingView('Cargando solicitud...'), 'request');
      const result = await loadPublicPurchaseRequest(client, nextRoute.code, access.token);
      if (!active || currentRequest !== requestId) return;
      paymentRequest = result.data;
      paymentState = { ...paymentState, step: 'summary', error: result.error };
      renderPaymentRequest();
      return;
    }
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
  const syncDetailQuantity = (input, nextValue = input?.value) => {
    if (!input) return;
    const maximum = Number(input.max);
    const digits = String(nextValue).replace(/\D/g, '');
    const quantity = Math.max(1, Math.min(maximum, Number(digits) || 1));
    input.value = String(quantity);
    input.closest('.quantity-control')?.querySelectorAll('[data-detail-quantity-change]').forEach((button) => {
      button.disabled = Number(button.dataset.detailQuantityStep) < 0 ? quantity <= 1 : quantity >= maximum;
    });
  };
  const revalidateDrawerCart = async () => {
    if (!cartDrawerState.open || confirmation || !cart.items.length) return;
    const validationId = ++cartValidationId;
    cartState = { loading: true, ready: false };
    renderDrawer();
    const checks = await Promise.all([...new Set(cart.items.map((item) => Number(item.productId)))].map(async (productId) => ({ productId, result: await loadPublicProduct(client, productId) })));
    if (!active || validationId !== cartValidationId || !cartDrawerState.open) return;
    if (checks.some(({ result }) => result.error)) { cartState = { error: 'No pudimos verificar la disponibilidad actual. Inténtalo de nuevo.', ready: false }; renderDrawer(); return; }
    const revalidated = revalidateCart(cart, new Map(checks.map(({ productId, result }) => [productId, result.data])));
    cart = revalidated.cart;
    persistCart();
    cartState = revalidated;
    renderDrawer();
  };
  const onClick = (event) => {
    const mobileMenuToggle = event.target.closest?.('[data-mobile-menu-toggle]');
    if (mobileMenuToggle) { if (mobileMenuOpen) closeMobileMenu({ focusTrigger: true }); else openMobileMenu(); return; }
    if (mobileMenuOpen && event.target.closest?.('[data-mobile-menu-close]')) { closeMobileMenu({ focusTrigger: true }); return; }
    const cartDrawerOpenTrigger = event.target.closest?.('[data-cart-drawer-open]');
    if (cartDrawerOpenTrigger) { closeMobileMenu(); cartDrawerState = { open: true, step: confirmation ? 'confirmation' : 'cart', error: null }; cartDrawerNeedsFocus = true; overlayTrigger = cartDrawerOpenTrigger; renderDrawer(); revalidateDrawerCart(); return; }
    if (cartDrawerState.open && event.target.closest?.('[data-cart-drawer-close]')) { closeCartDrawer({ focusTrigger: true }); return; }
    if (cartDrawerState.open && event.target.closest?.('[data-cart-drawer-back]')) { cartDrawerState = { ...cartDrawerState, step: cartDrawerState.step === 'payment' ? 'confirmation' : 'cart', error: null }; renderDrawer(); return; }
    if (cartDrawerState.open && event.target.closest?.('[data-cart-drawer-continue]')) { cartDrawerState = { ...cartDrawerState, step: 'form', error: null }; renderDrawer(); return; }
    if ((selectorProduct || filterPanelOpen || legalModal) && !event.target.closest?.('[data-presentation-selector], [data-filter-panel], [data-filter-toggle], [data-legal-modal-dialog], [data-legal-modal]')) { closeOverlay(); return; }
    const legal = event.target.closest?.('[data-legal-modal]'); if (legal) { overlayTrigger = legal; legalModal = legal.dataset.legalModal; if (currentRoute.name === 'cart') renderCart(); else renderRoute(currentRoute); return; }
    if (event.target.closest?.('[data-legal-close]')) { closeOverlay(); return; }
    if (event.target.closest?.('[data-filter-toggle]')) { overlayTrigger = event.target.closest('[data-filter-toggle]'); if (filterPanelOpen) { closeOverlay(); return; } filterPanelOpen = true; renderCatalog(parseCatalogFilters(windowRef.location.search)); app.querySelector('[data-filter-panel] button')?.focus(); return; }
    if (event.target.closest?.('[data-filter-close], [data-presentation-close]')) { closeOverlay(); return; }
    const add = event.target.closest?.('[data-product-add]'); if (add) { openPresentationSelector(Number(add.dataset.productAdd), add); return; }
    const galleryImage = event.target.closest?.('[data-product-gallery-image]'); if (galleryImage) { const main = app.querySelector('[data-public-image]'); if (main) { main.src = galleryImage.dataset.galleryUrl; main.alt = galleryImage.dataset.galleryAlt; main.hidden = false; main.parentElement.querySelector('[data-public-image-fallback]')?.setAttribute('hidden', ''); app.querySelectorAll('[data-product-gallery-image]').forEach((button) => button.setAttribute('aria-pressed', String(button === galleryImage))); } return; }
    const selected = event.target.closest?.('[data-presentation-add]'); if (selected && selectorProduct) { addPresentation(selectorProduct, selected.dataset.presentationAdd); return; }
    const remove = event.target.closest?.('[data-filter-remove]'); if (remove) { updateFilters(removeCatalogFilter(parseCatalogFilters(windowRef.location.search), remove.dataset.filterRemove, remove.dataset.filterValue)); return; }
    if (event.target.closest?.('[data-clear-search]')) { updateFilters({ ...parseCatalogFilters(windowRef.location.search), busqueda: '' }); return; }
    if (event.target.closest?.('[data-clear-filters]')) { filterPanelOpen = false; updateFilters(parseCatalogFilters('')); return; }
    const cartRemove = event.target.closest?.('[data-cart-remove]'); if (cartRemove) { cart = removeCartItem(cart, cartRemove.dataset.cartRemove); attemptId = null; requestState = { ...requestState, priceReview: null, error: null }; cartDrawerState = { ...cartDrawerState, error: null }; persistCart(); if (cartDrawerState.open) renderDrawer(); else renderRoute(currentRoute); announce('Producto retirado del carrito.'); return; }
    const cartSelect = event.target.closest?.('[data-cart-select]'); if (cartSelect) { cart = toggleCartItemSelection(cart, cartSelect.dataset.cartSelect); cartState = { ...cartState, ready: selectedCartIsReady(cart) }; attemptId = null; requestState = { ...requestState, priceReview: null, error: null }; persistCart(); if (cartDrawerState.open) renderDrawer(); else renderCart(); return; }
    const cartQuantity = event.target.closest?.('[data-cart-quantity-change]'); if (cartQuantity) { const item = cart.items.find((current) => current.presentationId === Number(cartQuantity.dataset.cartQuantityChange)); const next = item && updateCartItemQuantity(cart, cartQuantity.dataset.cartQuantityChange, item.quantity + Number(cartQuantity.dataset.cartQuantityStep)); if (!next || next === cart) { if (cartDrawerState.open) { cartDrawerState = { ...cartDrawerState, error: 'La cantidad debe respetar la disponibilidad actual de esta presentación.' }; renderDrawer(); } return; } cart = next; attemptId = null; requestState = { ...requestState, priceReview: null, error: null }; cartDrawerState = { ...cartDrawerState, error: null }; persistCart(); if (cartDrawerState.open) renderDrawer(); else renderCart(); return; }
    const detailQuantity = event.target.closest?.('[data-detail-quantity-change]'); if (detailQuantity) { const input = app.querySelector('[data-detail-quantity]'); syncDetailQuantity(input, Number(input?.value) + Number(detailQuantity.dataset.detailQuantityStep)); return; }
    if (event.target.closest?.('[data-request-new]')) { clearPurchaseConfirmation(windowRef.localStorage); requestDraft.clear(); confirmation = null; requestForm = emptyRequestForm(); requestState = { form: requestForm, errors: {}, error: null, busy: false, priceReview: null }; attemptId = null; if (cartDrawerState.open) { cartDrawerState = { ...cartDrawerState, step: 'cart' }; renderDrawer(); } else renderRoute(currentRoute); return; }
    if (event.target.closest?.('[data-payment-start]')) { paymentState = { step: 'payment', file: null, busy: false, error: null }; const code = confirmation?.codigo || currentRoute.code; if (cartDrawerState.open) loadPaymentRequest(code, { drawer: true }); else loadPaymentRequest(code); return; }
    const copyCode = event.target.closest?.('[data-confirmation-copy]');
    if (copyCode) { const value = copyCode.dataset.confirmationCopy; const clipboard = windowRef.navigator?.clipboard; if (!value || !clipboard?.writeText) { announce('No fue posible copiar el código.'); return; } clipboard.writeText(value).then(() => showToast('Código de solicitud copiado.')).catch(() => announce('No fue posible copiar el código.')); return; }
    const copyPaymentKey = event.target.closest?.('[data-payment-copy-key]');
    if (copyPaymentKey) { const value = copyPaymentKey.dataset.paymentCopyKey; const clipboard = windowRef.navigator?.clipboard; if (value && clipboard?.writeText) clipboard.writeText(value).then(() => showToast('Llave copiada.')).catch(() => announce('No fue posible copiar la llave.')); return; }
    if (event.target.closest?.('[data-payment-proof-clear]')) { paymentState = { ...paymentState, file: null, error: null }; if (cartDrawerState.open) { cartDrawerState = { ...cartDrawerState, paymentState }; renderDrawer(); } else renderPaymentRequest(); return; }
    if (cartDrawerState.open && event.target.closest?.('[data-confirmation-continue]')) closeCartDrawer();
    const retry = event.target.closest?.('[data-public-retry]'); if (retry) { event.preventDefault(); if (currentRoute.name === 'catalog') loadCatalog(parseCatalogFilters(windowRef.location.search), { refreshBase: true }); else renderRoute(currentRoute); return; }
    const link = event.target.closest?.('a[href]'); if (!link) return; if (mobileMenuOpen && link.closest?.('[data-mobile-menu-drawer]')) closeMobileMenu(); const target = new URL(link.href, windowRef.location.href);
    if (target.origin !== windowRef.location.origin || target.pathname === windowRef.location.pathname && target.hash) return; if (cartDrawerState.open && link.closest?.('[data-cart-drawer]')) closeCartDrawer(); const nextRoute = getPublicRoute(target.pathname); if (nextRoute.name === 'admin' || nextRoute.name === 'not-found') return;
    event.preventDefault(); windowRef.history.pushState({}, '', `${target.pathname}${target.search}`); renderRoute(nextRoute, { scrollToTop: true });
  };
  const onSubmit = (event) => {
    if (event.target.matches?.('[data-catalog-form]')) { event.preventDefault(); filterPanelOpen = false; updateFilters(readFormFilters()); return; }
    if (event.target.matches?.('[data-request-form]')) {
      event.preventDefault();
      const data = new FormData(event.target);
      requestForm = { nombre: data.get('nombre'), telefono: data.get('telefono'), ciudad: data.get('ciudad'), observaciones: data.get('observaciones'), aceptaTerminos: data.get('aceptaTerminos') === 'on', aceptaPoliticaDatos: data.get('aceptaPoliticaDatos') === 'on' };
      requestState = { ...requestState, form: requestForm, errors: {}, error: null, busy: true };
      attemptId ||= globalThis.crypto?.randomUUID?.();
      if (!attemptId) { requestState = { ...requestState, busy: false, error: 'No fue posible iniciar el registro. Inténtalo de nuevo.' }; renderRequestSurface(); return; }
      renderRequestSurface();
      registerPurchaseRequest(client, attemptId, requestForm, cart).then((result) => {
        if (!active) return;
        if (result.errors && Object.keys(result.errors).length) { requestState = { ...requestState, busy: false, errors: result.errors }; renderRequestSurface(); queueMicrotask(() => app.querySelector('[data-request-form] [aria-invalid="true"]')?.focus()); return; }
        if (result.error) { requestState = { ...requestState, busy: false, error: result.error }; renderRequestSurface(); return; }
        if (result.data?.requiere_revision_precio) { cart = applyPriceReview(cart, result.data); persistCart(); requestState = { ...requestState, busy: false, priceReview: result.data }; cartState = { ...cartState, ready: true }; renderRequestSurface(); return; }
        confirmation = result.data; savePurchaseRequestAccess(confirmation, windowRef.localStorage); requestDraft.clear(); cart = removeSelectedCartItems(cart); persistCart(); cartState = { ready: false }; requestState = { form: emptyRequestForm(), errors: {}, error: null, busy: false, priceReview: null }; attemptId = null; if (cartDrawerState.open) cartDrawerState = { ...cartDrawerState, step: 'confirmation' }; renderRequestSurface();
      }).catch(() => { if (!active) return; requestState = { ...requestState, busy: false, error: 'No fue posible registrar la solicitud. Inténtalo de nuevo.' }; renderRequestSurface(); });
      return;
    }
    if (event.target.matches?.('[data-payment-proof-form]')) {
      event.preventDefault();
      const code = paymentRequest?.codigo || currentRoute.code;
      const access = accessFor(code);
      if (!access) return;
      paymentState = { ...paymentState, busy: true, error: null };
      if (cartDrawerState.open) { cartDrawerState = { ...cartDrawerState, paymentState }; renderDrawer(); } else renderPaymentRequest();
      submitPaymentProof(client, { code, token: access.token, file: paymentState.file }).then(async (result) => {
        if (!active) return;
        if (result.error) { paymentState = { ...paymentState, busy: false, error: result.error }; if (cartDrawerState.open) { cartDrawerState = { ...cartDrawerState, paymentState }; renderDrawer(); } else renderPaymentRequest(); return; }
        paymentState = { step: 'summary', file: null, busy: false, error: null };
        await loadPaymentRequest(code, { drawer: cartDrawerState.open });
        showToast('Comprobante enviado correctamente.');
      });
      return;
    }
    if (!event.target.matches?.('[data-product-detail-form]')) return;
    event.preventDefault();
    const presentation = event.target.querySelector('[data-detail-presentation]:checked');
    const quantity = event.target.querySelector('[data-detail-quantity]');
    if (!currentProduct || !presentation || !quantity) { announce('Selecciona una presentación disponible.'); return; }
    addPresentation(currentProduct, presentation.dataset.detailPresentation, quantity.value);
  };
  const updateRequestDraft = (formElement) => { const data = new FormData(formElement); requestForm = { nombre: data.get('nombre'), telefono: data.get('telefono'), ciudad: data.get('ciudad'), observaciones: data.get('observaciones'), aceptaTerminos: data.get('aceptaTerminos') === 'on', aceptaPoliticaDatos: data.get('aceptaPoliticaDatos') === 'on' }; requestDraft.save(requestForm); attemptId = null; requestState = { ...requestState, form: requestForm, priceReview: null, error: null, errors: {} }; };
  const onInput = (event) => { if (event.target.matches?.('[name="precioMinimo"], [name="precioMaximo"]')) event.target.value = formatCopInput(event.target.value); if (event.target.matches?.('[data-detail-quantity]')) syncDetailQuantity(event.target); if (event.target.matches?.('[data-request-form] [name="telefono"]')) event.target.value = event.target.value.replace(/[^0-9+() -]/g, ''); const form = event.target.closest?.('[data-request-form]'); if (form) updateRequestDraft(form); };
  const onChange = (event) => {
    if (event.target.matches?.('[data-payment-proof-input]')) { paymentState = { ...paymentState, file: event.target.files?.[0] || null, error: null }; if (cartDrawerState.open) { cartDrawerState = { ...cartDrawerState, paymentState }; renderDrawer(); } else renderPaymentRequest(); return; }
    if (event.target.matches?.('[data-filter-panel] input[name="categoria"]')) {
      if (event.target.checked) app.querySelectorAll('[data-filter-panel] input[name="categoria"]').forEach((input) => { if (input !== event.target) input.checked = false; });
      return;
    }
    if (event.target.matches?.('[data-detail-presentation]')) {
      const quantity = app.querySelector('[data-detail-quantity]'); const maximum = Number(event.target.dataset.presentationMaximum);
      if (quantity) { quantity.max = String(maximum); syncDetailQuantity(quantity); }
      app.querySelectorAll('[data-detail-availability]').forEach((notice) => { notice.hidden = Number(notice.dataset.detailAvailability) !== Number(event.target.dataset.detailPresentation); });
      return;
    }
    const requestFormElement = event.target.closest?.('[data-request-form]'); if (requestFormElement) updateRequestDraft(requestFormElement);
    if (event.target.matches?.('[data-cart-quantity]')) { const next = updateCartItemQuantity(cart, event.target.dataset.cartQuantity, event.target.value); if (next === cart) { if (cartDrawerState.open) { cartDrawerState = { ...cartDrawerState, error: 'La cantidad debe respetar la disponibilidad actual de esta presentación.' }; renderDrawer(); } else announce('La cantidad debe respetar la disponibilidad actual de esta presentación.'); return; } cart = next; attemptId = null; requestState = { ...requestState, priceReview: null, error: null }; cartDrawerState = { ...cartDrawerState, error: null }; persistCart(); if (cartDrawerState.open) renderDrawer(); else renderRoute(currentRoute); announce('Cantidad actualizada.'); }
  };
  const onKeyDown = (event) => {
    if (event.key === 'Escape' && mobileMenuOpen) { event.preventDefault(); closeMobileMenu({ focusTrigger: true }); return; }
    if (event.key === 'Escape' && legalModal) { event.preventDefault(); closeOverlay(); return; }
    if (event.key === 'Escape' && cartDrawerState.open) { event.preventDefault(); closeCartDrawer({ focusTrigger: true }); return; }
    if (event.key === 'Escape' && (selectorProduct || filterPanelOpen || legalModal)) { event.preventDefault(); closeOverlay(); return; }
    trapFocus(event);
  };
  const renderDrawer = () => {
    const currentDrawer = app.querySelector('[data-cart-drawer]');
    const nextDrawer = cartDrawerView(cart, { ...cartDrawerState, cartState, requestState, confirmation });
    if (currentDrawer) currentDrawer.outerHTML = nextDrawer;
    else if (nextDrawer) app.insertAdjacentHTML('beforeend', nextDrawer);
    attachImageFallbacks(app);
    syncPageScrollLock();
    if (cartDrawerNeedsFocus) { cartDrawerNeedsFocus = false; queueMicrotask(() => app.querySelector('[data-cart-drawer-close]')?.focus()); }
  };
  const renderRequestSurface = () => { if (cartDrawerState.open) renderDrawer(); else renderCart(); };
  const onDrawerWheel = (event) => { if (!mobileMenuOpen || !event.target.closest?.('[data-mobile-menu-drawer]') || event.deltaY <= 8) return; event.preventDefault(); closeMobileMenu(); windowRef.scrollBy?.(0, event.deltaY); };
  const onTouchStart = (event) => { touchStartY = mobileMenuOpen && event.target.closest?.('[data-mobile-menu-drawer]') ? event.touches?.[0]?.clientY ?? null : null; };
  const onTouchMove = (event) => { const currentY = event.touches?.[0]?.clientY; if (!mobileMenuOpen || touchStartY === null || currentY === undefined || touchStartY - currentY <= 8) return; event.preventDefault(); const distance = touchStartY - currentY; touchStartY = null; closeMobileMenu(); windowRef.scrollBy?.(0, distance); };
  const onResize = () => { syncFooterSections(); if (windowRef.matchMedia?.('(min-width: 40rem)').matches ?? Number(windowRef.innerWidth) >= 640) closeMobileMenu(); };
  const onPopState = () => { closeCartDrawer(); selectorProduct = null; filterPanelOpen = false; legalModal = null; overlayTrigger = null; syncPageScrollLock(); renderRoute(getPublicRoute(windowRef.location.pathname)); };
  const stopHeaderScroll = startPublicHeaderScroll({ app, windowRef, onHide: closeMobileMenu });
  const flushRequestDraft = () => requestDraft.flush();
  const onVisibilityChange = () => { if (documentRef.visibilityState === 'hidden') flushRequestDraft(); };
  app.addEventListener('click', onClick); app.addEventListener('submit', onSubmit); app.addEventListener('input', onInput); app.addEventListener('change', onChange); app.addEventListener('wheel', onDrawerWheel, { passive: false }); app.addEventListener('touchstart', onTouchStart, { passive: true }); app.addEventListener('touchmove', onTouchMove, { passive: false }); documentRef.addEventListener?.('keydown', onKeyDown); documentRef.addEventListener?.('visibilitychange', onVisibilityChange); windowRef.addEventListener('pagehide', flushRequestDraft); windowRef.addEventListener('popstate', onPopState); windowRef.addEventListener('resize', onResize); renderRoute(route); if (restoredRequestForm) queueMicrotask(() => announce('Recuperamos los cambios que estabas realizando.'));
  return () => { active = false; requestId += 1; flushRequestDraft(); requestDraft.destroy(); closeMobileMenu(); cartDrawerState = { ...cartDrawerState, open: false }; selectorProduct = null; filterPanelOpen = false; legalModal = null; overlayTrigger = null; syncPageScrollLock(); stopHeaderScroll(); app.removeEventListener('click', onClick); app.removeEventListener('submit', onSubmit); app.removeEventListener('input', onInput); app.removeEventListener('change', onChange); app.removeEventListener('wheel', onDrawerWheel); app.removeEventListener('touchstart', onTouchStart); app.removeEventListener('touchmove', onTouchMove); documentRef.removeEventListener?.('keydown', onKeyDown); documentRef.removeEventListener?.('visibilitychange', onVisibilityChange); windowRef.removeEventListener('pagehide', flushRequestDraft); windowRef.removeEventListener('popstate', onPopState); windowRef.removeEventListener('resize', onResize); };
}
