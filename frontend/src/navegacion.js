export const ENLACES = [
  { ruta: '/dashboard', texto: 'Dashboard', icono: 'grafica', roles: ['ADMIN', 'TECNICO'] },
  { ruta: '/incidentes', texto: 'Incidentes', icono: 'lista', roles: ['ADMIN', 'TECNICO', 'USUARIO'], exacta: true },
  { ruta: '/incidentes/nuevo', texto: 'Reportar incidente', icono: 'mas', roles: ['ADMIN', 'TECNICO', 'USUARIO'] },
  { ruta: '/usuarios', texto: 'Usuarios', icono: 'usuarios', roles: ['ADMIN'] },
]

export function rutaInicial(rol) {
  return rol === 'USUARIO' ? '/incidentes' : '/dashboard'
}
