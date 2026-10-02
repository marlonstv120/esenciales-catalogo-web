import test from 'node:test';
import assert from 'node:assert/strict';
import { applyPriceReview, clearPurchaseConfirmation, emptyRequestForm, loadPurchaseConfirmation, loadPurchaseRequestDraft, purchaseRequestDraftMetadata, registerPurchaseRequest, requestLines, savePurchaseConfirmation, validateRequestForm, whatsappUrl } from '../src/public-purchase-request.mjs';

const cart = { version: 2, items: [{ presentationId: 4, quantity: 2, price: 50000, name: 'Brisa', label: '100 ml' }] };
const validForm = { ...emptyRequestForm(), nombre: 'Ana Pérez', telefono: '+57 (300) 123-4567', aceptaTerminos: true, aceptaPoliticaDatos: true };

test('validates the request fields and creates server lines without trusting cart totals', () => {
  assert.deepEqual(validateRequestForm(validForm, cart).errors, {});
  assert.match(validateRequestForm({ ...validForm, telefono: 'telefono' }, cart).errors.telefono, /teléfono válido/);
  assert.match(validateRequestForm({ ...validForm, telefono: '123456' }, cart).errors.telefono, /teléfono válido/);
  assert.match(validateRequestForm({ ...validForm, telefono: '1234567890123456' }, cart).errors.telefono, /teléfono válido/);
  const missing = validateRequestForm(emptyRequestForm(), cart).errors;
  assert.match(missing.nombre, /nombre/);
  assert.match(missing.telefono, /teléfono válido/);
  assert.match(missing.aceptacion, /aceptar/);
  assert.deepEqual(requestLines(cart), [{ presentacion_id: 4, cantidad: 2, precio_esperado: 50000 }]);
  assert.deepEqual(requestLines({ ...cart, items: [...cart.items, { presentationId: 5, quantity: 1, price: 30000, selected: false }] }), [{ presentacion_id: 4, cantidad: 2, precio_esperado: 50000 }]);
});

test('calls the registration RPC with the approved public contract', async () => {
  let call;
  const client = { rpc: async (name, parameters) => { call = { name, parameters }; return { data: { codigo: 'ES-00001' }, error: null }; } };
  const result = await registerPurchaseRequest(client, '11111111-1111-1111-1111-111111111111', validForm, cart);
  assert.equal(result.data.codigo, 'ES-00001');
  assert.equal(call.name, 'registrar_solicitud_compra');
  assert.equal(call.parameters.p_lineas[0].precio_esperado, 50000);
  assert.equal(call.parameters.p_acepta_terminos, true);
});

test('merges only server-confirmed changed prices into the cart', () => {
  const reviewed = applyPriceReview(cart, { lineas: [{ presentacion_id: 4, precio_unitario: 45000 }] });
  assert.equal(reviewed.items[0].price, 45000);
  assert.match(reviewed.items[0].validation.message, /precio se actualizó/);
});

test('persists only non-personal confirmation data and builds an encoded WhatsApp link', () => {
  const data = new Map(); const storage = { setItem: (key, value) => data.set(key, value), getItem: (key) => data.get(key) || null, removeItem: (key) => data.delete(key) };
  const confirmation = { codigo: 'ES-00001', estado: 'nueva', valor_total_productos: 100000, lineas: [{ producto: 'Brisa', presentacion: '100 ml', cantidad: 2, subtotal: 100000 }] };
  assert.equal(savePurchaseConfirmation({ ...confirmation, telefono: '3001234567' }, storage), true);
  assert.deepEqual(loadPurchaseConfirmation(storage), { version: 1, ...confirmation });
  assert.doesNotMatch(JSON.stringify(loadPurchaseConfirmation(storage)), /telefono/);
  assert.match(whatsappUrl(confirmation), /^https:\/\/wa\.me\/573174645670\?text=/);
  assert.match(decodeURIComponent(whatsappUrl(confirmation)), /\n\nPRODUCTOS\n/);
  clearPurchaseConfirmation(storage);
  assert.equal(loadPurchaseConfirmation(storage), null);
});

test('restores only a current, scoped purchase-request draft', () => {
  const data = new Map(); const storage = { getItem: (key) => data.get(key) || null };
  const metadata = purchaseRequestDraftMetadata();
  data.set(metadata.key, JSON.stringify({ ...metadata, updatedAt: Date.now(), values: { nombre: 'Ana', telefono: '3001234567', ciudad: 'Bogotá', observaciones: 'Llamar', aceptaTerminos: true, aceptaPoliticaDatos: false, token: 'no' } }));
  assert.deepEqual(loadPurchaseRequestDraft(storage), { nombre: 'Ana', telefono: '3001234567', ciudad: 'Bogotá', observaciones: 'Llamar', aceptaTerminos: true, aceptaPoliticaDatos: false });
  data.set(metadata.key, JSON.stringify({ ...metadata, version: 2, updatedAt: Date.now(), values: { nombre: 'Ana' } }));
  assert.equal(loadPurchaseRequestDraft(storage), null);
});
