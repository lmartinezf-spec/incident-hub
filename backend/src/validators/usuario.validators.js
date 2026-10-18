const { ROLES } = require('../utils/estados');

const idParam = { params: { id: { tipo: 'entero', requerido: true, min: 1 } } };

const listar = {
  query: { rol: { tipo: 'texto', enum: ROLES, mayusculas: true } }
};

const crear = {
  body: {
    nombre: { tipo: 'texto', requerido: true, min: 3, max: 100 },
    email: { tipo: 'email', requerido: true },
    password: {
      tipo: 'texto',
      requerido: true,
      min: 8,
      max: 100,
      patron: /^(?=.*[A-Za-z])(?=.*\d).+$/,
      mensajePatron: 'password debe contener al menos una letra y un número'
    },
    rol: { tipo: 'texto', requerido: true, enum: ROLES, mayusculas: true }
  }
};

const cambiarEstado = {
  ...idParam,
  body: { activo: { tipo: 'booleano', requerido: true } }
};

module.exports = { listar, crear, cambiarEstado };
