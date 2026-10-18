const { query } = require('../config/db');

async function listarCategorias() {
  const { rows } = await query('SELECT id, nombre FROM categorias WHERE activa = TRUE ORDER BY nombre');
  return rows;
}

module.exports = { listarCategorias };
