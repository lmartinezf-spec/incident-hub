const BASE = '/api'
const CLAVE_TOKEN = 'incident-hub.token'

let alExpirarSesion = null

export class ErrorApi extends Error {
  constructor(status, mensaje, detalles) {
    super(mensaje)
    this.status = status
    this.detalles = detalles
  }
}

export function registrarExpiracion(callback) {
  alExpirarSesion = callback
}

// TD-03 (documentada): el token vive en localStorage; ver docs/deuda-tecnica.md.
export function obtenerToken() {
  try {
    return localStorage.getItem(CLAVE_TOKEN)
  } catch {
    return null
  }
}

export function guardarToken(token) {
  try {
    localStorage.setItem(CLAVE_TOKEN, token)
  } catch {
    /* almacenamiento no disponible: la sesión dura lo que la pestaña */
  }
}

export function borrarToken() {
  try {
    localStorage.removeItem(CLAVE_TOKEN)
  } catch {
    /* sin acción */
  }
}

export async function solicitar(ruta, { metodo = 'GET', cuerpo } = {}) {
  const encabezados = { Accept: 'application/json' }
  const token = obtenerToken()
  if (token) encabezados.Authorization = `Bearer ${token}`
  if (cuerpo !== undefined) encabezados['Content-Type'] = 'application/json'

  let respuesta
  try {
    respuesta = await fetch(`${BASE}${ruta}`, {
      method: metodo,
      headers: encabezados,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    })
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor. Verifica que la API esté en ejecución.')
  }

  const datos = respuesta.status === 204 ? null : await respuesta.json().catch(() => null)

  if (!respuesta.ok) {
    if (respuesta.status === 401 && ruta !== '/auth/login' && alExpirarSesion) alExpirarSesion()
    throw new ErrorApi(respuesta.status, datos?.error || `Error ${respuesta.status}`, datos?.detalles)
  }
  return datos
}
