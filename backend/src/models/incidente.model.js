const db = require('../config/db');
const bitacora = require('./bitacora.model');
const { construirFiltros } = require('../utils/filtros');

const SELECT_BASE = `
  SELECT i.id, i.titulo, i.descripcion, i.prioridad, i.estado,
         i.categoria_id, c.nombre AS categoria,
         i.reportado_por, r.nombre AS reportado_por_nombre,
         i.tecnico_id, t.nombre AS tecnico_nombre,
         i.creado_en, i.actualizado_en, i.resuelto_en, i.cerrado_en
    FROM incidentes i
    JOIN categorias c ON c.id = i.categoria_id
    JOIN usuarios r ON r.id = i.reportado_por
    LEFT JOIN usuarios t ON t.id = i.tecnico_id`;

async function listar(filtros, usuario, { limit, offset }) {
  const { where, params } = construirFiltros(filtros, usuario);
  const conteo = await db.query(`SELECT COUNT(*)::int AS total FROM incidentes i ${where}`, params);
  const { rows } = await db.query(
    `${SELECT_BASE} ${where}
     ORDER BY i.creado_en DESC, i.id DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  return { datos: rows, total: conteo.rows[0].total };
}

async function obtenerPorId(id) {
  const { rows } = await db.query(`${SELECT_BASE} WHERE i.id = $1`, [id]);
  return rows[0] || null;
}

async function crear({ titulo, descripcion, categoriaId, prioridad }, usuarioId) {
  const id = await db.transaccion(async (cliente) => {
    const { rows } = await cliente.query(
      `INSERT INTO incidentes (titulo, descripcion, categoria_id, prioridad, reportado_por)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [titulo, descripcion, categoriaId, prioridad, usuarioId]
    );
    await bitacora.registrar(
      {
        incidenteId: rows[0].id,
        usuarioId,
        tipo: 'CREACION',
        detalle: 'Incidente registrado',
        estadoNuevo: 'NUEVO'
      },
      cliente
    );
    return rows[0].id;
  });
  return obtenerPorId(id);
}

/**
 * Asigna o reasigna técnico. El UPDATE incluye el estado leído previamente
 * (control optimista): si otro usuario lo modificó, no se actualiza nada.
 */
async function asignarTecnico({ id, estadoActual, estadoNuevo, tecnicoId, usuarioId, detalle }) {
  const actualizado = await db.transaccion(async (cliente) => {
    const { rowCount } = await cliente.query(
      `UPDATE incidentes
          SET tecnico_id = $3, estado = $4, actualizado_en = NOW()
        WHERE id = $1 AND estado = $2`,
      [id, estadoActual, tecnicoId, estadoNuevo]
    );
    if (rowCount === 0) return false;
    await bitacora.registrar(
      {
        incidenteId: id,
        usuarioId,
        tipo: 'ASIGNACION',
        detalle,
        estadoAnterior: estadoActual,
        estadoNuevo
      },
      cliente
    );
    return true;
  });
  return actualizado ? obtenerPorId(id) : null;
}

async function cambiarEstado({ id, estadoActual, estadoNuevo, usuarioId, comentario }) {
  const actualizado = await db.transaccion(async (cliente) => {
    const { rowCount } = await cliente.query(
      `UPDATE incidentes
          SET estado = $3::varchar,
              actualizado_en = NOW(),
              resuelto_en = CASE
                WHEN $3::varchar = 'RESUELTO' THEN NOW()
                WHEN $3::varchar = 'EN_PROCESO' THEN NULL
                ELSE resuelto_en END,
              cerrado_en = CASE WHEN $3::varchar = 'CERRADO' THEN NOW() ELSE cerrado_en END
        WHERE id = $1 AND estado = $2`,
      [id, estadoActual, estadoNuevo]
    );
    if (rowCount === 0) return false;
    const detalle = comentario
      ? `Estado: ${estadoActual} → ${estadoNuevo}. ${comentario}`
      : `Estado: ${estadoActual} → ${estadoNuevo}`;
    await bitacora.registrar(
      { incidenteId: id, usuarioId, tipo: 'CAMBIO_ESTADO', detalle, estadoAnterior: estadoActual, estadoNuevo },
      cliente
    );
    return true;
  });
  return actualizado ? obtenerPorId(id) : null;
}

module.exports = { listar, obtenerPorId, crear, asignarTecnico, cambiarEstado };
