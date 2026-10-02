const DEFAULT_DURATION = 4500;

export function showNotification(message, { tone = 'success', duration = DEFAULT_DURATION, documentRef = document } = {}) {
  if (!message || !documentRef?.body) return;
  let region = documentRef.querySelector('[data-toast-region]');
  if (!region) {
    region = documentRef.createElement('div');
    region.className = 'app-toast-region';
    region.dataset.toastRegion = '';
    region.setAttribute('aria-live', tone === 'error' ? 'assertive' : 'polite');
    region.setAttribute('aria-atomic', 'false');
    documentRef.body.append(region);
  }
  const toast = documentRef.createElement('div');
  toast.className = `app-toast app-toast--${tone}`;
  toast.setAttribute('role', tone === 'error' ? 'alert' : 'status');
  const text = documentRef.createElement('span');
  text.textContent = message;
  const close = documentRef.createElement('button');
  close.type = 'button';
  close.className = 'app-toast__close';
  close.setAttribute('aria-label', 'Cerrar notificación');
  close.textContent = '×';
  const dismiss = () => toast.remove();
  close.addEventListener('click', dismiss);
  toast.append(text, close);
  region.append(toast);
  (documentRef.defaultView?.setTimeout || globalThis.setTimeout)(dismiss, duration);
}
