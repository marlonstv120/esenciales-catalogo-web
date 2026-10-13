import test from 'node:test';
import assert from 'node:assert/strict';
import { appPath, getAppPathname, normalizeBasePath } from '../src/app-paths.mjs';

test('normalizes deployment base paths for local and project sites', () => {
  assert.equal(normalizeBasePath('/'), '/');
  assert.equal(normalizeBasePath('vehimarcas-catalogo-web'), '/vehimarcas-catalogo-web/');
  assert.equal(normalizeBasePath('/vehimarcas-catalogo-web'), '/vehimarcas-catalogo-web/');
});

test('prefixes application routes and assets with the deployment base', () => {
  const basePath = '/vehimarcas-catalogo-web/';
  assert.equal(appPath('/', basePath), basePath);
  assert.equal(appPath('/catalogo?generos=toyota#resultados', basePath), '/vehimarcas-catalogo-web/catalogo?generos=toyota#resultados');
  assert.equal(appPath('/assets/brand/logo.png', basePath), '/vehimarcas-catalogo-web/assets/brand/logo.png');
});

test('removes the deployment base before matching application routes', () => {
  const basePath = '/vehimarcas-catalogo-web/';
  assert.equal(getAppPathname('/vehimarcas-catalogo-web/', basePath), '/');
  assert.equal(getAppPathname('/vehimarcas-catalogo-web/admin', basePath), '/admin');
  assert.equal(getAppPathname('/otra-ruta', basePath), '/otra-ruta');
});
