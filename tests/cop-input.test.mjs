import test from 'node:test';
import assert from 'node:assert/strict';
import { copDigits, formatCopInput, formatCopInputElement } from '../src/cop-input.mjs';

test('formats COP input values while retaining only integer digits', () => {
  assert.equal(copDigits('$ 001.200'), '1200');
  assert.equal(formatCopInput('1200'), '$1.200');
  assert.equal(formatCopInput('$1.200abc'), '$1.200');
  assert.equal(formatCopInput(''), '');
});

test('adapts a price input for formatted numeric entry', () => {
  const input = { type: 'number', inputMode: '', value: '90000' };
  formatCopInputElement(input);
  assert.deepEqual(input, { type: 'text', inputMode: 'numeric', value: '$90.000' });
});
