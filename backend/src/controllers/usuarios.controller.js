const bcrypt = require('bcryptjs');
const usuarioModel = require('../models/usuario.model');
const { badRequest, notFound } = require('../utils/httpError');

async function listar(req, res) {
  res.json(await usuarioModel.listar(req.datos.query));
}

async function listarTecnicos(req, res) {
  res.json(await usuarioModel.listarTecnicosActivos());
}

async function crear(req, res) {
  const { nombre, email, password, rol } = req.datos.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await usuarioModel.crear({ nombre, email, passwordHash, rol });
  res.status(201).json(usuario);
}

async function cambiarEstado(req, res) {
  const { id } = req.datos.params;
  const { activo } = req.datos.body;
  if (id === req.usuario.id && !activo) {
    throw badRequest('No puedes desactivar tu propia cuenta');
  }
  const usuario = await usuarioModel.cambiarActivo(id, activo);
  if (!usuario) throw notFound('Usuario no encontrado');
  res.json(usuario);
}

module.exports = { listar, listarTecnicos, crear, cambiarEstado };
