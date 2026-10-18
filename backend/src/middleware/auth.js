const jwt = require('jsonwebtoken');
const config = require('../config');
const { unauthorized, forbidden } = require('../utils/httpError');

function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return next(unauthorized('Token no proporcionado'));
  }
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    req.usuario = {
      id: Number(payload.sub),
      nombre: payload.nombre,
      email: payload.email,
      rol: payload.rol
    };
    next();
  } catch {
    next(unauthorized('Token inválido o expirado'));
  }
}

function autorizar(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return next(forbidden());
    }
    next();
  };
}

function firmarToken(usuario) {
  return jwt.sign(
    { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    config.jwt.secret,
    { subject: String(usuario.id), expiresIn: config.jwt.expiresIn }
  );
}

module.exports = { autenticar, autorizar, firmarToken };
