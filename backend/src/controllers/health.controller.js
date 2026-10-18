const { query } = require('../config/db');
const config = require('../config');

async function estado(req, res) {
  let baseDatos = 'ok';
  try {
    await query('SELECT 1');
  } catch {
    baseDatos = 'error';
  }
  const ok = baseDatos === 'ok';
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degradado',
    version: config.appVersion,
    entorno: config.nodeEnv,
    baseDatos,
    fecha: new Date().toISOString()
  });
}

module.exports = { estado };
