import './styles.css';
import { getPasswordSetupFlow } from './auth-flow.mjs';
import {
  getAuthorizedSession,
  observeSession,
  requestPasswordRecovery,
  signIn,
  signOut,
  updatePassword,
} from './auth.js';

const app = document.querySelector('#app');

function render(content) {
  app.innerHTML = `<section class="auth-card"><h1>Esenciales</h1>${content}</section>`;
}

function showSignIn(message = '') {
  render(`
    <p>Acceso administrativo</p>
    <form id="sign-in-form">
      <label>Correo<input name="email" type="email" autocomplete="email" required></label>
      <label>Contraseña<input name="password" type="password" autocomplete="current-password" required></label>
      <button>Iniciar sesión</button>
    </form>
    <button class="link-button" id="show-recovery" type="button">¿Olvidaste tu contraseña?</button>
    <p class="message" role="status">${message}</p>
  `);
  document.querySelector('#sign-in-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { error } = await signIn(form.get('email').trim(), form.get('password'));
    if (error) showSignIn('No fue posible iniciar sesión. Verifica tus datos.');
  });
  document.querySelector('#show-recovery').addEventListener('click', showRecovery);
}

function showRecovery(message = '') {
  render(`
    <p>Solicita un enlace para recuperar tu contraseña.</p>
    <form id="recovery-form">
      <label>Correo<input name="email" type="email" autocomplete="email" required></label>
      <button>Enviar enlace</button>
    </form>
    <button class="link-button" id="show-sign-in" type="button">Volver al acceso</button>
    <p class="message" role="status">${message}</p>
  `);
  document.querySelector('#recovery-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get('email').trim();
    await requestPasswordRecovery(email);
    showRecovery('Si el correo está registrado, revisa el enlace enviado.');
  });
  document.querySelector('#show-sign-in').addEventListener('click', () => showSignIn());
}

function showPasswordUpdate(message = '') {
  render(`
    <p>Define una nueva contraseña.</p>
    <form id="password-form">
      <label>Nueva contraseña<input name="password" type="password" autocomplete="new-password" required minlength="6"></label>
      <label>Confirmar contraseña<input name="confirmation" type="password" autocomplete="new-password" required minlength="6"></label>
      <button>Actualizar contraseña</button>
    </form>
    <p class="message" role="status">${message}</p>
  `);
  document.querySelector('#password-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = form.get('password');
    if (password !== form.get('confirmation')) {
      showPasswordUpdate('Las contraseñas deben coincidir.');
      return;
    }
    const { error } = await updatePassword(password);
    if (error) {
      showPasswordUpdate('No fue posible actualizar la contraseña.');
      return;
    }
    window.history.replaceState({}, '', window.location.pathname);
    showAuthorized();
  });
}

function showAuthorized() {
  render(`
    <p>Sesión administrativa activa.</p>
    <p>La gestión de categorías se habilitará en el siguiente incremento.</p>
    <button id="sign-out" type="button">Cerrar sesión</button>
  `);
  document.querySelector('#sign-out').addEventListener('click', () => signOut());
}

async function refresh() {
  render('<p>Cargando acceso seguro...</p>');
  const { authorized } = await getAuthorizedSession();
  if (authorized && getPasswordSetupFlow(window.location.href)) showPasswordUpdate();
  else if (authorized) showAuthorized();
  else showSignIn();
}

observeSession(() => refresh());

refresh();
