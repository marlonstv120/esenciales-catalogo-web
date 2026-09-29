export const LOW_STOCK_THRESHOLD = 3;
export const CLASSIFICATION_LABELS = { original: 'Original', uno_a_uno: '1.1', inspiracion: 'Inspiración' };

export function classificationLabel(value) {
  return CLASSIFICATION_LABELS[value] || '—';
}

const productColumns = 'id, categoria_id, nombre, descripcion, marca, genero, familia_olfativa, clasificacion, destacado, activo, creado_en';
const presentationColumns = 'id, producto_id, etiqueta, precio_normal, precio_promocional, stock, modo_disponibilidad, activo';

const trimOrNull = (value) => value?.trim() || null;

export function effectivePrice(presentation) {
  const normal = Number(presentation?.precio_normal);
  const promotion = Number(presentation?.precio_promocional);
  return Number.isInteger(promotion) && promotion > 0 && promotion < normal ? promotion : normal;
}

export function normalizeProduct(values) {
  return {
    categoria_id: Number(values.categoria_id),
    nombre: values.nombre?.trim(),
    descripcion: values.descripcion?.trim(),
    marca: trimOrNull(values.marca),
    familia_olfativa: trimOrNull(values.familia_olfativa),
    genero: values.genero || null,
    clasificacion: values.clasificacion || null,
    destacado: values.destacado ?? false,
    activo: values.activo ?? true,
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
