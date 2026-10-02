import test from 'node:test';
import assert from 'node:assert/strict';
import { submitPaymentProof, validatePaymentProof } from '../src/public-payment.mjs';

const validFile = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'comprobante.jpg', { type: 'image/jpeg' });

test('validates permitted payment proof files before making a request', () => {
  assert.equal(validatePaymentProof(new File(['x'], 'comprobante.txt', { type: 'text/plain' })), 'Formato no permitido. Usa JPG, PNG, WebP o PDF.');
  assert.equal(validatePaymentProof(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'comprobante.png', { type: 'image/png' })), 'El archivo supera el máximo de 5 MiB.');
});

test('sends the secure request access and file as FormData', async () => {
  let invocation;
  const client = { functions: { invoke: async (name, options) => { invocation = { name, options }; return { data: { estado_pago: 'comprobante_enviado' }, error: null }; } } };
  const result = await submitPaymentProof(client, { code: 'ES-00051', token: '11111111-1111-1111-1111-111111111111', file: validFile });
  assert.deepEqual(result, { data: { estado_pago: 'comprobante_enviado' }, error: null });
  assert.equal(invocation.name, 'submit-payment-proof');
  assert.equal(invocation.options.body.get('code'), 'ES-00051');
  assert.equal(invocation.options.body.get('token'), '11111111-1111-1111-1111-111111111111');
  assert.equal(invocation.options.body.get('file').name, 'comprobante.jpg');
});

test('uses only safe Edge Function error messages', async () => {
  const client = { functions: { invoke: async () => ({ data: null, error: { context: new Response(JSON.stringify({ error: 'Esta solicitud ya no admite comprobantes.' }), { headers: { 'Content-Type': 'application/json' } }) } }) } };
  const result = await submitPaymentProof(client, { code: 'ES-00051', token: '11111111-1111-1111-1111-111111111111', file: validFile });
  assert.equal(result.error, 'Esta solicitud ya no admite comprobantes.');
});
