import { appPath } from './app-paths.mjs';
import { getCartCount, getCartTotal, getSelectedCartItems, getSelectedCartTotal } from './public-cart.mjs';
import { getCatalogFilterCount, hasCatalogFilters, parseCatalogFilters } from './public-catalog-filters.mjs';
import { whatsappUrl } from './public-purchase-request.mjs';
import { classificationLabel } from './products.js';
import { backButton, backLink } from './back-navigation.mjs';
import { uiIcon } from './ui-icons.mjs';

const logoUrl = appPath('/assets/brand/vehimarcas-logo-completo.png');
const footerLogoUrl = appPath('/assets/brand/vehimarcas-logo-completo.png');
const instagramIconUrl = appPath('/assets/social/instagram.png');
const whatsappSocialIconUrl = appPath('/assets/social/whatsapp.png');
const instagramUrl = 'https://www.instagram.com/vehimarcas/';
const facebookUrl = 'https://www.facebook.com/vehimarcasdelvalle/';
const whatsappContactUrl1 = 'https://wa.me/573045416480';
const whatsappContactUrl2 = 'https://wa.me/573128332023';
const whatsappContactUrl = whatsappContactUrl1;
const googleMapsUrl = 'https://www.google.com/maps/place/VehiMarcas+Del+Valle/@3.4284774,-76.5448212,17z/data=!3m1!4b1!4m6!3m5!1s0x8e30a728a3fe0bad:0x303478027adc7508!8m2!3d3.4284774!4d-76.5422463!16s%2Fg%2F11w8qyqtx7';
const contactEmail = 'contacto@vehimarcas.com';
const homeAssets = {
  hero: appPath('/assets/home/hero-vehimarcas.png'),
  cta: appPath('/assets/home/cta-vehimarcas.png'),
  advisors: appPath('/assets/home/asesores-horizontal.jpg'),
  sell: appPath('/assets/home/retoma.jpeg'),
};
const escapeHtml = (value = '') => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const money = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value).replace(/\s|COP/g, '');
const productsFromRows = (rows = []) => rows.filter((row) => row.producto_id != null);
const categoriesFromRows = (rows = []) => [...new Map(rows.map((row) => [row.categoria_id, { id: row.categoria_id, nombre: row.categoria_nombre }])).values()];
const statusClass = (status = '') => ({ Disponible: 'available', 'Bajo pedido': 'under-order', Agotado: 'sold-out', 'No disponible': 'unavailable', Vendido: 'sold' }[status] || 'neutral');
const statusLabel = (status = '') => status === 'Disponible' ? 'En stock' : status;
const arrowIcon = uiIcon('arrow-right', { size: 18, strokeWidth: 1.8 });
const plusIcon = uiIcon('plus', { size: 18, strokeWidth: 2 });
const leafIcon = uiIcon('leaf', { size: 32, strokeWidth: 1.5 });
const diamondIcon = uiIcon('gem', { size: 32, strokeWidth: 1.5 });
const sparklesIcon = uiIcon('sparkles', { size: 32, strokeWidth: 1.5 });
const closeIcon = uiIcon('x', { size: 18 });
const menuIcon = uiIcon('menu', { size: 24, strokeWidth: 2 });
const copyIcon = uiIcon('copy', { size: 18 });
const trashIcon = uiIcon('trash-2', { size: 18 });
const whatsappIcon = uiIcon('message-circle', { size: 18, strokeWidth: 2 });
const emailIcon = uiIcon('mail', { size: 18 });
const locationIcon = uiIcon('map-pin', { size: 18 });
const mapsSocialIcon = uiIcon('map-pin', { size: 20, strokeWidth: 2 });
const footerChevron = uiIcon('chevron-down', { size: 18, strokeWidth: 2 });
const cartIcon = uiIcon('shopping-cart', { size: 20, strokeWidth: 1.8 });

function cityComboboxView(form = {}, errors = {}) {
  const error = errors.ciudad ? `<p class="public-request-form__error" id="request-ciudad-error">${escapeHtml(errors.ciudad)}</p>` : '';
  const invalid = errors.ciudad ? 'aria-invalid="true" aria-describedby="request-city-help request-ciudad-error"' : 'aria-describedby="request-city-help"';
  return `<div class="city-combobox"><input id="request-city" name="ciudad" autocomplete="address-level2" maxlength="100" value="${escapeHtml(form.ciudad)}" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="request-city-options" ${invalid} data-city-input><ul id="request-city-options" class="city-combobox__options" role="listbox" hidden data-city-options></ul><p id="request-city-help" class="city-combobox__help">Escribe para buscar municipio y departamento.</p>${error}</div>`;
}

function imageView(product) {
  const fallback = '<p class="public-image-fallback" data-public-image-fallback>Imagen no disponible</p>';
  return !product.imagen_url ? `<div class="public-product-image">${fallback}</div>` : `<div class="public-product-image"><img data-public-image src="${escapeHtml(product.imagen_url)}" alt="${escapeHtml(product.texto_alternativo || product.nombre || '')}" loading="lazy"><p class="public-image-fallback" data-public-image-fallback hidden>Imagen no disponible</p></div>`;
}

function productCardView(product, featured = false) {
  const sold = product.disponibilidad === 'Vendido';
  const price = product.precio_desde ? `Desde ${money(product.precio_referencia)}` : money(product.precio_referencia);
  const normal = Number(product.precio_normal_referencia) > Number(product.precio_referencia) ? `<s class="public-product-card__normal-price">${money(product.precio_normal_referencia)}</s>` : '';
  const unavailable = ['Agotado', 'No disponible', 'Vendido'].includes(product.disponibilidad);
  const quickSpecs = `<div class="vehicle-quick-specs"><span class="vehicle-quick-spec">${uiIcon('calendar', { size: 14 })}<span>${escapeHtml(product.genero || '2024')}</span></span><span aria-hidden="true">•</span><span class="vehicle-quick-spec">${uiIcon('settings', { size: 14 })}<span>${escapeHtml(product.etiqueta || 'Automática')}</span></span><span aria-hidden="true">•</span><span class="vehicle-quick-spec">${uiIcon('tag', { size: 14 })}<span>${escapeHtml(product.clasificacion ? classificationLabel(product.clasificacion) : 'Seminuevo')}</span></span></div>`;
  const whatsappMsg = encodeURIComponent(`Hola VEHIMARCAS del Valle 👋🏼 Estoy interesado/a en recibir más información sobre el vehículo: *${product.nombre}* (${price}). ¿Está disponible?`);
  const whatsappCardUrl = `https://wa.me/573045416480?text=${whatsappMsg}`;
  const cta = sold
    ? `<span class="public-product-card__sold-note">Vehículo vendido</span>`
    : `<a class="public-whatsapp-button-card" href="${whatsappCardUrl}" target="_blank" rel="noopener noreferrer" data-product-add="${Number(product.producto_id)}" aria-label="Consultar por WhatsApp sobre ${escapeHtml(product.nombre)}" title="Consultar por WhatsApp">${whatsappIcon}<span>WhatsApp</span></a>`;

  return `<article class="public-product-card${featured ? ' public-product-card--featured' : ''}">
    <a class="public-product-card__image-link" href="${appPath(`/producto/${Number(product.producto_id)}`)}">${imageView(product)}<span class="catalog-status catalog-status--${statusClass(product.disponibilidad)}">${escapeHtml(statusLabel(product.disponibilidad))}</span></a>
    <div class="public-product-card__content"><p class="public-product-card__category">${escapeHtml(product.categoria_nombre)}</p><h3><a href="${appPath(`/producto/${Number(product.producto_id)}`)}">${escapeHtml(product.nombre)}</a></h3>${quickSpecs}<p class="public-product-card__description">${escapeHtml(product.descripcion || '')}</p><div class="public-product-card__footer"><p class="public-product-card__price">${price} ${normal}</p>${cta}</div>${unavailable ? '<span id="product-unavailable" class="visually-hidden">Vehículo no disponible para cotizar.</span>' : ''}</div>
  </article>`;
}

function editorialCategoriesView() {
  const categories = [
    ['Automóviles', 'Elegancia y eficiencia ejecutiva', 'categoria-sedan.jpg', '/catalogo?categoria=2'],
    ['SUV & Camionetas', 'Potencia y confort en todo terreno', 'categoria-suv.jpg', '/catalogo?categoria=1'],
    ['Pick-ups & 4x4', 'Fuerza de trabajo y aventura', 'categoria-pickup.jpg', '/catalogo?categoria=3'],
  ];
  return categories.map(([title, subtitle, image, href]) => `<a class="editorial-category-card" href="${appPath(href)}" style="--category-image: url('${appPath(`/assets/categories/${image}`)}')"><span><strong>${title}</strong><small>${subtitle}</small></span>${arrowIcon}</a>`).join('');
}

export function legalModalView(documentName) {
  if (!documentName) return '';
  const documents = {
    terms: { title: 'Términos y condiciones', url: appPath('/legal/terminos-v2.html') },
    policy: { title: 'Política de tratamiento de datos', url: appPath('/legal/politica-datos-v2.html') },
  };
  const document = documents[documentName];
  if (!document) return '';
  const externalIcon = uiIcon('external-link', { size: 20, strokeWidth: 1.8 });
  return `<section class="public-legal-modal" data-legal-modal-dialog role="dialog" aria-modal="true" aria-labelledby="legal-modal-title"><div class="public-legal-modal__panel"><header><a class="icon-button" href="${document.url}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${document.title} en una nueva pestaña" title="Abrir en una nueva pestaña">${externalIcon}</a><h2 id="legal-modal-title">${document.title}</h2><button class="icon-button" type="button" data-legal-close aria-label="Cerrar ${document.title}" title="Cerrar">${closeIcon}</button></header><iframe src="${document.url}" title="${document.title}"></iframe></div></section>`;
}

function footerSection(title, content) {
  return `<details class="public-footer__section" data-footer-section><summary>${title}${footerChevron}</summary><div class="public-footer__section-content">${content}</div></details>`;
}

function publicFooterView() {
  const socials = `<div class="public-footer__socials"><a href="${instagramUrl}" target="_blank" rel="noopener noreferrer" aria-label="Instagram de VEHIMARCAS del Valle"><img src="${instagramIconUrl}" alt="Instagram"></a><a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" aria-label="Facebook de VEHIMARCAS del Valle"><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.5C10 7.02 11.49 5.6 13.73 5.6c1.07 0 2.19.19 2.19.19v2.41h-1.24c-1.23 0-1.61.76-1.61 1.54V12h2.72l-.43 3h-2.29v6.8c4.56-.93 8-4.96 8-9.8z"/></svg></a><a href="${whatsappContactUrl1}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp de VEHIMARCAS del Valle"><img src="${whatsappSocialIconUrl}" alt="WhatsApp"></a><a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" aria-label="Ubicación de VEHIMARCAS del Valle en Google Maps" title="Ver ubicación en Google Maps">${mapsSocialIcon}</a></div>`;
  const links = `<nav aria-label="Enlaces del pie de página"><a href="${appPath('/')}">Inicio</a><a href="${appPath('/catalogo')}">Catálogo</a></nav>`;
  const contact = `<address><a href="${whatsappContactUrl1}" target="_blank" rel="noopener noreferrer">${whatsappIcon}<span>+57 304 5416480</span></a><a href="${whatsappContactUrl2}" target="_blank" rel="noopener noreferrer">${whatsappIcon}<span>+57 312 8332023</span></a><a href="mailto:${contactEmail}">${emailIcon}<span>${contactEmail}</span></a><p>${locationIcon}<span>Cali, Colombia</span></p></address>`;
  const information = `<nav aria-label="Información legal"><button type="button" data-legal-modal="terms">Términos y condiciones</button><button type="button" data-legal-modal="policy">Política de tratamiento de datos</button><a href="${appPath('/admin')}">Administración</a></nav>`;
  return `<footer class="public-footer"><div class="public-footer__inner"><div class="public-footer__content"><section class="public-footer__brand"><img src="${footerLogoUrl}" alt="VEHIMARCAS del Valle">${socials}</section>${footerSection('Enlaces', links)}${footerSection('Contáctanos', contact)}${footerSection('Información', information)}</div><div class="public-footer__bottom"><span>© 2026 VEHIMARCAS del Valle. Todos los derechos reservados.</span><span>Desarrollado con <span class="public-footer__heart" aria-label="amor">${uiIcon('heart', { size: 14 })}</span> para la compra y venta de vehículos.</span></div></div></footer>`;
}

function publicNavigationLinks(currentRoute) {
  const active = (route) => currentRoute === route ? ' aria-current="page"' : '';
  const anchors = currentRoute === 'home' ? '<a href="#retoma">Retoma</a><a href="#financieras">Financieras</a><a href="#credito">Solicita tu crédito</a><a href="#entregas">Entregas</a><a href="#nosotros">Quiénes somos</a>' : '';
  return `<a href="${appPath('/')}"${active('home')}>Inicio</a><a href="${appPath('/catalogo')}"${active('catalog')}>Catálogo</a>${anchors}`;
}

export function mobileMenuDrawerView(currentRoute = 'home') {
  return `<section class="public-mobile-drawer" data-mobile-menu-drawer id="mobile-menu-drawer" aria-label="Menú de navegación"><div class="public-mobile-drawer__backdrop" data-mobile-menu-close></div><aside class="public-mobile-drawer__panel" role="dialog" aria-modal="true" aria-label="Menú de navegación"><header><img src="${escapeHtml(logoUrl)}" alt="VEHIMARCAS del Valle"><button class="icon-button" type="button" data-mobile-menu-close aria-label="Cerrar menú" title="Cerrar menú">${closeIcon}</button></header><nav aria-label="Navegación móvil">${publicNavigationLinks(currentRoute)}</nav></aside></section>`;
}

export function publicShellView(content, currentRoute = 'home', cart = { items: [] }, modal = '', drawer = '') {
  const count = getCartCount(cart);
  return `<a class="skip-link" href="#main-content">Saltar al contenido</a><header class="public-header"><div class="public-header__inner"><button class="public-mobile-menu" type="button" data-mobile-menu-toggle aria-label="Abrir menú" aria-expanded="false" aria-controls="mobile-menu-drawer">${menuIcon}</button><a class="public-brand" href="${appPath('/')}" aria-label="Inicio"><img src="${escapeHtml(logoUrl)}" alt="VEHIMARCAS del Valle"></a><nav class="public-navigation" aria-label="Principal">${publicNavigationLinks(currentRoute)}</nav><button class="public-cart-link" type="button" data-cart-drawer-open aria-label="Abrir carrito (${count})" aria-haspopup="dialog">${uiIcon('shopping-cart', { size: 24, strokeWidth: 1.8 })}<span class="public-cart-link__count" aria-hidden="true">${count}</span></button></div></header><main class="public-main" id="main-content">${content}</main>${publicFooterView()}${drawer}${modal}<div class="public-live-region" role="status" aria-live="polite" aria-atomic="true"></div>`;
}

function homeViewMarkup(rows = [], deliveries = []) {
  const products = productsFromRows(rows);
  const featured = products.filter((product) => product.destacado);
  const quality = [
    ['Usados Certificados', 'Vehículos inspeccionados en más de 150 puntos técnicos y de motor.', 'Seguridad · Respaldo · Confianza', leafIcon],
    ['Seminuevos Seleccionados', 'Autos y camionetas de único dueño con peritaje aprobado.', 'Peritaje aprobado · Documentos al día', diamondIcon],
    ['Variedad de Marcas', 'Chevrolet, Mazda, Ford, Renault, Kia, Suzuki, Hyundai, Volkswagen, Toyota, BMW y Mercedes-Benz.', 'Catálogo amplio · Precios competitivos', sparklesIcon]
  ];
  const steps = [
    ['1', 'Explora', 'Filtra por marca, tipo de vehículo, modelo o rango de precio.'],
    ['2', 'Cotiza', 'Revisa la ficha técnica detallada y la galería de fotos.'],
    ['3', 'Contacta', 'Habla directamente con un asesor por WhatsApp o solicita cotización.']
  ];
  return `<section class="public-hero" aria-labelledby="home-title" style="--hero-image: url('${homeAssets.advisors}')"><div class="public-hero__content" data-reveal><h1 id="home-title">Porque tener carro propio Sí es posible</h1><p>Explora camionetas SUV, pick-ups y automóviles garantizados en Colombia.</p><a class="primary-button public-hero__action" href="${appPath('/catalogo')}">Ver catálogo de vehículos ${arrowIcon}</a></div></section><section class="public-categories" aria-labelledby="categories-title"><div class="public-section-label"><p>Categorías destacadas</p><h2 id="categories-title">Explora por tipo de vehículo</h2></div><nav class="editorial-category-grid" aria-label="Categorías" data-reveal data-reveal-delay="80">${editorialCategoriesView()}</nav></section>${featured.length ? `<section class="public-section public-featured" aria-labelledby="featured-title"><div class="public-section__heading" data-reveal><div><p class="public-section-label">Vehículos destacados</p><h2 id="featured-title">Selección especial VEHIMARCAS del Valle</h2></div><a href="${appPath('/catalogo')}">Ver catálogo completo ${arrowIcon}</a></div><div class="public-product-grid" data-reveal data-reveal-delay="120">${featured.map((product) => productCardView(product, true)).join('')}</div></section>` : ''}${homeSellCarView()}${homePartnersView()}${homeCreditView()}<section class="home-quality" aria-labelledby="quality-title"><div class="home-section-intro" data-reveal><p>Vehículos con peritaje seleccionados</p><h2 id="quality-title">Encuentra tu próximo vehículo</h2></div><div class="quality-grid">${quality.map(([title, description, benefits, icon], index) => `<article class="quality-card" data-reveal data-reveal-delay="${index * 80}"><span class="quality-card__icon">${icon}</span><h3>${title}</h3><p>${description}</p><strong>${benefits}</strong></article>`).join('')}</div></section>${homeBrandsView()}${homeDeliveriesView(deliveries)}<section class="home-identity" aria-labelledby="identity-title" style="--identity-image: url('${homeAssets.cta}')"><div class="home-identity__content" data-reveal><p>Sobre VEHIMARCAS del Valle</p><h2 id="identity-title">Calidad &amp; Confianza en cada vehículo.</h2><p>En VEHIMARCAS del Valle conectamos compradores y vendedores con total transparencia y seguridad.</p><p>Ofrecemos el catálogo más completo de vehículos nuevos y seminuevos verificados en Colombia.</p><strong>Calidad &amp; Confianza.</strong></div></section><section class="home-process" aria-labelledby="process-title"><div class="home-section-intro" data-reveal><p>Proceso simple</p><h2 id="process-title">Compra tu vehículo en pocos pasos</h2></div><div class="process-grid" data-reveal data-reveal-delay="80">${steps.map(([number, title, description], index) => `<article data-reveal data-reveal-delay="${index * 70}"><span>${number}</span><div><h3>${title}</h3><p>${description}</p></div></article>`).join('')}</div></section>${homeAboutView()}`;
}

const filterChoices = { disponibilidades: [['en-stock', 'En stock'], ['bajo-pedido', 'Bajo pedido'], ['agotado', 'Agotado'], ['no-disponible', 'No disponible']], generos: [['toyota', 'Toyota'], ['chevrolet', 'Chevrolet'], ['mazda', 'Mazda'], ['nissan', 'Nissan'], ['renault', 'Renault'], ['ford', 'Ford'], ['hyundai', 'Hyundai'], ['bmw', 'BMW'], ['mercedes-benz', 'Mercedes-Benz'], ['honda', 'Honda'], ['mecanica', 'Mecánica'], ['automatica', 'Automática']], clasificaciones: [['nuevo', 'Nuevo'], ['usado', 'Usado'], ['seminuevo', 'Semi-nuevo']] };
const fieldTitle = { disponibilidades: 'Disponibilidad', generos: 'Año / Marca', clasificaciones: 'Estado del vehículo' };

function choicesView(filters, field) { return `<fieldset><legend>${fieldTitle[field]}</legend>${filterChoices[field].map(([value, label]) => `<label><input type="checkbox" name="${field}" value="${value}" ${filters[field].includes(value) ? 'checked' : ''}>${label}</label>`).join('')}</fieldset>`; }
function categoryChoicesView(categories, filters) { return `<fieldset><legend>Tipo de vehículo</legend>${categories.map((category) => `<label><input type="checkbox" name="categoria" value="${category.id}" ${String(category.id) === String(filters.categoria) ? 'checked' : ''}>${escapeHtml(category.nombre)}</label>`).join('') || '<p class="field-help">No hay tipos de vehículo disponibles.</p>'}</fieldset>`; }
function filterTags(filters, categories) {
  const tags = [];
  if (filters.busqueda) tags.push(['busqueda', '', `Búsqueda: ${filters.busqueda}`]);
  if (filters.categoria) tags.push(['categoria', '', `Tipo: ${categories.find((item) => item.id === filters.categoria)?.nombre || filters.categoria}`]);
  ['disponibilidades', 'generos', 'clasificaciones'].forEach((field) => filters[field].forEach((value) => tags.push([field, value, `${fieldTitle[field]}: ${filterChoices[field].find(([key]) => key === value)?.[1] || value}`])));
  if (filters.precioMinimo) tags.push(['precioMinimo', '', `Desde ${money(filters.precioMinimo)}`]);
  if (filters.precioMaximo) tags.push(['precioMaximo', '', `Hasta ${money(filters.precioMaximo)}`]);
  return tags.length ? `<ul class="catalog-filter-tags" aria-label="Filtros aplicados">${tags.map(([field, value, label]) => `<li>${escapeHtml(label)} <button type="button" data-filter-remove="${field}" data-filter-value="${value}" aria-label="Quitar filtro ${escapeHtml(label)}">${uiIcon('x', { size: 12 })}</button></li>`).join('')}</ul>` : '';
}
function catalogControls(categories, filters, state) {
  const count = getCatalogFilterCount(filters);
  const searchIcon = uiIcon('search');
  const filterIcon = uiIcon('sliders-horizontal', { size: 16 });
  const resetIcon = uiIcon('rotate-ccw', { size: 16 });
  const panel = state.panelOpen ? `<div class="catalog-filter-backdrop" data-filter-close></div><aside class="catalog-filter-panel is-open" data-filter-panel aria-label="Filtros de catálogo"><header class="catalog-filter-panel__heading"><h2>Filtros</h2><button type="button" class="icon-button" data-filter-close aria-label="Cerrar filtros">${closeIcon}</button></header><div class="catalog-filter-panel__body">${categoryChoicesView(categories, filters)}${choicesView(filters, 'disponibilidades')}${choicesView(filters, 'clasificaciones')}<div class="catalog-price-fields"><label>Precio mínimo<input name="precioMinimo" inputmode="numeric" value="${escapeHtml(filters.precioMinimo)}"></label><label>Precio máximo<input name="precioMaximo" inputmode="numeric" value="${escapeHtml(filters.precioMaximo)}"></label></div>${state.validation ? `<p class="message message--error" role="alert">${escapeHtml(state.validation)}</p>` : ''}</div><footer class="catalog-filter-panel__actions"><button class="primary-button" type="submit">Aplicar filtros</button><button class="secondary-button" type="button" data-clear-filters>Limpiar filtros</button></footer></aside>` : '';
  return `<form class="catalog-filters" data-catalog-form role="search"><div class="catalog-toolbar"><label class="visually-hidden" for="catalog-search">Buscar por marca o modelo</label><div class="catalog-search">${searchIcon}<input id="catalog-search" name="busqueda" type="search" placeholder="Buscar por marca o modelo..." value="${escapeHtml(filters.busqueda)}" autocomplete="off">${filters.busqueda ? '<button type="button" class="catalog-search__clear" data-clear-search aria-label="Borrar búsqueda">${uiIcon(\'x\', { size: 14 })}</button>' : ''}</div><div class="catalog-toolbar__actions"><button class="secondary-button catalog-filters-toggle" type="button" data-filter-toggle aria-expanded="${Boolean(state.panelOpen)}">${filterIcon}<span>Filtros${count ? ` (${count})` : ''}</span></button>${hasCatalogFilters(filters) ? `<button type="button" class="catalog-clear" data-clear-filters>${resetIcon}<span>Limpiar filtros</span></button>` : ''}</div></div>${panel}</form>${filterTags(filters, categories)}`;
}

function logoCarouselView(trackClass, itemsHtml) {
  return `<div class="logo-carousel" data-logo-carousel data-reveal data-reveal-delay="80"><button type="button" class="logo-carousel__nav logo-carousel__nav--prev" data-carousel-scroll="-1" aria-label="Ver logos anteriores">${uiIcon('arrow-left', { size: 18 })}</button><ul class="logo-carousel__track ${trackClass}" data-carousel-track>${itemsHtml()}</ul><button type="button" class="logo-carousel__nav logo-carousel__nav--next" data-carousel-scroll="1" aria-label="Ver más logos">${uiIcon('arrow-right', { size: 18 })}</button></div>`;
}

function homePartnersView() {
  const partners = [
    ['Bancolombia', 'bancolombia.png'],
    ['BBVA', 'bbva.png'],
    ['Banco de Bogotá', 'banco-de-bogota.png'],
    ['Banco de Occidente', 'banco-de-occidente.png'],
    ['Santander', 'santander.png'],
    ['Banco Finandina', 'banco-finandina.jpg'],
    ['Finesa', 'finesa.png'],
    ['Sufi', 'sufi.png'],
    ['RCI', 'rci.png'],
    ['Comfandi', 'comfandi.jpg'],
    ['Vehigrupo', 'vehigrupo.jpg'],
    ['Seguros del Estado', 'seguros-del-estado.png'],
    ['Seguros Bolívar', 'seguros-bolivar.png'],
    ['Sura', 'sura.jpg'],
    ['Allianz', 'allianz.png'],
    ['AXA Colpatria', 'axa-colpatria.png'],
    ['Mapfre', 'mapfre.png'],
    ['HDI Seguros', 'hdi.png'],
    ['Equidad Seguros', 'equidad.png'],
  ];
  const itemsHtml = () => partners.map(([name, file]) => `<li><img src="${appPath(`/assets/aliados/${file}`)}" alt="Logo de ${name}" decoding="async"></li>`).join('');
  return `<section class="home-partners" id="financieras" aria-labelledby="partners-title"><div class="home-section-intro" data-reveal><p>Aliados</p><h2 id="partners-title">Financieras y pólizas contra todo riesgo</h2></div>${logoCarouselView('partners-logos', itemsHtml)}</section>`;
}

function homeBrandsView() {
  const brands = [
    ['Chevrolet', 'chevrolet.svg'],
    ['Mazda', 'mazda.svg'],
    ['Ford', 'ford.svg'],
    ['Renault', 'renault.svg'],
    ['Kia', 'kia.svg'],
    ['Suzuki', 'suzuki.svg'],
    ['Hyundai', 'hyundai.svg'],
    ['Volkswagen', 'volkswagen.svg'],
    ['Toyota', 'toyota.svg'],
    ['BMW', 'bmw.svg'],
    ['Mercedes-Benz', 'mercedes-benz.svg'],
  ];
  const itemsHtml = () => brands.map(([name, file]) => `<li><img src="${appPath(`/assets/marcas/${file}`)}" alt="Logo de ${name}" decoding="async"></li>`).join('');
  return `<section class="home-brands" aria-labelledby="brands-title"><div class="home-section-intro" data-reveal><p>Marcas</p><h2 id="brands-title">Trabajamos con las mejores marcas</h2></div>${logoCarouselView('brands-logos', itemsHtml)}</section>`;
}

function homeSellCarView() {
  return `<section class="home-sell" id="retoma" aria-labelledby="sell-title" style="--sell-image: url('${homeAssets.sell}')"><div class="home-sell__content" data-reveal><div class="home-sell__intro"><h2 id="sell-title">Te compramos tu carro o te lo ayudamos a vender</h2><p class="home-sell__lead">Deja tu información. Te contactamos y te hacemos una oferta.</p></div><form class="home-sell__form" data-sell-car-form data-whatsapp="${whatsappContactUrl1}" novalidate><label class="home-sell__field"><span>Nombre</span><input name="nombre" type="text" autocomplete="name" maxlength="100" required placeholder="Tu nombre"></label><label class="home-sell__field"><span>Teléfono</span><input name="telefono" type="tel" autocomplete="tel" inputmode="tel" maxlength="20" required placeholder="Tu teléfono"></label><button class="primary-button" type="submit">Solicitar oferta</button></form></div></section>`;
}

function homeCreditView() {
  const whatsappUrl = `${whatsappContactUrl1}?text=${encodeURIComponent('Hola, quiero solicitar un crédito para comprar mi vehículo con VEHIMARCAS del Valle.')}`;
  const benefits = [
    ['shield-check', 'Estudio de crédito con varias entidades bancarias'],
    ['tag', 'Cuotas y plazos a tu medida'],
    ['message-circle', 'Aprobación ágil y acompañamiento de un asesor'],
  ];
  return `<section class="home-credit" id="credito" aria-labelledby="credit-title" style="--credit-image: url('${homeAssets.hero}')"><div class="home-credit__content" data-reveal><div class="home-credit__intro"><h2 id="credit-title">Financiamos hasta el <strong class="home-credit__percent">100%</strong> de tu vehículo</h2><p class="home-credit__lead">¡Haz realidad tu compra hoy!</p><ul class="home-credit__benefits">${benefits.map(([icon, text]) => `<li>${uiIcon(icon, { size: 20 })}<span>${text}</span></li>`).join('')}</ul></div><a class="primary-button home-credit__action" href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">${whatsappIcon}Solicitar crédito por WhatsApp</a></div></section>`;
}

function homeAboutView() {
  const blocks = [
    ['sparkles', 'Misión', 'Brindar una experiencia de compra y venta de vehículos clara, segura y cercana, con alternativas de crédito, consignación y peritaje, para que cada cliente haga realidad el carro propio que desea.'],
    ['eye', 'Visión', 'Consolidarnos como el concesionario de vehículos usados más confiable y reconocido del Valle del Cauca, ampliando nuestro catálogo y servicios para acompañar a más familias a tener carro propio.'],
  ];
  const team = [
    ['ivon-sanchez.jpg', 'Ivón Sánchez, asesor de VEHIMARCAS del Valle', 'Ivón Sánchez'],
    ['jhojan-lozano.jpg', 'Jhojan Lozano, asesor de VEHIMARCAS del Valle', 'Jhojan Lozano'],
  ];
  return `<section class="home-about" id="nosotros" aria-labelledby="about-title"><div class="home-section-intro" data-reveal><p>Quiénes somos</p><h2 id="about-title">Calidad &amp; Confianza, del Valle para ti</h2></div><p class="home-about__intro" data-reveal>En VEHIMARCAS del Valle acompañamos a las familias colombianas a comprar, vender y financiar su vehículo con total transparencia. Ofrecemos consignación segura, crédito vehicular, pólizas contra todo riesgo, peritajes y asesoría personalizada.</p><div class="home-about__grid" data-reveal data-reveal-delay="80">${blocks.map(([icon, title, text]) => `<article class="home-about__card"><span class="home-about__icon">${uiIcon(icon, { size: 22 })}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div><div class="home-about__team" data-reveal data-reveal-delay="120"><h3>Nuestro equipo</h3><p class="home-about__team-lead">Asesores que te acompañan de principio a fin.</p><figure class="home-about__team-group"><img src="${appPath('/assets/home/equipo/asesores-grupo.jpg')}" alt="Equipo de asesores de VEHIMARCAS del Valle" loading="lazy" decoding="async"></figure><div class="home-about__team-grid">${team.map(([file, alt, name]) => `<figure class="home-about__member"><img src="${appPath(`/assets/home/equipo/${file}`)}" alt="${alt}" loading="lazy" decoding="async"><figcaption>${name}</figcaption></figure>`).join('')}</div><figure class="home-about__team-video"><video controls playsinline preload="metadata"><source src="${appPath('/assets/home/equipo/equipo-vehimarcas.mp4')}" type="video/mp4">Tu navegador no admite la reproducción de este video.</video></figure></div></section>`;
}

function homeDeliveriesView(deliveries = []) {
  const items = [...deliveries].filter((delivery) => (delivery.archivos || []).length);
  const heading = `<div class="home-section-intro" data-reveal><p>Entregas recientes</p><h2 id="deliveries-title">Clientes Felices</h2></div>`;
  if (!items.length) return `<section class="home-deliveries" id="entregas" aria-labelledby="deliveries-title">${heading}<p class="home-deliveries__empty">Aún no hay entregas publicadas. Pronto compartiremos aquí las entregas de nuestros clientes.</p></section>`;
  const mediaItem = (media) => media.tipo === 'video'
    ? `<video class="delivery-card__media-item" src="${escapeHtml(media.url)}" controls preload="metadata" playsinline></video>`
    : `<img class="delivery-card__media-item" src="${escapeHtml(media.url)}" alt="${escapeHtml(media.texto_alternativo || 'Vehículo entregado')}" loading="lazy">`;
  const card = (delivery) => `<article class="delivery-card" data-reveal><div class="delivery-card__media">${(delivery.archivos || []).map(mediaItem).join('')}</div><div class="delivery-card__body">${delivery.vehiculo ? `<p class="delivery-card__vehicle">${escapeHtml(delivery.vehiculo)}</p>` : ''}<h3>${escapeHtml(delivery.titulo)}</h3>${delivery.descripcion ? `<p>${escapeHtml(delivery.descripcion)}</p>` : ''}</div></article>`;
  return `<section class="home-deliveries" id="entregas" aria-labelledby="deliveries-title">${heading}<div class="delivery-grid">${items.map(card).join('')}</div></section>`;
}

export function homeView(rows = [], deliveries = []) {
  return homeViewMarkup(rows, deliveries);
}

export function catalogView(rows = [], filteredRows = rows, filters = parseCatalogFilters(''), state = {}) {
  filters = { disponibilidades: [], orden: 'destacados', ...filters }; const products = productsFromRows(filteredRows); const categories = categoriesFromRows(rows); const controls = catalogControls(categories, filters, state); const heading = '<div class="public-page-heading"><h1>Catálogo de Vehículos</h1><p>Explora vehículos disponibles, especificaciones y precios.</p></div>';
  if (state.loading) return `${heading}${controls}<p class="public-loading" role="status">Cargando resultados...</p>${loadingView('Cargando resultados...')}`;
  if (state.error) return `${heading}${controls}${errorView(state.error, '/catalogo')}`;
  if (!productsFromRows(rows).length) return `${heading}${controls}<section class="public-empty-state"><h2>El catálogo está vacío</h2><p>Aún no hay vehículos publicados.</p></section>`;
  if (!products.length) return `${heading}${controls}<section class="public-empty-state public-empty-state--no-results"><div class="public-empty-state__icon" aria-hidden="true">${uiIcon('search-x', { size: 32, strokeWidth: 1.4 })}</div><h2>No encontramos resultados con estos criterios</h2><p>Intenta ajustando los términos de búsqueda o eliminando los filtros seleccionados para explorar el catálogo completo de VEHIMARCAS del Valle.</p><button type="button" class="primary-button" data-clear-filters>Restablecer y ver todo ${arrowIcon}</button></section>`;
  return `${heading}${controls}<p class="catalog-result-count" role="status">${products.length} ${products.length === 1 ? 'vehículo' : 'vehículos'}</p><div class="public-product-grid" data-reveal data-reveal-delay="60">${products.map(productCardView).join('')}</div>`;
}

function presentationPrice(presentation) { return presentation.precio_promocional ? `<span class="presentation-price__current">${money(presentation.precio_promocional)}</span> <s class="presentation-price__normal">${money(presentation.precio_normal)}</s>` : `<span class="presentation-price__current">${money(presentation.precio_normal)}</span>`; }
function cartQuantityControl(item, disabled = false) {
  const label = `cantidad de ${item.name}`;
  return `<div class="quantity-control quantity-control--input" role="group" aria-label="${escapeHtml(label)}"><button type="button" data-cart-quantity-change="${item.presentationId}" data-cart-quantity-step="-1" aria-label="Disminuir ${escapeHtml(label)}" ${disabled || item.quantity <= 1 ? 'disabled' : ''}>−</button><input type="number" inputmode="numeric" min="1" max="${Number(item.maxQuantity) || 1}" value="${item.quantity}" data-cart-quantity="${item.presentationId}" aria-label="${escapeHtml(label)}" ${disabled ? 'disabled' : ''}><button type="button" data-cart-quantity-change="${item.presentationId}" data-cart-quantity-step="1" aria-label="Aumentar ${escapeHtml(label)}" ${disabled || item.quantity >= Number(item.maxQuantity) ? 'disabled' : ''}>+</button></div>`;
}
function cartImageView(item) {
  const fallback = '<p class="public-image-fallback" data-public-image-fallback>Imagen no disponible</p>';
  return !item.imageUrl ? `<div class="public-cart-item__image">${fallback}</div>` : `<div class="public-cart-item__image"><img data-public-image src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.imageAlt || item.name || '')}" loading="lazy"><p class="public-image-fallback" data-public-image-fallback hidden>Imagen no disponible</p></div>`;
}
function metadata(product) {
  const fields = [
    ['Marca', product.marca],
    ['Modelo / Especificación', product.modelo],
    ['Año', product.genero],
    ['Estado del vehículo', product.clasificacion ? classificationLabel(product.clasificacion) : 'Seminuevo'],
    ['Transmisión / Motor', product.presentaciones?.[0]?.etiqueta || null]
  ].filter(([, value]) => value);
  return fields.length ? `<dl class="public-product-metadata">${fields.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>` : '';
}
function imageIsVideo(image) {
  return image?.tipo === 'video' || /\.(mp4|webm|mov)(\?|#|$)/i.test(image?.url || '');
}
function productImages(product) {
  const images = Array.isArray(product.imagenes) ? product.imagenes : [];
  const fallback = product.imagen_url ? [{ url: product.imagen_url, tipo: 'imagen', texto_alternativo: product.texto_alternativo }] : [];
  return [...images, ...fallback].filter((image) => image?.url).filter((image, index, collection) => collection.findIndex((current) => current.url === image.url) === index);
}
function productGalleryView(product) {
  const images = productImages(product);
  const fallback = 'Imagen no disponible';
  if (!images.length) return `<div class="public-product-gallery public-product-gallery--single"><div class="public-product-image"><p class="public-image-fallback" data-public-image-fallback>${fallback}</p></div></div>`;
  const main = images[0];
  const mainIsVideo = imageIsVideo(main);
  const cover = images.find((image) => !imageIsVideo(image)) || null;
  const thumbnails = images.length > 1 ? `<div class="public-product-gallery__thumbnails" aria-label="Archivos del producto">${images.map((image, index) => { const video = imageIsVideo(image); const media = video ? `<video src="${escapeHtml(image.url)}" muted playsinline preload="metadata" aria-hidden="true"></video>` : `<img src="${escapeHtml(image.url)}" alt="" loading="lazy">`; return `<button type="button" data-product-gallery-image data-gallery-type="${video ? 'video' : 'imagen'}" data-gallery-url="${escapeHtml(image.url)}" data-gallery-alt="${escapeHtml(image.texto_alternativo || product.nombre || '')}" aria-label="Ver ${video ? 'video' : 'imagen'} ${index + 1} de ${images.length}" aria-pressed="${index === 0}">${media}</button>`; }).join('')}</div>` : '';
  const videoSource = mainIsVideo ? `src="${escapeHtml(main.url)}"` : '';
  const imageSource = cover ? `src="${escapeHtml(cover.url)}"` : '';
  return `<div class="public-product-gallery${images.length === 1 ? ' public-product-gallery--single' : ''}" data-public-gallery>${thumbnails}<div class="public-product-image"><video data-public-video ${videoSource} controls playsinline preload="metadata" ${mainIsVideo ? '' : 'hidden'}></video><img data-public-image ${imageSource} alt="${escapeHtml(cover?.texto_alternativo || product.nombre || '')}" ${mainIsVideo ? 'hidden' : ''}><p class="public-image-fallback" data-public-image-fallback hidden>${fallback}</p></div></div>`;
}
function detailAvailability(presentation) {
  if (presentation.estado === 'Disponible') return '';
  if (presentation.estado === 'Bajo pedido') return 'La disponibilidad y entrega se confirman directamente con VEHIMARCAS del Valle.';
  return 'Este vehículo no admite solicitudes de cotización actualmente.';
}
function detailQuantityControl(product, maximum) {
  const label = `cantidad de ${product.nombre}`;
  return `<div class="quantity-control quantity-control--input" role="group" aria-label="${escapeHtml(label)}"><button type="button" data-detail-quantity-change data-detail-quantity-step="-1" aria-label="Disminuir ${escapeHtml(label)}" disabled>−</button><input id="detail-quantity" name="cantidad" type="number" inputmode="numeric" min="1" max="${maximum}" step="1" value="1" data-detail-quantity aria-label="${escapeHtml(label)}"><button type="button" data-detail-quantity-change data-detail-quantity-step="1" aria-label="Aumentar ${escapeHtml(label)}" ${maximum <= 1 ? 'disabled' : ''}>+</button></div>`;
}
export function productDetailView(product) {
  if (!product) return notFoundView();
  const presentations = product.presentaciones || [];
  const firstRequestable = presentations.find((presentation) => Number(presentation.maximo_solicitable) > 0);
  const whatsappContactUrl = `https://wa.me/573045416480?text=Hola,%20quisiera%20recibir%20informaci%C3%B3n%20y%20cotizaci%C3%B3n%20del%20veh%C3%ADculo%20${encodeURIComponent(product.nombre)}`;
  const detailForm = presentations.length ? `<form class="public-product-detail__form" data-product-detail-form><fieldset class="public-presentations"><legend>Versiones / Transmisión</legend><div class="public-presentations__choices">${presentations.map((presentation) => {
    const maximum = Number(presentation.maximo_solicitable);
    const requestable = maximum > 0;
    return `<label class="public-presentation-option${requestable ? '' : ' is-unavailable'}"><input type="radio" name="presentacion" value="${Number(presentation.id)}" data-detail-presentation="${Number(presentation.id)}" data-presentation-maximum="${maximum}" ${firstRequestable?.id === presentation.id ? 'checked' : ''} ${requestable ? '' : 'disabled'}><span class="public-presentation-option__content"><strong>${escapeHtml(presentation.etiqueta)}</strong><span class="presentation-price">${presentationPrice(presentation)}</span></span></label>`;
  }).join('')}</div></fieldset>${firstRequestable ? `<div class="public-detail-purchase">${detailQuantityControl(product, Number(firstRequestable.maximo_solicitable))}<button class="primary-button" type="submit" data-product-detail-add>${cartIcon}<span>Solicitar Cotización</span></button></div><div class="public-detail-actions" style="margin-top:0.75rem;"><a class="secondary-button public-whatsapp-detail-button" href="${whatsappContactUrl}" target="_blank" rel="noopener noreferrer">${whatsappIcon}<span>Contactar Asesor por WhatsApp</span></a></div><div class="public-detail-availability" aria-live="polite">${presentations.map((presentation) => { const message = detailAvailability(presentation); return `<p data-detail-availability="${Number(presentation.id)}"${firstRequestable.id === presentation.id ? '' : ' hidden'}><span class="catalog-status catalog-status--${statusClass(presentation.estado)}">${escapeHtml(statusLabel(presentation.estado))}</span>${message ? `<span>${escapeHtml(message)}</span>` : ''}</p>`; }).join('')}</div>` : product.disponibilidad === 'Vendido' ? '<p class="public-empty"><span class="catalog-status catalog-status--sold">Vendido</span> Este vehículo fue vendido y ya no está disponible para cotizar.</p>' : '<p class="public-empty">Este vehículo no tiene versiones disponibles actualmente.</p>'}</form>` : '<p class="public-empty">No hay especificaciones disponibles.</p>';
  const productMetadata = metadata(product);
  const features = productMetadata ? `<section class="public-product-features"><h2>Ficha Técnica y Especificaciones</h2>${productMetadata}</section>` : '';
  return `${backLink({ href: appPath('/catalogo'), label: 'Volver al catálogo', className: 'public-back-navigation' })}<article class="public-product-detail">${productGalleryView(product)}<div class="public-product-detail__content"><p class="eyebrow">${escapeHtml(product.categoria_nombre)}</p><h1>${escapeHtml(product.nombre)}</h1>${product.marca ? `<p class="public-product-detail__brand">Marca: ${escapeHtml(product.marca)}</p>` : ''}<p class="public-product-detail__description">${escapeHtml(product.descripcion)}</p>${detailForm}${features}</div></article>`;
}

export function presentationSelectorView(product) { const available = (product.presentaciones || []).filter((item) => ['Disponible', 'Bajo pedido'].includes(item.estado)); return `<section class="public-selector" data-presentation-selector role="dialog" aria-modal="true" aria-labelledby="presentation-selector-title"><div class="public-selector__heading"><h2 id="presentation-selector-title">Elige una presentación</h2><button class="icon-button" type="button" data-presentation-close aria-label="Cerrar selector">${closeIcon}</button></div><p>${escapeHtml(product.nombre)}</p>${available.map((item) => `<button type="button" class="public-selector__option" data-presentation-add="${Number(item.id)}"><strong>${escapeHtml(item.etiqueta)}</strong><span>${presentationPrice(item)} · ${escapeHtml(statusLabel(item.estado))}</span></button>`).join('')}</section>`; }

function requestFormView(state = {}, compact = false) {
  const form = state.form || {}; const errors = state.errors || {}; const busy = Boolean(state.busy); const review = state.priceReview;
  const fieldError = (name) => errors[name] ? `<p class="message message--error" id="request-${name}-error">${escapeHtml(errors[name])}</p>` : '';
  const describedBy = (name) => errors[name] ? `aria-describedby="request-${name}-error"` : '';
  const reviewNotice = review ? `<section class="public-request-review" role="alert"><h2>Revisa los precios actualizados</h2><p>La solicitud todavía no fue registrada. Confirma el nuevo resumen para continuar.</p><ul>${(review.lineas || []).map((line) => `<li><strong>${escapeHtml(line.producto)} · ${escapeHtml(line.presentacion)}</strong><span>Antes ${money(line.precio_esperado)} · ahora ${money(line.precio_unitario)}</span></li>`).join('')}</ul></section>` : '';
  return `<form class="public-request-form" data-request-form novalidate><div class="public-request-form__heading"><p class="eyebrow">Datos de la solicitud</p><h2>¿A quién contactamos?</h2><p>Esta es una solicitud de compra, no un pago ni una venta confirmada.</p></div>${reviewNotice}${errors.cart ? `<p class="message message--error" role="alert">${escapeHtml(errors.cart)}</p>` : ''}<div class="public-request-form__fields"><label>Nombre<input name="nombre" autocomplete="name" minlength="2" maxlength="100" value="${escapeHtml(form.nombre)}" ${describedBy('nombre')} required></label>${fieldError('nombre')}<label>Teléfono<input name="telefono" type="tel" autocomplete="tel" inputmode="tel" maxlength="30" value="${escapeHtml(form.telefono)}" ${describedBy('telefono')} required></label>${fieldError('telefono')}<label>Ciudad <span class="public-optional">Opcional</span><input name="ciudad" autocomplete="address-level2" maxlength="100" value="${escapeHtml(form.ciudad)}" ${describedBy('ciudad')}></label>${fieldError('ciudad')}<label class="public-request-form__observations">Observaciones <span class="public-optional">Opcional</span><textarea name="observaciones" maxlength="500" ${describedBy('observaciones')}>${escapeHtml(form.observaciones)}</textarea></label>${fieldError('observaciones')}</div><p class="field-help">La dirección, la entrega y el costo de envío se confirman directamente con VEHIMARCAS del Valle.</p><label class="public-legal-acceptance"><input name="aceptaTerminos" type="checkbox" ${form.aceptaTerminos ? 'checked' : ''}><span>He leído y acepto los <button type="button" data-legal-modal="terms">Términos y condiciones</button>.</span></label><label class="public-legal-acceptance"><input name="aceptaPoliticaDatos" type="checkbox" ${form.aceptaPoliticaDatos ? 'checked' : ''}><span>He leído y acepto la <button type="button" data-legal-modal="policy">Política de tratamiento de datos</button>.</span></label>${fieldError('aceptacion')}${state.error ? `<p class="message message--error" role="alert">${escapeHtml(state.error)}</p>` : ''}<button class="primary-button" type="submit" ${busy ? 'disabled aria-busy="true"' : ''}>${busy ? 'Registrando...' : review ? 'Confirmar nuevos precios y registrar' : 'Registrar solicitud'}</button></form>`;
}

function confirmationView(confirmation) {
  return `<section class="public-confirmation" aria-labelledby="confirmation-title"><p class="eyebrow">VEHIMARCAS del Valle</p><h1 id="confirmation-title">Solicitud registrada</h1><p class="public-confirmation__code">Código de solicitud <strong>${escapeHtml(confirmation.codigo)}</strong></p><p>Tu solicitud quedó registrada como Nueva. Un asesor de VEHIMARCAS del Valle te contactará para confirmar la disponibilidad y coordinar los detalles.</p><ul>${confirmation.lineas.map((line) => `<li><span>${escapeHtml(line.producto)} · ${escapeHtml(line.presentacion)} × ${line.cantidad}</span><strong>${money(line.subtotal)}</strong></li>`).join('')}</ul><p class="public-confirmation__total">Valor total de productos <strong>${money(confirmation.valor_total_productos)}</strong></p><div class="public-confirmation__actions"><a class="primary-button" href="${whatsappUrl(confirmation)}" target="_blank" rel="noopener noreferrer">Continuar por WhatsApp</a><a class="secondary-button" href="${appPath('/catalogo')}">Seguir viendo productos</a><button class="link-button" type="button" data-request-new>Registrar otra solicitud</button></div></section>`;
}

function publicRequestSummaryView(request) {
  return `<section class="public-confirmation public-request-status-view" aria-labelledby="request-status-title"><p class="eyebrow">VEHIMARCAS del Valle</p><h1 id="request-status-title">Solicitud ${escapeHtml(request.codigo)}</h1><p class="public-confirmation__code">Estado de solicitud <strong>${escapeHtml(request.estado)}</strong></p><ul>${(request.lineas || []).map((line) => `<li><span>${escapeHtml(line.producto)} · ${escapeHtml(line.presentacion)} × ${line.cantidad}</span><strong>${money(line.subtotal)}</strong></li>`).join('')}</ul><p class="public-confirmation__total">Valor total de productos <strong>${money(request.valor_total_productos)}</strong></p></section>`;
}

export function publicRequestView(request, state = {}) {
  if (!request) return errorView('No pudimos cargar la información de esta solicitud.', '/catalogo');
  return `${publicRequestSummaryView(request)}<a class="primary-button" href="${whatsappContactUrl1}" target="_blank" rel="noopener noreferrer">Continuar por WhatsApp</a>`;
}

export function cartView(cart = { items: [] }, state = {}) {
  if (state.confirmation) return confirmationView(state.confirmation);
  if (!cart.items.length) return `<section class="public-section public-cart-empty"><p class="eyebrow">VEHIMARCAS del Valle</p><h1>Carrito (0)</h1><p>Tu carrito está vacío. Agrega presentaciones disponibles o bajo pedido desde el catálogo.</p><a class="primary-button" href="${appPath('/catalogo')}">Explorar catálogo</a></section>`;
  const verification = state.loading ? '<p class="public-cart__verification" role="status">Verificando disponibilidad y precios actuales...</p>' : state.error ? `<div class="public-cart__verification public-cart__verification--error"><p role="alert">${escapeHtml(state.error)}</p><button class="secondary-button" type="button" data-public-retry>Reintentar</button></div>` : state.ready === false ? '<p class="public-cart__verification public-cart__verification--warning" role="status">Corrige las líneas señaladas antes de continuar con la solicitud.</p>' : '<p class="public-cart__verification" role="status">Tu carrito está actualizado.</p>';
  const selectedItems = getSelectedCartItems(cart); const selectedTotal = getSelectedCartTotal(cart);
  const selectionNotice = selectedItems.length ? `<p class="public-cart__selection-summary">${selectedItems.length} ${selectedItems.length === 1 ? 'producto seleccionado' : 'productos seleccionados'} para esta solicitud.</p>` : '<p class="public-cart__verification public-cart__verification--warning" role="status">Selecciona al menos un producto para registrar la solicitud.</p>';
  return `<section class="public-cart"><div class="public-page-heading"><p class="eyebrow">VEHIMARCAS del Valle</p><h1>Revisa tu carrito</h1><p>Elige las presentaciones que deseas incluir antes de registrar la solicitud.</p></div>${verification}<div class="public-cart__layout"><div>${selectionNotice}<ul class="public-cart__items">${cart.items.map((item) => {
    const validation = item.validation; const disabled = state.loading || validation?.quantityEditable === false;
    const notice = validation?.message ? `<p class="public-cart__notice public-cart__notice--${escapeHtml(validation.state)}" role="status">${escapeHtml(validation.message)}</p>` : '';
    return `<li class="public-cart-item ${validation?.state === 'blocked' ? 'is-blocked' : ''}">${cartImageView(item)}<div class="public-cart-item__details"><label class="public-cart__select"><input type="checkbox" data-cart-select="${item.presentationId}" ${item.selected !== false ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span>Incluir en esta solicitud</span></label><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.label)}</span><span class="catalog-status catalog-status--${statusClass(item.status)}">${escapeHtml(statusLabel(item.status))}</span><span>${money(item.price)} c/u</span>${notice}</div><div class="public-cart-item__actions">${cartQuantityControl(item, disabled)}<strong class="public-cart-item__subtotal">${money(item.price * item.quantity)}</strong><button class="icon-button public-cart-item__remove" type="button" data-cart-remove="${item.presentationId}" aria-label="Retirar ${escapeHtml(item.name)}" title="Retirar">${trashIcon}</button></div></li>`;
  }).join('')}</ul></div><aside class="public-cart__summary"><p>Valor total de productos seleccionados</p><strong class="public-cart__total">${money(selectedTotal)}</strong>${selectedItems.length !== cart.items.length ? `<p class="field-help">Total del carrito: ${money(getCartTotal(cart))}</p>` : ''}<p>Domicilio o envío se confirma posteriormente con VEHIMARCAS del Valle.</p><a class="secondary-button" href="${appPath('/catalogo')}">Seguir comprando</a></aside></div>${state.ready && !state.loading && !state.error && selectedItems.length ? requestFormView(state.requestState) : ''}</section>`;
}

function drawerConfirmationView(confirmation, state = {}) {
  const continuation = '<p>Un asesor de VEHIMARCAS del Valle te contactará por WhatsApp para confirmar la disponibilidad y coordinar los detalles.</p>';
  return `<section class="public-drawer-confirmation"><p class="public-drawer-confirmation__success">${uiIcon('circle-check-big', { size: 26 })}<span><strong>Tu solicitud se registró correctamente.</strong><small>Guarda este código para identificar tu solicitud.</small></span></p><div class="public-drawer-confirmation__code"><span>Código de solicitud</span><div><strong>${escapeHtml(confirmation.codigo)}</strong><button class="icon-button" type="button" data-confirmation-copy="${escapeHtml(confirmation.codigo)}" aria-label="Copiar código de solicitud" title="Copiar código de solicitud">${copyIcon}</button></div></div><section class="public-drawer-confirmation__summary" aria-labelledby="drawer-request-summary"><h3 id="drawer-request-summary">Resumen de tu solicitud</h3><ul>${confirmation.lineas.map((line) => `<li><span>${escapeHtml(line.producto)} · ${escapeHtml(line.presentacion)} × ${line.cantidad}</span><strong>${money(line.subtotal)}</strong></li>`).join('')}</ul><p class="public-drawer-confirmation__total"><span>Total</span><strong>${money(confirmation.valor_total_productos)}</strong></p></section><section class="public-drawer-confirmation__continuation">${continuation}</section><div class="public-drawer-confirmation__actions"><a class="public-whatsapp-button" href="${whatsappUrl(confirmation)}" target="_blank" rel="noopener noreferrer">${whatsappIcon}<span>Continuar por WhatsApp</span></a></div><nav class="public-drawer-confirmation__links" aria-label="Acciones secundarias"><a href="${appPath('/catalogo')}" data-confirmation-continue>Seguir viendo productos</a><span aria-hidden="true" class="public-drawer-confirmation__links-separator"></span><button class="link-button" type="button" data-request-new>Registrar otra solicitud</button></nav></section>`;
}

function legacyDrawerRequestFormView(state = {}) {
  const form = state.form || {}; const errors = state.errors || {}; const busy = Boolean(state.busy); const review = state.priceReview;
  const error = (name) => errors[name] ? `<p class="public-request-form__error" id="request-${name}-error">${escapeHtml(errors[name])}</p>` : '';
  const invalid = (name) => errors[name] ? `aria-invalid="true" aria-describedby="request-${name}-error"` : '';
  const reviewNotice = review ? `<section class="public-request-review" role="alert"><h2>Revisa los precios actualizados</h2><p>La solicitud todavía no fue registrada. Confirma el nuevo resumen para continuar.</p></section>` : '';
  return `<form class="public-request-form public-request-form--drawer" data-request-form novalidate><div class="public-request-form__heading"><h3>¿A quién contactamos?</h3><p>Esta es una solicitud de compra, no un pago ni una venta confirmada.</p></div>${reviewNotice}${errors.cart ? `<p class="public-request-form__error" role="alert">${escapeHtml(errors.cart)}</p>` : ''}<div class="public-request-form__fields"><div class="public-request-form__field"><label for="request-name">Nombre</label><input id="request-name" name="nombre" autocomplete="name" minlength="2" maxlength="100" value="${escapeHtml(form.nombre)}" ${invalid('nombre')} required>${error('nombre')}</div><div class="public-request-form__field"><label for="request-phone">Teléfono</label><input id="request-phone" name="telefono" type="tel" autocomplete="tel" inputmode="tel" maxlength="30" value="${escapeHtml(form.telefono)}" ${invalid('telefono')} required>${error('telefono')}</div><div class="public-request-form__field"><label for="request-city">Ciudad <span class="public-optional">Opcional</span></label><input id="request-city" name="ciudad" autocomplete="address-level2" maxlength="100" value="${escapeHtml(form.ciudad)}" ${invalid('ciudad')}>${error('ciudad')}</div><div class="public-request-form__field public-request-form__observations"><label for="request-notes">Observaciones <span class="public-optional">Opcional</span></label><textarea id="request-notes" name="observaciones" maxlength="500" ${invalid('observaciones')}>${escapeHtml(form.observaciones)}</textarea>${error('observaciones')}</div></div><p class="field-help">La dirección, la entrega y el costo de envío se confirman directamente con VEHIMARCAS del Valle.</p><div class="public-request-form__legal"><label class="public-legal-acceptance"><input name="aceptaTerminos" type="checkbox" ${form.aceptaTerminos ? 'checked' : ''} ${errors.aceptacion ? 'aria-invalid="true" aria-describedby="request-acceptance-error"' : ''}><span>He leído y acepto los <button type="button" data-legal-modal="terms">Términos y condiciones</button>.</span></label><label class="public-legal-acceptance"><input name="aceptaPoliticaDatos" type="checkbox" ${form.aceptaPoliticaDatos ? 'checked' : ''} ${errors.aceptacion ? 'aria-invalid="true" aria-describedby="request-acceptance-error"' : ''}><span>He leído y acepto la <button type="button" data-legal-modal="policy">Política de tratamiento de datos</button>.</span></label>${errors.aceptacion ? `<p class="public-request-form__error" id="request-acceptance-error">${escapeHtml(errors.aceptacion)}</p>` : ''}</div>${state.error ? `<p class="public-request-form__error" role="alert">${escapeHtml(state.error)}</p>` : ''}<button class="primary-button" type="submit" ${busy ? 'disabled aria-busy="true"' : ''}>${busy ? 'Registrando solicitud...' : 'Registrar solicitud'}</button></form>`;
}

function drawerRequestFormView(state = {}) {
  const form = state.form || {}; const errors = state.errors || {}; const busy = Boolean(state.busy); const review = state.priceReview;
  const error = (name) => errors[name] ? `<p class="public-request-form__error" id="request-${name}-error">${escapeHtml(errors[name])}</p>` : '';
  const invalid = (name) => errors[name] ? `aria-invalid="true" aria-describedby="request-${name}-error"` : '';
  const reviewNotice = review ? '<section class="public-request-review" role="alert"><h2>Revisa los precios actualizados</h2><p>La solicitud todavía no fue registrada. Confirma el nuevo resumen para continuar.</p></section>' : '';
  return `<form class="public-request-form public-request-form--drawer" data-request-form novalidate><div class="public-request-form__heading"><h3>¿A quién contactamos?</h3><p>Esta es una solicitud de compra, no un pago ni una venta confirmada.</p></div>${reviewNotice}${errors.cart ? `<p class="public-request-form__error" role="alert">${escapeHtml(errors.cart)}</p>` : ''}<div class="public-request-form__fields"><div class="public-request-form__field"><label for="request-name">Nombre</label><input id="request-name" name="nombre" autocomplete="name" minlength="2" maxlength="100" value="${escapeHtml(form.nombre)}" ${invalid('nombre')} required>${error('nombre')}</div><div class="public-request-form__field"><label for="request-phone">Teléfono</label><input id="request-phone" name="telefono" type="tel" autocomplete="tel" inputmode="tel" maxlength="30" value="${escapeHtml(form.telefono)}" ${invalid('telefono')} required>${error('telefono')}</div><div class="public-request-form__field"><label for="request-city">Ciudad o municipio <span class="public-optional">Opcional</span></label>${cityComboboxView(form, errors)}</div><div class="public-request-form__field public-request-form__observations"><label for="request-notes">Observaciones <span class="public-optional">Opcional</span></label><textarea id="request-notes" name="observaciones" maxlength="500" ${invalid('observaciones')}>${escapeHtml(form.observaciones)}</textarea>${error('observaciones')}</div></div><p class="field-help">La dirección, la entrega y el costo de envío se confirman directamente con VEHIMARCAS del Valle.</p><div class="public-request-form__legal"><label class="public-legal-acceptance"><input name="aceptaTerminos" type="checkbox" ${form.aceptaTerminos ? 'checked' : ''} ${errors.aceptacion ? 'aria-invalid="true" aria-describedby="request-acceptance-error"' : ''}><span>He leído y acepto los <button type="button" data-legal-modal="terms">Términos y condiciones</button>.</span></label><label class="public-legal-acceptance"><input name="aceptaPoliticaDatos" type="checkbox" ${form.aceptaPoliticaDatos ? 'checked' : ''} ${errors.aceptacion ? 'aria-invalid="true" aria-describedby="request-acceptance-error"' : ''}><span>He leído y acepto la <button type="button" data-legal-modal="policy">Política de tratamiento de datos</button>.</span></label>${error('aceptacion')}</div>${state.error ? `<p class="public-request-form__error" role="alert">${escapeHtml(state.error)}</p>` : ''}<button class="primary-button" type="submit" ${busy ? 'disabled' : ''}>${busy ? 'Registrando solicitud...' : review ? 'Confirmar solicitud con precios actualizados' : 'Registrar solicitud'}</button></form>`;
}

function drawerCartItemView(item, { selectionDisabled = false, quantityDisabled = false } = {}) {
  const notice = item.validation?.message ? `<p class="public-cart__notice public-cart__notice--${escapeHtml(item.validation.state)}" role="alert">${escapeHtml(item.validation.message)}</p>` : '';
  return `<li class="public-cart-drawer__item ${item.validation?.state === 'blocked' ? 'is-blocked' : ''}"><label class="public-cart-drawer__select"><input type="checkbox" data-cart-select="${item.presentationId}" aria-label="Incluir ${escapeHtml(item.name)} en esta solicitud" ${item.selected !== false ? 'checked' : ''} ${selectionDisabled ? 'disabled' : ''}><span class="visually-hidden">Incluir ${escapeHtml(item.name)} en esta solicitud</span></label>${cartImageView(item)}<div class="public-cart-drawer__item-content"><div class="public-cart-drawer__item-top"><strong>${escapeHtml(item.name)}</strong><strong>${money(item.price * item.quantity)}</strong></div><p class="public-cart-drawer__item-meta">${escapeHtml(item.label)} <span aria-hidden="true">•</span> <span class="catalog-status catalog-status--${statusClass(item.status)}">${escapeHtml(statusLabel(item.status))}</span></p><span class="public-cart-drawer__unit-price">${money(item.price)} c/u</span>${notice}<div class="public-cart-drawer__actions">${cartQuantityControl(item, quantityDisabled)}<button class="icon-button public-cart-drawer__remove" type="button" data-cart-remove="${item.presentationId}" aria-label="Retirar ${escapeHtml(item.name)}" title="Retirar">${trashIcon}</button></div></div></li>`;
}
export function cartDrawerView(cart = { items: [] }, state = {}) {
  const drawer = typeof state === 'boolean' ? { open: state } : state;
  if (!drawer.open) return '';
  const items = cart.items || [];
  const cartState = drawer.cartState || {};
  const selectedItems = getSelectedCartItems(cart);
  const total = getSelectedCartTotal(cart);
  const verification = cartState.loading ? '<p class="public-cart__verification" role="status">Verificando disponibilidad y precios actuales...</p>' : cartState.error ? `<p class="public-cart__verification public-cart__verification--error" role="alert">${escapeHtml(cartState.error)}</p>` : cartState.ready === false ? '<p class="public-cart__verification public-cart__verification--warning" role="alert">Corrige las líneas señaladas antes de continuar con la solicitud.</p>' : '';
  const drawerError = drawer.error ? `<p class="public-cart__verification public-cart__verification--error" role="alert">${escapeHtml(drawer.error)}</p>` : '';
  const header = drawer.step === 'form' ? `${backButton({ label: 'Volver al carrito', className: 'public-cart-drawer__back', attributes: 'data-cart-drawer-back' })}<div><h2 id="cart-drawer-title">Datos de la solicitud</h2></div>` : `<div><h2 id="cart-drawer-title">${drawer.step === 'confirmation' ? 'Solicitud registrada' : 'Tu carrito'}</h2></div>`;
  const selectionSummary = selectedItems.length ? `${selectedItems.length} de ${items.length} ${items.length === 1 ? 'producto seleccionado' : 'productos seleccionados'}` : 'Selecciona al menos un producto para continuar';
  const body = drawer.step === 'confirmation' && drawer.confirmation ? `<div class="public-cart-drawer__confirmation">${drawerConfirmationView(drawer.confirmation, drawer)}</div>` : drawer.step === 'form' ? `<div class="public-cart-drawer__form"><p class="public-cart-drawer__summary">${selectedItems.length} ${selectedItems.length === 1 ? 'producto' : 'productos'} · <strong>${money(total)}</strong></p>${drawerRequestFormView(drawer.requestState)}</div>` : items.length ? `${verification}${drawerError}<ul>${items.map((item) => drawerCartItemView(item, { selectionDisabled: cartState.loading, quantityDisabled: cartState.loading || item.validation?.quantityEditable === false })).join('')}</ul><footer><p>Total <strong>${money(total)}</strong></p><p class="field-help">${selectionSummary}</p><button class="primary-button" type="button" data-cart-drawer-continue ${cartState.loading || cartState.error || cartState.ready === false || !selectedItems.length ? 'disabled' : ''}>Continuar con la solicitud</button></footer>` : `<div class="public-cart-drawer__empty">${drawerError}<p>Tu carrito está vacío.</p><button class="secondary-button" type="button" data-cart-drawer-close>Continuar explorando</button></div>`;
  return `<div class="public-cart-drawer" data-cart-drawer><div class="public-cart-drawer__backdrop" data-cart-drawer-close></div><aside class="public-cart-drawer__panel" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title"><header>${header}<button class="icon-button" type="button" data-cart-drawer-close aria-label="${drawer.step === 'confirmation' ? 'Cerrar' : 'Cerrar carrito'}" title="Cerrar">${closeIcon}</button></header>${body}</aside></div>`;
}
export function notFoundView() { return `<section class="public-section public-not-found"><h1>No encontrado</h1><p>Este producto no existe o dejó de publicarse.</p>${backLink({ href: appPath('/catalogo'), label: 'Volver al catálogo' })}</section>`; }
export function loadingView(label = 'Cargando catálogo...') {
  const card = () => '<div class="skeleton-card"><span class="skeleton skeleton-image"></span><span class="skeleton skeleton-line skeleton-line--60"></span><span class="skeleton skeleton-line skeleton-line--40"></span><span class="skeleton skeleton-line skeleton-line--80"></span></div>';
  return `<p class="public-loading" role="status">${escapeHtml(label)}</p><div class="public-skeleton" aria-hidden="true">${card()}${card()}${card()}${card()}</div>`;
}
export function errorView(message, retryRoute) { return `<section class="public-section public-error"><p class="message message--error" role="alert">${escapeHtml(message)}</p><button class="secondary-button" type="button" data-public-retry="${escapeHtml(retryRoute)}">Reintentar</button></section>`; }
export function renderPublicRoute(route, result = {}) { if (route.name === 'cart') return cartView(result.cart, result.cartState); if (route.name === 'request') return publicRequestView(result.data); if (route.name === 'not-found') return notFoundView(); if (result.error) return errorView(result.error, route.name === 'product' ? `/producto/${route.productId}` : `/${route.name === 'catalog' ? 'catalogo' : ''}`); if (route.name === 'product') return result.data ? productDetailView(result.data) : notFoundView(); if (route.name === 'catalog') return result.catalogState ? catalogView(result.catalogState.baseRows, result.catalogState.filteredRows, result.catalogState.filters, result.catalogState) : catalogView(result.data || []); return homeView(result.data || [], result.deliveries || []); }
