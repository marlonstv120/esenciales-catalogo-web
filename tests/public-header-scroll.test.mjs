import test from 'node:test';
import assert from 'node:assert/strict';
import { startPublicHeaderScroll } from '../src/public-header-scroll.mjs';

function createHeader() {
  const classes = new Set();
  return {
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name),
      contains: (name) => classes.has(name),
    },
  };
}

test('hides only after a meaningful downward scroll and shows on upward scroll', () => {
  const listeners = {};
  const header = createHeader();
  const windowRef = {
    scrollY: 0,
    addEventListener(name, listener) { listeners[name] = listener; },
    removeEventListener(name) { delete listeners[name]; },
  };
  const stop = startPublicHeaderScroll({ app: { querySelector: () => header }, windowRef });

  windowRef.scrollY = 6;
  listeners.scroll();
  assert.equal(header.classList.contains('is-hidden'), false);

  windowRef.scrollY = 18;
  listeners.scroll();
  assert.equal(header.classList.contains('is-hidden'), true);

  windowRef.scrollY = 9;
  listeners.scroll();
  assert.equal(header.classList.contains('is-hidden'), false);

  windowRef.scrollY = 0;
  listeners.scroll();
  assert.equal(header.classList.contains('is-hidden'), false);

  stop();
  assert.equal(listeners.scroll, undefined);
});

test('notifies the public navigation before hiding the header', () => {
  const listeners = {};
  const header = createHeader();
  const windowRef = {
    scrollY: 0,
    addEventListener(name, listener) { listeners[name] = listener; },
    removeEventListener() {},
  };
  let hideCount = 0;
  startPublicHeaderScroll({ app: { querySelector: () => header }, windowRef, onHide: () => { hideCount += 1; } });

  windowRef.scrollY = 20;
  listeners.scroll();
  assert.equal(hideCount, 1);
  assert.equal(header.classList.contains('is-hidden'), true);
});
