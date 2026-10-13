// Entorno de desarrollo de VEHIMARCAS en un solo comando:
//
//   npm run dev
//
// 1. Prepara la base de datos PostgreSQL local (repetible, no borra datos).
// 2. Arranca la API local en http://localhost:3000  (node server/index.js).
// 3. Arranca Vite en http://localhost:5173 con recarga en caliente.
//
// Variable opcional: VEHIMARCAS_SKIP_DB_SETUP=1 omite el paso de preparación
// de la base de datos cuando ya sabes que está lista.

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const node = process.execPath;
const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');

const children = new Set();
let shuttingDown = false;

function banner(message) {
  console.log(`  \x1b[36m[dev]\x1b[0m ${message}`);
}

function finalize(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    try { child.kill(); } catch {}
  }
  process.exit(code ?? 0);
}

function runOnce(args) {
  return new Promise((resolve) => {
    const child = spawn(node, args, { cwd: root, stdio: 'inherit' });
    child.on('error', (error) => {
      console.error(`[dev] no se pudo ejecutar «${args.join(' ')}»: ${error.message}`);
      resolve(1);
    });
    child.on('exit', (code) => resolve(code ?? 0));
  });
}

function keepRunning(label, args) {
  const child = spawn(node, args, { cwd: root, stdio: 'inherit' });
  children.add(child);
  child.on('error', (error) => {
    console.error(`[dev] error al ejecutar «${label}»: ${error.message}`);
    finalize(1);
  });
  child.on('exit', (code) => {
    children.delete(child);
    if (!shuttingDown && code !== null) {
      console.error(`[dev] «${label}» se detuvo (código ${code}); cerrando el resto.`);
      finalize(code);
    }
  });
  return child;
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => finalize(0));
}

banner('VEHIMARCAS del Valle — entorno local');
banner('Base de datos: PostgreSQL en localhost:5432/vehimarcas (según DATABASE_URL de .env)');

if (process.env.VEHIMARCAS_SKIP_DB_SETUP === '1') {
  banner('Se omite la preparación de la base de datos (VEHIMARCAS_SKIP_DB_SETUP=1).');
} else {
  banner('Preparando la base de datos (repetible, no altera datos existentes)…');
  const code = await runOnce(['server/setup-db.mjs']);
  if (code !== 0) {
    console.error('');
    console.error('[dev] No fue posible preparar la base de datos local.');
    console.error('[dev] Verifica que PostgreSQL esté activo en localhost:5432 y que DATABASE_URL en .env sea correcto.');
    console.error('[dev] Si solo quieres el frontend sin backend, ejecuta: npm run dev:frontend');
    process.exit(code || 1);
  }
}

banner('Arrancando la API local en http://localhost:3000 …');
keepRunning('API local (server/index.js)', ['server/index.js']);

banner('Arrancando Vite en http://localhost:5173 …');
keepRunning('Vite', [viteBin]);

banner('Frontend: http://localhost:5173  |  Admin: http://localhost:5173/admin');
banner('Admin local: admin@vehimarcas.com (ver server/index.js para la contraseña de desarrollo)');