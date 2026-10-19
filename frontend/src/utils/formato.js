export const ORDEN_ESTADOS = ['NUEVO', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO']
export const ORDEN_PRIORIDADES = ['CRITICA', 'ALTA', 'MEDIA', 'BAJA']

export const ETIQUETAS_ESTADO = {
  NUEVO: 'Nuevo',
  ASIGNADO: 'Asignado',
  EN_PROCESO: 'En proceso',
  RESUELTO: 'Resuelto',
  CERRADO: 'Cerrado',
}

export const ETIQUETAS_PRIORIDAD = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
}

export const ETIQUETAS_ROL = {
  ADMIN: 'Administrador',
  TECNICO: 'Técnico',
  USUARIO: 'Usuario',
}

export const ETIQUETAS_BITACORA = {
  CREACION: 'Registro',
  COMENTARIO: 'Comentario',
  ASIGNACION: 'Asignación',
  CAMBIO_ESTADO: 'Cambio de estado',
}

export function codigoIncidente(id) {
  return `INC-${String(id).padStart(4, '0')}`
}

export function formatearFecha(valor) {
  if (!valor) return '—'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return '—'
  return new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium', timeStyle: 'short' }).format(fecha)
}

export function tiempoRelativo(valor, ahora = new Date()) {
  if (!valor) return '—'
  const minutos = Math.round((ahora.getTime() - new Date(valor).getTime()) / 60000)
  if (minutos < 1) return 'hace un momento'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.floor(horas / 24)
  return dias === 1 ? 'hace 1 día' : `hace ${dias} días`
}

/** Convierte un objeto de filtros en query string, omitiendo valores vacíos. */
export function construirQuery(filtros = {}) {
  const params = new URLSearchParams()
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor === undefined || valor === null || valor === '' || valor === false) continue
    params.set(clave, String(valor))
  }
  const texto = params.toString()
  return texto ? `?${texto}` : ''
}

/** Texto del botón para cada transición disponible. */
export function etiquetaTransicion(estadoActual, estadoDestino) {
  if (estadoDestino === 'EN_PROCESO') {
    return estadoActual === 'RESUELTO' ? 'Reabrir incidente' : 'Iniciar atención'
  }
  if (estadoDestino === 'RESUELTO') return 'Marcar como resuelto'
  if (estadoDestino === 'CERRADO') return 'Confirmar y cerrar'
  return ETIQUETAS_ESTADO[estadoDestino] || estadoDestino
}

/** El backend exige comentario al resolver y al reabrir; la interfaz pide el texto antes de enviar. */
export function requiereComentario(estadoActual, estadoDestino) {
  return estadoDestino === 'RESUELTO' || (estadoActual === 'RESUELTO' && estadoDestino === 'EN_PROCESO')
}

export function porcentaje(valor, total) {
  if (!total) return 0
  return Math.round((valor / total) * 100)
}

/** Ordena filas según un orden fijo y completa con 0 las categorías ausentes. */
export function completarSerie(filas, clave, orden) {
  const mapa = new Map(filas.map((fila) => [fila[clave], fila.total]))
  return orden.map((valor) => ({ [clave]: valor, total: mapa.get(valor) || 0 }))
}
