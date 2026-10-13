import { pool } from './db.js';

const { rows: dbs } = await pool.query("select datname from pg_database where datistemplate = false");
console.log('databases:', dbs.map((r) => r.datname).join(', '));

try {
  const { rows: tables } = await pool.query("select table_name from information_schema.tables where table_schema = 'public' order by table_name");
  console.log('tables:', tables.map((r) => r.table_name).join(', '));
  if (tables.some((r) => r.table_name === 'productos')) {
    const { rows: cols } = await pool.query("select column_name, data_type, is_nullable, column_default from information_schema.columns where table_schema='public' and table_name='productos' order by ordinal_position");
    console.table(cols);
    const { rows: constraints } = await pool.query("select conname, pg_get_constraintdef(oid) as def from pg_constraint where conrelid = 'public.productos'::regclass");
    console.table(constraints);
    const { rows: counts } = await pool.query('select (select count(*) from productos) productos, (select count(*) from categorias) categorias, (select count(*) from presentaciones) presentaciones, (select count(*) from imagenes_producto) imagenes');
    console.table(counts);
  }
} catch (error) {
  console.log('schema error:', error.message);
}
await pool.end();
