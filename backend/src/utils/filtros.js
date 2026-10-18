/**
 * Construye la cláusula WHERE parametrizada para el listado de incidentes.
 * Aplica también la visibilidad por rol: USUARIO ve lo que reportó,
 * TECNICO ve lo que reportó o tiene asignado, ADMIN ve todo.
 */
function construirFiltros(filtros = {}, usuario) {
  const condiciones = [];
  const params = [];

  const agregar = (sqlConMarcador, valor) => {
    params.push(valor);
    condiciones.push(sqlConMarcador.replace('?', `$${params.length}`));
  };

  if (usuario.rol === 'USUARIO') {
    agregar('i.reportado_por = ?', usuario.id);
  } else if (usuario.rol === 'TECNICO') {
    params.push(usuario.id);
    condiciones.push(`(i.tecnico_id = $${params.length} OR i.reportado_por = $${params.length})`);
  }

  if (filtros.estado) agregar('i.estado = ?', filtros.estado);
  if (filtros.prioridad) agregar('i.prioridad = ?', filtros.prioridad);
  if (filtros.categoriaId) agregar('i.categoria_id = ?', filtros.categoriaId);

  if (filtros.sinAsignar) {
    condiciones.push('i.tecnico_id IS NULL');
  } else if (filtros.tecnicoId) {
    agregar('i.tecnico_id = ?', filtros.tecnicoId);
  }

  if (filtros.q) {
    params.push(`%${filtros.q}%`);
    condiciones.push(`(i.titulo ILIKE $${params.length} OR i.descripcion ILIKE $${params.length})`);
  }

  return {
    where: condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '',
    params
  };
}

function normalizarPaginacion({ page, limit } = {}) {
  const pagina = Number.isInteger(page) && page > 0 ? page : 1;
  const limite = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 10;
  return { page: pagina, limit: limite, offset: (pagina - 1) * limite };
}

module.exports = { construirFiltros, normalizarPaginacion };
