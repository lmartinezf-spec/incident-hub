import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { incidentesApi } from '../api/servicios'
import { useAuth } from '../hooks/useAuth'
import { useCatalogos } from '../hooks/useCatalogos'
import { Icono } from '../components/Icono'
import { InsigniaEstado, InsigniaPrioridad } from '../components/Insignias'
import { Cargando, MensajeError, Vacio } from '../components/Estados'
import { Paginacion } from '../components/Paginacion'
import {
  ETIQUETAS_ESTADO,
  ETIQUETAS_PRIORIDAD,
  ORDEN_ESTADOS,
  ORDEN_PRIORIDADES,
  codigoIncidente,
  formatearFecha,
  tiempoRelativo,
} from '../utils/formato'

const FILTROS = ['q', 'estado', 'prioridad', 'categoriaId', 'tecnicoId', 'sinAsignar', 'page']

export default function Incidentes() {
  const { usuario } = useAuth()
  const navegar = useNavigate()
  const [params, setParams] = useSearchParams()
  const puedeFiltrarTecnico = usuario.rol === 'ADMIN'
  const { categorias, tecnicos } = useCatalogos({ conTecnicos: puedeFiltrarTecnico })

  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState(params.get('q') || '')
  const consulta = params.toString()

  useEffect(() => {
    let activo = true
    const filtros = Object.fromEntries(new URLSearchParams(consulta))
    incidentesApi
      .listar({ ...filtros, limit: 10 })
      .then((datos) => {
        if (!activo) return
        setResultado(datos)
        setError(null)
      })
      .catch((err) => activo && setError(err.message))
    return () => {
      activo = false
    }
  }, [consulta])

  function cambiarFiltro(clave, valor) {
    const siguiente = new URLSearchParams(params)
    if (valor) siguiente.set(clave, valor)
    else siguiente.delete(clave)
    if (clave !== 'page') siguiente.delete('page')
    setParams(siguiente)
  }

  function cambiarTecnico(valor) {
    const siguiente = new URLSearchParams(params)
    siguiente.delete('tecnicoId')
    siguiente.delete('sinAsignar')
    siguiente.delete('page')
    if (valor === 'sin') siguiente.set('sinAsignar', 'true')
    else if (valor) siguiente.set('tecnicoId', valor)
    setParams(siguiente)
  }

  function buscar(evento) {
    evento.preventDefault()
    cambiarFiltro('q', busqueda.trim())
  }

  function limpiar() {
    setBusqueda('')
    setParams(new URLSearchParams())
  }

  const hayFiltros = FILTROS.some((clave) => clave !== 'page' && params.get(clave))
  const valorTecnico = params.get('sinAsignar') ? 'sin' : params.get('tecnicoId') || ''

  return (
    <section>
      <header className="encabezado-pagina">
        <div>
          <h1>Incidentes</h1>
          <p className="texto-suave">
            {usuario.rol === 'USUARIO'
              ? 'Incidentes que has reportado.'
              : usuario.rol === 'TECNICO'
                ? 'Incidentes asignados a ti o reportados por ti.'
                : 'Todos los incidentes registrados.'}
          </p>
        </div>
        <Link to="/incidentes/nuevo" className="boton boton-primario">
          <Icono nombre="mas" /> Reportar incidente
        </Link>
      </header>

      <div className="tarjeta filtros">
        <form onSubmit={buscar} className="filtro-busqueda">
          <Icono nombre="buscar" />
          <input
            type="search"
            placeholder="Buscar por título o descripción"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar incidentes"
          />
        </form>
        <select value={params.get('estado') || ''} onChange={(e) => cambiarFiltro('estado', e.target.value)} aria-label="Estado">
          <option value="">Todos los estados</option>
          {ORDEN_ESTADOS.map((estado) => (
            <option key={estado} value={estado}>{ETIQUETAS_ESTADO[estado]}</option>
          ))}
        </select>
        <select value={params.get('prioridad') || ''} onChange={(e) => cambiarFiltro('prioridad', e.target.value)} aria-label="Prioridad">
          <option value="">Todas las prioridades</option>
          {ORDEN_PRIORIDADES.map((prioridad) => (
            <option key={prioridad} value={prioridad}>{ETIQUETAS_PRIORIDAD[prioridad]}</option>
          ))}
        </select>
        <select value={params.get('categoriaId') || ''} onChange={(e) => cambiarFiltro('categoriaId', e.target.value)} aria-label="Categoría">
          <option value="">Todas las categorías</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
          ))}
        </select>
        {puedeFiltrarTecnico && (
          <select value={valorTecnico} onChange={(e) => cambiarTecnico(e.target.value)} aria-label="Técnico">
            <option value="">Todos los técnicos</option>
            <option value="sin">Sin asignar</option>
            {tecnicos.map((tecnico) => (
              <option key={tecnico.id} value={tecnico.id}>{tecnico.nombre}</option>
            ))}
          </select>
        )}
        {hayFiltros && (
          <button type="button" className="boton boton-texto" onClick={limpiar}>
            Limpiar filtros
          </button>
        )}
      </div>

      <MensajeError mensaje={error} />
      {!resultado && !error && <Cargando />}

      {resultado && resultado.datos.length === 0 && (
        <Vacio titulo={hayFiltros ? 'Ningún incidente coincide con los filtros.' : 'Aún no hay incidentes.'}>
          {hayFiltros ? (
            <button type="button" className="boton boton-secundario" onClick={limpiar}>Limpiar filtros</button>
          ) : (
            <Link to="/incidentes/nuevo" className="boton boton-primario">Reportar el primero</Link>
          )}
        </Vacio>
      )}

      {resultado && resultado.datos.length > 0 && (
        <div className="tarjeta tabla-contenedor">
          <table className="tabla tabla-clicable">
            <thead>
              <tr>
                <th>Código</th>
                <th>Incidente</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Técnico</th>
                <th>Reportado</th>
              </tr>
            </thead>
            <tbody>
              {resultado.datos.map((incidente) => (
                <tr key={incidente.id} onClick={() => navegar(`/incidentes/${incidente.id}`)}>
                  <td className="codigo">
                    <Link to={`/incidentes/${incidente.id}`} onClick={(e) => e.stopPropagation()}>
                      {codigoIncidente(incidente.id)}
                    </Link>
                  </td>
                  <td>
                    <span className="celda-titulo">{incidente.titulo}</span>
                    <small className="texto-suave">{incidente.categoria}</small>
                  </td>
                  <td><InsigniaPrioridad prioridad={incidente.prioridad} /></td>
                  <td><InsigniaEstado estado={incidente.estado} /></td>
                  <td>{incidente.tecnico_nombre || <span className="texto-suave">Sin asignar</span>}</td>
                  <td title={formatearFecha(incidente.creado_en)}>
                    <span>{tiempoRelativo(incidente.creado_en)}</span>
                    <small className="texto-suave">{incidente.reportado_por_nombre}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Paginacion
            pagina={resultado.paginacion.page}
            totalPaginas={resultado.paginacion.totalPaginas}
            total={resultado.paginacion.total}
            onCambiar={(pagina) => cambiarFiltro('page', String(pagina))}
          />
        </div>
      )}
    </section>
  )
}
