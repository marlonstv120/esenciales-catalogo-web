import test from 'node:test';
import assert from 'node:assert/strict';
import { cartDrawerView, cartView, catalogView, homeView, legalModalView, mobileMenuDrawerView, productDetailView, publicRequestView, publicShellView } from '../src/public-views.mjs';

const row = { categoria_id: 1, categoria_nombre: 'SUV & Camionetas', producto_id: 4, nombre: 'Brisa', descripcion: 'Camioneta moderna', imagen_url: 'https://example.test/brisa.webp', texto_alternativo: 'Brisa', precio_referencia: 50000000, precio_normal_referencia: 60000000, precio_desde: true, disponibilidad: 'Disponible', destacado: true };
test('catalog has one grid, an independent add action, price and textual availability', () => { const view = catalogView([row]); assert.match(view, /<h1>Catálogo de Vehículos<\/h1>/); assert.doesNotMatch(view, /<p class="eyebrow">VEHIMARCAS/); assert.doesNotMatch(view, /id="categoria-1"/); assert.match(view, /Desde/); assert.match(view, /En stock/); assert.match(view, /data-product-add="4"/); assert.match(view, /aria-label="Consultar por WhatsApp sobre Brisa"/); });
test('catalog exposes persistent filters, search controls and tags without an order control', () => { const filters = { busqueda: 'brisa', categoria: 1, disponibilidades: ['en-stock'], generos: ['toyota'], clasificaciones: [], precioMinimo: '30000', precioMaximo: '', orden: 'precio-asc' }; const view = catalogView([row], [row], filters); assert.match(view, /Filtros \(5\)/); assert.match(view, /data-clear-search/); assert.match(view, /aria-label="Borrar búsqueda"/); assert.match(view, /Disponibilidad/); assert.match(view, /Limpiar filtros/); assert.match(view, /Filtros aplicados/); assert.match(view, /Quitar filtro/); assert.doesNotMatch(view, /catalog-order|Ordenar|Menor precio|Mayor precio/); });
test('no-results state occupies the catalog width with clear recovery copy', () => { const filters = { busqueda: 'sin coincidencias', categoria: null, disponibilidades: [], generos: [], clasificaciones: [], precioMinimo: '', precioMaximo: '', orden: 'destacados' }; const view = catalogView([row], [], filters); assert.match(view, /public-empty-state--no-results/); assert.match(view, /No encontramos resultados con estos criterios/); assert.match(view, /explorar el catálogo completo de VEHIMARCAS del Valle/); assert.match(view, /Restablecer y ver todo/); });
test('sold catalog cards show the badge and hide the WhatsApp action', () => {
  const soldRow = { ...row, producto_id: 9, nombre: 'Brisa Z', disponibilidad: 'Vendido' };
  const view = catalogView([soldRow]);
  assert.match(view, /catalog-status catalog-status--sold">Vendido<\/span>/);
  assert.match(view, /Vehículo vendido/);
  assert.doesNotMatch(view, /data-product-add="9"/);
  assert.doesNotMatch(view, /public-whatsapp-button-card/);
});
test('sold product detail keeps a requestable-none state and explains the sale', () => {
  const view = productDetailView({ ...row, producto_id: 9, nombre: 'Brisa Z', marca: 'Vehimarcas', genero: '2024', modelo: 'Brisa', clasificacion: 'usado', disponibilidad: 'Vendido', presentaciones: [{ id: 7, etiqueta: 'Única', estado: 'Vendido', precio_normal: 50000000, maximo_solicitable: 0 }] });
  assert.match(view, /catalog-status--sold">Vendido<\/span>/);
  assert.match(view, /fue vendido y ya no está disponible para cotizar/);
  assert.doesNotMatch(view, /data-product-detail-add/);
});
test('offers other availability options as catalog filters', () => {
  const filters = { busqueda: '', categoria: null, disponibilidades: ['agotado'], generos: [], clasificaciones: [], precioMinimo: '', precioMaximo: '', orden: 'destacados' };
  const view = catalogView([row], [row], filters, { panelOpen: true });
  assert.match(view, /value="agotado" checked/);
  assert.match(view, /Disponibilidad: Agotado/);
});
test('home categories lead to the shared catalog filters and featured data is not hidden by name', () => { assert.match(homeView([row]), /href="\/catalogo\?categoria=1"/); assert.match(homeView([{ ...row, nombre: 'prubea' }]), /prubea/); });
test('home shows partner bank and insurer logos below the featured catalog', () => {
  const view = homeView([row]);
  const partnersIndex = view.search('<section class="home-partners"');
  const featuredIndex = view.search('public-featured');
  const qualityIndex = view.search('home-quality');
  assert.ok(partnersIndex > featuredIndex, 'la sección de aliados va después del catálogo destacado');
  assert.ok(partnersIndex < qualityIndex, 'la sección de aliados va antes de la sección de garantías');
  assert.match(view, /Financieras y pólizas contra todo riesgo/);
  ['bancolombia.png', 'bbva.png', 'banco-de-bogota.png', 'banco-de-occidente.png', 'santander.png', 'banco-finandina.jpg', 'finesa.png', 'sufi.png', 'rci.png', 'comfandi.jpg', 'vehigrupo.jpg', 'seguros-del-estado.png', 'seguros-bolivar.png', 'sura.jpg', 'allianz.png', 'axa-colpatria.png', 'mapfre.png', 'hdi.png', 'equidad.png'].forEach((file) => assert.match(view, new RegExp(`/assets/aliados/${file}`)));
});
test('home shows the vehicle brand logos after the quality section', () => {
  const view = homeView([row]);
  const qualityIndex = view.search('home-quality');
  const brandsIndex = view.search('home-brands');
  const deliveriesIndex = view.search('home-deliveries');
  assert.ok(brandsIndex > qualityIndex, 'la franja de marcas va después de la sección de calidad');
  assert.ok(brandsIndex < deliveriesIndex, 'la franja de marcas va antes de las entregas');
  assert.match(view, /Trabajamos con las mejores marcas/);
  ['chevrolet.svg', 'mazda.svg', 'ford.svg', 'renault.svg', 'kia.svg', 'suzuki.svg', 'hyundai.svg', 'volkswagen.svg', 'toyota.svg', 'bmw.svg', 'mercedes-benz.svg'].forEach((file) => assert.match(view, new RegExp(`/assets/marcas/${file}`)));
  assert.match(view, /Chevrolet, Mazda, Ford, Renault, Kia, Suzuki, Hyundai, Volkswagen, Toyota, BMW y Mercedes-Benz/);
});
test('home renders the partner and brand logos as horizontal carousels', () => {
  const view = homeView([row]);
  assert.match(view, /data-logo-carousel/);
  assert.match(view, /class="logo-carousel__track partners-logos" data-carousel-track>/);
  assert.match(view, /class="logo-carousel__track brands-logos" data-carousel-track>/);
  assert.match(view, /data-carousel-scroll="-1"/);
  assert.match(view, /data-carousel-scroll="1"/);
  assert.match(view, /class="logo-carousel__track brands-logos" data-carousel-track><li><img src="[^"]*chevrolet\.svg" alt="Logo de Chevrolet" decoding="async"><\/li>/);
  assert.doesNotMatch(view, /data-carousel-clone/);
});
test('home shows the sell-your-car express quote form after the featured vehicles', () => {
  const view = homeView([row]);
  const featuredIndex = view.search('public-featured');
  const sellIndex = view.search('home-sell');
  const partnersIndex = view.search('home-partners');
  assert.ok(sellIndex > featuredIndex, 'el cotizador va después de los vehículos destacados');
  assert.ok(sellIndex < partnersIndex, 'el cotizador va antes de los aliados');
  assert.match(view, /Te compramos tu carro o te lo ayudamos a vender/);
  assert.match(view, /class="home-sell"[^>]*--sell-image: url\('\/assets\/home\/retoma\.jpeg'\)/);
  assert.doesNotMatch(view, /Cotizador express/);
  assert.match(view, /Deja tu información\. Te contactamos y te hacemos una oferta\./);
  assert.match(view, /data-sell-car-form/);
  assert.match(view, /name="nombre"/);
  assert.match(view, /name="telefono"/);
  assert.match(view, /data-whatsapp="https:\/\/wa\.me\/573045416480"/);
});
test('home anchors the retoma, financieras, credit and entregas navigation links next to the catalog link', () => {
  const home = publicShellView('<h1>Inicio</h1>', 'home', { items: [] });
  assert.match(home, /Catálogo<\/a><a href="#retoma">Retoma<\/a><a href="#financieras">Financieras<\/a><a href="#credito">Solicita tu crédito<\/a><a href="#entregas">Entregas<\/a><a href="#nosotros">Quiénes somos<\/a>/);
  const catalog = publicShellView('<h1>Catálogo</h1>', 'catalog', { items: [] });
  assert.doesNotMatch(catalog, /href="#retoma"/);
  assert.doesNotMatch(catalog, /href="#credito"/);
  assert.doesNotMatch(catalog, /href="#entregas"/);
  const content = homeView([row]);
  assert.match(content, /id="retoma"/);
  assert.match(content, /id="financieras"/);
  assert.match(content, /id="credito"/);
  assert.match(content, /id="nosotros"/);
});
test('home offers a credit section with a WhatsApp call to action', () => {
  const view = homeView([row]);
  const creditIndex = view.search('home-credit');
  const partnersIndex = view.search('home-partners');
  assert.ok(creditIndex > partnersIndex, 'la sección de crédito va después de los aliados');
  assert.match(view, /Financiamos hasta el <strong class="home-credit__percent">100%<\/strong> de tu vehículo/);
  assert.match(view, /--credit-image: url\('\/assets\/home\/hero-vehimarcas\.png'\)/);
  assert.match(view, /¡Haz realidad tu compra hoy!/);
  assert.match(view, /href="https:\/\/wa\.me\/573045416480\?text=Hola%2C/);
  assert.match(view, /Solicitar crédito por WhatsApp/);
});
test('home shows the quienes somos, mission and vision section at the bottom', () => {
  const view = homeView([row]);
  const processIndex = view.search('home-process');
  const aboutIndex = view.search('home-about');
  assert.ok(aboutIndex > processIndex, 'la sección de quiénes somos va al final del inicio');
  assert.match(view, /id="nosotros"/);
  assert.match(view, /Quiénes somos/);
  assert.match(view, /Misión/);
  assert.match(view, /Visión/);
  assert.match(view, /Nuestro equipo/);
  assert.match(view, /\/assets\/home\/equipo\/asesores-grupo\.jpg/);
  assert.match(view, /\/assets\/home\/equipo\/ivon-sanchez\.jpg/);
  assert.match(view, /\/assets\/home\/equipo\/jhojan-lozano\.jpg/);
  assert.match(view, /<video[^>]*controls[^>]*>.*equipo-vehimarcas\.mp4/s);
});
test('home hero uses the advisors photo as its background', () => {
  const view = homeView([row]);
  assert.match(view, /class="public-hero"[^>]*--hero-image: url\('\/assets\/home\/asesores-horizontal\.jpg'\)/);
  assert.doesNotMatch(view, /--hero-image: url\('\/assets\/home\/hero-vehimarcas\.png'\)/);
  assert.doesNotMatch(view, /home-advisors/);
});
test('home shows delivered-vehicle photos and videos after the guarantees section', () => {
  const deliveries = [
    { id: 1, titulo: 'Entrega de Hilux', descripcion: 'Cliente feliz', vehiculo: 'Toyota Hilux', archivos: [{ id: 1, url: 'https://example.test/entrega.jpg', tipo: 'imagen', texto_alternativo: 'Hilux entregada' }, { id: 2, url: 'https://example.test/entrega.mp4', tipo: 'video', texto_alternativo: null }] },
  ];
  const view = homeView([row], deliveries);
  assert.match(view, /Entregas recientes/);
  assert.match(view, /Clientes Felices/);
  assert.match(view, /Toyota Hilux/);
  assert.match(view, /<img class="delivery-card__media-item" src="https:\/\/example.test\/entrega.jpg"/);
  assert.match(view, /<video class="delivery-card__media-item" src="https:\/\/example.test\/entrega.mp4"/);
  const qualityIndex = view.search('home-quality');
  const deliveriesIndex = view.search('home-deliveries');
  const identityIndex = view.search('home-identity');
  assert.ok(deliveriesIndex > qualityIndex, 'las entregas van después de las garantías');
  assert.ok(deliveriesIndex < identityIndex, 'las entregas van antes del bloque de identidad');
});
test('home keeps the deliveries section visible without published files and shows an empty state', () => {
  assert.match(homeView([row]), /id="entregas"/);
  assert.doesNotMatch(homeView([row]), /<div class="delivery-grid">/);
  assert.match(homeView([row], [{ id: 1, titulo: 'Sin archivos', archivos: [] }]), /home-deliveries__empty/);
});
test('home presents the editorial category filters and required brand sections', () => {
  const view = homeView([row]);

  assert.match(view, /assets\/home\/hero-vehimarcas\.png/);
  assert.match(view, /href="\/catalogo\?categoria=1"/);
  assert.match(view, /href="\/catalogo\?categoria=2"/);
  assert.match(view, /href="\/catalogo\?categoria=3"/);
  assert.doesNotMatch(view, /Motos/);
  assert.match(view, /Vehículos con peritaje seleccionados/i);
  assert.match(view, /Calidad &amp; Confianza/);
  assert.match(view, /Proceso simple/i);
  assert.match(view, /Filtra por marca, tipo de vehículo/);
  assert.match(view, /Revisa la ficha técnica detallada/);
  assert.match(view, /Habla directamente con un asesor por WhatsApp/);
  assert.match(view, /home-identity[^>]*identity-image: url\('\/assets\/home\/cta-vehimarcas\.png'\)/);
  assert.match(view, /data-product-add="4"[^>]*><svg/);
});
test('cart renders selectable persisted lines and editable quantity controls without payment claims', () => { const view = cartView({ version: 2, items: [{ presentationId: 2, name: 'Brisa', label: 'Automática', status: 'Disponible', price: 50000, maxQuantity: 3, quantity: 2 }] }); assert.match(view, /Valor total de productos seleccionados/); assert.match(view, /100\.000/); assert.match(view, /data-cart-select="2" checked/); assert.match(view, /data-cart-quantity-change="2" data-cart-quantity-step="-1"/); assert.match(view, /type="number"[^>]*data-cart-quantity="2"/); assert.match(view, /aria-label="Retirar Brisa"/); assert.doesNotMatch(view, />Cantidad</); assert.doesNotMatch(view, /Pagar|Compra realizada/); });
test('product detail selects a requestable presentation and uses its public limit for quantity', () => {
  const view = productDetailView({ ...row, marca: 'Vehimarcas', genero: '2024', modelo: 'Hilux', clasificacion: 'usado', imagenes: [
    { url: 'https://example.test/brisa-front.webp', texto_alternativo: 'Brisa frontal' },
    { url: 'https://example.test/brisa-side.webp', texto_alternativo: 'Brisa lateral' },
  ], presentaciones: [
    { id: 2, etiqueta: 'Automática 4x4', estado: 'Disponible', precio_normal: 50000000, maximo_solicitable: 3 },
    { id: 3, etiqueta: 'Mecánica', estado: 'Agotado', precio_normal: 40000000, maximo_solicitable: 0 },
  ] });
  assert.match(view, /<svg[^>]*><path d="m12 19-7-7 7-7"><\/path><path d="M19 12H5"><\/path><\/svg><span>Volver al catálogo<\/span>/);
  assert.equal(view.match(/data-product-gallery-image/g).length, 3);
  assert.match(view, /data-product-detail-form/);
  assert.match(view, /data-detail-presentation="2"[^>]*checked/);
  assert.match(view, /data-detail-presentation="3"[^>]*disabled/);
  assert.match(view, /type="number"[^>]*max="3"[^>]*data-detail-quantity/);
  assert.match(view, /<span class="catalog-status catalog-status--available">En stock<\/span><\/p>/);
  assert.match(view, /<section class="public-product-features"><h2>Ficha Técnica y Especificaciones<\/h2>/);
  assert.match(view, /Año<\/dt><dd>2024/);
  assert.match(view, /Modelo \/ Especificación<\/dt><dd>Hilux/);
  assert.match(view, /Estado del vehículo<\/dt><dd>Usado/);
  assert.doesNotMatch(view, /Categoría<\/dt>|Puedes solicitar hasta/);
  assert.equal(view.match(/Camioneta moderna/g).length, 1);
  assert.doesNotMatch(view, /data-product-detail-tab|product-description-panel|<h2>Descripción<\/h2>/);
  assert.match(view, /data-product-detail-add/);
});
test('renders videos in the public product gallery with a video thumbnail', () => {
  const view = productDetailView({ ...row, imagenes: [
    { url: 'https://example.test/brisa.webp', tipo: 'imagen', texto_alternativo: 'Brisa frontal' },
    { url: 'https://example.test/brisa.mp4', tipo: 'video', texto_alternativo: 'Brisa en movimiento' },
  ], presentaciones: [{ id: 2, etiqueta: 'Automática', estado: 'Disponible', precio_normal: 50000000, maximo_solicitable: 1 }] });
  assert.match(view, /data-public-video/);
  assert.match(view, /data-gallery-type="video"/);
  assert.match(view, /data-gallery-type="imagen"/);
  assert.match(view, /data-public-gallery/);
});
test('cart shows current availability warnings and blocks continuation while a line is invalid', () => {
  const view = cartView({ version: 2, items: [{ presentationId: 2, name: 'Brisa', label: 'Automática', status: 'Agotado', price: 50000, maxQuantity: 0, quantity: 5, validation: { state: 'blocked', message: 'Esta presentación ya no está disponible.', quantityEditable: false } }] }, { ready: false });
  assert.match(view, /Esta presentación ya no está disponible/);
  assert.match(view, /data-cart-quantity-change="2"[^>]*disabled/);
  assert.match(view, /Corrige las líneas señaladas antes de continuar con la solicitud/);
});
test('cart exposes a retry action when current availability cannot be verified', () => {
  const view = cartView({ version: 2, items: [{ presentationId: 2, name: 'Brisa', label: 'Automática', status: 'Disponible', price: 50000, maxQuantity: 3, quantity: 1 }] }, { error: 'No pudimos verificar la disponibilidad actual.', ready: false });
  assert.match(view, /data-public-retry/);
  assert.match(view, /No pudimos verificar la disponibilidad actual/);
});
test('public shell exposes the live cart counter, mobile menu, and complete responsive footer', () => {
  const view = publicShellView('<h1>Inicio</h1>', 'home', { items: [{ quantity: 2 }] });
  assert.match(view, /aria-label="Abrir carrito \(2\)"/);
  assert.match(view, /data-cart-drawer-open/);
  assert.match(view, /aria-label="Abrir menú" aria-expanded="false"/);
  assert.match(view, /aria-controls="mobile-menu-drawer"/);
  assert.match(view, /href="#main-content"/);
  assert.match(view, /assets\/brand\/vehimarcas-logo-completo\.png/);
  assert.match(view, /https:\/\/www\.instagram\.com\/vehimarcas\//);
  assert.match(view, /assets\/social\/instagram\.png/);
  assert.match(view, /assets\/social\/whatsapp\.png/);
  assert.match(view, /\+57 304 5416480/);
  assert.match(view, /mailto:contacto@vehimarcas\.com/);
  assert.match(view, /Cali, Colombia/);
  assert.equal(view.match(/data-footer-section/g).length, 3);
  assert.match(view, /Términos y condiciones/);
  assert.match(view, /Política de tratamiento de datos/);
  assert.match(view, /© 2026 VEHIMARCAS del Valle\. Todos los derechos reservados\./);
  assert.match(view, /Desarrollado con/);
});
test('mobile navigation drawer shares the public links without exposing administration', () => {
  const view = mobileMenuDrawerView('catalog');
  assert.match(view, /role="dialog" aria-modal="true"/);
  assert.match(view, /data-mobile-menu-close/);
  assert.match(view, /Inicio/);
  assert.match(view, /Catálogo/);
  assert.match(view, /aria-current="page">Catálogo/);
  assert.doesNotMatch(view, /Administración/);
});
test('cart drawer separates request selection from quantity and removal controls', () => {
  const view = cartDrawerView({ items: [
    { presentationId: 2, name: 'Brisa', label: 'Automática', status: 'Bajo pedido', price: 50000, maxQuantity: 3, quantity: 2, selected: true },
    { presentationId: 3, name: 'Ranger', label: 'Mecánica', status: 'Disponible', price: 40000, maxQuantity: 2, quantity: 1, selected: false },
  ] }, true);
  assert.match(view, /Bajo pedido/);
  assert.match(view, /data-cart-select="2"[^>]*checked/);
  assert.match(view, /data-cart-select="3"(?![^>]*checked)/);
  assert.match(view, /aria-label="Incluir Brisa en esta solicitud"/);
  assert.ok(view.indexOf('data-cart-select="2"') < view.indexOf('public-cart-item__image'));
  assert.match(view, /data-cart-quantity="2"/);
  assert.match(view, /data-cart-drawer-continue/);
  assert.match(view, /100\.000/);
  assert.match(view, /1 de 2 productos seleccionados/);
  assert.match(view, /public-cart-drawer__item-top/);
  assert.match(view, /public-cart-drawer__item-meta/);
  assert.match(view, /public-cart-drawer__actions/);
});
test('cart drawer shows a zero selected total and blocks continuation without a selection', () => {
  const view = cartDrawerView({ items: [{ presentationId: 2, name: 'Brisa', label: 'Automática', status: 'Disponible', price: 50000, maxQuantity: 3, quantity: 1, selected: false }] }, true);
  assert.match(view, /Total <strong>\$0<\/strong>/);
  assert.match(view, /Selecciona al menos un producto para continuar/);
  assert.match(view, /data-cart-drawer-continue disabled/);
});
test('cart drawer presents a confirmation with WhatsApp continuation and a copyable code', () => {
  const cart = { items: [{ presentationId: 2, name: 'Brisa', label: 'Automática', status: 'Disponible', price: 50000, maxQuantity: 3, quantity: 2 }] };
  const form = cartDrawerView(cart, { open: true, step: 'form', requestState: { form: { nombre: 'Ana', telefono: '3001234567' }, errors: {} } });
  assert.match(form, /data-cart-drawer-back/);
  assert.match(form, /class="back-navigation public-cart-drawer__back"[^>]*><svg[^>]*><path d="m12 19-7-7 7-7"><\/path><path d="M19 12H5"><\/path><\/svg><span>Volver al carrito<\/span><\/button>/);
  assert.match(form, /data-request-form/);
  assert.match(form, /name="aceptaTerminos" type="checkbox"/);
  assert.match(form, /1 producto.*100\.000/);
  const confirmation = cartDrawerView(cart, { open: true, step: 'confirmation', confirmation: { codigo: 'VM-00001', estado: 'nueva', elegible_pago: true, valor_total_productos: 100000, lineas: [{ producto: 'Brisa', presentacion: 'Automática', cantidad: 2, subtotal: 100000 }] } });
  assert.equal(confirmation.match(/<h2 id="cart-drawer-title">Solicitud registrada<\/h2>/g).length, 1);
  assert.match(confirmation, /Tu solicitud se registró correctamente/);
  assert.match(confirmation, /Código de solicitud/);
  assert.match(confirmation, /<strong>VM-00001<\/strong>/);
  assert.match(confirmation, /data-confirmation-copy="VM-00001"/);
  assert.match(confirmation, /aria-label="Copiar código de solicitud"/);
  assert.match(confirmation, /Resumen de tu solicitud/);
  assert.match(confirmation, /Brisa · Automática × 2/);
  assert.match(confirmation, /<span>Total<\/span><strong>\$100\.000<\/strong>/);
  assert.match(confirmation, /Continuar por WhatsApp/);
  assert.match(confirmation, /public-whatsapp-button/);
  assert.doesNotMatch(confirmation, /Pagar ahora|payment-status|data-payment-start/);
  assert.match(confirmation, /te contactará por WhatsApp/);
  assert.doesNotMatch(confirmation, /Pagar más tarde|data-payment-later/);
  assert.match(confirmation, /data-confirmation-continue/);
  assert.match(confirmation, /data-request-new/);
  assert.match(confirmation, /public-drawer-confirmation__links-separator/);
});
test('cart drawer confirmation only offers WhatsApp continuation without payment actions', () => {
  const view = cartDrawerView({ items: [] }, { open: true, step: 'confirmation', confirmation: { codigo: 'VM-00002', estado: 'nueva', elegible_pago: false, valor_total_productos: 100000, lineas: [{ producto: 'Brisa', presentacion: 'Automática', cantidad: 1, subtotal: 100000 }] } });
  assert.match(view, /Continuar por WhatsApp/);
  assert.match(view, /te contactará por WhatsApp/);
  assert.doesNotMatch(view, /Pagar ahora|Pago por coordinar|data-payment-start|data-payment-later|payment-status/);
});
test('drawer request step keeps a compact heading, telephone semantics, and field-level errors', () => {
  const cart = { items: [{ presentationId: 2, name: 'Brisa', label: 'Automática', status: 'Disponible', price: 50000, maxQuantity: 3, quantity: 1 }] };
  const view = cartDrawerView(cart, { open: true, step: 'form', requestState: { form: {}, errors: { nombre: 'Ingresa un nombre entre 2 y 100 caracteres.', telefono: 'Ingresa un teléfono válido de 7 a 15 dígitos.', aceptacion: 'Debes aceptar los documentos.' } } });
  assert.equal(view.match(/Datos de la solicitud/g).length, 1);
  assert.match(view, /<h3>¿A quién contactamos\?<\/h3>/);
  assert.match(view, /name="telefono" type="tel" autocomplete="tel" inputmode="tel"/);
  assert.match(view, /name="telefono"[^>]*aria-invalid="true"/);
  assert.match(view, /class="public-request-form__error" id="request-telefono-error"/);
  assert.match(view, /name="aceptaTerminos"[^>]*aria-invalid="true"/);
  assert.match(view, /Ciudad o municipio/);
  assert.match(view, /role="combobox"/);
  assert.match(view, /aria-autocomplete="list"/);
  assert.match(view, /data-city-options/);
});
test('cart provides an accessible request form and legal modal links', () => {
  const view = cartView({ version: 2, items: [{ presentationId: 2, name: 'Brisa', label: 'Automática', status: 'Disponible', price: 50000, maxQuantity: 3, quantity: 1 }] }, { ready: true, requestState: { form: {}, errors: {} } });
  assert.match(view, /data-request-form/);
  assert.match(view, /name="aceptaTerminos" type="checkbox"/);
  assert.match(view, /data-legal-modal="terms"/);
  assert.match(legalModalView('policy'), /role="dialog"/);
  assert.match(legalModalView('policy'), /data-legal-close/);
  assert.match(legalModalView('policy'), /<h2 id="legal-modal-title">Política de tratamiento de datos<\/h2>/);
  assert.match(legalModalView('terms'), /legal\/terminos-v2\.html/);
});
test('public shell places a legal modal after an open drawer', () => {
  const shell = publicShellView('<h1>Inicio</h1>', 'home', { items: [] }, legalModalView('terms'), '<div data-cart-drawer></div>');
  assert.ok(shell.indexOf('data-cart-drawer') < shell.indexOf('data-legal-modal-dialog'));
});
test('cart confirmation uses server totals and offers voluntary WhatsApp continuation', () => {
  const view = cartView({ items: [] }, { confirmation: { codigo: 'VM-00001', estado: 'nueva', valor_total_productos: 50000, lineas: [{ producto: 'Brisa', presentacion: 'Automática', cantidad: 1, subtotal: 50000 }] } });
  assert.match(view, /Solicitud registrada/);
  assert.match(view, /VM-00001/);
  assert.match(view, /wa\.me\/573045416480/);
  assert.match(view, /data-request-new/);
});
test('public request view shows the summary and only offers WhatsApp continuation', () => {
  const view = publicRequestView({ codigo: 'VM-0049', estado: 'nueva', valor_total_productos: 82000, lineas: [{ producto: 'Brisa', presentacion: 'Automática', cantidad: 1, subtotal: 82000 }] });
  assert.match(view, /Solicitud VM-0049/);
  assert.match(view, /Valor total de productos <strong>\$82\.000<\/strong>/);
  assert.match(view, /Continuar por WhatsApp/);
  assert.doesNotMatch(view, /Pagar ahora|Bre-B|Llave|comprobante|payment-step/);
});
test('public request view tolerates a legacy payment state without payment UI', () => {
  const view = publicRequestView({ codigo: 'VM-00061', estado: 'nueva', pago_estado: 'comprobante_enviado', valor_total_productos: 90000, lineas: [{ producto: 'Hilux SRX', presentacion: 'Automática', cantidad: 1, subtotal: 90000 }] });
  assert.doesNotMatch(view, /Comprobante enviado|Pendiente de verificación|Pagar ahora|Bre-B/);
  assert.match(view, /Solicitud VM-00061/);
  assert.match(view, /Hilux SRX · Automática × 1/);
  assert.match(view, /Valor total de productos <strong>\$90\.000<\/strong>/);
  assert.match(view, /Continuar por WhatsApp/);
});
