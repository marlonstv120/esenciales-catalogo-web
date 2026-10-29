export function normalizeCustomerWhatsappPhone(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  let digits = raw.replace(/\D/g, '');
  const hasInternationalPrefix = raw.startsWith('+') || raw.startsWith('00');

  if (raw.startsWith('00')) digits = digits.slice(2);
  if (!hasInternationalPrefix && /^3\d{9}$/.test(digits)) return `57${digits}`;
  if (/^573\d{9}$/.test(digits)) return digits;
  if (hasInternationalPrefix && /^[1-9]\d{7,14}$/.test(digits)) return digits;

  return '';
}

export function customerWhatsappMessage(request = {}) {
  const name = String(request.nombre_cliente || '').trim();
  const firstName = name.split(/\s+/)[0];
  const code = String(request.codigo || '').trim();
  const greeting = firstName ? `Hola, ${firstName}.` : 'Hola.';
  const reference = code ? ` sobre tu solicitud ${code}` : ' sobre tu solicitud';
  return `${greeting} Te contactamos de ESENCIALES${reference}.`;
}

export function customerWhatsappUrl(request = {}) {
  const phone = normalizeCustomerWhatsappPhone(request.telefono);
  if (!phone) return '';
  return `https://wa.me/${phone}?text=${encodeURIComponent(customerWhatsappMessage(request))}`;
}
