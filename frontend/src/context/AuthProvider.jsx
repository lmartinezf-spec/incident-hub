import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './auth-context'
import { authApi } from '../api/servicios'
import { borrarToken, guardarToken, obtenerToken, registrarExpiracion } from '../api/client'

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(() => Boolean(obtenerToken()))

  const cerrarSesion = useCallback(() => {
    borrarToken()
    setUsuario(null)
  }, [])

  useEffect(() => {
    registrarExpiracion(cerrarSesion)
    if (!obtenerToken()) return
    authApi
      .perfil()
      .then(setUsuario)
      .catch(() => borrarToken())
      .finally(() => setCargando(false))
  }, [cerrarSesion])

  const iniciarSesion = useCallback(async (email, password) => {
    const { token, usuario: datos } = await authApi.login(email, password)
    guardarToken(token)
    setUsuario(datos)
    return datos
  }, [])

  const valor = useMemo(
    () => ({ usuario, cargando, iniciarSesion, cerrarSesion }),
    [usuario, cargando, iniciarSesion, cerrarSesion],
  )

  return <AuthContext value={valor}>{children}</AuthContext>
}
