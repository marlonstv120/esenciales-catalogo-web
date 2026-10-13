import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/vehimarcas';

export const pool = new pg.Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Identidad del administrador para auth.uid(): Supabase/PostgREST inyecta el
// claim JWT en la sesión, y aquí lo hacemos nosotros al abrir cada conexión.
// Sin esto, funciones como ordenar_imagenes_producto() rechazan la operación.
export const ADMIN_USER_ID = process.env.ADMIN_USER_ID || '00000000-0000-0000-0000-000000000001';

pool.on('connect', (client) => {
  client.query(`set request.jwt.claim.sub = '${ADMIN_USER_ID}'`).catch(() => {});
});

export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  return res;
}
