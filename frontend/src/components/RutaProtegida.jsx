import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { rutaInicial } from '../navegacion'
import { Cargando } from './Estados'

export function RutaProtegida({ roles }) {
  const { usuario, cargando } = useAuth()
  const ubicacion = useLocation()

  if (cargando) return <Cargando texto="Verificando sesión..." />
  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  if (roles && !roles.includes(usuario.rol)) return <Navigate to={rutaInicial(usuario.rol)} replace />
  return <Outlet />
}
