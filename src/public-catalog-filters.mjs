const valid = {
  generos: ['hombre', 'mujer', 'unisex'],
  clasificaciones: ['original', 'uno_a_uno', 'inspiracion'],
};

export function parseCatalogFilters(search = '') {
  const params = new URLSearchParams(search);
  const category = params.get('categoria');
  return {
    busqueda: (params.get('q') || '').trim(),
    categoria: category && /^[1-9]\d*$/.test(category) && Number.isSafeInteger(Number(category)) ? Number(category) : null,
    generos: [...new Set(params.getAll('genero').filter((value) => valid.generos.includes(value)))],
    clasificaciones: [...new Set(params.getAll('clasificacion').filter((value) => valid.clasificaciones.includes(value)))],
    precioMinimo: params.get('min') || '',
    precioMaximo: params.get('max') || '',
  };
}

export function serializeCatalogFilters(filters) {
  const params = new URLSearchParams();
  if (filters.busqueda.trim()) params.set('q', filters.busqueda.trim());
  if (filters.categoria) params.set('categoria', String(filters.categoria));
  filters.generos.forEach((value) => params.append('genero', value));
  filters.clasificaciones.forEach((value) => params.append('clasificacion', value));
  if (filters.precioMinimo) params.set('min', filters.precioMinimo);
  if (filters.precioMaximo) params.set('max', filters.precioMaximo);
  return params.toString();
}

export function hasCatalogFilters(filters) {
  return Boolean(serializeCatalogFilters(filters));
}

export function validateCatalogFilters(filters) {
  for (const value of [filters.precioMinimo, filters.precioMaximo]) {
    if (value !== '' && (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)))) {
      return 'Ingresa un precio entero en COP mayor que cero.';
    }
  }
  if (filters.precioMinimo && filters.precioMaximo && Number(filters.precioMinimo) > Number(filters.precioMaximo)) {
    return 'El precio mínimo no puede superar el máximo.';
  }
  return null;
}

export function toggleFilterValue(filters, field, value) {
  if (!valid[field]?.includes(value)) return filters;
  const values = filters[field];
  return { ...filters, [field]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] };
}
