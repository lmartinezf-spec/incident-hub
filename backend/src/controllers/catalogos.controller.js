const catalogoModel = require('../models/catalogo.model');
const { ESTADOS, PRIORIDADES } = require('../utils/estados');

async function obtener(req, res) {
  const categorias = await catalogoModel.listarCategorias();
  res.json({ categorias, prioridades: PRIORIDADES, estados: ESTADOS });
}

module.exports = { obtener };
