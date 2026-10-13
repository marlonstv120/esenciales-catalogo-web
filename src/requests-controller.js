import { filterPurchaseRequests, listPurchaseRequests, savePurchaseRequest, transitionPurchaseRequest } from './requests.js';
import { purchaseRequestDetailView, purchaseRequestsView } from './request-views.mjs';
import { supabase } from './supabase.js';
import { showNotification } from './notifications.mjs';

const initialState = () => ({ requests: [], loading: true, error: '', filters: { query: '', status: '' }, selectedId: null, values: null, operation: '', dirty: false, quantityErrors: {} });

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
  let state = initialState();
  const selectedRequest = () => state.requests.find((request) => request.id === state.selectedId);
  const draw = () => {
    const request = selectedRequest();
    outlet.innerHTML = request ? purchaseRequestDetailView(request, { values: state.values || valuesFor(request), operation: state.operation, dirty: state.dirty, quantityErrors: state.quantityErrors }) : purchaseRequestsView({ requests: filterPurchaseRequests(state.requests, state.filters), allCount: state.requests.length, filters: state.filters, loading: state.loading, error: state.error });
    bind();
  };
  const showNotice = (message, type = 'success') => {
    showNotification(message, { tone: type, documentRef: outlet.ownerDocument });
  };
  const captureValues = () => {
    const form = outlet.querySelector('#request-edit-form');
    if (!form || !state.values) return;
    const data = new FormData(form);
    const values = { ...state.values, nombre_cliente: data.get('nombre_cliente'), telefono: data.get('telefono'), ciudad: data.get('ciudad'), observaciones: data.get('observaciones'), lineas: state.values.lineas.map((line) => ({ ...line, cantidad: data.get(`cantidad-${line.id}`) ?? line.cantidad })) };
    state = { ...state, values, dirty: hasUnsavedChanges(selectedRequest(), values), quantityErrors: quantityErrorsFor(values.lineas) };
  };
  const syncEditControls = () => {
    const disabled = Boolean(state.operation) || !state.dirty || Object.keys(state.quantityErrors).length > 0;
    outlet.querySelector('[data-request-edit-actions]')?.toggleAttribute('hidden', !state.dirty);
    outlet.querySelector('[data-request-save]')?.toggleAttribute('disabled', disabled);
    outlet.querySelector('[data-request-discard]')?.toggleAttribute('disabled', disabled);
    outlet.querySelectorAll('[data-request-transition]').forEach((button) => button.toggleAttribute('disabled', Boolean(state.operation) || state.dirty));
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
    state = { ...state, requests: data || [], loading: false, error: error ? (error.message || 'No fue posible cargar las solicitudes. Inténtalo de nuevo.') : '', quantityErrors: {} };
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
    if (state.operation || !state.selectedId) return;
    captureValues();
    if (!state.values?.lineas.length) { showNotice('La solicitud debe conservar al menos un producto.', 'error'); return; }
    if (Object.keys(state.quantityErrors).length) { showNotice('Revisa las cantidades que superan la disponibilidad.', 'error'); return; }
    state = { ...state, operation: 'saving', error: '' }; draw();
    const { error } = await savePurchaseRequest(supabase, state.selectedId, state.values);
    if (!isCurrentGeneration()) return;
    if (error) {
      state = { ...state, operation: '' };
      await refreshAvailability();
      const quantityError = Object.values(state.quantityErrors)[0];
      draw();
      showNotice(quantityError || requestError(error), 'error');
      return;
    }
    state = { ...state, operation: '', dirty: false, values: null };
    await load();
    showNotice('Cambios guardados correctamente.');
  }
  async function transition(transitionName) {
    if (state.operation || !state.selectedId) return;
    if (state.dirty) { showNotice('Guarda o descarta los cambios antes de cambiar el estado.', 'info'); return; }
    const labels = { confirm: 'confirmar', deliver: 'marcar como entregada', cancel: 'cancelar' };
    if (!window.confirm(`¿Confirmas ${labels[transitionName]} esta solicitud?`)) return;
    const previous = selectedRequest();
    const nextStatus = { confirm: 'confirmada', deliver: 'entregada', cancel: 'cancelada' }[transitionName];
    state = nextStatus && previous
      ? { ...state, operation: transitionName, error: '', values: null, requests: state.requests.map((item) => item.id === previous.id ? { ...item, estado: nextStatus } : item) }
      : { ...state, operation: transitionName, error: '' };
    draw();
    const { error } = await transitionPurchaseRequest(supabase, state.selectedId, transitionName);
    if (!isCurrentGeneration()) return;
    if (error) {
      state = previous ? { ...state, operation: '', requests: state.requests.map((item) => item.id === previous.id ? previous : item) } : { ...state, operation: '' };
      draw();
      showNotice(requestError(error), 'error');
      return;
    }
    state = { ...state, operation: '', dirty: false, values: null };
    await load();
    showNotice('Estado de la solicitud actualizado correctamente.');
  }
  function openRequest(requestId) {
    const request = state.requests.find((item) => String(item.id) === String(requestId));
    if (!request) return;
    state = { ...state, selectedId: request.id, values: valuesFor(request), error: '', dirty: false, operation: '', quantityErrors: {} };
    draw();
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
  }
  await load();
  return {
    canLeave: () => !state.dirty || window.confirm('Hay cambios sin guardar. ¿Quieres volver de todas formas?'),
  };
}
