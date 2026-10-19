import { useEffect, useState } from 'react'
import { catalogosApi, usuariosApi } from '../api/servicios'

/** Carga categorías y, si el rol lo permite, la lista de técnicos activos. */
export function useCatalogos({ conTecnicos = false } = {}) {
  const [catalogos, setCatalogos] = useState({ categorias: [], tecnicos: [] })
  const [error, setError] = useState(null)

  useEffect(() => {
    let activo = true
    Promise.all([catalogosApi.obtener(), conTecnicos ? usuariosApi.tecnicos() : Promise.resolve([])])
      .then(([datos, tecnicos]) => {
        if (activo) setCatalogos({ categorias: datos.categorias, tecnicos })
      })
      .catch((err) => activo && setError(err.message))
    return () => {
      activo = false
    }
  }, [conTecnicos])

  return { ...catalogos, error }
}
