const valid = {
  generos: ['hombre', 'mujer', 'unisex'],
  clasificaciones: ['original', 'uno_a_uno', 'inspiracion'],
  disponibilidades: ['en-stock', 'bajo-pedido', 'agotado', 'no-disponible'],
  ordenes: ['destacados', 'precio-asc', 'precio-desc', 'nombre'],
};

export function parseCatalogFilters(search = '') {
  const params = new URLSearchParams(search);
  const category = params.get('categoria');
  const values = (name, allowed) => [...new Set(params.getAll(name).filter((value) => allowed.includes(value)))];
  const order = params.get('orden');
  return {
    busqueda: (params.get('q') || '').trim(),
    categoria: category && /^[1-9]\d*$/.test(category) && Number.isSafeInteger(Number(category)) ? Number(category) : null,
    disponibilidades: values('disponibilidad', valid.disponibilidades),
    generos: values('genero', valid.generos),
    clasificaciones: values('clasificacion', valid.clasificaciones),
    precioMinimo: params.get('min') || '',
    precioMaximo: params.get('max') || '',
    orden: valid.ordenes.includes(order) ? order : 'destacados',
  };
}

export function serializeCatalogFilters(filters) {
  const params = new URLSearchParams();
  if (filters.busqueda.trim()) params.set('q', filters.busqueda.trim());
  if (filters.categoria) params.set('categoria', String(filters.categoria));
  filters.disponibilidades.forEach((value) => params.append('disponibilidad', value));
  filters.generos.forEach((value) => params.append('genero', value));
  filters.clasificaciones.forEach((value) => params.append('clasificacion', value));
  if (filters.precioMinimo) params.set('min', filters.precioMinimo);
  if (filters.precioMaximo) params.set('max', filters.precioMaximo);
  if (filters.orden && filters.orden !== 'destacados') params.set('orden', filters.orden);
  return params.toString();
}

export function hasCatalogFilters(filters) {
  return Boolean(filters.busqueda || filters.categoria || filters.disponibilidades?.length || filters.generos?.length || filters.clasificaciones?.length || filters.precioMinimo || filters.precioMaximo);
}

export function getCatalogFilterCount(filters) {
  return [filters.busqueda, filters.categoria, filters.disponibilidades?.length, filters.generos?.length, filters.clasificaciones?.length, Boolean(filters.precioMinimo || filters.precioMaximo)].filter(Boolean).length;
}

export function validateCatalogFilters(filters) {
  for (const value of [filters.precioMinimo, filters.precioMaximo]) {
    if (value !== '' && (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)))) return 'Ingresa un precio entero en COP mayor que cero.';
  }
  if (filters.precioMinimo && filters.precioMaximo && Number(filters.precioMinimo) > Number(filters.precioMaximo)) return 'El precio mínimo no puede superar el máximo.';
  return null;
}

export function toggleFilterValue(filters, field, value) {
  if (!valid[field]?.includes(value)) return filters;
  const values = filters[field];
  return { ...filters, [field]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] };
}

export function removeCatalogFilter(filters, field, value) {
  if (['generos', 'clasificaciones', 'disponibilidades'].includes(field)) return { ...filters, [field]: filters[field].filter((item) => item !== value) };
  if (field === 'busqueda') return { ...filters, busqueda: '' };
  if (field === 'categoria') return { ...filters, categoria: null };
  if (field === 'precioMinimo' || field === 'precioMaximo') return { ...filters, [field]: '' };
  return filters;
}
