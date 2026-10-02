import { appPath } from './app-paths.mjs';

// These values are public payment instructions, not credentials.
export const PAYMENT_CONFIG = {
  method: 'bre_b',
  methodLabel: 'Bre-B',
  keyType: 'Alias',
  keyValue: '@esensiales',
  qrSrc: appPath('/assets/pagos/bre-b-qr.jpeg'),
};

export function paymentInstructionsAreConfigured() {
  return Boolean(PAYMENT_CONFIG.keyType && PAYMENT_CONFIG.keyValue);
}
