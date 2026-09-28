import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cartView,
  catalogView,
  homeView,
  notFoundView,
  productDetailView,
  publicShellView,
  renderPublicRoute,
} from '../src/public-views.mjs';

const catalogRows = [
  {
    categoria_id: 1,
    categoria_nombre: 'Splash',
    producto_id: 4,
    nombre: 'Brisa',
    descripcion: 'Aroma fresco',
    imagen_url: 'https://example.test/brisa.webp',
    texto_alternativo: 'Brisa',
    precio_referencia: 50000,
    precio_normal_referencia: 60000,
    precio_desde: true,
    disponibilidad: 'Disponible',
    destacado: true,
  },
  { categoria_id: 2, categoria_nombre: 'Cremas', producto_id: null },
];

const product = {
  ...catalogRows[0],
  marca: 'Marca',
  genero: 'unisex',
  presentaciones: [
    { id: 2, etiqueta: '100 ml', precio_normal: 60000, precio_promocional: 50000, estado: 'Disponible' },
    { id: 3, etiqueta: 'Bajo pedido', precio_normal: 75000, precio_promocional: null, estado: 'Bajo pedido' },
  ],
};

test('renders category-grouped cards with desde price and textual availability', () => {
  const view = catalogView(catalogRows);
  assert.match(view, /id="categoria-1"/);
  assert.match(view, /id="categoria-2"/);
  assert.match(view, /Brisa/);
  assert.match(view, /Desde/);
  assert.match(view, /Disponible/);
  assert.match(view, /href="\/producto\/4"/);
});

test('shows the normal reference price when the card reference price is promotional', () => {
  const view = catalogView([catalogRows[0]]);
  assert.match(view, /50\.000/);
  assert.match(view, /<s[^>]*>[^<]*60\.000/);
});

test('renders the featured section only when public featured products exist', () => {
  assert.match(homeView(catalogRows), /Productos destacados/);
  assert.doesNotMatch(homeView([{ ...catalogRows[0], destacado: false }, catalogRows[1]]), /Productos destacados/);
  assert.doesNotMatch(homeView([{ ...catalogRows[0], nombre: 'prubea' }, catalogRows[1]]), /Productos destacados|prubea/);
});

test('home uses approved HTML copy and only links categories supplied by catalog data', () => {
  const view = homeView(catalogRows);
  assert.match(view, /<h1 id="home-title">Tu aroma, siempre contigo\.<\/h1>/);
  assert.match(view, /Explora lociones, perfumes y opciones de cuidado personal para cada estilo y ocasión\./);
  assert.match(view, /href="\/catalogo"[^>]*>Ver catálogo<\/a>/);
  assert.match(view, /href="\/catalogo#categoria-1"/);
  assert.match(view, /categoria-splash\.png" alt=""/);
  assert.match(view, /categoria-cremas-corporales\.png" alt=""/);
  assert.doesNotMatch(view, /categoria-humidificadores\.png/);
});

test('category illustrations resolve predictable name variations and unknown categories stay text-only', () => {
  const view = homeView([
    { categoria_id: 5, categoria_nombre: 'PERFUMES  /  LOCIÓNES', producto_id: null },
    { categoria_id: 6, categoria_nombre: 'Edición especial', producto_id: null },
  ]);
  assert.match(view, /categoria-perfumes-lociones\.png/);
  assert.match(view, /href="\/catalogo#categoria-6"><span>Edición especial<\/span><\/a>/);
});

test('renders an accessible presentation selector with normal price, promotion and exact status', () => {
  const view = productDetailView(product);
  assert.match(view, /<fieldset/);
  assert.match(view, /name="presentacion"/);
  assert.match(view, /50\.000/);
  assert.match(view, /60\.000/);
  assert.match(view, /Bajo pedido/);
  assert.doesNotMatch(view, /cantidad|Agregar al carrito/);
});

test('provides an image fallback when a product image is absent', () => {
  const view = productDetailView({ ...product, imagen_url: null });
  assert.match(view, /data-public-image/);
  assert.match(view, /Imagen no disponible/);
});

test('renders an informative empty cart without checkout or payment claims', () => {
  const view = cartView();
  assert.match(view, /Carrito \(0\)/);
  assert.match(view, /h[aá]bilitar[aá]/);
  assert.doesNotMatch(view, /Pagar|Finalizar compra|Compra realizada/);
});

test('offers a path back to catalog when a product is not found', () => {
  const view = notFoundView();
  assert.match(view, /No encontrado/);
  assert.match(view, /href="\/catalogo"/);
});

test('uses a semantic public shell with home, catalog, cart and admin navigation', () => {
  const view = publicShellView('<h1>Inicio</h1>', 'home');
  assert.match(view, /alt="ESENCIALES"/);
  assert.match(view, /href="\/catalogo"/);
  assert.match(view, /Carrito \(0\)/);
  assert.match(view, /href="\/admin"/);
  assert.match(view, /<main class="public-main" id="main-content">/);
  assert.match(view, /href="#main-content"/);
});

test('header uses the official horizontal brand and accessible cart with discreet admin access', () => {
  const view = publicShellView('<h1>Inicio</h1>', 'home');
  assert.match(view, /esenciales-logo-horizontal\.png/);
  assert.match(view, /<svg[^>]*aria-hidden="true"/);
  assert.match(view, /aria-label="Carrito \(0\)"/);
  assert.doesNotMatch(view, /class="public-cart-link__text"/);
  assert.match(view, /aria-current="page">Inicio/);
  assert.match(view, /class="public-footer"[\s\S]*href="\/admin"/);
});

test('featured products follow categories using the catalog card rather than reference-image data', () => {
  const view = homeView(catalogRows);
  assert.ok(view.indexOf('id="categories-title">Categorías') < view.indexOf('Productos destacados'));
  assert.match(view, /id="featured-title">Productos destacados<\/h2>/);
  assert.match(view, /href="\/producto\/4"/);
  assert.match(view, /Ver catálogo <svg aria-hidden="true"/);
  assert.doesNotMatch(view, /<span class="public-product-card__action">Ver producto<\/span>/);
  assert.match(catalogView(catalogRows), /<span class="public-product-card__action">Ver producto<\/span>/);
});

test('renders API errors with a retry button and private details removed', () => {
  const view = renderPublicRoute({ name: 'catalog' }, { data: null, error: 'No fue posible cargar el catalogo.' });
  assert.match(view, /role="alert"/);
  assert.match(view, /data-public-retry="\/catalogo"/);
  assert.doesNotMatch(view, /stack|postgres|internal/i);
});

test('escapes untrusted product names in rendered public cards', () => {
  const malicious = { ...catalogRows[0], nombre: '<img src=x onerror=alert(1)>' };
  assert.match(catalogView([malicious]), /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(catalogView([malicious]), /<img src=x onerror=/);
});

test('catalog exposes synced quick filters, price controls, count and distinct empty states', () => {
  const filters = { busqueda: '', categoria: null, generos: ['hombre'], clasificaciones: ['original'], precioMinimo: '', precioMaximo: '' };
  const view = catalogView(catalogRows, catalogRows, filters);
  assert.match(view, /Buscar por nombre/);
  assert.match(view, /<summary>Filtros/);
  assert.match(view, /data-quick-field="generos" data-quick-value="hombre" aria-pressed="true"/);
  assert.match(view, /data-quick-value="uno_a_uno"/);
  assert.match(view, /name="precioMinimo"/);
  assert.match(view, /1 producto/);
  assert.match(catalogView(catalogRows, [], filters), /Sin resultados/);
  assert.match(catalogView([], [], filters), /Aún no hay productos/);
  assert.match(catalogView(catalogRows, catalogRows, filters, { loading: true }), /Cargando resultados/);
});
