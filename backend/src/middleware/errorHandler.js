const config = require('../config');
const { HttpError } = require('../utils/httpError');

function rutaNoEncontrada(req, res, next) {
  next(new HttpError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

// Traduce errores conocidos de PostgreSQL a respuestas HTTP comprensibles.
function traducirErrorPg(err) {
  if (err.code === '23505') return new HttpError(409, 'El registro ya existe');
  if (err.code === '23503') return new HttpError(400, 'Referencia inválida a un registro relacionado');
  if (err.code === '23514') return new HttpError(400, 'Valor no permitido por las reglas de la base de datos');
  return null;
}

// Express reconoce el manejador de errores por sus 4 parámetros, aunque _next no se use.
function manejarErrores(err, req, res, _next) {
  let error = err;
  if (err.type === 'entity.parse.failed') error = new HttpError(400, 'El cuerpo de la petición no es JSON válido');
  else if (!(err instanceof HttpError)) error = traducirErrorPg(err) || err;

  const status = error.status || 500;
  if (status >= 500) console.error('[error]', err);

  const ocultarDetalle = status >= 500 && config.nodeEnv === 'production';
  res.status(status).json({
    error: ocultarDetalle ? 'Error interno del servidor' : error.message,
    ...(error.detalles ? { detalles: error.detalles } : {})
  });
}

module.exports = { rutaNoEncontrada, manejarErrores };
