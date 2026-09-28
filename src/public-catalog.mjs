export async function loadPublicCatalog(client) {
  const { data, error } = await client.rpc('obtener_catalogo_publico');
  return {
    data: data || [],
    error: error ? 'No fue posible cargar el catalogo.' : null,
  };
}

export async function loadFilteredCatalog(client, filters) {
  const { data, error } = await client.rpc('buscar_catalogo_publico', {
    busqueda: filters.busqueda || null,
    categoria: filters.categoria,
    generos: filters.generos.length ? filters.generos : null,
    clasificaciones: filters.clasificaciones.length ? filters.clasificaciones : null,
    precio_minimo: filters.precioMinimo ? Number(filters.precioMinimo) : null,
    precio_maximo: filters.precioMaximo ? Number(filters.precioMaximo) : null,
  });
  return { data: data || [], error: error ? 'No fue posible cargar el catálogo.' : null };
}

export async function loadPublicProduct(client, productId) {
  const id = Number(productId);
  if (!Number.isInteger(id) || id < 1) {
    return { data: null, error: 'Producto no encontrado.' };
  }

  const { data, error } = await client.rpc('obtener_producto_publico', {
    producto_id: id,
  });
  return {
    data: data || null,
    error: error ? 'No fue posible cargar el producto.' : null,
  };
}
