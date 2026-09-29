import test from 'node:test';
import assert from 'node:assert/strict';
import { appPath, getAppPathname, normalizeBasePath } from '../src/app-paths.mjs';

test('normalizes deployment base paths for local and project sites', () => {
  assert.equal(normalizeBasePath('/'), '/');
  assert.equal(normalizeBasePath('esenciales-catalogo-web'), '/esenciales-catalogo-web/');
  assert.equal(normalizeBasePath('/esenciales-catalogo-web'), '/esenciales-catalogo-web/');
});

test('prefixes application routes and assets with the deployment base', () => {
  const basePath = '/esenciales-catalogo-web/';
  assert.equal(appPath('/', basePath), basePath);
  assert.equal(appPath('/catalogo?generos=hombre#resultados', basePath), '/esenciales-catalogo-web/catalogo?generos=hombre#resultados');
  assert.equal(appPath('/assets/brand/logo.png', basePath), '/esenciales-catalogo-web/assets/brand/logo.png');
});

test('removes the deployment base before matching application routes', () => {
  const basePath = '/esenciales-catalogo-web/';
  assert.equal(getAppPathname('/esenciales-catalogo-web/', basePath), '/');
  assert.equal(getAppPathname('/esenciales-catalogo-web/admin', basePath), '/admin');
  assert.equal(getAppPathname('/otra-ruta', basePath), '/otra-ruta');
});
