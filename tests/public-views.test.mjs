import test from 'node:test';
import assert from 'node:assert/strict';
import { cartDrawerView, cartView, catalogView, homeView, legalModalView, mobileMenuDrawerView, productDetailView, publicRequestView, publicShellView } from '../src/public-views.mjs';

const row = { categoria_id: 1, categoria_nombre: 'Splash', producto_id: 4, nombre: 'Brisa', descripcion: 'Aroma fresco', imagen_url: 'https://example.test/brisa.webp', texto_alternativo: 'Brisa', precio_referencia: 50000, precio_normal_referencia: 60000, precio_desde: true, disponibilidad: 'Disponible', destacado: true };
test('catalog has one grid, an independent add action, price and textual availability', () => { const view = catalogView([row]); assert.match(view, /<h1>Catálogo<\/h1>/); assert.doesNotMatch(view, /<p class="eyebrow">ESENCIALES/); assert.doesNotMatch(view, /id="categoria-1"/); assert.match(view, /Desde/); assert.match(view, /En stock/); assert.match(view, /data-product-add="4"/); assert.match(view, /aria-label="Agregar Brisa al carrito"/); });
test('catalog exposes persistent filters, search controls and tags without an order control', () => { const filters = { busqueda: 'brisa', categoria: 1, disponibilidades: ['en-stock'], generos: ['hombre'], clasificaciones: [], precioMinimo: '30000', precioMaximo: '', orden: 'precio-asc' }; const view = catalogView([row], [row], filters); assert.match(view, /Filtros \(5\)/); assert.match(view, /data-clear-search/); assert.match(view, /aria-label="Borrar búsqueda"/); assert.match(view, /Disponibilidad/); assert.match(view, /Limpiar filtros/); assert.match(view, /Filtros aplicados/); assert.match(view, /Quitar filtro/); assert.doesNotMatch(view, /catalog-order|Ordenar|Menor precio|Mayor precio/); });
test('no-results state occupies the catalog width with clear recovery copy', () => { const filters = { busqueda: 'sin coincidencias', categoria: null, disponibilidades: [], generos: [], clasificaciones: [], precioMinimo: '', precioMaximo: '', orden: 'destacados' }; const view = catalogView([row], [], filters); assert.match(view, /public-empty-state--no-results/); assert.match(view, /No encontramos resultados con estos criterios/); assert.match(view, /explorar el catálogo completo de ESENCIALES/); assert.match(view, /Restablecer y ver todo/); });
test('home categories lead to the shared catalog filters and featured data is not hidden by name', () => { assert.match(homeView([row]), /href="\/catalogo\?genero=mujer"/); assert.match(homeView([{ ...row, nombre: 'prubea' }]), /prubea/); });
test('home presents the editorial category filters and required brand sections', () => {
  const view = homeView([row]);

  assert.match(view, /assets\/home\/hero-esenciales\.png/);
  assert.match(view, /href="\/catalogo\?genero=mujer"/);
  assert.match(view, /href="\/catalogo\?genero=hombre"/);
  assert.match(view, /href="\/catalogo\?genero=unisex"/);
  assert.match(view, /href="\/catalogo\?clasificacion=inspiracion"/);
  assert.match(view, /Calidad y transparencia/i);
  assert.match(view, /Tu aroma\. Tu esencia\./);
  assert.match(view, /Proceso simple/i);
  assert.match(view, /Descubre las fragancias y opciones disponibles\./);
  assert.match(view, /Selecciona la presentación y cantidad que deseas solicitar\./);
  assert.match(view, /Déjanos tus datos y registra tu solicitud\. Luego coordinamos contigo la disponibilidad y entrega\./);
  assert.doesNotMatch(view, /<strong>Tu aroma\. Tu esencia\.<\/strong>|Confirma tu pedido y los datos para la entrega\./);
  assert.doesNotMatch(view, /Encuentra la fragancia que habla de ti|Explora nuestro catálogo|home-final-cta/);
  assert.match(view, /home-identity[^>]*identity-image: url\('\/assets\/home\/cta-piedra-oscura\.png'\)/);
  assert.doesNotMatch(view, /identidad-esenciales\.png/);
  assert.match(view, /data-product-add="4"[^>]*><svg/);
});
test('cart renders selectable persisted lines and editable quantity controls without payment claims', () => { const view = cartView({ version: 2, items: [{ presentationId: 2, name: 'Brisa', label: '100 ml', status: 'Disponible', price: 50000, maxQuantity: 3, quantity: 2 }] }); assert.match(view, /Valor total de productos seleccionados/); assert.match(view, /100\.000/); assert.match(view, /data-cart-select="2" checked/); assert.match(view, /data-cart-quantity-change="2" data-cart-quantity-step="-1"/); assert.match(view, /type="number"[^>]*data-cart-quantity="2"/); assert.match(view, /aria-label="Retirar Brisa"/); assert.doesNotMatch(view, />Cantidad</); assert.doesNotMatch(view, /Pagar|Compra realizada/); });
test('product detail selects a requestable presentation and uses its public limit for quantity', () => {
  const view = productDetailView({ ...row, marca: 'Esenciales', genero: 'Unisex', familia_olfativa: 'Cítrica', clasificacion: 'uno_a_uno', imagenes: [
    { url: 'https://example.test/brisa-front.webp', texto_alternativo: 'Brisa frontal' },
    { url: 'https://example.test/brisa-side.webp', texto_alternativo: 'Brisa lateral' },
  ], presentaciones: [
    { id: 2, etiqueta: '100 ml', estado: 'Disponible', precio_normal: 50000, maximo_solicitable: 3 },
    { id: 3, etiqueta: '50 ml', estado: 'Agotado', precio_normal: 40000, maximo_solicitable: 0 },
  ] });
  assert.match(view, /←<\/span> Volver al catálogo/);
  assert.equal(view.match(/data-product-gallery-image/g).length, 3);
  assert.match(view, /data-product-detail-form/);
  assert.match(view, /data-detail-presentation="2"[^>]*checked/);
  assert.match(view, /data-detail-presentation="3"[^>]*disabled/);
  assert.match(view, /type="number"[^>]*max="3"[^>]*data-detail-quantity/);
  assert.match(view, /<span class="catalog-status catalog-status--available">En stock<\/span><\/p>/);
  assert.match(view, /<section class="public-product-features"><h2>Características<\/h2>/);
  assert.match(view, /Género<\/dt><dd>Unisex/);
  assert.match(view, /Familia olfativa<\/dt><dd>Cítrica/);
  assert.match(view, /Clasificación<\/dt><dd>1\.1/);
  assert.doesNotMatch(view, /Categoría<\/dt>|Marca<\/dt>|Puedes solicitar hasta/);
  assert.equal(view.match(/Aroma fresco/g).length, 1);
  assert.doesNotMatch(view, /data-product-detail-tab|product-description-panel|<h2>Descripción<\/h2>/);
  assert.match(view, /data-product-detail-add/);
});
test('cart shows current availability warnings and blocks continuation while a line is invalid', () => {
  const view = cartView({ version: 2, items: [{ presentationId: 2, name: 'Brisa', label: '100 ml', status: 'Agotado', price: 50000, maxQuantity: 0, quantity: 5, validation: { state: 'blocked', message: 'Esta presentación ya no está disponible.', quantityEditable: false } }] }, { ready: false });
  assert.match(view, /Esta presentación ya no está disponible/);
  assert.match(view, /data-cart-quantity-change="2"[^>]*disabled/);
  assert.match(view, /Corrige las líneas señaladas antes de continuar con la solicitud/);
});
test('cart exposes a retry action when current availability cannot be verified', () => {
  const view = cartView({ version: 2, items: [{ presentationId: 2, name: 'Brisa', label: '100 ml', status: 'Disponible', price: 50000, maxQuantity: 3, quantity: 1 }] }, { error: 'No pudimos verificar la disponibilidad actual.', ready: false });
  assert.match(view, /data-public-retry/);
  assert.match(view, /No pudimos verificar la disponibilidad actual/);
});
test('public shell exposes the live cart counter, mobile menu, and complete responsive footer', () => {
  const view = publicShellView('<h1>Inicio</h1>', 'home', { items: [{ quantity: 2 }] });
  assert.match(view, /aria-label="Abrir carrito \(2\)"/);
  assert.match(view, /data-cart-drawer-open/);
  assert.match(view, /aria-label="Abrir menú de navegación" aria-expanded="false"/);
  assert.match(view, /aria-controls="mobile-menu-drawer"/);
  assert.match(view, /href="#main-content"/);
  assert.match(view, /assets\/brand\/esenciales-logo-completo\.png/);
  assert.match(view, /https:\/\/www\.instagram\.com\/esenciales\.24/);
  assert.match(view, /assets\/social\/instagram\.png/);
  assert.match(view, /assets\/social\/whatsapp\.png/);
  assert.match(view, /\+57 317 464 5670/);
  assert.match(view, /mailto:essentialsformen0122@gmail\.com/);
  assert.match(view, /Cali, Colombia/);
  assert.equal(view.match(/data-footer-section/g).length, 3);
  assert.match(view, /Términos y condiciones/);
  assert.match(view, /Política de tratamiento de datos/);
  assert.match(view, /© 2026 ESENCIALES\. Todos los derechos reservados\./);
  assert.match(view, /Desarrollado con/);
  assert.doesNotMatch(view, /Fragancias y lociones que te acompañan en cada momento\./);
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
    { presentationId: 2, name: 'Brisa', label: '100 ml', status: 'Bajo pedido', price: 50000, maxQuantity: 3, quantity: 2, selected: true },
    { presentationId: 3, name: 'Aura', label: '50 ml', status: 'Disponible', price: 40000, maxQuantity: 2, quantity: 1, selected: false },
  ] }, true);
  assert.match(view, /role="dialog" aria-modal="true"/);
  assert.match(view, /data-cart-drawer-close/);
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
  const view = cartDrawerView({ items: [{ presentationId: 2, name: 'Brisa', label: '100 ml', status: 'Disponible', price: 50000, maxQuantity: 3, quantity: 1, selected: false }] }, true);
  assert.match(view, /Total <strong>\$0<\/strong>/);
  assert.match(view, /Selecciona al menos un producto para continuar/);
  assert.match(view, /data-cart-drawer-continue disabled/);
});
test('cart drawer presents an eligible confirmation with stacked payment actions and a copyable code', () => {
  const cart = { items: [{ presentationId: 2, name: 'Brisa', label: '100 ml', status: 'Disponible', price: 50000, maxQuantity: 3, quantity: 2 }] };
  const form = cartDrawerView(cart, { open: true, step: 'form', requestState: { form: { nombre: 'Ana', telefono: '3001234567' }, errors: {} } });
  assert.match(form, /data-cart-drawer-back/);
  assert.match(form, /data-request-form/);
  assert.match(form, /name="aceptaTerminos" type="checkbox"/);
  assert.match(form, /1 producto.*100\.000/);
  const confirmation = cartDrawerView(cart, { open: true, step: 'confirmation', confirmation: { codigo: 'ES-00001', estado: 'nueva', elegible_pago: true, valor_total_productos: 100000, lineas: [{ producto: 'Brisa', presentacion: '100 ml', cantidad: 2, subtotal: 100000 }] } });
  assert.equal(confirmation.match(/<h2 id="cart-drawer-title">Solicitud registrada<\/h2>/g).length, 1);
  assert.match(confirmation, /Tu solicitud se registró correctamente/);
  assert.match(confirmation, /Código de solicitud/);
  assert.match(confirmation, /<strong>ES-00001<\/strong>/);
  assert.match(confirmation, /data-confirmation-copy="ES-00001"/);
  assert.match(confirmation, /aria-label="Copiar código de solicitud"/);
  assert.match(confirmation, /Resumen de tu solicitud/);
  assert.match(confirmation, /Brisa · 100 ml × 2/);
  assert.match(confirmation, /<span>Total<\/span><strong>\$100\.000<\/strong>/);
  assert.match(confirmation, /Continuar por WhatsApp/);
  assert.match(confirmation, /public-whatsapp-button/);
  assert.match(confirmation, /Pagar ahora/);
  assert.doesNotMatch(confirmation, /Pagar más tarde|data-payment-later/);
  assert.match(confirmation, /data-confirmation-continue/);
  assert.match(confirmation, /data-request-new/);
  assert.match(confirmation, /public-drawer-confirmation__links-separator/);
  assert.doesNotMatch(confirmation, /<p class="eyebrow">ESENCIALES/);
  assert.doesNotMatch(confirmation, /como Nueva/);
});
test('cart drawer coordinates payment when a confirmed request is not eligible', () => {
  const view = cartDrawerView({ items: [] }, { open: true, step: 'confirmation', confirmation: { codigo: 'ES-00002', estado: 'nueva', elegible_pago: false, valor_total_productos: 100000, lineas: [{ producto: 'Brisa', presentacion: '100 ml', cantidad: 1, subtotal: 100000 }] } });
  assert.match(view, /Pago por coordinar/);
  assert.match(view, /contiene productos bajo pedido/);
  assert.match(view, /Continuar por WhatsApp/);
  assert.doesNotMatch(view, /data-payment-start|data-payment-later|payment-status/);
});
test('drawer request step keeps a compact heading, telephone semantics, and field-level errors', () => {
  const cart = { items: [{ presentationId: 2, name: 'Brisa', label: '100 ml', status: 'Disponible', price: 50000, maxQuantity: 3, quantity: 1 }] };
  const view = cartDrawerView(cart, { open: true, step: 'form', requestState: { form: {}, errors: { nombre: 'Ingresa un nombre entre 2 y 100 caracteres.', telefono: 'Ingresa un teléfono válido de 7 a 15 dígitos.', aceptacion: 'Debes aceptar los documentos.' } } });
  assert.equal(view.match(/Datos de la solicitud/g).length, 1);
  assert.match(view, /<h3>¿A quién contactamos\?<\/h3>/);
  assert.match(view, /name="telefono" type="tel" autocomplete="tel" inputmode="tel"/);
  assert.match(view, /name="telefono"[^>]*aria-invalid="true"/);
  assert.match(view, /class="public-request-form__error" id="request-telefono-error"/);
  assert.match(view, /name="aceptaTerminos"[^>]*aria-invalid="true"/);
});
test('cart provides an accessible request form and legal modal links', () => {
  const view = cartView({ version: 2, items: [{ presentationId: 2, name: 'Brisa', label: '100 ml', status: 'Disponible', price: 50000, maxQuantity: 3, quantity: 1 }] }, { ready: true, requestState: { form: {}, errors: {} } });
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
  const view = cartView({ items: [] }, { confirmation: { codigo: 'ES-00001', estado: 'nueva', valor_total_productos: 50000, lineas: [{ producto: 'Brisa', presentacion: '100 ml', cantidad: 1, subtotal: 50000 }] } });
  assert.match(view, /Solicitud registrada/);
  assert.match(view, /ES-00001/);
  assert.match(view, /wa\.me\/573174645670/);
  assert.match(view, /data-request-new/);
});
test('payment step uses a compact Bre-B summary, copyable key, and removable selected proof', () => {
  const view = publicRequestView({ codigo: 'ES-00049', elegible_pago: true, pago_estado: 'pendiente', valor_total_productos: 82000 }, { step: 'payment', file: { name: 'comprobante.png', size: 2048 } });
  assert.match(view, /Solicitud <strong>ES-00049<\/strong>/);
  assert.match(view, /Total a transferir <strong>\$82\.000<\/strong>/);
  assert.match(view, /<small>Llave<\/small>/);
  assert.match(view, /data-payment-copy-key="@esensiales"/);
  assert.match(view, /aria-label="Copiar llave Bre-B"/);
  assert.match(view, /comprobante\.png/);
  assert.match(view, /aria-label="Quitar comprobante comprobante\.png"/);
  assert.doesNotMatch(view, /Pagar solicitud/);
  assert.doesNotMatch(view, />Copiar llave<|>Quitar</);
});
test('payment proof sent view consolidates verification status and offers contextual WhatsApp continuation', () => {
  const view = publicRequestView({ codigo: 'ES-00061', estado: 'nueva', pago_estado: 'comprobante_enviado', valor_total_productos: 90000, lineas: [{ producto: '9 PM', presentacion: '100 ml', cantidad: 1, subtotal: 90000 }] });
  assert.match(view, /Comprobante enviado/);
  assert.match(view, /Solicitud <strong>ES-00061<\/strong>/);
  assert.match(view, /9 PM · 100 ml × 1/);
  assert.match(view, /<span>Total<\/span><strong>\$90\.000<\/strong>/);
  assert.match(view, /Pendiente de verificación/);
  assert.match(view, /ESENCIALES revisará el comprobante antes de confirmar el pago/);
  assert.match(view, /Continuar por WhatsApp/);
  assert.match(view, /ES-00061%20por%20%2490\.000%20y%20ya%20envi%C3%A9%20el%20comprobante/);
  assert.match(view, /Seguir viendo productos/);
  assert.match(view, /data-confirmation-continue/);
  assert.doesNotMatch(view, /Estado de solicitud|Pago: Comprobante enviado|<p class="eyebrow">ESENCIALES|Solicitud ES-00061<\/h1>/);
});
