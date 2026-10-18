const { ESTADOS, PRIORIDADES } = require('../utils/estados');

const idParam = { params: { id: { tipo: 'entero', requerido: true, min: 1 } } };

const listar = {
  query: {
    estado: { tipo: 'texto', enum: ESTADOS, mayusculas: true },
    prioridad: { tipo: 'texto', enum: PRIORIDADES, mayusculas: true },
    categoriaId: { tipo: 'entero', min: 1 },
    tecnicoId: { tipo: 'entero', min: 1 },
    sinAsignar: { tipo: 'booleano' },
    q: { tipo: 'texto', max: 100 },
    page: { tipo: 'entero', min: 1 },
    limit: { tipo: 'entero', min: 1, max: 100 }
  }
};

const crear = {
  body: {
    titulo: { tipo: 'texto', requerido: true, min: 5, max: 150 },
    descripcion: { tipo: 'texto', requerido: true, min: 10, max: 5000 },
    categoriaId: { tipo: 'entero', requerido: true, min: 1 },
    prioridad: { tipo: 'texto', requerido: true, enum: PRIORIDADES, mayusculas: true }
  }
};

const asignar = {
  ...idParam,
  body: { tecnicoId: { tipo: 'entero', requerido: true, min: 1 } }
};

const cambiarEstado = {
  ...idParam,
  body: {
    estado: { tipo: 'texto', requerido: true, enum: ESTADOS, mayusculas: true },
    comentario: { tipo: 'texto', max: 2000 }
  }
};

const comentar = {
  ...idParam,
  body: { texto: { tipo: 'texto', requerido: true, min: 2, max: 2000 } }
};

module.exports = { idParam, listar, crear, asignar, cambiarEstado, comentar };
