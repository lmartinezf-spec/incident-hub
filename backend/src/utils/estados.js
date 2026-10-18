const ROLES = Object.freeze(['ADMIN', 'TECNICO', 'USUARIO']);
const PRIORIDADES = Object.freeze(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']);
const ESTADOS = Object.freeze(['NUEVO', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO']);
const ESTADOS_ABIERTOS = Object.freeze(['NUEVO', 'ASIGNADO', 'EN_PROCESO']);

// Flujo de vida del incidente. ASIGNADO solo se alcanza con la acción "asignar técnico".
const TRANSICIONES = Object.freeze({
  NUEVO: ['ASIGNADO'],
  ASIGNADO: ['EN_PROCESO'],
  EN_PROCESO: ['RESUELTO'],
  RESUELTO: ['CERRADO', 'EN_PROCESO'],
  CERRADO: []
});

function esTransicionValida(estadoActual, estadoNuevo) {
  return (TRANSICIONES[estadoActual] || []).includes(estadoNuevo);
}

function esTecnicoAsignado(incidente, usuario) {
  return usuario.rol === 'TECNICO' && incidente.tecnico_id === usuario.id;
}

function puedeVerIncidente(incidente, usuario) {
  if (usuario.rol === 'ADMIN') return true;
  if (incidente.reportado_por === usuario.id) return true;
  return esTecnicoAsignado(incidente, usuario);
}

/**
 * Evalúa si el usuario puede mover el incidente al estado indicado.
 * Devuelve { permitido, status, motivo } para que el controlador responda con el código correcto.
 */
function evaluarCambioEstado(incidente, usuario, estadoNuevo) {
  if (!ESTADOS.includes(estadoNuevo)) {
    return { permitido: false, status: 400, motivo: `Estado desconocido: ${estadoNuevo}` };
  }
  if (estadoNuevo === 'ASIGNADO') {
    return { permitido: false, status: 409, motivo: 'Para pasar a ASIGNADO utiliza la acción de asignar técnico' };
  }
  if (!esTransicionValida(incidente.estado, estadoNuevo)) {
    return {
      permitido: false,
      status: 409,
      motivo: `Transición no permitida: ${incidente.estado} → ${estadoNuevo}`
    };
  }

  const esAdmin = usuario.rol === 'ADMIN';
  const esReportante = incidente.reportado_por === usuario.id;
  const esTecnico = esTecnicoAsignado(incidente, usuario);
  const esReapertura = incidente.estado === 'RESUELTO' && estadoNuevo === 'EN_PROCESO';

  let permitido;
  if (estadoNuevo === 'CERRADO' || esReapertura) {
    permitido = esAdmin || esReportante;
  } else {
    permitido = esAdmin || esTecnico;
  }

  return permitido
    ? { permitido: true, status: 200, motivo: null }
    : { permitido: false, status: 403, motivo: 'No tienes permiso para realizar este cambio de estado' };
}

function requiereComentario(estadoActual, estadoNuevo) {
  return estadoNuevo === 'RESUELTO' || (estadoActual === 'RESUELTO' && estadoNuevo === 'EN_PROCESO');
}

/** Acciones que la interfaz debe mostrar al usuario para un incidente. */
function accionesDisponibles(incidente, usuario) {
  const estados = (TRANSICIONES[incidente.estado] || []).filter(
    (destino) => evaluarCambioEstado(incidente, usuario, destino).permitido
  );
  return {
    asignar: usuario.rol === 'ADMIN' && ESTADOS_ABIERTOS.includes(incidente.estado),
    comentar: incidente.estado !== 'CERRADO' && puedeVerIncidente(incidente, usuario),
    estados
  };
}

module.exports = {
  ROLES,
  PRIORIDADES,
  ESTADOS,
  ESTADOS_ABIERTOS,
  TRANSICIONES,
  esTransicionValida,
  puedeVerIncidente,
  evaluarCambioEstado,
  requiereComentario,
  accionesDisponibles
};
