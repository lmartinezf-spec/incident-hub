const { nodeEnv, db, requerida } = require('./env');
const { version } = require('../../package.json');

// Falla rápido: la API no arranca sin secreto para firmar tokens.
const jwtSecret = requerida('JWT_SECRET');
if (nodeEnv === 'production' && jwtSecret.length < 32) {
  throw new Error('JWT_SECRET debe tener al menos 32 caracteres en producción.');
}

module.exports = Object.freeze({
  nodeEnv,
  appVersion: version,
  port: Number(process.env.PORT) || 4000,
  db,
  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  },
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean)
});
