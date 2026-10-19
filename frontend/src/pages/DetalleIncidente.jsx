import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { incidentesApi } from '../api/servicios'
import { useAuth } from '../hooks/useAuth'
import { useCatalogos } from '../hooks/useCatalogos'
import { Icono } from '../components/Icono'
import { InsigniaEstado, InsigniaPrioridad } from '../components/Insignias'
import { Cargando, MensajeError } from '../components/Estados'
import {
  ETIQUETAS_BITACORA,
  codigoIncidente,
  etiquetaTransicion,
  formatearFecha,
  requiereComentario,
  tiempoRelativo,
} from '../utils/formato'

function obtenerDatos(id) {
  return Promise.all([incidentesApi.obtener(id), incidentesApi.bitacora(id)])
}

export default function DetalleIncidente() {
  const { id } = useParams()
  const ubicacion = useLocation()
  const { usuario } = useAuth()
  const { tecnicos } = useCatalogos({ conTecnicos: usuario.rol === 'ADMIN' })

  const [incidente, setIncidente] = useState(null)
  const [bitacora, setBitacora] = useState([])
  const [error, setError] = useState(null)
  const [errorAccion, setErrorAccion] = useState(null)
  const [ocupado, setOcupado] = useState(false)
  const [tecnicoId, setTecnicoId] = useState('')
  const [transicion, setTransicion] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [comentario, setComentario] = useState('')

  useEffect(() => {
    let activo = true
    obtenerDatos(id)
      .then(([datos, eventos]) => {
        if (!activo) return
        setIncidente(datos)
        setBitacora(eventos)
        setError(null)
      })
      .catch((err) => activo && setError(err.message))
    return () => {
      activo = false
    }
  }, [id])

  async function recargar() {
    const [datos, eventos] = await obtenerDatos(id)
    setIncidente(datos)
    setBitacora(eventos)
  }

  async function ejecutar(accion) {
    setErrorAccion(null)
    setOcupado(true)
    try {
      await accion()
      await recargar()
      return true
    } catch (err) {
      setErrorAccion({ mensaje: err.message, detalles: err.detalles })
      return false
    } finally {
      setOcupado(false)
    }
  }

  async function asignar(evento) {
    evento.preventDefault()
    if (!tecnicoId) return
    const ok = await ejecutar(() => incidentesApi.asignar(id, Number(tecnicoId)))
    if (ok) setTecnicoId('')
  }

  async function cambiarEstado(destino) {
    if (requiereComentario(incidente.estado, destino) && transicion !== destino) {
      setTransicion(destino)
      setMotivo('')
      return
    }
    const ok = await ejecutar(() => incidentesApi.cambiarEstado(id, destino, motivo.trim() || undefined))
    if (ok) {
      setTransicion(null)
      setMotivo('')
    }
  }

  async function comentar(evento) {
    evento.preventDefault()
    const ok = await ejecutar(() => incidentesApi.comentar(id, comentario.trim()))
    if (ok) setComentario('')
  }

  if (error) {
    return (
      <section>
        <Link to="/incidentes" className="volver"><Icono nombre="flecha" tamano={16} /> Incidentes</Link>
        <MensajeError mensaje={error} />
      </section>
    )
  }
  if (!incidente) return <Cargando />

  const { acciones } = incidente
  const tecnicosDisponibles = tecnicos.filter((t) => t.id !== incidente.tecnico_id)
  const hayAcciones = acciones.asignar || acciones.estados.length > 0

  return (
    <section>
      <Link to="/incidentes" className="volver"><Icono nombre="flecha" tamano={16} /> Incidentes</Link>

      {ubicacion.state?.creado && (
        <div className="alerta alerta-exito" role="status">
          Incidente {ubicacion.state.creado} registrado. El equipo de TI lo revisará en breve.
        </div>
      )}

      <header className="encabezado-pagina encabezado-detalle">
        <div>
          <p className="codigo">{codigoIncidente(incidente.id)}</p>
          <h1>{incidente.titulo}</h1>
          <div className="fila-insignias">
            <InsigniaEstado estado={incidente.estado} />
            <InsigniaPrioridad prioridad={incidente.prioridad} />
            <span className="texto-suave">{incidente.categoria}</span>
          </div>
        </div>
      </header>

      <div className="detalle">
        <div className="detalle-principal">
          <article className="tarjeta">
            <h2 className="tarjeta-titulo">Descripción</h2>
            <p className="descripcion">{incidente.descripcion}</p>
          </article>

          <article className="tarjeta">
            <h2 className="tarjeta-titulo">Bitácora</h2>
            <ol className="linea-tiempo">
              {bitacora.map((evento) => (
                <li key={evento.id} className={`evento evento-${evento.tipo.toLowerCase()}`}>
                  <span className="evento-marca" aria-hidden="true" />
                  <div>
                    <p className="evento-cabecera">
                      <strong>{evento.usuario_nombre}</strong>
                      <span className="texto-suave">· {ETIQUETAS_BITACORA[evento.tipo]}</span>
                      <time className="texto-suave" dateTime={evento.creado_en} title={formatearFecha(evento.creado_en)}>
                        {tiempoRelativo(evento.creado_en)}
                      </time>
                    </p>
                    <p className="evento-detalle">{evento.detalle}</p>
                  </div>
                </li>
              ))}
            </ol>

            {acciones.comentar && (
              <form onSubmit={comentar} className="formulario formulario-comentario">
                <label>
                  Agregar comentario
                  <textarea
                    rows={3}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Información adicional, avances o preguntas"
                  />
                </label>
                <div className="acciones-formulario">
                  <button type="submit" className="boton boton-secundario" disabled={ocupado || comentario.trim().length < 2}>
                    Comentar
                  </button>
                </div>
              </form>
            )}
          </article>
        </div>

        <aside className="detalle-lateral">
          {hayAcciones && (
            <article className="tarjeta">
              <h2 className="tarjeta-titulo">Acciones</h2>
              <MensajeError mensaje={errorAccion?.mensaje} detalles={errorAccion?.detalles} />

              {acciones.asignar && (
                <form onSubmit={asignar} className="formulario formulario-compacto">
                  <label>
                    {incidente.tecnico_id ? 'Reasignar técnico' : 'Asignar técnico'}
                    <select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)}>
                      <option value="">Selecciona un técnico</option>
                      {tecnicosDisponibles.map((t) => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="boton boton-primario boton-bloque" disabled={!tecnicoId || ocupado}>
                    {incidente.tecnico_id ? 'Reasignar' : 'Asignar'}
                  </button>
                </form>
              )}

              {acciones.estados.map((destino) => (
                <div key={destino} className="accion-estado">
                  {transicion === destino && (
                    <label>
                      {destino === 'RESUELTO' ? 'Describe la solución aplicada' : 'Motivo de la reapertura'}
                      <textarea rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} autoFocus />
                    </label>
                  )}
                  <button
                    type="button"
                    className={`boton boton-bloque ${destino === 'CERRADO' || destino === 'RESUELTO' ? 'boton-exito' : 'boton-secundario'}`}
                    disabled={ocupado || (transicion === destino && motivo.trim().length < 5)}
                    onClick={() => cambiarEstado(destino)}
                  >
                    {transicion === destino ? 'Confirmar' : etiquetaTransicion(incidente.estado, destino)}
                  </button>
                  {transicion === destino && (
                    <button type="button" className="boton boton-texto boton-bloque" onClick={() => setTransicion(null)}>
                      Cancelar
                    </button>
                  )}
                </div>
              ))}
            </article>
          )}

          <article className="tarjeta">
            <h2 className="tarjeta-titulo">Detalles</h2>
            <dl className="datos">
              <dt>Reportado por</dt>
              <dd>{incidente.reportado_por_nombre}</dd>
              <dt>Técnico</dt>
              <dd>{incidente.tecnico_nombre || <span className="texto-suave">Sin asignar</span>}</dd>
              <dt>Categoría</dt>
              <dd>{incidente.categoria}</dd>
              <dt>Creado</dt>
              <dd>{formatearFecha(incidente.creado_en)}</dd>
              <dt>Última actualización</dt>
              <dd>{formatearFecha(incidente.actualizado_en)}</dd>
              {incidente.resuelto_en && (
                <>
                  <dt>Resuelto</dt>
                  <dd>{formatearFecha(incidente.resuelto_en)}</dd>
                </>
              )}
              {incidente.cerrado_en && (
                <>
                  <dt>Cerrado</dt>
                  <dd>{formatearFecha(incidente.cerrado_en)}</dd>
                </>
              )}
            </dl>
          </article>
        </aside>
      </div>
    </section>
  )
}
