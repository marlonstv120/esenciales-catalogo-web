const logoUrl = new URL('../docs/sources/logo_esenciales.jpg', import.meta.url).href;

export function getPasswordToggleState(passwordVisible) {
  return passwordVisible
    ? { inputType: 'password', pressed: 'false', label: 'Mostrar contraseña' }
    : { inputType: 'text', pressed: 'true', label: 'Ocultar contraseña' };
}

function passwordToggle(targetId) {
  return `
    <button class="password-toggle" type="button" data-password-toggle="${targetId}" aria-controls="${targetId}" aria-pressed="false" aria-label="Mostrar contraseña">
      <svg class="password-icon password-icon--show" aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <svg class="password-icon password-icon--hide" aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 3 18 18" />
        <path d="M10.6 6.1A10.8 10.8 0 0 1 12 6c6.5 0 10 6 10 6a17.7 17.7 0 0 1-2.1 2.8" />
        <path d="M6.6 6.6C3.6 8.4 2 12 2 12s3.5 6 10 6a10.5 10.5 0 0 0 3.4-.6" />
      </svg>
    </button>`;
}

function messageRegion(message, tone = 'error', id = 'auth-message') {
  const role = tone === 'error' && message ? 'alert' : 'status';
  return `<p class="message message--${tone}" id="${id}" role="${role}" aria-live="polite">${message}</p>`;
}

function passwordControl({ id, name, label, autocomplete, helpId, messageId }) {
  return `
    <div class="field">
      <label for="${id}">${label}</label>
      <div class="password-control">
        <input id="${id}" name="${name}" type="password" autocomplete="${autocomplete}" required minlength="6" aria-describedby="${helpId} ${messageId}">
        ${passwordToggle(id)}
      </div>
      <p class="field-help" id="${helpId}">Mínimo 6 caracteres.</p>
    </div>`;
}

export function authCard(content) {
  return `
    <section class="auth-shell" aria-labelledby="auth-title">
      <aside class="auth-brand" aria-label="ESENCIALES">
        <img class="auth-logo" src="${logoUrl}" alt="ESENCIALES">
        <p class="auth-brand-note">Catálogo y gestión, reunidos en un solo lugar.</p>
      </aside>
      <div class="auth-card">
        <p class="eyebrow">Área privada</p>
        <h1 id="auth-title">Administración</h1>
        ${content}
      </div>
    </section>`;
}

export function signInView(message = '', tone = 'error') {
  return `
    <p class="auth-intro">Ingresa con la cuenta autorizada para gestionar ESENCIALES.</p>
    <form class="auth-form" id="sign-in-form">
      <div class="field">
        <label for="sign-in-email">Correo electrónico</label>
        <input id="sign-in-email" name="email" type="email" autocomplete="email" required aria-describedby="sign-in-email-help sign-in-message">
        <p class="field-help" id="sign-in-email-help">Usa el correo asociado a tu cuenta administrativa.</p>
      </div>
      <div class="field">
        <label for="sign-in-password">Contraseña</label>
        <div class="password-control">
          <input id="sign-in-password" name="password" type="password" autocomplete="current-password" required aria-describedby="sign-in-password-help sign-in-message">
          ${passwordToggle('sign-in-password')}
        </div>
        <p class="field-help" id="sign-in-password-help">La contraseña distingue mayúsculas y minúsculas.</p>
      </div>
      ${messageRegion(message, tone, 'sign-in-message')}
      <button class="primary-button" type="submit" data-busy-label="Iniciando sesión…">Iniciar sesión</button>
    </form>
    <button class="link-button" id="show-recovery" type="button">¿Olvidaste tu contraseña?</button>
  `;
}

export function recoveryView(message = '', tone = 'error') {
  return `
    <p class="auth-intro">Te enviaremos un enlace para establecer una nueva contraseña.</p>
    <form class="auth-form" id="recovery-form">
      <div class="field">
        <label for="recovery-email">Correo electrónico</label>
        <input id="recovery-email" name="email" type="email" autocomplete="email" required aria-describedby="recovery-email-help recovery-message">
        <p class="field-help" id="recovery-email-help">Ingresa el correo asociado a tu cuenta administrativa.</p>
      </div>
      ${messageRegion(message, tone, 'recovery-message')}
      <button class="primary-button" type="submit" data-busy-label="Enviando enlace…">Enviar enlace de recuperación</button>
    </form>
    <button class="link-button" id="show-sign-in" type="button">Volver al acceso</button>
  `;
}

export function passwordUpdateView(message = '') {
  return `
    <p class="auth-intro">Crea una contraseña para proteger tu acceso administrativo.</p>
    <form class="auth-form" id="password-form">
      ${passwordControl({ id: 'new-password', name: 'password', label: 'Nueva contraseña', autocomplete: 'new-password', helpId: 'new-password-help', messageId: 'password-message' })}
      ${passwordControl({ id: 'password-confirmation', name: 'confirmation', label: 'Confirmar contraseña', autocomplete: 'new-password', helpId: 'password-confirmation-help', messageId: 'password-message' })}
      ${messageRegion(message, 'error', 'password-message')}
      <button class="primary-button" type="submit" data-busy-label="Actualizando contraseña…">Actualizar contraseña</button>
    </form>
  `;
}

export function authorizedView() {
  return `
    <div class="authorized-state">
      <p class="status-label"><span aria-hidden="true"></span>Sesión administrativa activa</p>
      <p>Tu identidad fue verificada correctamente.</p>
      <p class="auth-detail">La gestión de categorías se habilitará en el siguiente incremento.</p>
      <button class="secondary-button" id="sign-out" type="button">Cerrar sesión</button>
    </div>
  `;
}

export function loadingView() {
  return '<div class="loading-state" role="status" aria-live="polite"><span class="spinner" aria-hidden="true"></span><p>Cargando acceso seguro…</p></div>';
}
