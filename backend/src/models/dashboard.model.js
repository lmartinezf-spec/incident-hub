const { query } = require('../config/db');

async function obtenerIndicadores() {
  const [resumen, porEstado, porPrioridad, porCategoria, porTecnico] = await Promise.all([
    query(`
      SELECT COUNT(*)::int AS total,
             COUNT(*) FILTER (WHERE estado IN ('NUEVO', 'ASIGNADO', 'EN_PROCESO'))::int AS abiertos,
             COUNT(*) FILTER (WHERE estado = 'RESUELTO')::int AS resueltos,
             COUNT(*) FILTER (WHERE estado = 'CERRADO')::int AS cerrados,
             COUNT(*) FILTER (
               WHERE prioridad = 'CRITICA' AND estado IN ('NUEVO', 'ASIGNADO', 'EN_PROCESO')
             )::int AS criticos,
             COUNT(*) FILTER (WHERE estado = 'NUEVO' AND tecnico_id IS NULL)::int AS sin_asignar,
             ROUND(
               (AVG(EXTRACT(EPOCH FROM (resuelto_en - creado_en)) / 3600)
                 FILTER (WHERE resuelto_en IS NOT NULL))::numeric, 1
             )::float AS horas_promedio_resolucion
        FROM incidentes`),
    query(`SELECT estado, COUNT(*)::int AS total FROM incidentes GROUP BY estado`),
    query(`SELECT prioridad, COUNT(*)::int AS total FROM incidentes GROUP BY prioridad`),
    query(`
      SELECT c.nombre AS categoria, COUNT(i.id)::int AS total
        FROM categorias c
        LEFT JOIN incidentes i ON i.categoria_id = c.id
       WHERE c.activa = TRUE
       GROUP BY c.id, c.nombre
       ORDER BY total DESC, c.nombre`),
    query(`
      SELECT u.id, u.nombre AS tecnico,
             COUNT(i.id)::int AS total,
             COUNT(i.id) FILTER (WHERE i.estado IN ('ASIGNADO', 'EN_PROCESO'))::int AS en_curso,
             COUNT(i.id) FILTER (WHERE i.estado IN ('RESUELTO', 'CERRADO'))::int AS atendidos
        FROM usuarios u
        LEFT JOIN incidentes i ON i.tecnico_id = u.id
       WHERE u.rol = 'TECNICO' AND u.activo = TRUE
       GROUP BY u.id, u.nombre
       ORDER BY total DESC, u.nombre`)
  ]);

  return {
    resumen: resumen.rows[0],
    porEstado: porEstado.rows,
    porPrioridad: porPrioridad.rows,
    porCategoria: porCategoria.rows,
    porTecnico: porTecnico.rows
  };
}

module.exports = { obtenerIndicadores };
