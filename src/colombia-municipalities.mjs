// Source: public Colombia municipality catalogue maintained at github.com/marcovega/colombia-json.
// The catalogue is cached for the session so searching never makes requests per keystroke.
const SOURCE_URL = 'https://raw.githubusercontent.com/marcovega/colombia-json/master/colombia.json';
const CACHE_KEY = 'esenciales:colombia-municipalities:v1';

function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-CO').trim();
}

function flatten(data) {
  return data.flatMap(({ departamento, ciudades = [] }) => ciudades.map((municipio) => ({
    municipio,
    departamento,
    value: `${municipio}, ${departamento}`,
    search: normalize(`${municipio} ${departamento}`),
  }))).sort((a, b) => a.value.localeCompare(b.value, 'es-CO'));
}

export async function loadColombianMunicipalities(storage = globalThis.sessionStorage, fetcher = globalThis.fetch) {
  try {
    const cached = JSON.parse(storage?.getItem(CACHE_KEY) || 'null');
    if (Array.isArray(cached) && cached.every((item) => typeof item?.value === 'string')) return cached;
  } catch { /* A corrupt cache is safely replaced by the source catalogue. */ }

  const response = await fetcher(SOURCE_URL);
  if (!response.ok) throw new Error('No fue posible cargar los municipios.');
  const municipalities = flatten(await response.json());
  try { storage?.setItem(CACHE_KEY, JSON.stringify(municipalities)); } catch { /* The selector works without storage. */ }
  return municipalities;
}

export function findColombianMunicipalities(municipalities, query, limit = 8) {
  const term = normalize(query);
  if (!term) return [];
  return municipalities.filter((item) => item.search.includes(term)).slice(0, limit);
}
