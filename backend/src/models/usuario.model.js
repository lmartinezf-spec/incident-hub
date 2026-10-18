const { query } = require('../config/db');

const CAMPOS_PUBLICOS = 'id, nombre, email, rol, activo, creado_en';

async function buscarPorEmail(email) {
  const { rows } = await query(`SELECT ${CAMPOS_PUBLICOS}, password_hash FROM usuarios WHERE email = $1`, [
    email
  ]);
  return rows[0] || null;
}

async function obtenerPorId(id) {
  const { rows } = await query(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function listar({ rol } = {}) {
  const params = [];
  let where = '';
  if (rol) {
    params.push(rol);
    where = 'WHERE rol = $1';
  }
  const { rows } = await query(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios ${where} ORDER BY nombre`, params);
  return rows;
}

async function listarTecnicosActivos() {
  const { rows } = await query(
    `SELECT id, nombre, email FROM usuarios WHERE rol = 'TECNICO' AND activo = TRUE ORDER BY nombre`
  );
  return rows;
}

async function crear({ nombre, email, passwordHash, rol }) {
  const { rows } = await query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol)
     VALUES ($1, $2, $3, $4)
     RETURNING ${CAMPOS_PUBLICOS}`,
    [nombre, email, passwordHash, rol]
  );
  return rows[0];
}

async function cambiarActivo(id, activo) {
  const { rows } = await query(
    `UPDATE usuarios SET activo = $2 WHERE id = $1 RETURNING ${CAMPOS_PUBLICOS}`,
    [id, activo]
  );
  return rows[0] || null;
}

module.exports = { buscarPorEmail, obtenerPorId, listar, listarTecnicosActivos, crear, cambiarActivo };
