// Aplica el esquema de VEHIMARCAS al PostgreSQL local.
//
// Uso:  node server/setup-db.mjs
//
// 1. Crea la base de datos (DATABASE_URL) si no existe.
// 2. Aplica server/local-bootstrap.sql (roles, auth, storage, extensions).
// 3. Aplica las migraciones de supabase/migrations en orden, dejando registro
//    en public._migrations para que sea repetible.
// 4. Aplica supabase/seed.sql (categorías e inventario inicial).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import dotenv from 'dotenv';
import { ADMIN_USER_ID } from './db.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(here, '..', 'supabase', 'migrations');
const bootstrapFile = path.join(here, 'local-bootstrap.sql');
const seedFile = path.join(here, '..', 'supabase', 'seed.sql');

// Migraciones exclusivas del entorno de pruebas (pgtap y roles del CLI remoto).
const skippedMigrations = new Set([
  '20260928000400_enable_pgtap.sql',
  '20260928000500_grant_pgtap_to_postgres.sql',
  '20260928000600_grant_pgtap_to_cli_test_role.sql',
  '20260928000700_grant_remote_test_role_catalog_access.sql',
  '20260928000800_enable_bypassrls_for_cli_test_role.sql',
]);

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/vehimarcas';
const url = new URL(connectionString);
const databaseName = decodeURIComponent(url.pathname.replace(/^\//, '')) || 'vehimarcas';

function log(message) {
  console.log(`[setup-db] ${message}`);
}

async function connect(database) {
  const target = new URL(connectionString);
  target.pathname = `/${database}`;
  const client = new pg.Client({ connectionString: target.toString() });
  await client.connect();
  return client;
}

async function ensureDatabase() {
  const admin = await connect('postgres');
  try {
    const { rows } = await admin.query('select 1 from pg_database where datname = $1', [databaseName]);
    if (rows.length) {
      log(`base de datos "${databaseName}" ya existe`);
      return;
    }
    await admin.query(`create database "${databaseName}"`);
    log(`base de datos "${databaseName}" creada`);
  } finally {
    await admin.end();
  }
}

async function applyScript(client, sql, label) {
  try {
    await client.query(sql);
    log(`${label}: aplicado`);
  } catch (error) {
    throw new Error(`${label}: ${error.message}`);
  }
}

async function ensureMigrationTable(client) {
  await client.query(`create table if not exists public._migrations (
    nombre text primary key,
    aplicada_en timestamptz not null default now()
  )`);
}

async function applyMigrations(client) {
  const { rows } = await client.query('select nombre from public._migrations');
  const applied = new Set(rows.map((row) => row.nombre));
  const files = fs.readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql') && !skippedMigrations.has(file))
    .sort();

  let pending = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    try {
      await client.query('begin');
      await client.query(sql);
      await client.query('insert into public._migrations (nombre) values ($1)', [file]);
      await client.query('commit');
      pending += 1;
    } catch (error) {
      await client.query('rollback');
      throw new Error(`migración ${file}: ${error.message}`);
    }
  }
  log(`${pending} migración(es) aplicada(s), ${files.length - pending} ya estaban`);
}

async function ensureAdminIdentity(client) {
  // auth.uid() toma request.jwt.claim.sub de la sesión; el servidor abre cada
  // conexión con el id de abajo, así que debe existir como administrador activo.
  await client.query(
    `insert into auth.users (id, email)
     values ($1, 'admin@vehimarcas.com')
     on conflict (id) do nothing`,
    [ADMIN_USER_ID],
  );
  await client.query(
    `insert into public.usuarios_administrativos (id, activo)
     values ($1, true)
     on conflict (id) do update set activo = true`,
    [ADMIN_USER_ID],
  );
  log(`identidad de administrador local: ${ADMIN_USER_ID}`);
}

async function main() {
  await ensureDatabase();
  const client = await connect(databaseName);
  try {
    await applyScript(client, fs.readFileSync(bootstrapFile, 'utf8'), 'bootstrap local');
    await ensureMigrationTable(client);
    await applyMigrations(client);
    await ensureAdminIdentity(client);
    await applyScript(client, fs.readFileSync(seedFile, 'utf8'), 'seed');
    await applyScript(client, fs.readFileSync(path.join(here, 'seed-local-images.sql'), 'utf8'), 'seed de imágenes locales');
    const { rows } = await client.query(`select
      (select count(*) from public.categorias) as categorias,
      (select count(*) from public.productos) as productos,
      (select count(*) from public.presentaciones) as presentaciones`);
    log(`estado: ${rows[0].categorias} categorías, ${rows[0].productos} vehículos, ${rows[0].presentaciones} presentaciones`);
    log('listo');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(`[setup-db] error: ${error.message}`);
  process.exitCode = 1;
});
