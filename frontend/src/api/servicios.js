import { solicitar } from './client'
import { construirQuery } from '../utils/formato'

export const authApi = {
  login: (email, password) => solicitar('/auth/login', { metodo: 'POST', cuerpo: { email, password } }),
  perfil: () => solicitar('/auth/me'),
}

export const catalogosApi = {
  obtener: () => solicitar('/catalogos'),
}

export const incidentesApi = {
  listar: (filtros) => solicitar(`/incidentes${construirQuery(filtros)}`),
  obtener: (id) => solicitar(`/incidentes/${id}`),
  crear: (datos) => solicitar('/incidentes', { metodo: 'POST', cuerpo: datos }),
  asignar: (id, tecnicoId) =>
    solicitar(`/incidentes/${id}/asignar`, { metodo: 'PATCH', cuerpo: { tecnicoId } }),
  cambiarEstado: (id, estado, comentario) =>
    solicitar(`/incidentes/${id}/estado`, { metodo: 'PATCH', cuerpo: { estado, comentario } }),
  bitacora: (id) => solicitar(`/incidentes/${id}/bitacora`),
  comentar: (id, texto) => solicitar(`/incidentes/${id}/comentarios`, { metodo: 'POST', cuerpo: { texto } }),
}

export const usuariosApi = {
  listar: (filtros) => solicitar(`/usuarios${construirQuery(filtros)}`),
  tecnicos: () => solicitar('/usuarios/tecnicos'),
  crear: (datos) => solicitar('/usuarios', { metodo: 'POST', cuerpo: datos }),
  cambiarEstado: (id, activo) => solicitar(`/usuarios/${id}/estado`, { metodo: 'PATCH', cuerpo: { activo } }),
}

export const dashboardApi = {
  obtener: () => solicitar('/dashboard'),
}
