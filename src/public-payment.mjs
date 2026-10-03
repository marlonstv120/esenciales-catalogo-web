const PAYMENT_ACCESS_KEY = 'esenciales.purchase-request-access.v1';
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const safeSubmissionErrors = new Set([
  'No pudimos validar esta solicitud.',
  'El archivo supera el máximo de 5 MiB.',
  'Formato no permitido. Usa JPG, PNG, WebP o PDF.',
  'El contenido del archivo no coincide con su formato.',
  'Esta solicitud ya no admite comprobantes.',
  'No fue posible subir el comprobante. Intenta nuevamente.',
]);

export function savePurchaseRequestAccess(confirmation, storage = globalThis.localStorage) {
  const access = { version: 1, codigo: confirmation?.codigo, token: confirmation?.token_cliente };
  if (!access.codigo || !access.token) return false;
  try { storage?.setItem(PAYMENT_ACCESS_KEY, JSON.stringify(access)); return true; } catch { return false; }
}

export function loadPurchaseRequestAccess(code, storage = globalThis.localStorage) {
  try {
    const access = JSON.parse(storage?.getItem(PAYMENT_ACCESS_KEY) || 'null');
    return access?.version === 1 && access.codigo === code && typeof access.token === 'string' ? access : null;
  } catch { return null; }
}

export function tokenFromLocation(locationRef = globalThis.location) {
  return new URLSearchParams(String(locationRef?.hash || '').replace(/^#/, '')).get('t') || '';
}

export function publicRequestUrl(code, token, locationRef = globalThis.location) {
  const url = new URL(locationRef?.href || 'http://localhost/');
  url.pathname = url.pathname.replace(/\/$/, '') + `/solicitud/${encodeURIComponent(code)}`;
  url.search = '';
  url.hash = `t=${encodeURIComponent(token)}`;
  return `${url.pathname}${url.hash}`;
}

export async function loadPublicPurchaseRequest(client, code, token) {
  const { data, error } = await client.rpc('obtener_solicitud_publica_segura', { p_codigo: code, p_token_cliente: token });
  return { data: data || null, error: error ? 'No pudimos cargar la información de esta solicitud.' : null };
}

export function validatePaymentProof(file) {
  if (!file) return 'Selecciona un comprobante antes de enviarlo.';
  if (!allowedTypes.has(file.type)) return 'Formato no permitido. Usa JPG, PNG, WebP o PDF.';
  if (file.size < 1 || file.size > MAX_FILE_BYTES) return 'El archivo supera el máximo de 5 MiB.';
  return null;
}

async function submissionErrorMessage(error, data) {
  const directMessage = typeof data?.error === 'string' ? data.error : null;
  if (safeSubmissionErrors.has(directMessage)) return directMessage;
  try {
    const response = error?.context;
    const payload = response && typeof response.clone === 'function' ? await response.clone().json() : null;
    if (safeSubmissionErrors.has(payload?.error)) return payload.error;
  } catch {
    // A malformed error response must not prevent a safe fallback message.
  }
  return 'No fue posible subir el comprobante. Intenta nuevamente.';
}

export async function submitPaymentProof(client, { code, token, file }) {
  const validation = validatePaymentProof(file);
  if (validation) return { error: validation };
  const body = new FormData();
  body.set('code', code);
  body.set('token', token);
  body.set('file', file);
  try {
    const { data, error } = await client.functions.invoke('submit-payment-proof', { body });
    if (!error && !data?.error) return { data: data || null, error: null };
    if (import.meta.env?.DEV) console.error('Bre-B proof submission failed.', { code, error, data });
    return { data: null, error: await submissionErrorMessage(error, data) };
  } catch (error) {
    if (import.meta.env?.DEV) console.error('Bre-B proof submission failed.', { code, error });
    return { data: null, error: 'No fue posible subir el comprobante. Intenta nuevamente.' };
  }
}

export function paymentStatusLabel(status) {
  return ({ pendiente: 'Pendiente', comprobante_enviado: 'Comprobante enviado', verificado: 'Verificado', rechazado: 'Rechazado', validado_manualmente: 'Validado manualmente' }[status] || 'Pendiente');
}
