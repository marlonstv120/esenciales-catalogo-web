import { appPath } from './app-paths.mjs';
import { hasCatalogFilters, parseCatalogFilters } from './public-catalog-filters.mjs';

const logoUrl = appPath('/assets/brand/esenciales-logo-horizontal.png');
const categoryImages = {
  perfumeslociones: appPath('/assets/images/categories/categoria-perfumes-lociones.png'),
  splash: appPath('/assets/images/categories/categoria-splash.png'),
  cremas: appPath('/assets/images/categories/categoria-cremas-corporales.png'),
  cremascorporales: appPath('/assets/images/categories/categoria-cremas-corporales.png'),
  humidificadores: appPath('/assets/images/categories/categoria-humidificadores.png'),
  otrosproductos: appPath('/assets/images/categories/categoria-otros-productos.png'),
};

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function money(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function productsFromRows(rows = []) {
  return rows.filter((row) => row.producto_id != null);
}

function categoriesFromRows(rows = []) {
  const categories = new Map();
  for (const row of rows) {
    categories.set(row.categoria_id, {
      id: row.categoria_id,
      nombre: row.categoria_nombre,
    });
  }
  return [...categories.values()];
}

function statusClass(status = '') {
  return {
    Disponible: 'available',
    'Bajo pedido': 'under-order',
    Agotado: 'sold-out',
    'No disponible': 'unavailable',
  }[status] || 'neutral';
}

function imageView(product) {
  const fallback = '<p class="public-image-fallback" data-public-image-fallback>Imagen no disponible</p>';
  if (!product.imagen_url) return `<div class="public-product-image">${fallback}</div>`;
  return `<div class="public-product-image"><img data-public-image src="${escapeHtml(product.imagen_url)}" alt="${escapeHtml(product.texto_alternativo || product.nombre || '')}" loading="lazy"><p class="public-image-fallback" data-public-image-fallback hidden>Imagen no disponible</p></div>`;
}

function productCardView(product, featured = false) {
  const price = product.precio_desde
    ? `Desde ${money(product.precio_referencia)}`
    : money(product.precio_referencia);
  const normalReferencePrice = Number(product.precio_normal_referencia) > Number(product.precio_referencia)
    ? `<s class="public-product-card__normal-price">${money(product.precio_normal_referencia)}</s>`
    : '';
  return `<article class="public-product-card${featured ? ' public-product-card--featured' : ''}">
    <a class="public-product-card__link" href="${appPath(`/producto/${Number(product.producto_id)}`)}">
      ${imageView(product)}
      <p class="public-product-card__category">${escapeHtml(product.categoria_nombre)}</p>
      <h3>${escapeHtml(product.nombre)}</h3>
      <p class="public-product-card__price">${price} ${normalReferencePrice}</p>
      <p class="catalog-status catalog-status--${statusClass(product.disponibilidad)}">${escapeHtml(product.disponibilidad)}</p>
      ${featured
        ? '<span class="public-product-card__action" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span>'
        : '<span class="public-product-card__action">Ver producto</span>'}
    </a>
  </article>`;
}

function categoryLinks(rows) {
  return categoriesFromRows(rows)
    .map((category) => {
      const key = category.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const image = categoryImages[key];
      return `<a href="${appPath(`/catalogo#categoria-${category.id}`)}">${image ? `<img data-category-image src="${image}" alt="" loading="lazy" width="320" height="240">` : ''}<span>${escapeHtml(category.nombre)}</span></a>`;
    })
    .join('');
}

export function publicShellView(content, currentRoute = 'home') {
  const active = (route) => currentRoute === route ? ' aria-current="page"' : '';
  return `<a class="skip-link" href="#main-content">Saltar al contenido</a>
    <header class="public-header">
      <div class="public-header__inner"><details class="public-mobile-menu"><summary aria-label="Abrir menú de navegación"><svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></summary><nav aria-label="Navegación móvil"><a href="${appPath('/')}"${active('home')}>Inicio</a><a href="${appPath('/catalogo')}"${active('catalog')}>Catálogo</a><a href="${appPath('/admin')}">Administración</a></nav></details><a class="public-brand" href="${appPath('/')}"><img src="${escapeHtml(logoUrl)}" alt="ESENCIALES"></a>
      <nav class="public-navigation" aria-label="Principal">
        <a href="${appPath('/')}"${active('home')}>Inicio</a>
        <a href="${appPath('/catalogo')}"${active('catalog')}>Catálogo</a>
      </nav>
      <a class="public-cart-link" href="${appPath('/carrito')}" aria-label="Carrito (0)"${active('cart')}><svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M2 3h2l2.4 12h13l2-9H5"/></svg><span class="public-cart-link__count" aria-hidden="true">0</span></a></div>
    </header>
    <main class="public-main" id="main-content">${content}</main>
    <footer class="public-footer"><div class="public-footer__inner"><span>ESENCIALES</span><a href="${appPath('/admin')}">Administración</a></div></footer>`;
}

export function homeView(rows = []) {
  const products = productsFromRows(rows);
  // Until test records are corrected in administration, omit the known fixture from home.
  const featured = products.filter((product) => product.destacado && product.nombre?.trim().toLowerCase() !== 'prubea');
  const categories = categoryLinks(rows);
  return `<section class="public-hero" aria-labelledby="home-title">
      <div class="public-hero__content">
      <h1 id="home-title">Tu aroma, siempre contigo.</h1>
      <p>Explora lociones, perfumes y opciones de cuidado personal para cada estilo y ocasión.</p>
      <a class="primary-button public-hero__action" href="${appPath('/catalogo')}">Ver catálogo</a></div>
    </section>
    ${categories ? `<section class="public-categories" aria-labelledby="categories-title"><h2 id="categories-title">Categorías</h2><nav class="public-category-links" aria-label="Categorías">${categories}</nav></section>` : ''}
    ${featured.length ? `<section class="public-section public-featured" aria-labelledby="featured-title"><div class="public-section__heading"><h2 id="featured-title">Productos destacados</h2><a href="${appPath('/catalogo')}">Ver catálogo <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></a></div><div class="public-product-grid">${featured.map((product) => productCardView(product, true)).join('')}</div></section>` : ''}`;
}

const filterChoices = {
  generos: [['hombre', 'Hombre'], ['mujer', 'Mujer'], ['unisex', 'Unisex']],
  clasificaciones: [['original', 'Original'], ['uno_a_uno', '1.1'], ['inspiracion', 'Inspiración']],
};

function filterCheckboxes(filters, field, title) {
  return `<fieldset><legend>${title}</legend>${filterChoices[field].map(([value, label]) =>
    `<label><input type="checkbox" name="${field}" value="${value}" ${filters[field].includes(value) ? 'checked' : ''}>${label}</label>`).join('')}</fieldset>`;
}

function catalogControls(categories, filters, state) {
  const shortcuts = [['generos', 'hombre', 'Hombre'], ['generos', 'mujer', 'Mujer'], ['clasificaciones', 'original', 'Original'], ['clasificaciones', 'uno_a_uno', '1.1']];
  return `<form class="catalog-filters" data-catalog-form role="search">
    <label for="catalog-search">Buscar por nombre</label>
    <div class="catalog-search-row"><input id="catalog-search" name="busqueda" type="search" value="${escapeHtml(filters.busqueda)}" autocomplete="off"><button class="secondary-button" type="submit">Buscar</button></div>
    <div class="catalog-filter-row"><details class="catalog-filter-panel" data-filter-panel ${state.panelOpen ? 'open' : ''}><summary>Filtros</summary>
      <div class="catalog-filter-panel__body"><label for="catalog-category">Categoría</label><select id="catalog-category" name="categoria"><option value="">Todas</option>${categories.map((category) => `<option value="${category.id}" ${category.id === filters.categoria ? 'selected' : ''}>${escapeHtml(category.nombre)}</option>`).join('')}</select>
      ${filterCheckboxes(filters, 'generos', 'Género')}${filterCheckboxes(filters, 'clasificaciones', 'Clasificación')}
      <div class="catalog-price-fields"><label>Precio mínimo (COP)<input name="precioMinimo" inputmode="numeric" type="text" value="${escapeHtml(filters.precioMinimo)}"></label><label>Precio máximo (COP)<input name="precioMaximo" inputmode="numeric" type="text" value="${escapeHtml(filters.precioMaximo)}"></label></div>
      <button class="secondary-button" type="submit">Aplicar filtros</button></div></details>
      <div class="catalog-quick-filters" aria-label="Filtros rápidos">${shortcuts.map(([field, value, label]) => `<button type="button" data-quick-field="${field}" data-quick-value="${value}" aria-pressed="${filters[field].includes(value)}">${label}</button>`).join('')}</div></div>
    ${state.validation ? `<p class="message message--error" role="alert" id="catalog-filter-error">${escapeHtml(state.validation)}</p>` : ''}
    ${hasCatalogFilters(filters) ? '<button type="button" class="catalog-clear" data-clear-filters>Limpiar filtros</button>' : ''}
  </form>`;
}

export function catalogView(rows = [], filteredRows = rows, filters = parseCatalogFilters(''), state = {}) {
  const products = productsFromRows(filteredRows);
  const categories = categoriesFromRows(rows);
  const controls = catalogControls(categories, filters, state);
  const heading = '<div class="public-page-heading"><p class="eyebrow">ESENCIALES</p><h1>Catálogo</h1></div>';
  if (state.loading) return `${heading}${controls}<p class="public-loading" role="status">Cargando resultados...</p>${loadingView('Cargando resultados...')}`;
  if (state.error) return `${heading}${controls}${errorView(state.error, '/catalogo')}`;
  if (!productsFromRows(rows).length) return `${heading}${controls}<p class="public-empty">Aún no hay productos disponibles en el catálogo.</p>`;
  if (!products.length) return `${heading}${controls}<section class="public-section"><h2>Sin resultados</h2><p>Ningún producto coincide con los filtros activos.</p><button type="button" class="secondary-button" data-clear-filters>Limpiar filtros</button></section>`;

  const sections = categories.filter((category) => !hasCatalogFilters(filters) || products.some((product) => product.categoria_id === category.id)).map((category) => {
    const categoryProducts = products.filter((product) => product.categoria_id === category.id);
    return `<section class="public-section public-category-section" id="categoria-${category.id}" aria-labelledby="category-title-${category.id}">
      <h2 id="category-title-${category.id}">${escapeHtml(category.nombre)}</h2>
      ${categoryProducts.length
        ? `<div class="public-product-grid">${categoryProducts.map(productCardView).join('')}</div>`
        : '<p class="public-empty">Aún no hay productos disponibles en esta categoría.</p>'}
    </section>`;
  }).join('');

  return `${heading}${controls}<p class="catalog-result-count" role="status">${products.length} ${products.length === 1 ? 'producto' : 'productos'}</p>${sections}`;
}

function presentationPrice(presentation) {
  const normal = money(presentation.precio_normal);
  return presentation.precio_promocional
    ? `<span class="presentation-price__current">${money(presentation.precio_promocional)}</span> <s class="presentation-price__normal">${normal}</s>`
    : `<span class="presentation-price__current">${normal}</span>`;
}

function metadata(product) {
  const fields = [
    ['Categoría', product.categoria_nombre],
    ['Marca', product.marca],
    ['Género', product.genero],
    ['Familia olfativa', product.familia_olfativa],
    ['Clasificación', product.clasificacion],
  ].filter(([, value]) => value);
  if (!fields.length) return '';
  return `<dl class="public-product-metadata">${fields.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>`;
}

export function productDetailView(product) {
  if (!product) return notFoundView();
  const presentations = product.presentaciones || [];
  const options = presentations.map((presentation, index) => `<label class="public-presentation-option">
    <input type="radio" name="presentacion" value="${Number(presentation.id)}" ${index === 0 ? 'checked' : ''}>
    <span class="public-presentation-option__content">
      <strong>${escapeHtml(presentation.etiqueta)}</strong>
      <span class="presentation-price">${presentationPrice(presentation)}</span>
      <span class="catalog-status catalog-status--${statusClass(presentation.estado)}">${escapeHtml(presentation.estado)}</span>
    </span>
  </label>`).join('');

  return `<a class="public-back-link" href="${appPath('/catalogo')}">Volver al catálogo</a>
    <article class="public-product-detail">
      ${imageView(product)}
      <div class="public-product-detail__content">
        <p class="eyebrow">${escapeHtml(product.categoria_nombre)}</p>
        <h1>${escapeHtml(product.nombre)}</h1>
        <p class="public-product-detail__description">${escapeHtml(product.descripcion)}</p>
        ${metadata(product)}
        ${presentations.length
          ? `<fieldset class="public-presentations"><legend>Presentaciones</legend>${options}</fieldset>`
          : '<p class="public-empty">No hay presentaciones disponibles.</p>'}
      </div>
    </article>`;
}

export function cartView() {
  return `<section class="public-section public-cart-empty"><p class="eyebrow">ESENCIALES</p><h1>Carrito (0)</h1><p>La preparación de solicitudes se habilitará en el siguiente incremento.</p><a class="primary-button" href="${appPath('/catalogo')}">Seguir explorando</a></section>`;
}

export function notFoundView() {
  return `<section class="public-section public-not-found"><h1>No encontrado</h1><p>Este producto no existe o dejó de publicarse.</p><a class="primary-button" href="${appPath('/catalogo')}">Volver al catálogo</a></section>`;
}

export function loadingView(label = 'Cargando catálogo...') {
  return `<p class="public-loading" role="status">${escapeHtml(label)}</p><div class="public-skeleton" aria-hidden="true"><span></span><span></span><span></span></div>`;
}

export function errorView(message, retryRoute) {
  return `<section class="public-section public-error"><p class="message message--error" role="alert">${escapeHtml(message)}</p><button class="secondary-button" type="button" data-public-retry="${escapeHtml(retryRoute)}">Reintentar</button></section>`;
}

export function renderPublicRoute(route, result = {}) {
  if (route.name === 'cart') return cartView();
  if (route.name === 'not-found') return notFoundView();
  if (result.error) {
    const retryRoute = route.name === 'product' ? `/producto/${route.productId}` : `/${route.name === 'catalog' ? 'catalogo' : ''}`;
    return errorView(result.error, retryRoute);
  }
  if (route.name === 'product') return result.data ? productDetailView(result.data) : notFoundView();
  if (route.name === 'catalog') return result.catalogState
    ? catalogView(result.catalogState.baseRows, result.catalogState.filteredRows, result.catalogState.filters, result.catalogState)
    : catalogView(result.data || []);
  return homeView(result.data || []);
}
