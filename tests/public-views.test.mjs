import test from 'node:test';
import assert from 'node:assert/strict';
import { cartView, catalogView, homeView, legalModalView, productDetailView, publicShellView } from '../src/public-views.mjs';

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
  assert.match(view, /Encuentra la fragancia que habla de ti/);
  assert.match(view, /data-product-add="4"[^>]*><svg/);
});
test('cart renders persisted lines without purchase or payment claims', () => { const view = cartView({ version: 2, items: [{ presentationId: 2, name: 'Brisa', label: '100 ml', status: 'Disponible', price: 50000, maxQuantity: 3, quantity: 2 }] }); assert.match(view, /Valor total de productos/); assert.match(view, /100\.000/); assert.match(view, /max="3"[^>]*data-cart-quantity="2"/); assert.doesNotMatch(view, /Pagar|Compra realizada/); });
test('product detail selects a requestable presentation and uses its public limit for quantity', () => {
  const view = productDetailView({ ...row, presentaciones: [
    { id: 2, etiqueta: '100 ml', estado: 'Disponible', precio_normal: 50000, maximo_solicitable: 3 },
    { id: 3, etiqueta: '50 ml', estado: 'Agotado', precio_normal: 40000, maximo_solicitable: 0 },
  ] });
  assert.match(view, /data-product-detail-form/);
  assert.match(view, /data-detail-presentation="2"[^>]*checked/);
  assert.match(view, /data-detail-presentation="3"[^>]*disabled/);
  assert.match(view, /max="3"[^>]*data-detail-quantity/);
  assert.match(view, /data-product-detail-add/);
});
test('cart shows current availability warnings and blocks continuation while a line is invalid', () => {
  const view = cartView({ version: 2, items: [{ presentationId: 2, name: 'Brisa', label: '100 ml', status: 'Agotado', price: 50000, maxQuantity: 0, quantity: 5, validation: { state: 'blocked', message: 'Esta presentación ya no está disponible.', quantityEditable: false } }] }, { ready: false });
  assert.match(view, /Esta presentación ya no está disponible/);
  assert.match(view, /data-cart-quantity="2"[^>]*disabled/);
  assert.match(view, /Corrige las líneas señaladas antes de continuar con la solicitud/);
});
test('cart exposes a retry action when current availability cannot be verified', () => {
  const view = cartView({ version: 2, items: [{ presentationId: 2, name: 'Brisa', label: '100 ml', status: 'Disponible', price: 50000, maxQuantity: 3, quantity: 1 }] }, { error: 'No pudimos verificar la disponibilidad actual.', ready: false });
  assert.match(view, /data-public-retry/);
  assert.match(view, /No pudimos verificar la disponibilidad actual/);
});
test('public shell exposes the live cart counter and collapsed mobile-menu state', () => { const view = publicShellView('<h1>Inicio</h1>', 'home', { items: [{ quantity: 2 }] }); assert.match(view, /aria-label="Carrito \(2\)"/); assert.match(view, /aria-label="Abrir menú de navegación" aria-expanded="false"/); assert.match(view, /href="#main-content"/); });
test('cart provides an accessible request form and legal modal links', () => {
  const view = cartView({ version: 2, items: [{ presentationId: 2, name: 'Brisa', label: '100 ml', status: 'Disponible', price: 50000, maxQuantity: 3, quantity: 1 }] }, { ready: true, requestState: { form: {}, errors: {} } });
  assert.match(view, /data-request-form/);
  assert.match(view, /name="aceptaTerminos" type="checkbox"/);
  assert.match(view, /data-legal-modal="terms"/);
  assert.match(legalModalView('policy'), /role="dialog"/);
  assert.match(legalModalView('policy'), /data-legal-close/);
});
test('cart confirmation uses server totals and offers voluntary WhatsApp continuation', () => {
  const view = cartView({ items: [] }, { confirmation: { codigo: 'ES-00001', estado: 'nueva', valor_total_productos: 50000, lineas: [{ producto: 'Brisa', presentacion: '100 ml', cantidad: 1, subtotal: 50000 }] } });
  assert.match(view, /Solicitud registrada/);
  assert.match(view, /ES-00001/);
  assert.match(view, /wa\.me\/573174645670/);
  assert.match(view, /data-request-new/);
});
