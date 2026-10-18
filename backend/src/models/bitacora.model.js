const db = require('../config/db');

/**
 * Registra un evento en la bitácora del incidente.
 * Acepta un cliente de transacción para escribir junto con el cambio del incidente.
 */
async function registrar(
  { incidenteId, usuarioId, tipo, detalle, estadoAnterior = null, estadoNuevo = null },
  ejecutor = db
) {
  const { rows } = await ejecutor.query(
    `INSERT INTO bitacora (incidente_id, usuario_id, tipo, detalle, estado_anterior, estado_nuevo)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, incidente_id, usuario_id, tipo, detalle, estado_anterior, estado_nuevo, creado_en`,
    [incidenteId, usuarioId, tipo, detalle, estadoAnterior, estadoNuevo]
  );
  return rows[0];
}

async function listarPorIncidente(incidenteId) {
  const { rows } = await db.query(
    `SELECT b.id, b.tipo, b.detalle, b.estado_anterior, b.estado_nuevo, b.creado_en,
            u.id AS usuario_id, u.nombre AS usuario_nombre, u.rol AS usuario_rol
       FROM bitacora b
       JOIN usuarios u ON u.id = b.usuario_id
      WHERE b.incidente_id = $1
      ORDER BY b.creado_en ASC, b.id ASC`,
    [incidenteId]
  );
  return rows;
}

module.exports = { registrar, listarPorIncidente };
