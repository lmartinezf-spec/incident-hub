const incidenteModel = require('../models/incidente.model');
const bitacoraModel = require('../models/bitacora.model');
const usuarioModel = require('../models/usuario.model');
const { normalizarPaginacion } = require('../utils/filtros');
const {
  ESTADOS_ABIERTOS,
  puedeVerIncidente,
  evaluarCambioEstado,
  requiereComentario,
  accionesDisponibles
} = require('../utils/estados');
const { HttpError, badRequest, forbidden, notFound, conflict } = require('../utils/httpError');

const MENSAJE_CONCURRENCIA = 'El incidente fue modificado por otra persona. Recarga e intenta de nuevo.';

async function cargarVisible(id, usuario) {
  const incidente = await incidenteModel.obtenerPorId(id);
  if (!incidente) throw notFound('Incidente no encontrado');
  if (!puedeVerIncidente(incidente, usuario)) throw forbidden('No tienes acceso a este incidente');
  return incidente;
}

async function listar(req, res) {
  const { page, limit, ...filtros } = req.datos.query;
  const paginacion = normalizarPaginacion({ page, limit });
  const { datos, total } = await incidenteModel.listar(filtros, req.usuario, paginacion);
  res.json({
    datos,
    paginacion: {
      page: paginacion.page,
      limit: paginacion.limit,
      total,
      totalPaginas: Math.max(1, Math.ceil(total / paginacion.limit))
    }
  });
}

async function obtener(req, res) {
  const incidente = await cargarVisible(req.datos.params.id, req.usuario);
  res.json({ ...incidente, acciones: accionesDisponibles(incidente, req.usuario) });
}

async function crear(req, res) {
  const incidente = await incidenteModel.crear(req.datos.body, req.usuario.id);
  res.status(201).json(incidente);
}

async function asignar(req, res) {
  const { id } = req.datos.params;
  const { tecnicoId } = req.datos.body;

  const incidente = await incidenteModel.obtenerPorId(id);
  if (!incidente) throw notFound('Incidente no encontrado');
  if (!ESTADOS_ABIERTOS.includes(incidente.estado)) {
    throw conflict(`No se puede asignar un incidente en estado ${incidente.estado}`);
  }
  if (incidente.tecnico_id === tecnicoId) throw conflict('El incidente ya está asignado a ese técnico');

  const tecnico = await usuarioModel.obtenerPorId(tecnicoId);
  if (!tecnico || tecnico.rol !== 'TECNICO' || !tecnico.activo) {
    throw badRequest('El usuario indicado no es un técnico activo');
  }

  const estadoNuevo = incidente.estado === 'NUEVO' ? 'ASIGNADO' : incidente.estado;
  const detalle = incidente.tecnico_nombre
    ? `Reasignado de ${incidente.tecnico_nombre} a ${tecnico.nombre}`
    : `Asignado a ${tecnico.nombre}`;

  const actualizado = await incidenteModel.asignarTecnico({
    id,
    estadoActual: incidente.estado,
    estadoNuevo,
    tecnicoId,
    usuarioId: req.usuario.id,
    detalle
  });
  if (!actualizado) throw conflict(MENSAJE_CONCURRENCIA);
  res.json({ ...actualizado, acciones: accionesDisponibles(actualizado, req.usuario) });
}

async function cambiarEstado(req, res) {
  const { id } = req.datos.params;
  const { estado: estadoNuevo, comentario } = req.datos.body;

  const incidente = await cargarVisible(id, req.usuario);
  const evaluacion = evaluarCambioEstado(incidente, req.usuario, estadoNuevo);
  if (!evaluacion.permitido) throw new HttpError(evaluacion.status, evaluacion.motivo);

  if (requiereComentario(incidente.estado, estadoNuevo) && (!comentario || comentario.length < 5)) {
    throw badRequest('Debes describir la solución o el motivo (mínimo 5 caracteres)');
  }

  const actualizado = await incidenteModel.cambiarEstado({
    id,
    estadoActual: incidente.estado,
    estadoNuevo,
    usuarioId: req.usuario.id,
    comentario
  });
  if (!actualizado) throw conflict(MENSAJE_CONCURRENCIA);
  res.json({ ...actualizado, acciones: accionesDisponibles(actualizado, req.usuario) });
}

async function bitacora(req, res) {
  const incidente = await cargarVisible(req.datos.params.id, req.usuario);
  res.json(await bitacoraModel.listarPorIncidente(incidente.id));
}

async function comentar(req, res) {
  const incidente = await cargarVisible(req.datos.params.id, req.usuario);
  if (incidente.estado === 'CERRADO') throw conflict('No se puede comentar un incidente cerrado');
  const registro = await bitacoraModel.registrar({
    incidenteId: incidente.id,
    usuarioId: req.usuario.id,
    tipo: 'COMENTARIO',
    detalle: req.datos.body.texto
  });
  res.status(201).json(registro);
}

module.exports = { listar, obtener, crear, asignar, cambiarEstado, bitacora, comentar };
