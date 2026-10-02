import test from 'node:test';
import assert from 'node:assert/strict';
import { showNotification } from '../src/notifications.mjs';

function fakeDocument() {
  let region = null;
  const body = { append(node) { region = node; } };
  const createElement = () => ({
    className: '', dataset: {}, attributes: {}, children: [], removed: false,
    setAttribute(name, value) { this.attributes[name] = value; },
    append(...nodes) { this.children.push(...nodes); },
    addEventListener() {},
    remove() { this.removed = true; },
  });
  return { body, createElement, querySelector(selector) { return selector === '[data-toast-region]' ? region : null; }, defaultView: { setTimeout() {} } };
}

test('creates an accessible, dismissible global notification', () => {
  const documentRef = fakeDocument();
  showNotification('Cambios guardados.', { tone: 'error', documentRef });

  const region = documentRef.querySelector('[data-toast-region]');
  const toast = region.children[0];
  assert.equal(region.attributes['aria-live'], 'assertive');
  assert.equal(toast.attributes.role, 'alert');
  assert.equal(toast.children[0].textContent, 'Cambios guardados.');
  assert.equal(toast.children[1].attributes['aria-label'], 'Cerrar notificación');
});
