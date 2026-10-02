import { filterPurchaseRequests, listPurchaseRequests, rejectPaymentProof, savePurchaseRequest, transitionPurchaseRequest, verifyPaymentAndConfirm } from './requests.js';
import { purchaseRequestDetailView, purchaseRequestsView } from './request-views.mjs';
import { supabase } from './supabase.js';
import { showNotification } from './notifications.mjs';

let state = { requests: [], loading: true, error: '', filters: { query: '', status: '' }, selectedId: null, values: null, busy: false, dirty: false, quantityErrors: {} };

function valuesFor(request) {
  return { nombre_cliente: request.nombre_cliente, telefono: request.telefono, ciudad: request.ciudad || '', observaciones: request.observaciones || '', lineas: (request.detalles_solicitud || []).map((line) => ({ ...line })) };
}

function requestError(error) {
  return error?.code === '22023' ? error.message : 'No fue posible guardar los cambios. Inténtalo de nuevo.';
}

function immediateStockMaximum(line) {
  const presentation = line.presentaciones || {};
  return presentation.modo_disponibilidad === 'venta_inmediata' && Number.isInteger(Number(presentation.stock)) ? Math.max(0, Number(presentation.stock)) : null;
}

function quantityErrorsFor(lines = []) {
  return Object.fromEntries(lines.flatMap((line) => {
    const quantity = Number(line.cantidad);
    const maximum = immediateStockMaximum(line);
    const name = line.presentaciones?.productos?.nombre || 'Esta presentación';
    const label = line.presentaciones?.etiqueta ? `${name} · ${line.presentaciones.etiqueta}` : name;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return [[line.id, `${label}: la cantidad debe estar entre 1 y 99.`]];
    if (maximum !== null && quantity > maximum) return [[line.id, `${label}: máximo disponible ${maximum} ${maximum === 1 ? 'unidad' : 'unidades'}.`]];
    return [];
  }));
}

function hasUnsavedChanges(request, values) {
  if (!request || !values) return false;
  const fields = ['nombre_cliente', 'telefono', 'ciudad', 'observaciones'];
  if (fields.some((field) => String(values[field] || '') !== String(request[field] || ''))) return true;
  const originalLines = request.detalles_solicitud || [];
  return values.lineas?.length !== originalLines.length || values.lineas?.some((line) => {
    const original = originalLines.find((item) => String(item.id) === String(line.id));
    return !original || Number(line.cantidad) !== Number(original.cantidad);
  });
}

export async function renderRequestsScreen({ outlet, isCurrentGeneration }) {
  const selectedRequest = () => state.requests.find((request) => request.id === state.selectedId);
  const draw = () => {
    const request = selectedRequest();
    outlet.innerHTML = request ? purchaseRequestDetailView(request, { values: state.values || valuesFor(request), busy: state.busy, dirty: state.dirty, quantityErrors: state.quantityErrors }) : purchaseRequestsView({ requests: filterPurchaseRequests(state.requests, state.filters), allCount: state.requests.length, filters: state.filters, loading: state.loading, error: state.error });
    bind();
  };
  const showNotice = (message, type = 'success') => {
    showNotification(message, { tone: type, documentRef: outlet.ownerDocument });
  };
  const captureValues = () => {
    const form = outlet.querySelector('#request-edit-form');
    if (!form || !state.values) return;
    const data = new FormData(form);
    const values = { ...state.values, nombre_cliente: data.get('nombre_cliente'), telefono: data.get('telefono'), ciudad: data.get('ciudad'), observaciones: data.get('observaciones'), lineas: state.values.lineas.map((line) => ({ ...line, cantidad: data.get(`cantidad-${line.id}`) })) };
    state = { ...state, values, dirty: hasUnsavedChanges(selectedRequest(), values), quantityErrors: quantityErrorsFor(values.lineas) };
  };
  const syncEditControls = () => {
    const disabled = state.busy || !state.dirty || Object.keys(state.quantityErrors).length > 0;
    outlet.querySelector('[data-request-save]')?.toggleAttribute('disabled', disabled);
    outlet.querySelector('[data-request-discard]')?.toggleAttribute('disabled', disabled);
    outlet.querySelectorAll('[data-request-transition]').forEach((button) => button.toggleAttribute('disabled', state.busy || state.dirty));
    outlet.querySelector('[data-request-dirty-hint]')?.toggleAttribute('hidden', !state.dirty);
    state.values?.lineas.forEach((line) => {
      const maximum = immediateStockMaximum(line);
      const message = state.quantityErrors[line.id];
      const feedback = outlet.querySelector(`[data-request-quantity-feedback="${line.id}"]`);
      const input = outlet.querySelector(`[data-request-quantity-input="${line.id}"]`);
      if (feedback && maximum !== null) {
        feedback.textContent = message || `Máx. disponible: ${maximum}`;
        feedback.classList.toggle('request-quantity-help--error', Boolean(message));
      }
      input?.toggleAttribute('aria-invalid', Boolean(message));
    });
  };
  async function load() {
    state = { ...state, loading: true, error: '' }; draw();
    const { data, error } = await listPurchaseRequests(supabase);
    if (!isCurrentGeneration()) return;
    state = { ...state, requests: data || [], loading: false, error: error ? 'No fue posible cargar las solicitudes. Inténtalo de nuevo.' : '', quantityErrors: {} };
    draw();
  }
  async function refreshAvailability() {
    const { data, error } = await listPurchaseRequests(supabase);
    if (!isCurrentGeneration() || error || !state.values) return;
    const request = (data || []).find((item) => item.id === state.selectedId);
    if (!request) return;
    const values = { ...state.values, lineas: state.values.lineas.map((line) => ({ ...line, presentaciones: request.detalles_solicitud?.find((item) => String(item.id) === String(line.id))?.presentaciones || line.presentaciones })) };
    state = { ...state, requests: data, values, quantityErrors: quantityErrorsFor(values.lineas) };
  }
  async function save(form) {
    if (state.busy || !state.selectedId) return;
    captureValues();
    if (!state.values?.lineas.length) { showNotice('La solicitud debe conservar al menos un producto.', 'error'); return; }
    if (Object.keys(state.quantityErrors).length) { showNotice('Revisa las cantidades que superan la disponibilidad.', 'error'); return; }
    state = { ...state, busy: true, error: '' }; draw();
    const { error } = await savePurchaseRequest(supabase, state.selectedId, state.values);
    if (!isCurrentGeneration()) return;
    if (error) {
      state = { ...state, busy: false };
      await refreshAvailability();
      const quantityError = Object.values(state.quantityErrors)[0];
      showNotice(quantityError || requestError(error), 'error');
      return;
    }
    state = { ...state, busy: false, dirty: false, values: null };
    await load();
    showNotice('Cambios guardados correctamente.');
  }
  async function transition(transitionName) {
    if (state.busy || !state.selectedId) return;
    if (state.dirty) { showNotice('Guarda o descarta los cambios antes de cambiar el estado.', 'info'); return; }
    const labels = { confirm: 'confirmar', deliver: 'marcar como entregada', cancel: 'cancelar' };
    if (!window.confirm(`¿Confirmas ${labels[transitionName]} esta solicitud?`)) return;
    state = { ...state, busy: true, error: '' }; draw();
    const { error } = await transitionPurchaseRequest(supabase, state.selectedId, transitionName);
    if (!isCurrentGeneration()) return;
    if (error) { state = { ...state, busy: false }; showNotice(requestError(error), 'error'); return; }
    state = { ...state, busy: false, dirty: false, values: null };
    await load();
    showNotice('Estado de la solicitud actualizado correctamente.');
  }
  async function rejectProof() {
    if (state.busy || !state.selectedId) return;
    const reason = window.prompt('Indica la razón del rechazo del comprobante:');
    if (reason === null) return;
    state = { ...state, busy: true, error: '' }; draw();
    const { error } = await rejectPaymentProof(supabase, state.selectedId, reason);
    if (!isCurrentGeneration()) return;
    if (error) { state = { ...state, busy: false }; showNotice(requestError(error), 'error'); return; }
    state = { ...state, busy: false, dirty: false, values: null };
    await load();
    showNotice('Comprobante rechazado.');
  }
  async function verifyPayment() {
    if (state.busy || !state.selectedId) return;
    if (!window.confirm('¿Confirmas que verificaste el pago? Esta acción también confirmará la solicitud y descontará el inventario inmediato.')) return;
    state = { ...state, busy: true, error: '' }; draw();
    const { error } = await verifyPaymentAndConfirm(supabase, state.selectedId);
    if (!isCurrentGeneration()) return;
    if (error) { state = { ...state, busy: false }; showNotice(requestError(error), 'error'); return; }
    state = { ...state, busy: false, dirty: false, values: null };
    await load();
    showNotice('Pago verificado y solicitud confirmada.');
  }
  async function openProof() {
    const request = selectedRequest();
    const payment = Array.isArray(request?.pagos_solicitud) ? request.pagos_solicitud[0] : request?.pagos_solicitud;
    if (!payment?.comprobante_path) return;
    const { data, error } = await supabase.storage.from('comprobantes-pago').createSignedUrl(payment.comprobante_path, 60);
    if (error || !data?.signedUrl) { showNotice('No fue posible abrir el comprobante.', 'error'); return; }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  }
  function closeDetail() {
    if (state.dirty && !window.confirm('Hay cambios sin guardar. ¿Quieres volver de todas formas?')) return;
    state = { ...state, selectedId: null, values: null, error: '', dirty: false, busy: false, quantityErrors: {} }; draw();
  }
  function discardChanges() {
    const request = selectedRequest();
    if (!request) return;
    state = { ...state, values: valuesFor(request), dirty: false, quantityErrors: {}, error: '' };
    draw();
  }
  function openRequest(requestId) {
    const request = state.requests.find((item) => String(item.id) === String(requestId));
    if (!request) return;
    state = { ...state, selectedId: request.id, values: valuesFor(request), error: '', dirty: false, quantityErrors: {} };
    draw();
    outlet.querySelector('#request-edit-form input')?.focus();
  }
  function bind() {
    outlet.querySelector('[data-requests-retry]')?.addEventListener('click', load);
    outlet.querySelector('#requests-search')?.addEventListener('input', (event) => { state = { ...state, filters: { ...state.filters, query: event.target.value } }; draw(); outlet.querySelector('#requests-search')?.focus(); });
    outlet.querySelector('#requests-status')?.addEventListener('change', (event) => { state = { ...state, filters: { ...state.filters, status: event.target.value } }; draw(); });
    outlet.querySelectorAll('[data-request-open]').forEach((button) => button.addEventListener('click', () => openRequest(button.dataset.requestOpen)));
    outlet.querySelectorAll('[data-request-row]').forEach((row) => row.addEventListener('dblclick', (event) => {
      if (event.target.closest('button, a, input, select, textarea, label')) return;
      openRequest(row.dataset.requestRow);
    }));
    outlet.querySelector('[data-request-back]')?.addEventListener('click', closeDetail);
    outlet.querySelector('[data-request-discard]')?.addEventListener('click', discardChanges);
    outlet.querySelector('#request-edit-form')?.addEventListener('input', () => { captureValues(); syncEditControls(); });
    outlet.querySelectorAll('[data-request-quantity-change]').forEach((button) => button.addEventListener('click', () => {
      captureValues();
      const line = state.values?.lineas.find((item) => String(item.id) === button.dataset.requestQuantityChange);
      if (!line) return;
      const maximum = immediateStockMaximum(line);
      const quantity = Math.max(1, Math.min(99, maximum === null ? 99 : maximum, Number(line.cantidad) + Number(button.dataset.requestQuantityStep)));
      const values = { ...state.values, lineas: state.values.lineas.map((item) => String(item.id) === String(line.id) ? { ...item, cantidad: quantity } : item) };
      state = { ...state, values, dirty: hasUnsavedChanges(selectedRequest(), values), quantityErrors: quantityErrorsFor(values.lineas), error: '' };
      draw();
      outlet.querySelector(`[data-request-quantity-input="${line.id}"]`)?.focus();
    }));
    outlet.querySelectorAll('[data-request-quantity-input]').forEach((input) => input.addEventListener('change', () => { if (input.checkValidity()) { captureValues(); draw(); } }));
    outlet.querySelectorAll('[data-request-line-remove]').forEach((button) => button.addEventListener('click', () => { captureValues(); const values = { ...state.values, lineas: state.values.lineas.filter((line) => String(line.id) !== button.dataset.requestLineRemove) }; state = { ...state, values, dirty: hasUnsavedChanges(selectedRequest(), values), quantityErrors: quantityErrorsFor(values.lineas), error: '' }; draw(); }));
    outlet.querySelector('#request-edit-form')?.addEventListener('submit', (event) => { event.preventDefault(); event.currentTarget.checkValidity() ? save(event.currentTarget) : event.currentTarget.reportValidity(); });
    outlet.querySelectorAll('[data-request-transition]').forEach((button) => button.addEventListener('click', () => transition(button.dataset.requestTransition)));
    outlet.querySelector('[data-payment-reject]')?.addEventListener('click', rejectProof);
    outlet.querySelector('[data-payment-verify]')?.addEventListener('click', verifyPayment);
    outlet.querySelector('[data-payment-proof-open]')?.addEventListener('click', openProof);
  }
  await load();
}
