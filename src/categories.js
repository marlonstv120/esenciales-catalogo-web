const categoryColumns = 'id, nombre, activo';

export function listCategories(client) {
  return client.from('categorias').select(categoryColumns).order('nombre', { ascending: true });
}

export function createCategory(client, name) {
  const nombre = name.trim();
  if (!nombre) return { data: null, error: { code: 'category_name_required' } };

  return client.from('categorias').insert({ nombre }).select(categoryColumns).single();
}

export function updateCategory(client, id, changes) {
  const values = { ...changes };
  if (typeof values.nombre === 'string') {
    values.nombre = values.nombre.trim();
    if (!values.nombre) return { data: null, error: { code: 'category_name_required' } };
  }

  return client.from('categorias').update(values).eq('id', id).select(categoryColumns).single();
}
