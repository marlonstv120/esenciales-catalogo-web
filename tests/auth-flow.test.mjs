import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPostPasswordUpdateView,
  getAdminAuthReturnUrl,
  getPasswordSetupFlow,
  shouldRenderPasswordUpdate,
  shouldRefreshAdminSession,
  shouldShowPasswordUpdate,
} from '../src/auth-flow.mjs';

test('returns Auth recovery and invitation flows to the admin route', () => {
  assert.equal(getAdminAuthReturnUrl('http://localhost:5173'), 'http://localhost:5173/admin');
  assert.equal(
    getAdminAuthReturnUrl('https://marlonstv120.github.io', '/esenciales-catalogo-web/'),
    'https://marlonstv120.github.io/esenciales-catalogo-web/admin',
  );
});

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

test('refreshes administration only for initial, sign-in, or sign-out session events', () => {
  assert.equal(shouldRefreshAdminSession('INITIAL_SESSION'), true);
  assert.equal(shouldRefreshAdminSession('SIGNED_OUT', true), true);
  assert.equal(shouldRefreshAdminSession('SIGNED_IN', false), true);
  assert.equal(shouldRefreshAdminSession('SIGNED_IN', true), false);
  assert.equal(shouldRefreshAdminSession('TOKEN_REFRESHED', true), false);
});

test('returns the sign-in view after an update without admin authorization', () => {
  assert.equal(getPostPasswordUpdateView(false), 'sign-in');
});
