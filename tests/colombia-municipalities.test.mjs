import test from 'node:test';
import assert from 'node:assert/strict';
import { findColombianMunicipalities, loadColombianMunicipalities } from '../src/colombia-municipalities.mjs';

test('loads, flattens, caches, and searches municipalities without accents', async () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
  let requests = 0;
  const fetcher = async () => { requests += 1; return { ok: true, json: async () => [{ departamento: 'Antioquia', ciudades: ['Medellín'] }, { departamento: 'Valle del Cauca', ciudades: ['Cali'] }] }; };
  const municipalities = await loadColombianMunicipalities(storage, fetcher);
  assert.deepEqual(findColombianMunicipalities(municipalities, 'medellin'), [{ municipio: 'Medellín', departamento: 'Antioquia', value: 'Medellín, Antioquia', search: 'medellin antioquia' }]);
  assert.equal((await loadColombianMunicipalities(storage, fetcher)).length, 2);
  assert.equal(requests, 1);
});
