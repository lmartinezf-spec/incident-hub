import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { dashboardApi } from '../api/servicios'
import { Cargando, MensajeError } from '../components/Estados'
import { GraficaBarras, GraficaTecnicos } from '../components/GraficaBarras'
import { Icono } from '../components/Icono'
import {
  ETIQUETAS_ESTADO,
  ETIQUETAS_PRIORIDAD,
  ORDEN_ESTADOS,
  ORDEN_PRIORIDADES,
  completarSerie,
} from '../utils/formato'

function Indicador({ titulo, valor, detalle, tono, onClick }) {
  return (
    <button type="button" className={`indicador ${tono ? `indicador-${tono}` : ''}`} onClick={onClick} disabled={!onClick}>
      <span className="indicador-titulo">{titulo}</span>
      <span className="indicador-valor">{valor}</span>
      {detalle && <span className="indicador-detalle">{detalle}</span>}
    </button>
  )
}

export default function Dashboard() {
  const navegar = useNavigate()
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    dashboardApi.obtener().then(setDatos).catch((err) => setError(err.message))
  }, [])

  if (error) return <MensajeError mensaje={error} />
  if (!datos) return <Cargando />

  const { resumen } = datos
  const filtrar = (consulta) => navegar(`/incidentes?${consulta}`)

  const porEstado = completarSerie(datos.porEstado, 'estado', ORDEN_ESTADOS).map((fila) => ({
    clave: fila.estado,
    etiqueta: ETIQUETAS_ESTADO[fila.estado],
    valor: fila.total,
  }))
  const porPrioridad = completarSerie(datos.porPrioridad, 'prioridad', ORDEN_PRIORIDADES).map((fila) => ({
    clave: fila.prioridad,
    etiqueta: ETIQUETAS_PRIORIDAD[fila.prioridad],
    valor: fila.total,
  }))
  const porCategoria = datos.porCategoria.map((fila) => ({
    clave: fila.categoria,
    etiqueta: fila.categoria,
    valor: fila.total,
  }))

  return (
    <section>
      <header className="encabezado-pagina">
        <div>
          <h1>Dashboard</h1>
          <p className="texto-suave">Estado general de la mesa de servicio · {resumen.total} incidentes registrados</p>
        </div>
      </header>

      <div className="indicadores">
        <Indicador titulo="Abiertos" valor={resumen.abiertos} detalle="Nuevos, asignados, en proceso" />
        <Indicador
          titulo="Críticos abiertos"
          valor={resumen.criticos}
          detalle="Requieren atención inmediata"
          tono={resumen.criticos > 0 ? 'critico' : undefined}
          onClick={() => filtrar('prioridad=CRITICA')}
        />
        <Indicador
          titulo="Sin asignar"
          valor={resumen.sin_asignar}
          detalle="Esperando técnico"
          onClick={() => filtrar('estado=NUEVO')}
        />
        <Indicador
          titulo="Resueltos"
          valor={resumen.resueltos}
          detalle="Pendientes de confirmación"
          onClick={() => filtrar('estado=RESUELTO')}
        />
        <Indicador titulo="Cerrados" valor={resumen.cerrados} onClick={() => filtrar('estado=CERRADO')} />
        <Indicador
          titulo="Tiempo prom. de resolución"
          valor={resumen.horas_promedio_resolucion === null ? '—' : `${resumen.horas_promedio_resolucion} h`}
          detalle="Del registro a resuelto"
        />
      </div>

      <div className="graficas">
        <div className="tarjeta">
          <GraficaBarras
            titulo="Incidentes por estado"
            filas={porEstado}
            onSeleccionar={(fila) => filtrar(`estado=${fila.clave}`)}
          />
        </div>
        <div className="tarjeta">
          <GraficaBarras
            titulo="Incidentes por prioridad"
            filas={porPrioridad}
            onSeleccionar={(fila) => filtrar(`prioridad=${fila.clave}`)}
          />
        </div>
        <div className="tarjeta">
          <GraficaBarras titulo="Incidentes por categoría" filas={porCategoria} />
        </div>
        <div className="tarjeta">
          <GraficaTecnicos titulo="Carga por técnico" filas={datos.porTecnico} />
        </div>
      </div>

      <p className="nota texto-suave">
        <Icono nombre="grafica" tamano={14} /> Selecciona un indicador o una barra para ver los incidentes correspondientes.
      </p>
    </section>
  )
}
