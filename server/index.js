// API local de VEHIMARCAS del Valle: Express + PostgreSQL.
//
// El frontend (src/supabase.js) habla con esta API cuando no hay credenciales
// de Supabase configuradas. Expone:
//
//   POST  /api/auth/login        inicio de sesión
//   GET   /api/auth/session      validación del token
//   GET   /api/data/:tablas      listado con relaciones anidadas
//   POST  /api/data/:tabla       creación
//   PUT   /api/data/:tabla/:id   edición
//   DELETE /api/data/:tabla/:id  eliminación
//   POST  /api/rpc/:nombre       funciones de PostgreSQL (catálogo, imágenes…)
//   POST  /api/upload/:bucket    carga de imágenes y comprobantes
//   GET   /api/uploads/...       lectura de archivos cargados
//
// Uso:  node server/setup-db.mjs   (una vez: crea la base y las tablas)
//       node server/index.js       (arranca la API en http://localhost:3000)

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from './db.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(here, 'uploads');
const distDir = path.join(here, '..', 'dist');

const JWT_SECRET = process.env.JWT_SECRET || 'vehimarcas_secret_key_2026';
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';

const app = express();
app.use(cors());
app.use(express.json({ limit: '4mb' }));
app.use('/api/uploads', express.static(uploadsDir, { dotfiles: 'deny' }));

// ---------------------------------------------------------------------------
// Tablas expuestas y relaciones que el frontend espera recibir anidadas
// ---------------------------------------------------------------------------

const categoriasEmbed = { alias: 'categorias', table: 'categorias', local: 'categoria_id', remote: 'id', many: false, order: 'nombre asc' };
const productosEmbed = { alias: 'productos', table: 'productos', local: 'producto_id', remote: 'id', many: false, order: 'id asc' };
const presentacionesSolicitudEmbed = {
  alias: 'presentaciones',
  table: 'presentaciones',
  local: 'presentacion_id',
  remote: 'id',
  many: false,
  order: 'id asc',
  embeds: [productosEmbed],
};
const detallesSolicitudEmbed = {
  alias: 'detalles_solicitud',
  table: 'detalles_solicitud',
  local: 'id',
  remote: 'solicitud_id',
  many: true,
  order: 'id asc',
  embeds: [presentacionesSolicitudEmbed],
};

const TABLES = {
  categorias: { order: 'nombre asc', embeds: [] },
  productos: {
    order: 'creado_en desc',
    embeds: [
      categoriasEmbed,
      { alias: 'presentaciones', table: 'presentaciones', local: 'id', remote: 'producto_id', many: true, order: 'id asc' },
      { alias: 'imagenes_producto', table: 'imagenes_producto', local: 'id', remote: 'producto_id', many: true, order: 'posicion asc, id asc' },
    ],
  },
  presentaciones: {
    order: 'id asc',
    embeds: [
      {
        alias: 'productos',
        table: 'productos',
        local: 'producto_id',
        remote: 'id',
        many: false,
        order: 'id asc',
        embeds: [categoriasEmbed],
      },
    ],
  },
  imagenes_producto: {
    order: 'posicion asc, id asc',
    embeds: [{ alias: 'productos', table: 'productos', local: 'producto_id', remote: 'id', many: false, order: 'id asc' }],
  },
  solicitudes: {
    order: 'creado_en desc',
    embeds: [
      { alias: 'pagos_solicitud', table: 'pagos_solicitud', local: 'id', remote: 'solicitud_id', many: true, order: 'id asc' },
      detallesSolicitudEmbed,
    ],
  },
  pagos_solicitud: { order: 'id asc', embeds: [] },
  detalles_solicitud: {
    order: 'id asc',
    embeds: [presentacionesSolicitudEmbed],
  },
  // Galería de venta: una por vehículo vendido, con sus fotos/videos.
  entregas: {
    order: 'creado_en desc',
    embeds: [
      { alias: 'archivos_entrega', table: 'archivos_entrega', local: 'id', remote: 'entrega_id', many: true, order: 'posicion asc, id asc' },
      { alias: 'productos', table: 'productos', local: 'producto_id', remote: 'id', many: false, order: 'id asc', embeds: [categoriasEmbed] },
    ],
  },
  archivos_entrega: {
    order: 'posicion asc, id asc',
    embeds: [{ alias: 'entregas', table: 'entregas', local: 'entrega_id', remote: 'id', many: false, order: 'id asc' }],
  },
  // Vista de solo lectura del catálogo de vehículos.
  vehiculos: { order: 'created_at desc', embeds: [], readOnly: true },
};

const ident = (value) => `"${String(value).replaceAll('"', '""')}"`;

function arrayParameterType(values) {
  return values.every((value) => Number.isInteger(Number(value))) ? 'integer[]'
    : values.every((value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value))) ? 'uuid[]'
      : 'text[]';
}

async function tableColumns(table) {
  const { rows } = await query(
    `select column_name from information_schema.columns
     where table_schema = 'public' and table_name = $1`,
    [table],
  );
  return rows.map((row) => row.column_name);
}

async function attachEmbeds(rows, embeds, depth = 0) {
  if (!rows.length || !embeds || depth > 3) return rows;
  for (const embed of embeds) {
    const keys = [...new Set(rows.map((row) => row[embed.local]).filter((value) => value !== null && value !== undefined))];
    if (!keys.length) {
      for (const row of rows) row[embed.alias] = embed.many ? [] : null;
      continue;
    }
    const { rows: related } = await query(
      `select * from public.${ident(embed.table)}
       where ${ident(embed.remote)} = any($1::${arrayParameterType(keys)})
       order by ${embed.order || '1'}`,
      [keys],
    );
    await attachEmbeds(related, embed.embeds, depth + 1);
    for (const row of rows) {
      const matches = related.filter((item) => String(item[embed.remote]) === String(row[embed.local]));
      row[embed.alias] = embed.many ? matches : matches[0] || null;
    }
  }
  return rows;
}

function errorStatus(error) {
  if (error.code === '23505') return 409;
  if (error.code === '23503') return 409;
  if (error.code === '23514' || error.code === '23502' || error.code === '22001' || error.code === '22P02') return 400;
  return 500;
}

function errorPayload(error) {
  const message = error.code === '23505'
    ? 'Ya existe un registro con esos datos únicos.'
    : error.code === '23503'
      ? 'No se puede eliminar: existen registros relacionados.'
      : error.message || 'No fue posible completar la operación.';
  return { message, code: error.code || null };
}

function sendError(res, error) {
  res.status(errorStatus(error)).json(errorPayload(error));
}

// ---------------------------------------------------------------------------
// Autenticación del panel
// ---------------------------------------------------------------------------

const ADMIN_ACCOUNTS = [
  { email: 'admin@vehimarcas.com', password: 'admin123' },
];

async function findStoredAdmin(email) {
  try {
    const { rows } = await query('select id, email, password_hash, rol from public.usuarios_admin where email = $1', [email]);
    return rows[0] || null;
  } catch {
    return null;
  }
}

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos.' });
  }

  const hardcoded = ADMIN_ACCOUNTS.find((account) => account.email === email && account.password === password);
  if (hardcoded) {
    const token = jwt.sign({ id: 1, email, rol: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, user: { id: 1, email, role: 'admin' } });
  }

  try {
    const user = await findStoredAdmin(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, user: { id: user.id, email: user.email, role: user.rol } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/session', (req, res) => {
  const authorization = req.headers.authorization;
  if (!authorization) return res.json({ session: null });
  const token = authorization.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return res.json({ session: { user: payload, access_token: token } });
  } catch {
    return res.json({ session: null });
  }
});

// ---------------------------------------------------------------------------
// CRUD genérico (/api/data/:tabla)
// ---------------------------------------------------------------------------

app.get('/api/data/:tabla', async (req, res) => {
  const table = TABLES[req.params.tabla];
  if (!table) return res.status(404).json({ message: 'Tabla no encontrada.', code: '42P01' });
  try {
    const { rows } = await query(`select * from public.${ident(req.params.tabla)} order by ${table.order}`);
    await attachEmbeds(rows, table.embeds);
    res.json({ data: rows });
  } catch (error) {
    sendError(res, error);
  }
});

app.post('/api/data/:tabla', async (req, res) => {
  const table = TABLES[req.params.tabla];
  if (!table) return res.status(404).json({ message: 'Tabla no encontrada.', code: '42P01' });
  if (table.readOnly) return res.status(400).json({ message: 'Esta vista es de solo lectura.', code: 'HV000' });
  try {
    const allowed = await tableColumns(req.params.tabla);
    const payload = Object.fromEntries(
      Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)),
    );
    const keys = Object.keys(payload);
    if (!keys.length) return res.status(400).json({ message: 'No hay datos para guardar.', code: '22004' });
    const { rows } = await query(
      `insert into public.${ident(req.params.tabla)} (${keys.map(ident).join(', ')})
       values (${keys.map((_, index) => `$${index + 1}`).join(', ')})
       returning *`,
      keys.map((key) => payload[key]),
    );
    res.status(201).json({ data: rows[0] });
  } catch (error) {
    sendError(res, error);
  }
});

app.put('/api/data/:tabla/:id', async (req, res) => {
  const table = TABLES[req.params.tabla];
  if (!table) return res.status(404).json({ message: 'Tabla no encontrada.', code: '42P01' });
  if (table.readOnly) return res.status(400).json({ message: 'Esta vista es de solo lectura.', code: 'HV000' });
  try {
    const allowed = await tableColumns(req.params.tabla);
    const payload = Object.fromEntries(
      Object.entries(req.body || {}).filter(([key]) => allowed.includes(key) && key !== 'id'),
    );
    const keys = Object.keys(payload);
    if (!keys.length) return res.status(400).json({ message: 'No hay datos para actualizar.', code: '22004' });
    const { rows } = await query(
      `update public.${ident(req.params.tabla)}
       set ${keys.map((key, index) => `${ident(key)} = $${index + 1}`).join(', ')}
       where id = $${keys.length + 1}
       returning *`,
      [...keys.map((key) => payload[key]), req.params.id],
    );
    if (!rows.length) return res.status(404).json({ message: 'Registro no encontrado.', code: 'PGRST116' });
    res.json({ data: rows[0] });
  } catch (error) {
    sendError(res, error);
  }
});

app.delete('/api/data/:tabla/:id', async (req, res) => {
  const table = TABLES[req.params.tabla];
  if (!table) return res.status(404).json({ message: 'Tabla no encontrada.', code: '42P01' });
  if (table.readOnly) return res.status(400).json({ message: 'Esta vista es de solo lectura.', code: 'HV000' });
  try {
    const { rowCount } = await query(`delete from public.${ident(req.params.tabla)} where id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Registro no encontrado.', code: 'PGRST116' });
    res.json({ data: null });
  } catch (error) {
    sendError(res, error);
  }
});

// ---------------------------------------------------------------------------
// Funciones de PostgreSQL (/api/rpc/:nombre)
// ---------------------------------------------------------------------------

// pg devuelve text[] como array de JS, pero "char[]" (proargmodes) como texto
// literal "{i,i,i,t}". Normaliza ambos casos antes de recorrerlos.
function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  const trimmed = value.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return [];
  const inner = trimmed.slice(1, -1).trim();
  return inner ? inner.split(',').map((item) => item.trim()) : [];
}

async function describeFunction(name) {
  const { rows } = await query(
    `select p.oid,
            p.proretset,
            p.prorettype::regtype::text as return_type,
            p.proargnames,
            p.proargmodes,
            p.proargtypes::oid[] as input_types
     from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname = $1
     order by p.oid`,
    [name],
  );
  if (!rows.length) return [];

  const allTypes = [...new Set(rows.flatMap((row) => normalizeArray(row.input_types)))];
  const { rows: typeRows } = await query(
    `select oid, format_type(oid, null) as label from pg_type where oid = any($1::oid[])`,
    [allTypes],
  );
  const typeLabels = new Map(typeRows.map((row) => [row.oid, row.label]));

  return rows.map((row) => {
    const names = normalizeArray(row.proargnames);
    const modes = normalizeArray(row.proargmodes);
    const inputTypes = normalizeArray(row.input_types);
    const inputs = [];
    if (process.env.API_DEBUG) {
      console.log('[rpc] meta', JSON.stringify(names), JSON.stringify(modes), JSON.stringify(inputTypes));
    }

    if (!modes.length) {
      // Sin modos explícitos: todos los argumentos son de entrada.
      for (let index = 0; index < row.input_types.length; index += 1) {
        inputs.push({ name: names[index] || null, type: typeLabels.get(row.input_types[index]) || 'text' });
      }
    } else {
      let typeIndex = 0;
      for (let index = 0; index < modes.length; index += 1) {
        const mode = modes[index];
        if (mode === 'i' || mode === 'b' || mode === 'v') {
          inputs.push({ name: names[index] || null, type: typeLabels.get(row.input_types[typeIndex]) || 'text' });
          typeIndex += 1;
        }
      }
    }

    return {
      oid: row.oid,
      returnType: row.return_type,
      returnsSet: row.proretset,
      inputs,
    };
  });
}

app.post('/api/rpc/:nombre', async (req, res) => {
  const name = req.params.nombre;
  const params = req.body || {};
  const providedKeys = Object.keys(params);
  if (process.env.API_DEBUG) console.log('[rpc] entrada', name, JSON.stringify(params));

  try {
    const candidates = await describeFunction(name);
    if (!candidates.length) {
      return res.status(404).json({ data: null, error: { message: `Función ${name}() no existe en la base de datos.`, code: '42883' } });
    }

    const candidate = candidates.find((fn) => {
      const names = fn.inputs.map((input) => input.name).filter(Boolean);
      return providedKeys.every((key) => names.includes(key));
    }) || candidates[0];

    const values = candidate.inputs.map((input) => {
      const value = input.name ? (params[input.name] ?? null) : null;
      // Los parámetros json/jsonb deben viajar como texto JSON: pg serializa los
      // arreglos de JavaScript como literales de arreglo de PostgreSQL, lo que
      // produce «invalid input syntax for type json» al castear a jsonb.
      if (value !== null && typeof value !== 'string' && /json/i.test(input.type)) return JSON.stringify(value);
      return value;
    });
    const argumentsSql = candidate.inputs
      .map((input, index) => `$${index + 1}::${input.type}`)
      .join(', ');
    const callSql = `public.${ident(name)}(${argumentsSql})`;
    const sql = candidate.returnsSet
      ? `select coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) as result from ${callSql} as r`
      : `select to_jsonb(${callSql}) as result`;

    if (process.env.API_DEBUG) console.log('[rpc]', sql, values, 'entradas:', JSON.stringify(candidate.inputs), 'recibido:', JSON.stringify(providedKeys));
    const { rows } = await query(sql, values);
    res.json({ data: rows[0].result, error: null });
  } catch (error) {
    res.status(200).json({ data: null, error: { message: error.message, code: error.code || null } });
  }
});

// ---------------------------------------------------------------------------
// Archivos: imágenes de vehículos y comprobantes de pago
// ---------------------------------------------------------------------------

// Límite alineado con el bucket público "entregas" (50 MiB), que admite videos.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

function safeRelativePath(rawPath) {
  const cleaned = String(rawPath || '').replaceAll('\\', '/').replace(/^\/+/, '');
  const normalized = path.posix.normalize(cleaned);
  if (!normalized || normalized.startsWith('..') || normalized === '.') return null;
  return normalized;
}

app.post('/api/upload/:bucket', upload.single('file'), (req, res) => {
  const relative = safeRelativePath(req.body?.path);
  if (!relative) return res.status(400).json({ message: 'Ruta de archivo inválida.' });
  if (!req.file) return res.status(400).json({ message: 'No se recibió ningún archivo.' });

  const destination = path.join(uploadsDir, ...relative.split('/'));
  try {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, req.file.buffer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.json({ data: { path: relative, url: `/api/uploads/${relative}` } });
});

app.delete('/api/uploads/:path(*)', (req, res) => {
  const relative = safeRelativePath(req.params.path);
  if (!relative) return res.status(400).json({ message: 'Ruta de archivo inválida.' });
  const destination = path.join(uploadsDir, ...relative.split('/'));
  try {
    if (fs.existsSync(destination)) fs.unlinkSync(destination);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.json({ data: null });
});

// ---------------------------------------------------------------------------
// Arranque
// ---------------------------------------------------------------------------

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: 'El archivo supera el tamaño permitido (50 MiB).' });
  }
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Cuerpo de la petición demasiado grande.' });
  }
  console.error('[api] error no controlado:', error);
  return res.status(500).json({ message: 'Error interno del servidor.' });
});

app.listen(PORT, HOST, () => {
  console.log(`[api] VEHIMARCAS del Valle escuchando en http://${HOST}:${PORT}/api`);
});
