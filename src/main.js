import './styles.css';
import { getPostPasswordUpdateView, getPasswordSetupFlow, shouldRenderPasswordUpdate } from './auth-flow.mjs';
import { getApplicationArea, getPublicRoute } from './public-routes.mjs';
import { startPublicCatalog } from './public-catalog-controller.mjs';
import { authCard, getPasswordToggleState, loadingView, passwordUpdateView, recoveryView, signInView } from './auth-views.mjs';
import { getAuthorizedSession, observeSession, requestPasswordRecovery, signIn, signOut, updatePassword } from './auth.js';
import { startAdminShell } from './admin-shell.js';
import { supabase } from './supabase.js';

const app = document.querySelector('#app');
let passwordUpdateActive = Boolean(getPasswordSetupFlow(window.location.href));
let authorizationGeneration = 0;
let stopAdminShell = null;
let stopPublicCatalog = null;

function render(content) {
  stopAdminShell?.(); stopAdminShell = null;
  stopPublicCatalog?.(); stopPublicCatalog = null;
  app.className = 'auth-page';
  app.innerHTML = authCard(content);
  app.querySelectorAll('[data-password-toggle]').forEach((button) => button.addEventListener('click', () => {
    const input = app.querySelector(`#${button.dataset.passwordToggle}`);
    const next = getPasswordToggleState(input.type === 'text');
    input.type = next.inputType; button.setAttribute('aria-pressed', next.pressed); button.setAttribute('aria-label', next.label);
  }));
}

function markFormBusy(form) { const button = form.querySelector('[type="submit"]'); button.textContent = button.dataset.busyLabel; button.disabled = true; button.setAttribute('aria-busy', 'true'); }
function showSignIn(message = '', tone = 'error') { render(signInView(message, tone)); app.querySelector('#sign-in-form').addEventListener('submit', async (event) => { event.preventDefault(); markFormBusy(event.currentTarget); const form = new FormData(event.currentTarget); const { error } = await signIn(form.get('email').trim(), form.get('password')); if (error) showSignIn('No fue posible iniciar sesión. Verifica tus datos.'); }); app.querySelector('#show-recovery').addEventListener('click', () => showRecovery()); }
function showRecovery(message = '', tone = 'error') { render(recoveryView(message, tone)); app.querySelector('#recovery-form').addEventListener('submit', async (event) => { event.preventDefault(); markFormBusy(event.currentTarget); const { error } = await requestPasswordRecovery(new FormData(event.currentTarget).get('email').trim()); if (error) showRecovery('No fue posible enviar el enlace. Inténtalo de nuevo.'); else showRecovery('Si el correo está registrado, revisa el enlace enviado.', 'success'); }); app.querySelector('#show-sign-in').addEventListener('click', () => showSignIn()); }
function showPasswordUpdate(message = '') { render(passwordUpdateView(message)); app.querySelector('#password-form').addEventListener('submit', async (event) => { event.preventDefault(); markFormBusy(event.currentTarget); const form = new FormData(event.currentTarget); if (form.get('password') !== form.get('confirmation')) return showPasswordUpdate('Las contraseñas deben coincidir.'); const { error } = await updatePassword(form.get('password')); if (error) return showPasswordUpdate('No fue posible actualizar la contraseña.'); const { authorized } = await getAuthorizedSession(); passwordUpdateActive = false; window.history.replaceState({}, '', '/admin'); if (getPostPasswordUpdateView(authorized) === 'authorized') showAuthorized(); else showSignIn('Contraseña actualizada. Puedes iniciar sesión.', 'success'); }); }
function showAuthorized(generation = authorizationGeneration) { stopPublicCatalog?.(); stopPublicCatalog = null; app.className = 'admin-app'; stopAdminShell?.(); stopAdminShell = startAdminShell({ app, generation, isCurrentGeneration: () => generation === authorizationGeneration, onSignOut: signOut }); }
async function refresh() { const generation = ++authorizationGeneration; stopAdminShell?.(); stopAdminShell = null; if (passwordUpdateActive) return; render(loadingView()); const { authorized } = await getAuthorizedSession(); if (passwordUpdateActive || generation !== authorizationGeneration) return; if (authorized) showAuthorized(generation); else showSignIn(); }

function startAdminApp() {
  app.className = 'auth-page';
  document.title = 'ESENCIALES | Administración';
  document.querySelector('meta[name="description"]')?.setAttribute('content', 'Acceso y gestión administrativa del catálogo de ESENCIALES.');
  observeSession((event) => { if (shouldRenderPasswordUpdate(event, window.location.href, passwordUpdateActive)) { passwordUpdateActive = true; showPasswordUpdate(); } else refresh(); });
  if (passwordUpdateActive) showPasswordUpdate(); else refresh();
}

if (getApplicationArea({ pathname: window.location.pathname, href: window.location.href }) === 'public') {
  app.className = 'public-app';
  stopPublicCatalog = startPublicCatalog({ app, client: supabase, route: getPublicRoute(window.location.pathname) });
} else {
  startAdminApp();
}
