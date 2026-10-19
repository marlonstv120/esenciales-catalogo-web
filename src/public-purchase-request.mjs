import { getSelectedCartItems } from './public-cart.mjs';

const CONFIRMATION_KEY = 'esenciales.purchase-request-confirmation.v1';
const REQUEST_DRAFT_KEY = 'esenciales:draft:solicitud:nueva';
const REQUEST_DRAFT = { version: 1, form: 'public-purchase-request' };

function trimmed(value) { return String(value || '').trim(); }

function phoneDigits(value) { return trimmed(value).replace(/[^0-9]/g, ''); }

export function emptyRequestForm() {
  return { nombre: '', telefono: '', ciudad: '', observaciones: '', aceptaTerminos: false, aceptaPoliticaDatos: false };
}

export function loadPurchaseRequestDraft(storage = globalThis.sessionStorage) {
  try {
    const draft = JSON.parse(storage?.getItem(REQUEST_DRAFT_KEY) || 'null');
    const values = draft?.values;
    if (draft?.version !== REQUEST_DRAFT.version || draft?.form !== REQUEST_DRAFT.form || !Number.isFinite(draft.updatedAt) || !values || typeof values !== 'object') return null;
    return { nombre: String(values.nombre || ''), telefono: String(values.telefono || ''), ciudad: String(values.ciudad || ''), observaciones: String(values.observaciones || ''), aceptaTerminos: values.aceptaTerminos === true, aceptaPoliticaDatos: values.aceptaPoliticaDatos === true };
  } catch { return null; }
}

export function purchaseRequestDraftMetadata() { return { ...REQUEST_DRAFT, key: REQUEST_DRAFT_KEY }; }

export function validateRequestForm(form, cart) {
  const errors = {};
  const nombre = trimmed(form.nombre);
  const telefono = trimmed(form.telefono);
  const ciudad = trimmed(form.ciudad);
  const observaciones = trimmed(form.observaciones);
  if (nombre.length < 2 || nombre.length > 100) errors.nombre = 'Ingresa un nombre entre 2 y 100 caracteres.';
  if (!/^[0-9+() -]+$/.test(telefono) || phoneDigits(telefono).length < 7 || phoneDigits(telefono).length > 15) errors.telefono = 'Ingresa un teléfono válido de 7 a 15 dígitos.';
  if (ciudad.length > 100) errors.ciudad = 'La ciudad no puede superar 100 caracteres.';
  if (observaciones.length > 500) errors.observaciones = 'Las observaciones no pueden superar 500 caracteres.';
  if (!form.aceptaTerminos || !form.aceptaPoliticaDatos) errors.aceptacion = 'Debes aceptar los Términos y condiciones y la Política de tratamiento de datos.';
  if (!getSelectedCartItems(cart || { items: [] }).length) errors.cart = 'Selecciona al menos un producto para registrar la solicitud.';
  return { errors, values: { nombre, telefono, ciudad, observaciones } };
}

export function requestLines(cart) {
  return getSelectedCartItems(cart).map((item) => ({ presentacion_id: Number(item.presentationId), cantidad: Number(item.quantity), precio_esperado: Number(item.price) }));
}

export async function registerPurchaseRequest(client, attemptId, form, cart) {
  const validation = validateRequestForm(form, cart);
  if (Object.keys(validation.errors).length) return { data: null, errors: validation.errors, error: null };
  const { data, error } = await client.rpc('registrar_solicitud_compra', {
    p_identificador_intento: attemptId,
    p_nombre_cliente: validation.values.nombre,
    p_telefono: validation.values.telefono,
    p_ciudad: validation.values.ciudad || null,
    p_observaciones: validation.values.observaciones || null,
    p_lineas: requestLines(cart),
    p_acepta_terminos: true,
    p_acepta_politica_datos: true,
  });
  if (error) return { data: null, errors: {}, error: 'No fue posible registrar la solicitud. Verifica el carrito e inténtalo de nuevo.' };
  return { data, errors: {}, error: null };
}

export function applyPriceReview(cart, review) {
  const prices = new Map((review?.lineas || []).map((line) => [Number(line.presentacion_id), Number(line.precio_unitario)]));
  return { ...cart, items: cart.items.map((item) => prices.has(Number(item.presentationId)) ? { ...item, price: prices.get(Number(item.presentationId)), validation: { state: 'changed', message: 'El precio se actualizó. Revisa el nuevo resumen antes de registrar.', quantityEditable: true } } : item) };
}

export function savePurchaseConfirmation(confirmation, storage = globalThis.localStorage) {
  const safe = { version: 1, codigo: confirmation?.codigo, estado: confirmation?.estado, valor_total_productos: Number(confirmation?.valor_total_productos), lineas: confirmation?.lineas || [] };
  if (!safe.codigo || !Array.isArray(safe.lineas) || !Number.isInteger(safe.valor_total_productos)) return false;
  try { storage?.setItem(CONFIRMATION_KEY, JSON.stringify(safe)); return true; } catch { return false; }
}

export function loadPurchaseConfirmation(storage = globalThis.localStorage) {
  try {
    const value = JSON.parse(storage?.getItem(CONFIRMATION_KEY) || 'null');
    return value?.version === 1 && typeof value.codigo === 'string' && Array.isArray(value.lineas) && Number.isInteger(value.valor_total_productos) ? value : null;
  } catch { return null; }
}

export function clearPurchaseConfirmation(storage = globalThis.localStorage) {
  try { storage?.removeItem(CONFIRMATION_KEY); return true; } catch { return false; }
}

export function whatsappUrl(confirmation) {
  const lines = (confirmation?.lineas || []).map((line) => `• ${line.producto}\n  ${line.presentacion} · Cantidad: ${line.cantidad}\n  Precio unitario: $${Number(line.precio_unitario).toLocaleString('es-CO')}\n  Subtotal: $${Number(line.subtotal).toLocaleString('es-CO')}`).join('\n\n');
  const message = `Hola, ESENCIALES.\n\nRegistré la solicitud ${confirmation?.codigo}.\n\nPRODUCTOS\n${lines}\n\nVALOR TOTAL DE PRODUCTOS\n$${Number(confirmation?.valor_total_productos).toLocaleString('es-CO')}\n\nQuisiera confirmar disponibilidad y entrega.`;
  return `https://wa.me/573174645670?text=${encodeURIComponent(message)}`;
}

export function paymentProofWhatsappUrl(request) {
  const total = Number(request?.valor_total_productos).toLocaleString('es-CO');
  const message = `Hola, ESENCIALES.\n\nRegistré la solicitud ${request?.codigo} por $${total} y ya envié el comprobante de la transferencia desde la página.\n\nQuedo atento(a) a la verificación y coordinación de la entrega.`;
  return `https://wa.me/573174645670?text=${encodeURIComponent(message)}`;
}
