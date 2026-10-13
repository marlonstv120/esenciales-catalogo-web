import { copDigits } from './cop-input.mjs';

export const LOW_STOCK_THRESHOLD = 3;
export const CLASSIFICATION_LABELS = {
  nuevo: 'Nuevo',
  usado: 'Usado',
  seminuevo: 'Semi-nuevo',
  original: 'Nuevo',
  uno_a_uno: 'Usado',
  inspiracion: 'Semi-nuevo'
};

export function classificationLabel(value) {
  return CLASSIFICATION_LABELS[value] || '—';
}

const productColumns = 'id, categoria_id, nombre, descripcion, marca, genero, modelo, clasificacion, destacado, activo, creado_en';
const presentationColumns = 'id, producto_id, etiqueta, precio_normal, precio_promocional, stock, modo_disponibilidad, activo';

const trimOrNull = (value) => value?.trim() || null;
const presentationUnits = new Set(['km', 'mi', 'cc', 'l', 'hp']);

export function splitPresentationLabel(label = '') {
  const value = String(label).trim();
  const match = value.match(/^(.*?)\s+(cc|l|km|mi|hp)$/i);
  return match && match[1].trim()
    ? { value: match[1].trim(), unit: match[2].toLowerCase() }
    : { value, unit: '' };
}

export function formatPresentationLabel(value, unit = '') {
  const label = String(value || '').trim();
  const normalizedUnit = String(unit).toLowerCase();
  return presentationUnits.has(normalizedUnit) ? `${label} ${normalizedUnit}`.trim() : label;
}

export function effectivePrice(presentation) {
  const normal = Number(presentation?.precio_normal);
  const promotion = Number(presentation?.precio_promocional);
  return Number.isInteger(promotion) && promotion > 0 && promotion < normal ? promotion : normal;
}

// Un vehículo está vendido cuando tiene una presentación vendida sin otras que
// admitan solicitud. Una vez vendido, sale del inventario y del catálogo público.
export function productIsSold(product) {
  const presentations = (product?.presentaciones || []).filter((presentation) => presentation.activo);
  if (!presentations.some((presentation) => presentation.modo_disponibilidad === 'vendido')) return false;
  return !presentations.some((presentation) =>
    presentation.modo_disponibilidad === 'bajo_pedido'
    || (presentation.modo_disponibilidad === 'venta_inmediata' && Number(presentation.stock) > 0));
}

export function normalizeProduct(values) {
  return {
    categoria_id: Number(values.categoria_id),
    nombre: values.nombre?.trim(),
    descripcion: values.descripcion?.trim(),
    marca: trimOrNull(values.marca),
    modelo: trimOrNull(values.modelo),
    genero: values.genero || null,
    clasificacion: values.clasificacion || null,
    destacado: values.destacado ?? false,
    activo: values.activo ?? true,
  };
}

export function normalizePresentation(values) {
  const { etiqueta_valor, etiqueta_unidad, ...presentation } = values;
  const modo_disponibilidad = values.modo_disponibilidad;
  return {
    ...presentation,
    etiqueta: etiqueta_valor === undefined ? values.etiqueta?.trim() : formatPresentationLabel(etiqueta_valor, etiqueta_unidad),
    precio_normal: Number(copDigits(values.precio_normal)),
    precio_promocional: copDigits(values.precio_promocional) === '' ? null : Number(copDigits(values.precio_promocional)),
    stock: ['bajo_pedido', 'vendido'].includes(modo_disponibilidad) ? 0 : Number(values.stock),
  };
}

export function listProducts(client) {
  return client.from('productos').select(`${productColumns}, categorias(id, nombre, activo), presentaciones(${presentationColumns}), imagenes_producto(id, producto_id, url, identificador_externo, tipo, texto_alternativo, posicion)`).order('creado_en', { ascending: false });
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
