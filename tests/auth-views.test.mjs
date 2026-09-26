import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  authCard,
  getPasswordToggleState,
  loadingView,
  passwordUpdateView,
  recoveryView,
  signInView,
} from '../src/auth-views.mjs';

const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('keeps the identifiers required by authentication event handlers', () => {
  assert.match(signInView(), /id="sign-in-form"/);
  assert.match(signInView(), /id="show-recovery"/);
  assert.match(recoveryView(), /id="recovery-form"/);
  assert.match(recoveryView(), /id="show-sign-in"/);
  assert.match(passwordUpdateView(), /id="password-form"/);
});

test('renders the official identity and a semantic administration heading', () => {
  const view = authCard(signInView());

  assert.match(view, /logo_esenciales\.jpg/);
  assert.match(view, /alt="ESENCIALES"/);
  assert.match(view, /<h1[^>]*>Administración<\/h1>/);
});

test('associates visible labels, help, and status with sign-in controls', () => {
  const view = signInView('No fue posible iniciar sesión.');

  assert.match(view, /<label for="sign-in-email">Correo electrónico<\/label>/);
  assert.match(view, /id="sign-in-email"[^>]*aria-describedby="sign-in-email-help sign-in-message"/);
  assert.match(view, /id="sign-in-password"[^>]*aria-describedby="sign-in-password-help sign-in-message"/);
  assert.match(view, /id="sign-in-message"[^>]*role="alert"/);
});

test('provides accessible password visibility controls', () => {
  const signIn = signInView();

  assert.match(signIn, /data-password-toggle="sign-in-password"/);
  assert.match(signIn, /aria-label="Mostrar contraseña"/);
  assert.match(signIn, /class="password-icon password-icon--show"[^>]*aria-hidden="true"/);
  assert.match(signIn, /class="password-icon password-icon--hide"[^>]*aria-hidden="true"/);
  assert.match(passwordUpdateView(), /data-password-toggle="new-password"/);
  assert.match(passwordUpdateView(), /data-password-toggle="password-confirmation"/);
  assert.match(passwordUpdateView(), /aria-pressed="false"/);
});

test('describes the password visibility action for each state', () => {
  assert.deepEqual(getPasswordToggleState(false), {
    inputType: 'text',
    pressed: 'true',
    label: 'Ocultar contraseña',
  });
  assert.deepEqual(getPasswordToggleState(true), {
    inputType: 'password',
    pressed: 'false',
    label: 'Mostrar contraseña',
  });
});

test('hides the browser password reveal control when using the custom toggle', () => {
  assert.match(styles, /\.password-control input::-ms-reveal\s*{[^}]*display:\s*none/s);
});

test('shows a crossed eye while the password is hidden', () => {
  assert.match(styles, /\.password-icon--show\s*{[^}]*display:\s*none/s);
  assert.match(styles, /\.password-toggle\[aria-pressed="true"\] \.password-icon--hide\s*{[^}]*display:\s*none/s);
  assert.match(styles, /\.password-toggle\[aria-pressed="true"\] \.password-icon--show\s*{[^}]*display:\s*block/s);
});

test('keeps the primary action black while it is busy', () => {
  assert.match(styles, /\.primary-button:disabled\s*{[^}]*background:\s*var\(--color-brand-black\)/s);
  assert.match(styles, /\.primary-button:disabled\s*{[^}]*border-color:\s*var\(--color-brand-black\)/s);
});

test('presents sign out as a full-width black and white secondary action', () => {
  assert.match(styles, /\.authorized-state \.secondary-button\s*{[^}]*width:\s*100%/s);
  assert.match(styles, /\.secondary-button:hover\s*{[^}]*color:\s*white/s);
  assert.match(styles, /\.secondary-button:hover\s*{[^}]*background:\s*var\(--color-brand-black\)/s);
});

test('marks submit actions for busy-state handling', () => {
  assert.match(signInView(), /data-busy-label="Iniciando sesión…"/);
  assert.match(recoveryView(), /data-busy-label="Enviando enlace…"/);
  assert.match(passwordUpdateView(), /data-busy-label="Actualizando contraseña…"/);
});

test('announces secure-access loading without presenting invented data', () => {
  assert.match(loadingView(), /role="status"/);
  assert.match(loadingView(), /aria-live="polite"/);
  assert.match(loadingView(), /Cargando acceso seguro/);
});
