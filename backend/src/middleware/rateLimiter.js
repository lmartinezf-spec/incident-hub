const { rateLimit } = require('express-rate-limit');

const QUINCE_MINUTOS = 15 * 60 * 1000;

// TD-02: el login no limitaba los intentos y permitía ataques de fuerza bruta.
// Solo se cuentan los intentos fallidos; un login exitoso no consume el cupo.
const limitarLogin = rateLimit({
  windowMs: QUINCE_MINUTOS,
  limit: Number(process.env.LOGIN_MAX_INTENTOS) || 5,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiados intentos fallidos de inicio de sesión. Intenta de nuevo en 15 minutos.'
    });
  }
});

module.exports = { limitarLogin };
