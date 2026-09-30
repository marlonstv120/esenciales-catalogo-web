export function copDigits(value = '') {
  return String(value).replace(/\D/g, '').replace(/^0+(?=\d)/, '');
}

export function formatCopInput(value = '') {
  const digits = copDigits(value);
  return digits ? `$${digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}` : '';
}

export function formatCopInputElement(input) {
  input.type = 'text';
  input.inputMode = 'numeric';
  input.value = formatCopInput(input.value);
}
