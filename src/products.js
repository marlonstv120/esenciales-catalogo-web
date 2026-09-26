const productColumns = 'id, categoria_id, nombre, descripcion, marca, genero, referencia, clasificacion, destacado, activo';
const presentationColumns = 'id, producto_id, etiqueta, precio_normal, precio_promocional, stock, modo_disponibilidad, activo';

const trimOrNull = (value) => value?.trim() || null;

export function normalizeProduct(values) {
  return {
    ...values,
    nombre: values.nombre?.trim(),
    descripcion: values.descripcion?.trim(),
    marca: trimOrNull(values.marca),
    referencia: trimOrNull(values.referencia),
    genero: values.genero || null,
    clasificacion: values.clasificacion || null,
  };
}

export function normalizePresentation(values) {
  const modo_disponibilidad = values.modo_disponibilidad;
  return {
    ...values,
    etiqueta: values.etiqueta?.trim(),
    precio_normal: Number(values.precio_normal),
    precio_promocional: values.precio_promocional === '' ? null : Number(values.precio_promocional),
    stock: modo_disponibilidad === 'bajo_pedido' ? 0 : Number(values.stock),
  };
}

export function listProducts(client) {
  return client.from('productos').select(`${productColumns}, categorias(id, nombre, activo), presentaciones(${presentationColumns}), imagenes_producto(id, producto_id, url, identificador_externo, texto_alternativo, posicion)`).order('nombre');
}

export function listInventory(client) {
  return client.from('presentaciones').select(`${presentationColumns}, productos(id, nombre, categoria_id, categorias(id, nombre))`).order('id');
}

export function saveProduct(client, id, values) {
  const data = normalizeProduct(values);
  const query = client.from('productos');
  return id ? query.update(data).eq('id', id).select(productColumns).single() : query.insert(data).select(productColumns).single();
}

export function savePresentation(client, id, values) {
  const data = normalizePresentation(values);
  const query = client.from('presentaciones');
  return id ? query.update(data).eq('id', id).select(presentationColumns).single() : query.insert(data).select(presentationColumns).single();
}
