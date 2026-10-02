import { getPasswordSetupFlow } from './auth-flow.mjs';
import { APP_BASE_PATH, getAppPathname } from './app-paths.mjs';

export function getPublicRoute(pathname, basePath = APP_BASE_PATH) {
  pathname = getAppPathname(pathname, basePath);
  if (pathname === '/') return { name: 'home' };
  if (pathname === '/catalogo') return { name: 'catalog' };
  if (pathname === '/carrito') return { name: 'cart' };
  if (pathname === '/admin' || /^\/admin\/(productos?|inventario)$/.test(pathname)) return { name: 'admin' };

  const match = pathname.match(/^\/producto\/(\d+)$/);
  const requestMatch = pathname.match(/^\/solicitud\/(ES-[0-9]+)$/);
  if (requestMatch) return { name: 'request', code: requestMatch[1] };
  if (!match) return { name: 'not-found' };

  const productId = Number(match[1]);
  return Number.isSafeInteger(productId) && productId > 0
    ? { name: 'product', productId }
    : { name: 'not-found' };
}

export function getApplicationArea({ pathname, href }, basePath = APP_BASE_PATH) {
  if (getPasswordSetupFlow(href)) return 'admin-auth';
  pathname = getAppPathname(pathname, basePath);
  return pathname === '/admin' || /^\/admin\/(productos?|inventario)$/.test(pathname) ? 'admin' : 'public';
}
