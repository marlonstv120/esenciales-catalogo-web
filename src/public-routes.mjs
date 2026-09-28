import { getPasswordSetupFlow } from './auth-flow.mjs';

export function getPublicRoute(pathname) {
  if (pathname === '/') return { name: 'home' };
  if (pathname === '/catalogo') return { name: 'catalog' };
  if (pathname === '/carrito') return { name: 'cart' };
  if (pathname === '/admin') return { name: 'admin' };

  const match = pathname.match(/^\/producto\/(\d+)$/);
  if (!match) return { name: 'not-found' };

  const productId = Number(match[1]);
  return Number.isSafeInteger(productId) && productId > 0
    ? { name: 'product', productId }
    : { name: 'not-found' };
}

export function getApplicationArea({ pathname, href }) {
  if (getPasswordSetupFlow(href)) return 'admin-auth';
  return pathname === '/admin' ? 'admin' : 'public';
}
