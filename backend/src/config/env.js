const path = require('path');

// Carga backend/.env si existe (en CI/CD las variables llegan desde el pipeline).
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env'), quiet: true });

const nodeEnv = process.env.NODE_ENV || 'development';

function requerida(nombre) {
  const valor = process.env[nombre];
  if (!valor || !valor.trim()) {
    throw new Error(
      `Falta la variable de entorno requerida: ${nombre}. ` +
        'Configúrala en backend/.env (local) o como variable secreta del pipeline.'
    );
  }
  return valor;
}

const db = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'incident_hub',
  user: process.env.DB_USER || 'postgres',
  password: nodeEnv === 'production' ? requerida('DB_PASSWORD') : process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

module.exports = { nodeEnv, db, requerida };
