export const ENLACES = [
  { ruta: '/incidentes', texto: 'Incidentes', icono: 'lista', roles: ['ADMIN', 'TECNICO', 'USUARIO'], exacta: true },
  { ruta: '/incidentes/nuevo', texto: 'Reportar incidente', icono: 'mas', roles: ['ADMIN', 'TECNICO', 'USUARIO'] },
  { ruta: '/usuarios', texto: 'Usuarios', icono: 'usuarios', roles: ['ADMIN'] },
]

export function rutaInicial() {
  return '/incidentes'
}