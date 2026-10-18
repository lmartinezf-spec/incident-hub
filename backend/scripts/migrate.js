/**
 * Aplica en orden los archivos de database/migrations que aún no se han ejecutado.
 * Cada migración corre en su propia transacción y queda registrada en schema_migrations.
 * Uso: npm run db:migrate
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

const CARPETA = process.env.MIGRATIONS_DIR || path.join(__dirname, '..', '..', 'database', 'migrations');

async function main() {
  const cliente = await pool.connect();
  try {
    await cliente.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version    VARCHAR(255) PRIMARY KEY,
        aplicada_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);

    const { rows } = await cliente.query('SELECT version FROM schema_migrations');
    const aplicadas = new Set(rows.map((fila) => fila.version));
    const archivos = fs
      .readdirSync(CARPETA)
      .filter((archivo) => archivo.endsWith('.sql'))
      .sort();

    let nuevas = 0;
    for (const archivo of archivos) {
      if (aplicadas.has(archivo)) continue;
      const sql = fs.readFileSync(path.join(CARPETA, archivo), 'utf8');
      await cliente.query('BEGIN');
      try {
        await cliente.query(sql);
        await cliente.query('INSERT INTO schema_migrations (version) VALUES ($1)', [archivo]);
        await cliente.query('COMMIT');
        console.log(`[migrate] aplicada ${archivo}`);
        nuevas += 1;
      } catch (err) {
        await cliente.query('ROLLBACK');
        throw new Error(`Falló la migración ${archivo}: ${err.message}`, { cause: err });
      }
    }
    console.log(nuevas ? `[migrate] ${nuevas} migración(es) aplicada(s)` : '[migrate] base de datos al día');
  } finally {
    cliente.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(`[migrate] ${err.message}`);
  process.exit(1);
});
