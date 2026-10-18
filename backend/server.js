const app = require('./src/app');
const config = require('./src/config');
const { pool } = require('./src/config/db');

const server = app.listen(config.port, () => {
  console.log(
    `[incident-hub] v${config.appVersion} escuchando en http://localhost:${config.port} (${config.nodeEnv})`
  );
});

function apagar(senal) {
  console.log(`[incident-hub] ${senal} recibido, cerrando servidor...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGINT', () => apagar('SIGINT'));
process.on('SIGTERM', () => apagar('SIGTERM'));
