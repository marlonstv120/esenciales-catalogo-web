import test from 'node:test';
import assert from 'node:assert/strict';
import { getPasswordSetupFlow } from '../src/auth-flow.mjs';

test('recognizes invitation links as password setup flows', () => {
  assert.equal(
    getPasswordSetupFlow('http://localhost:5173/#type=invite&code=test'),
    'invite',
  );
});

test('recognizes invitation links when Auth parameters precede the flow type', () => {
  assert.equal(
    getPasswordSetupFlow('http://localhost:5173/#access_token=test&type=invite'),
    'invite',
  );
});

test('recognizes recovery links as password setup flows', () => {
  assert.equal(
    getPasswordSetupFlow('http://localhost:5173/#type=recovery&access_token=test'),
    'recovery',
  );
});

test('ignores regular application URLs', () => {
  assert.equal(getPasswordSetupFlow('http://localhost:5173/'), null);
});
