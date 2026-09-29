export function normalizeBasePath(basePath = '/') {
  const path = String(basePath || '/').trim();
  if (path === '/') return '/';
  return `/${path.replace(/^\/+|\/+$/g, '')}/`;
}

export const APP_BASE_PATH = normalizeBasePath(import.meta.env?.BASE_URL || '/');

export function appPath(path = '/', basePath = APP_BASE_PATH) {
  const base = normalizeBasePath(basePath);
  const absolutePath = path.startsWith('/') ? path : `/${path}`;
  return base === '/' ? absolutePath : `${base.slice(0, -1)}${absolutePath}`;
}

export function getAppPathname(pathname, basePath = APP_BASE_PATH) {
  const base = normalizeBasePath(basePath);
  if (base === '/') return pathname;

  const baseWithoutTrailingSlash = base.slice(0, -1);
  if (pathname === baseWithoutTrailingSlash || pathname === base) return '/';
  return pathname.startsWith(`${baseWithoutTrailingSlash}/`)
    ? pathname.slice(baseWithoutTrailingSlash.length)
    : pathname;
}
