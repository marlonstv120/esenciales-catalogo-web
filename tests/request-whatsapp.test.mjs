import test from 'node:test';
import assert from 'node:assert/strict';
import { customerWhatsappMessage, customerWhatsappUrl, normalizeCustomerWhatsappPhone } from '../src/request-whatsapp.mjs';

test('normalizes Colombian customer mobile numbers for WhatsApp', () => {
  assert.equal(normalizeCustomerWhatsappPhone('300 000 0000'), '573000000000');
  assert.equal(normalizeCustomerWhatsappPhone('+57 300-000-0000'), '573000000000');
  assert.equal(normalizeCustomerWhatsappPhone('57 300 000 0000'), '573000000000');
});

test('accepts explicit international numbers and rejects ambiguous invalid numbers', () => {
  assert.equal(normalizeCustomerWhatsappPhone('+1 (202) 555-0123'), '12025550123');
  assert.equal(normalizeCustomerWhatsappPhone('001 202 555 0123'), '12025550123');
  assert.equal(normalizeCustomerWhatsappPhone('555-0123'), '');
  assert.equal(normalizeCustomerWhatsappPhone(''), '');
});

test('builds a neutral editable WhatsApp draft for the customer', () => {
  const request = { codigo: 'ES-00003', nombre_cliente: 'Ana María', telefono: '3000000000' };
  assert.equal(customerWhatsappMessage(request), 'Hola, Ana. Te contactamos de ESENCIALES sobre tu solicitud ES-00003.');
  assert.match(customerWhatsappUrl(request), /^https:\/\/wa\.me\/573000000000\?text=/);
  assert.equal(decodeURIComponent(customerWhatsappUrl(request).split('?text=')[1]), customerWhatsappMessage(request));
});

test('does not build a WhatsApp URL without a valid customer phone', () => {
  assert.equal(customerWhatsappUrl({ codigo: 'ES-00003', telefono: 'sin número' }), '');
});
