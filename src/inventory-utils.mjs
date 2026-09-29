import { effectivePrice, LOW_STOCK_THRESHOLD } from './products.js';

export const INVENTORY_PAGE_SIZE = 20;

export function normalizedText(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-CO');
}

export function activePresentations(product) {
  return (product.presentaciones || []).filter((presentation) => presentation.activo);
}

export function presentationAvailability(presentation) {
  if (!presentation.activo) return 'inactive';
  if (presentation.modo_disponibilidad === 'bajo_pedido') return 'under-order';
  if (presentation.modo_disponibilidad === 'no_disponible') return 'unavailable';
  if (Number(presentation.stock) === 0) return 'out-of-stock';
  if (Number(presentation.stock) <= LOW_STOCK_THRESHOLD) return 'low-stock';
  return 'in-stock';
}

export function productStock(product) {
  return activePresentations(product).reduce((total, presentation) => total + Number(presentation.stock || 0), 0);
}

export function productPriceRange(product) {
  const prices = activePresentations(product).map(effectivePrice).filter((price) => Number.isInteger(price) && price > 0);
  return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null;
}

export function inventoryMetrics(products) {
  return products.reduce((metrics, product) => {
    const presentations = activePresentations(product);
    return {
      products: metrics.products + 1,
      units: metrics.units + presentations.reduce((total, presentation) => total + Number(presentation.stock || 0), 0),
      value: metrics.value + presentations.reduce((total, presentation) => total + Number(presentation.stock || 0) * effectivePrice(presentation), 0),
    };
  }, { products: 0, units: 0, value: 0 });
}

function matchesAvailability(product, availability) {
  if (!availability) return true;
  const statuses = activePresentations(product).map(presentationAvailability);
  return availability === 'in-stock' ? statuses.includes('in-stock')
    : availability === 'low-stock' ? statuses.includes('low-stock')
      : availability === 'out-of-stock' ? statuses.includes('out-of-stock') : true;
}

export function filterInventory(products, filters = {}) {
  const query = normalizedText(filters.query);
  return products.filter((product) => {
    const searchable = [product.nombre, product.marca, ...(product.presentaciones || []).map(({ etiqueta }) => etiqueta)].map(normalizedText).join(' ');
    const range = productPriceRange(product);
    return (!query || searchable.includes(query))
      && (!filters.category || String(product.categoria_id) === filters.category)
      && (!filters.brand || normalizedText(product.marca) === normalizedText(filters.brand))
      && (!filters.gender || product.genero === filters.gender)
      && (!filters.classification || product.clasificacion === filters.classification)
      && (!filters.family || normalizedText(product.familia_olfativa) === normalizedText(filters.family))
      && (!filters.status || String(product.activo) === filters.status)
      && (!filters.featured || product.destacado)
      && matchesAvailability(product, filters.availability)
      && (!filters.minPrice || range?.max >= Number(filters.minPrice))
      && (!filters.maxPrice || range?.min <= Number(filters.maxPrice));
  });
}

export function sortInventory(products, order = '') {
  const direction = ['stock-desc', 'name-desc', 'newest', 'price-desc'].includes(order) ? -1 : 1;
  return [...products].sort((a, b) => {
    if (order.startsWith('stock')) return direction * (productStock(a) - productStock(b)) || a.nombre.localeCompare(b.nombre, 'es');
    if (order.startsWith('name')) return direction * a.nombre.localeCompare(b.nombre, 'es');
    if (order.startsWith('category')) return direction * (a.categorias?.nombre || '').localeCompare(b.categorias?.nombre || '', 'es') || a.nombre.localeCompare(b.nombre, 'es');
    if (order.startsWith('status')) return direction * (Number(Boolean(a.activo)) - Number(Boolean(b.activo))) || a.nombre.localeCompare(b.nombre, 'es');
    if (order === 'newest' || order === 'oldest') return direction * (new Date(a.creado_en) - new Date(b.creado_en));
    if (order.startsWith('price')) {
      const left = productPriceRange(a)?.min;
      const right = productPriceRange(b)?.min;
      if (left == null && right == null) return a.nombre.localeCompare(b.nombre, 'es');
      if (left == null) return 1;
      if (right == null) return -1;
      return direction * (left - right);
    }
    return a.nombre.localeCompare(b.nombre, 'es');
  });
}

export function paginateInventory(products, page = 1) {
  const totalPages = Math.max(1, Math.ceil(products.length / INVENTORY_PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const start = (currentPage - 1) * INVENTORY_PAGE_SIZE;
  return { items: products.slice(start, start + INVENTORY_PAGE_SIZE), page: currentPage, totalPages };
}
