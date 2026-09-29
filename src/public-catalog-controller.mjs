import { loadFilteredCatalog, loadPublicCatalog, loadPublicProduct } from './public-catalog.mjs';
import { hasCatalogFilters, parseCatalogFilters, serializeCatalogFilters, toggleFilterValue, validateCatalogFilters } from './public-catalog-filters.mjs';
import { getPublicRoute } from './public-routes.mjs';
import { appPath } from './app-paths.mjs';
import {
  loadingView,
  publicShellView,
  renderPublicRoute,
} from './public-views.mjs';

export function getDocumentMetadata(route, product = null) {
  if (route.name === 'product' && product?.nombre) {
    return {
      title: `${product.nombre} | ESENCIALES`,
      description: `Consulta presentaciones y disponibilidad de ${product.nombre}.`,
    };
  }
  if (route.name === 'catalog') {
    return { title: 'Catálogo | ESENCIALES', description: 'Consulta el catálogo de productos de ESENCIALES.' };
  }
  if (route.name === 'cart') {
    return { title: 'Carrito | ESENCIALES', description: 'Carrito vacío del catálogo de ESENCIALES.' };
  }
  return { title: 'ESENCIALES | Catálogo de productos', description: 'Explora el catálogo de productos de ESENCIALES.' };
}

export function attachImageFallbacks(root) {
  root.querySelectorAll('[data-public-image]').forEach((image) => {
    image.onerror = () => {
      image.hidden = true;
      const fallback = image.parentElement.querySelector('[data-public-image-fallback]');
      if (fallback) fallback.hidden = false;
    };
  });
  root.querySelectorAll('[data-category-image]').forEach((image) => {
    image.onerror = () => { image.hidden = true; };
  });
}

function loadingLabel(route) {
  return route.name === 'product' ? 'Cargando producto...' : 'Cargando catálogo...';
}

export function startPublicCatalog({ app, client, route, windowRef = window, documentRef = document }) {
  let active = true;
  let requestId = 0;
  let currentRoute = route;
  let baseRows = null;
  let lastFilteredRows = [];
  let filterPanelOpen = false;

  const renderCatalog = (filters, state = {}) => {
    const focused = documentRef.activeElement;
    const focusSelector = focused?.dataset?.quickField
      ? `[data-quick-field="${focused.dataset.quickField}"][data-quick-value="${focused.dataset.quickValue}"]`
      : focused?.name === 'categoria' ? '[name="categoria"]'
        : focused?.name === 'generos' || focused?.name === 'clasificaciones' ? `[name="${focused.name}"][value="${focused.value}"]`
          : focused?.name && ['busqueda', 'precioMinimo', 'precioMaximo'].includes(focused.name) ? `[name="${focused.name}"]` : null;
    app.innerHTML = publicShellView(renderPublicRoute({ name: 'catalog' }, {
      catalogState: { baseRows: baseRows || [], filteredRows: lastFilteredRows, filters, panelOpen: filterPanelOpen, ...state },
    }), 'catalog');
    attachImageFallbacks(app);
    if (focusSelector) app.querySelector(focusSelector)?.focus();
  };

  const loadCatalog = async (filters, { refreshBase = false } = {}) => {
    const currentRequest = ++requestId;
    if (refreshBase) baseRows = null;
    renderCatalog(filters, { loading: true });
    const base = baseRows === null ? await loadPublicCatalog(client) : { data: baseRows, error: null };
    if (!active || currentRequest !== requestId) return;
    if (base.error) { renderCatalog(filters, { error: base.error }); return; }
    baseRows = base.data;
    const filtered = hasCatalogFilters(filters) ? await loadFilteredCatalog(client, filters) : base;
    if (!active || currentRequest !== requestId) return;
    if (!filtered.error) lastFilteredRows = filtered.data;
    renderCatalog(filters, filtered.error ? { error: filtered.error } : { filteredRows: filtered.data });
    if (windowRef.location.hash.startsWith('#categoria-')) {
      documentRef.getElementById?.(windowRef.location.hash.slice(1))?.scrollIntoView();
    }
  };

  const updateFilters = (filters) => {
    const error = validateCatalogFilters(filters);
    if (error) { renderCatalog(filters, { validation: error }); return; }
    const query = serializeCatalogFilters(filters);
    windowRef.history.pushState({}, '', appPath(`/catalogo${query ? `?${query}` : ''}`));
    loadCatalog(filters);
  };

  const readFormFilters = () => {
    const form = app.querySelector('[data-catalog-form]');
    const data = new FormData(form);
    return {
      busqueda: String(data.get('busqueda') || '').trim(),
      categoria: data.get('categoria') ? Number(data.get('categoria')) : null,
      generos: data.getAll('generos'),
      clasificaciones: data.getAll('clasificaciones'),
      precioMinimo: String(data.get('precioMinimo') || '').trim(),
      precioMaximo: String(data.get('precioMaximo') || '').trim(),
    };
  };

  const setMetadata = (nextRoute, product) => {
    const metadata = getDocumentMetadata(nextRoute, product);
    documentRef.title = metadata.title;
    const description = documentRef.querySelector('meta[name="description"]');
    description?.setAttribute('content', metadata.description);
  };

  const renderRoute = async (nextRoute) => {
    currentRoute = nextRoute;
    const currentRequest = ++requestId;
    setMetadata(nextRoute);
    if (nextRoute.name === 'catalog') {
      loadCatalog(parseCatalogFilters(windowRef.location.search));
      return;
    }
    if (nextRoute.name === 'cart' || nextRoute.name === 'not-found') {
      app.innerHTML = publicShellView(renderPublicRoute(nextRoute), nextRoute.name);
      attachImageFallbacks(app);
      return;
    }

    app.innerHTML = publicShellView(loadingView(loadingLabel(nextRoute)), nextRoute.name);
    const result = nextRoute.name === 'product'
      ? await loadPublicProduct(client, nextRoute.productId)
      : await loadPublicCatalog(client);
    if (!active || currentRequest !== requestId) return;

    app.innerHTML = publicShellView(renderPublicRoute(nextRoute, result), nextRoute.name);
    if (nextRoute.name === 'product' && result.data) setMetadata(nextRoute, result.data);
    attachImageFallbacks(app);
    if (windowRef.location.hash.startsWith('#categoria-')) {
      const target = documentRef.getElementById(windowRef.location.hash.slice(1));
      target?.scrollIntoView();
    }
  };

  const onClick = (event) => {
    const quick = event.target.closest?.('[data-quick-field]');
    if (quick && currentRoute.name === 'catalog') {
      filterPanelOpen = Boolean(app.querySelector('[data-filter-panel]')?.open);
      const filters = readFormFilters();
      updateFilters(toggleFilterValue(filters, quick.dataset.quickField, quick.dataset.quickValue));
      return;
    }
    if (event.target.closest?.('[data-clear-filters]') && currentRoute.name === 'catalog') {
      filterPanelOpen = false;
      updateFilters(parseCatalogFilters(''));
      return;
    }
    const retry = event.target.closest?.('[data-public-retry]');
    if (retry) {
      event.preventDefault();
      if (currentRoute.name === 'catalog') loadCatalog(parseCatalogFilters(windowRef.location.search), { refreshBase: true });
      else renderRoute(currentRoute);
      return;
    }

    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const target = new URL(link.href, windowRef.location.href);
    if (target.origin !== windowRef.location.origin || target.pathname === windowRef.location.pathname && target.hash) return;
    const nextRoute = getPublicRoute(target.pathname);
    if (nextRoute.name === 'admin' || nextRoute.name === 'not-found') return;

    event.preventDefault();
    windowRef.history.pushState({}, '', `${target.pathname}${target.search}${target.hash}`);
    renderRoute(nextRoute);
  };

  const onSubmit = (event) => {
    if (!event.target.matches?.('[data-catalog-form]')) return;
    event.preventDefault();
    filterPanelOpen = Boolean(app.querySelector('[data-filter-panel]')?.open);
    updateFilters(readFormFilters());
  };

  const onChange = (event) => {
    if (!event.target.matches?.('[data-catalog-form] select, [data-catalog-form] input[type="checkbox"]')) return;
    filterPanelOpen = Boolean(app.querySelector('[data-filter-panel]')?.open);
    updateFilters(readFormFilters());
  };

  const onPopState = () => renderRoute(getPublicRoute(windowRef.location.pathname));
  app.addEventListener('click', onClick);
  app.addEventListener('submit', onSubmit);
  app.addEventListener('change', onChange);
  windowRef.addEventListener('popstate', onPopState);
  renderRoute(route);

  return () => {
    active = false;
    requestId += 1;
    app.removeEventListener('click', onClick);
    app.removeEventListener('submit', onSubmit);
    app.removeEventListener('change', onChange);
    windowRef.removeEventListener('popstate', onPopState);
  };
}
