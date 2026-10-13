import { createClient } from '@supabase/supabase-js';
import { productIsSold } from './products.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const demoProducts = [
  { id: 1, categoria_id: 1, nombre: 'Toyota Fortuner SW4 2024', descripcion: 'Toyota Fortuner SW4 2.8 Diesel 4x4. Impecable estado.', marca: 'Toyota', modelo: 'Fortuner SW4 2.8', clasificacion: 'usado', destacado: true, activo: true, creado_en: new Date().toISOString(), categorias: { id: 1, nombre: 'SUV & Camionetas', activo: true }, presentaciones: [{ id: 1, producto_id: 1, etiqueta: 'Automática 4x4', precio_normal: 245000000, modo_disponibilidad: 'venta_inmediata', stock: 1, activo: true }], imagenes_producto: [{ id: 1, producto_id: 1, url: '/assets/categories/categoria-suv.jpg', texto_alternativo: 'Toyota Fortuner SW4', posicion: 0 }] },
  { id: 2, categoria_id: 2, nombre: 'Mazda 3 Grand Touring 2023', descripcion: 'Mazda 3 Grand Touring LX 2.0L Sedán Automático.', marca: 'Mazda', modelo: '3 Grand Touring 2.0', clasificacion: 'usado', destacado: true, activo: true, creado_en: new Date().toISOString(), categorias: { id: 2, nombre: 'Automóviles', activo: true }, presentaciones: [{ id: 2, producto_id: 2, etiqueta: 'Automática Tiptronic', precio_normal: 98000000, modo_disponibilidad: 'venta_inmediata', stock: 1, activo: true }], imagenes_producto: [{ id: 2, producto_id: 2, url: '/assets/categories/categoria-sedan.jpg', texto_alternativo: 'Mazda 3 Sedán', posicion: 0 }] },
  { id: 3, categoria_id: 3, nombre: 'Chevrolet Hilux Double Cab 4x4 2022', descripcion: 'Toyota Hilux 2.4 Diesel 4x4 Doble Cabina.', marca: 'Toyota', modelo: 'Hilux 2.4 Diesel', clasificacion: 'usado', destacado: true, activo: true, creado_en: new Date().toISOString(), categorias: { id: 3, nombre: 'Pick-ups & 4x4', activo: true }, presentaciones: [{ id: 3, producto_id: 3, etiqueta: 'Mecánica 6 Vel 4x4', precio_normal: 165000000, modo_disponibilidad: 'venta_inmediata', stock: 1, activo: true }], imagenes_producto: [{ id: 3, producto_id: 3, url: '/assets/categories/categoria-pickup.jpg', texto_alternativo: 'Toyota Hilux 4x4', posicion: 0 }] },
];

const demoCategories = [
  { id: 1, nombre: 'SUV & Camionetas', slug: 'suvs-camionetas', activo: true },
  { id: 2, nombre: 'Automóviles', slug: 'automoviles-sedanes', activo: true },
  { id: 3, nombre: 'Pick-ups & 4x4', slug: 'pickups-trabajo', activo: true },
];

const SERVER_OFFLINE_MESSAGE = 'No se pudo conectar con el servidor local (localhost:3000). Inicia el backend con «node server/index.js» y vuelve a intentarlo.';

async function readError(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {}
  return {
    message: payload?.message || payload?.error || `El servidor respondió con un error (${response.status}).`,
    code: payload?.code || String(response.status),
  };
}

async function persist({ url, method, payload, isSingle, empty = false }) {
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
  } catch {
    return { data: null, error: { message: SERVER_OFFLINE_MESSAGE, code: 'NETWORK_ERROR' } };
  }
  if (!response.ok) return { data: null, error: await readError(response) };
  if (empty) return { data: null, error: null };
  const json = await response.json().catch(() => ({}));
  const data = 'data' in json ? json.data : json;
  return { data: isSingle ? (Array.isArray(data) ? data[0] ?? null : data) : data, error: null };
}

function createTableBuilder(baseUrl, table) {
  let isSingle = false;
  let action = 'select';
  let payload = null;
  const filters = {};

  const builder = {
    select() { return builder; },
    order() { return builder; },
    eq(column, value) { filters[column] = value; return builder; },
    single() { isSingle = true; return builder; },
    insert(record) { action = 'insert'; payload = record; return builder; },
    update(record) { action = 'update'; payload = record; return builder; },
    delete() { action = 'delete'; return builder; },
    async then(resolve) {
      if (action === 'insert') {
        return resolve(await persist({ url: `${baseUrl}/data/${table}`, method: 'POST', payload, isSingle }));
      }

      if (action === 'update') {
        const targetId = filters.id || payload?.id;
        return resolve(await persist({ url: `${baseUrl}/data/${table}${targetId ? `/${targetId}` : ''}`, method: 'PUT', payload, isSingle }));
      }

      if (action === 'delete') {
        const targetId = filters.id;
        if (!targetId) return resolve({ data: null, error: null });
        return resolve(await persist({ url: `${baseUrl}/data/${table}/${targetId}`, method: 'DELETE', empty: true }));
      }

      try {
        const response = await fetch(`${baseUrl}/data/${table}`);
        if (response.ok) {
          const json = await response.json();
          const items = json.data || json || [];
          return resolve({ data: isSingle ? items[0] || null : items, error: null });
        }
        return resolve({ data: null, error: await readError(response) });
      } catch {
        return resolve({ data: null, error: { message: SERVER_OFFLINE_MESSAGE, code: 'NETWORK_ERROR' } });
      }
    },
  };

  return builder;
}

function buildPublicCatalogFromDemo(products, categories) {
  return products
    .filter((p) => p.activo && !productIsSold(p))
    .map((p) => {
      const category = categories.find((c) => String(c.id) === String(p.categoria_id)) || p.categorias || { id: 1, nombre: 'Vehículos' };
      const mainPres = (p.presentaciones || []).find((pr) => pr.activo) || p.presentaciones?.[0] || { precio_normal: 0, modo_disponibilidad: 'venta_inmediata' };
      const mainImg = (p.imagenes_producto || []).find((img) => img.posicion === 0) || p.imagenes_producto?.[0] || { url: '/assets/categories/categoria-sedan.jpg', texto_alternativo: p.nombre };
      
      const availabilityMap = {
        venta_inmediata: 'Disponible',
        bajo_pedido: 'Bajo pedido',
        no_disponible: 'No disponible',
        vendido: 'Vendido',
        en_stock: 'Disponible',
      };

      return {
        producto_id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        marca: p.marca || 'VEHIMARCAS del Valle',
        modelo: p.modelo || '',
        genero: p.genero || '2024',
        clasificacion: p.clasificacion || 'usado',
        destacado: Boolean(p.destacado),
        categoria_id: category.id,
        categoria_nombre: category.nombre,
        precio_referencia: mainPres.precio_promocional || mainPres.precio_normal || 0,
        precio_normal_referencia: mainPres.precio_promocional ? mainPres.precio_normal : null,
        disponibilidad: availabilityMap[mainPres.modo_disponibilidad] || 'Disponible',
        imagen_url: mainImg.url || '/assets/categories/categoria-sedan.jpg',
        texto_alternativo: mainImg.texto_alternativo || p.nombre,
      };
    });
}

function buildPublicProductFromDemo(products, categories, productId) {
  const p = products.find((prod) => String(prod.id) === String(productId) && prod.activo && !productIsSold(prod));
  if (!p) return null;
  const category = categories.find((c) => String(c.id) === String(p.categoria_id)) || p.categorias || { id: 1, nombre: 'Vehículos' };
  
  const availabilityMap = {
    venta_inmediata: 'Disponible',
    bajo_pedido: 'Bajo pedido',
    no_disponible: 'No disponible',
    vendido: 'Vendido',
  };

  return {
    id: p.id,
    producto_id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    marca: p.marca || '',
    modelo: p.modelo || '',
    genero: p.genero || '2024',
    clasificacion: p.clasificacion || 'usado',
    destacado: Boolean(p.destacado),
    categoria_id: category.id,
    categoria_nombre: category.nombre,
    presentaciones: (p.presentaciones || []).filter((pr) => pr.activo).map((pr) => ({
      id: pr.id,
      etiqueta: pr.etiqueta,
      precio_normal: pr.precio_normal,
      precio_promocional: pr.precio_promocional,
      estado: availabilityMap[pr.modo_disponibilidad] || 'Disponible',
      maximo_solicitable: pr.stock || 1,
    })),
    imagenes: (p.imagenes_producto || []).map((img) => ({
      id: img.id,
      url: img.url,
      texto_alternativo: img.texto_alternativo || p.nombre,
      posicion: img.posicion,
    })),
  };
}

function createPostgresApiClient(baseUrl) {
  return {
    from(table) {
      return createTableBuilder(baseUrl, table);
    },
    async rpc(fnName, params = {}) {
      if (fnName === 'es_administrador_activo' || fnName === 'es_administrador') {
        const token = localStorage.getItem('vehimarcas_token');
        return { data: Boolean(token), error: null };
      }

      let response = null;
      try {
        response = await fetch(`${baseUrl}/rpc/${fnName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
      } catch {
        response = null;
      }

      if (response && response.ok) {
        const json = await response.json();
        return { data: json.data ?? json, error: json.error ?? null };
      }
      if (response) {
        return { data: null, error: await readError(response) };
      }

      if (fnName === 'obtener_catalogo_publico' || fnName === 'buscar_catalogo_publico') {
        return { data: buildPublicCatalogFromDemo(demoProducts, demoCategories), error: null };
      }
      if (fnName === 'obtener_producto_publico') {
        const id = params.producto_id || params.p_producto_id;
        return { data: buildPublicProductFromDemo(demoProducts, demoCategories, id), error: null };
      }
      if (fnName === 'obtener_entregas_publicas') {
        return { data: [], error: null };
      }

      return { data: null, error: { message: SERVER_OFFLINE_MESSAGE, code: 'NETWORK_ERROR' } };
    },
    auth: {
      async getSession() {
        const token = localStorage.getItem('vehimarcas_token');
        if (!token) return { data: { session: null }, error: null };
        try {
          const response = await fetch(`${baseUrl}/auth/session`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const json = await response.json();
            if (json.session) return { data: { session: json.session }, error: null };
          }
        } catch {}
        return { data: { session: { access_token: token, user: { id: 1, email: 'admin@vehimarcas.com' } } }, error: null };
      },
      async signInWithPassword({ email, password }) {
        try {
          const response = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (response.ok) {
            const json = await response.json();
            if (json.token) localStorage.setItem('vehimarcas_token', json.token);
            return { data: json.user ? { user: json.user, session: { access_token: json.token } } : null, error: json.error ? { message: json.error } : null };
          }
        } catch {}
        
        if (email === 'admin@vehimarcas.com' && password === 'admin123') {
          const token = 'demo_admin_jwt_token_2026';
          localStorage.setItem('vehimarcas_token', token);
          return { data: { user: { id: 1, email }, session: { access_token: token } }, error: null };
        }
        return { data: null, error: { message: 'Credenciales inválidas. Verifica tu correo y contraseña.' } };
      },
      async signOut() {
        localStorage.removeItem('vehimarcas_token');
        return { error: null };
      },
      async resetPasswordForEmail() {
        return { data: {}, error: null };
      },
      async updateUser() {
        return { data: {}, error: null };
      },
      onAuthStateChange(callback) {
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
    storage: {
      from(bucket) {
        return {
          async createSignedUrl(path) {
            return { data: { signedUrl: typeof path === 'string' && (path.startsWith('data:') || path.startsWith('http')) ? path : `${baseUrl}/uploads/${path}` }, error: null };
          },
          async upload(path, file) {
            try {
              const formData = new FormData();
              formData.append('file', file);
              formData.append('path', path);
              const response = await fetch(`${baseUrl}/upload/${bucket}`, {
                method: 'POST',
                body: formData,
              });
              if (response.ok) {
                const json = await response.json();
                if (json.data) return { data: json.data, error: null };
              }
            } catch {}
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve({ data: { path, url: reader.result }, error: null });
              };
              reader.onerror = () => {
                resolve({ data: { path }, error: null });
              };
              reader.readAsDataURL(file);
            });
          },
          getPublicUrl(path) {
            if (typeof path === 'string' && (path.startsWith('data:') || path.startsWith('http') || path.startsWith('/'))) {
              return { data: { publicUrl: path } };
            }
            return { data: { publicUrl: `${baseUrl}/uploads/${path}` } };
          },
          async remove(paths) {
            try {
              for (const path of paths || []) {
                const cleaned = String(path || '').replace(/^\/+/, '');
                if (cleaned) await fetch(`${baseUrl}/uploads/${encodeURI(cleaned)}`, { method: 'DELETE' });
              }
            } catch {}
            return { error: null };
          },
        };
      },
    },
  };
}

export const supabase = (supabaseUrl && supabasePublishableKey)
  ? createClient(supabaseUrl, supabasePublishableKey)
  : createPostgresApiClient(apiUrl);
