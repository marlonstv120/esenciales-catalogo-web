import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPostPasswordUpdateView,
  getPasswordSetupFlow,
  shouldRenderPasswordUpdate,
  shouldShowPasswordUpdate,
} from '../src/auth-flow.mjs';

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

test('shows password update immediately for Supabase recovery events', () => {
  assert.equal(
    shouldShowPasswordUpdate(
      'PASSWORD_RECOVERY',
      'http://localhost:5173/',
    ),
    true,
  );
});

test('shows password update for invitation URLs on signed-in events', () => {
  assert.equal(
    shouldShowPasswordUpdate(
      'SIGNED_IN',
      'http://localhost:5173/#type=invite&access_token=test',
    ),
    true,
  );
});

test('does not show password update for a regular signed-in session', () => {
  assert.equal(
    shouldShowPasswordUpdate('SIGNED_IN', 'http://localhost:5173/'),
    false,
  );
});

test('does not re-render an active password update flow for another auth event', () => {
  assert.equal(
    shouldRenderPasswordUpdate(
      'SIGNED_OUT',
      'http://localhost:5173/',
      true,
    ),
    false,
  );
});

test('returns the sign-in view after an update without admin authorization', () => {
  assert.equal(getPostPasswordUpdateView(false), 'sign-in');
});
