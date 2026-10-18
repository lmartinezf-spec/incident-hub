const bcrypt = require('bcryptjs');
const usuarioModel = require('../models/usuario.model');
const { firmarToken } = require('../middleware/auth');
const { unauthorized } = require('../utils/httpError');

// Hash de relleno: si el correo no existe se compara igual, para no revelar
// por diferencia de tiempo qué correos están registrados.
const HASH_RELLENO = bcrypt.hashSync('relleno-no-valido', 10);

async function login(req, res) {
  const { email, password } = req.datos.body;
  const usuario = await usuarioModel.buscarPorEmail(email);
  const coincide = await bcrypt.compare(password, usuario ? usuario.password_hash : HASH_RELLENO);

  if (!usuario || !coincide || !usuario.activo) {
    throw unauthorized('Credenciales inválidas');
  }

  const { password_hash: _omitido, ...publico } = usuario;
  res.json({ token: firmarToken(publico), usuario: publico });
}

async function perfil(req, res) {
  const usuario = await usuarioModel.obtenerPorId(req.usuario.id);
  if (!usuario || !usuario.activo) throw unauthorized('La cuenta no existe o está desactivada');
  res.json(usuario);
}

module.exports = { login, perfil };
