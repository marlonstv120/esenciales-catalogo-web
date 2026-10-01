import { filterPurchaseRequests, listPurchaseRequests, savePurchaseRequest, transitionPurchaseRequest } from './requests.js';
import { purchaseRequestDetailView, purchaseRequestsView } from './request-views.mjs';
import { supabase } from './supabase.js';

let state = { requests: [], loading: true, error: '', filters: { query: '', status: '' }, selectedId: null, values: null, busy: false, dirty: false, notice: '' };

function valuesFor(request) {
  return { nombre_cliente: request.nombre_cliente, telefono: request.telefono, ciudad: request.ciudad || '', observaciones: request.observaciones || '', lineas: (request.detalles_solicitud || []).map((line) => ({ ...line })) };
}

function requestError(error) {
  return error?.code === '22023' ? error.message : 'No fue posible guardar los cambios. Inténtalo de nuevo.';
}

export async function renderRequestsScreen({ outlet, isCurrentGeneration }) {
  const selectedRequest = () => state.requests.find((request) => request.id === state.selectedId);
  const draw = () => {
    const request = selectedRequest();
    outlet.innerHTML = `${state.notice ? `<p class="admin-toast" role="status">${state.notice}</p>` : ''}${request ? purchaseRequestDetailView(request, { values: state.values || valuesFor(request), busy: state.busy, dirty: state.dirty, error: state.error }) : purchaseRequestsView({ requests: filterPurchaseRequests(state.requests, state.filters), allCount: state.requests.length, filters: state.filters, loading: state.loading, error: state.error })}`;
    bind();
  };
  const showNotice = (message) => {
    state = { ...state, notice: message }; draw();
    window.setTimeout(() => { if (state.notice === message) { state = { ...state, notice: '' }; draw(); } }, 4000);
  };
  const captureValues = () => {
    const form = outlet.querySelector('#request-edit-form');
    if (!form || !state.values) return;
    const data = new FormData(form);
    state = { ...state, values: { ...state.values, nombre_cliente: data.get('nombre_cliente'), telefono: data.get('telefono'), ciudad: data.get('ciudad'), observaciones: data.get('observaciones'), lineas: state.values.lineas.map((line) => ({ ...line, cantidad: data.get(`cantidad-${line.id}`) })) } };
  };
  async function load() {
    state = { ...state, loading: true, error: '' }; draw();
    const { data, error } = await listPurchaseRequests(supabase);
    if (!isCurrentGeneration()) return;
    state = { ...state, requests: data || [], loading: false, error: error ? 'No fue posible cargar las solicitudes. Inténtalo de nuevo.' : '' };
    draw();
  }
  async function save(form) {
    if (state.busy || !state.selectedId) return;
    captureValues();
    if (!state.values?.lineas.length) { state = { ...state, error: 'La solicitud debe conservar al menos un producto.' }; draw(); return; }
    state = { ...state, busy: true, error: '' }; draw();
    const { error } = await savePurchaseRequest(supabase, state.selectedId, state.values);
    if (!isCurrentGeneration()) return;
    if (error) { state = { ...state, busy: false, error: requestError(error) }; draw(); return; }
    state = { ...state, busy: false, dirty: false, values: null };
    await load();
    showNotice('Solicitud actualizada correctamente.');
  }
  async function transition(transitionName) {
    if (state.busy || !state.selectedId) return;
    const labels = { confirm: 'confirmar', deliver: 'marcar como entregada', cancel: 'cancelar' };
    if (!window.confirm(`¿Confirmas ${labels[transitionName]} esta solicitud?`)) return;
    state = { ...state, busy: true, error: '' }; draw();
    const { error } = await transitionPurchaseRequest(supabase, state.selectedId, transitionName);
    if (!isCurrentGeneration()) return;
    if (error) { state = { ...state, busy: false, error: requestError(error) }; draw(); return; }
    state = { ...state, busy: false, dirty: false, values: null };
    await load();
    showNotice('Estado de la solicitud actualizado correctamente.');
  }
  function closeDetail() {
    if (state.dirty && !window.confirm('Hay cambios sin guardar. ¿Quieres volver de todas formas?')) return;
    state = { ...state, selectedId: null, values: null, error: '', dirty: false, busy: false }; draw();
  }
  function bind() {
    outlet.querySelector('[data-requests-retry]')?.addEventListener('click', load);
    outlet.querySelector('#requests-search')?.addEventListener('input', (event) => { state = { ...state, filters: { ...state.filters, query: event.target.value } }; draw(); outlet.querySelector('#requests-search')?.focus(); });
    outlet.querySelector('#requests-status')?.addEventListener('change', (event) => { state = { ...state, filters: { ...state.filters, status: event.target.value } }; draw(); });
    outlet.querySelectorAll('[data-request-open]').forEach((button) => button.addEventListener('click', () => { const request = state.requests.find((item) => String(item.id) === button.dataset.requestOpen); if (!request) return; state = { ...state, selectedId: request.id, values: valuesFor(request), error: '', dirty: false }; draw(); outlet.querySelector('#request-edit-form input')?.focus(); }));
    outlet.querySelectorAll('[data-request-back]').forEach((button) => button.addEventListener('click', closeDetail));
    outlet.querySelector('#request-edit-form')?.addEventListener('input', () => { state = { ...state, dirty: true }; });
    outlet.querySelectorAll('[data-request-line-remove]').forEach((button) => button.addEventListener('click', () => { captureValues(); state = { ...state, values: { ...state.values, lineas: state.values.lineas.filter((line) => String(line.id) !== button.dataset.requestLineRemove) }, dirty: true, error: '' }; draw(); }));
    outlet.querySelector('#request-edit-form')?.addEventListener('submit', (event) => { event.preventDefault(); event.currentTarget.checkValidity() ? save(event.currentTarget) : event.currentTarget.reportValidity(); });
    outlet.querySelectorAll('[data-request-transition]').forEach((button) => button.addEventListener('click', () => transition(button.dataset.requestTransition)));
  }
  await load();
}
