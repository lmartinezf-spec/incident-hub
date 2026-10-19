import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { incidentesApi } from '../api/servicios'
import { useCatalogos } from '../hooks/useCatalogos'
import { Icono } from '../components/Icono'
import { MensajeError } from '../components/Estados'
import { ETIQUETAS_PRIORIDAD, codigoIncidente } from '../utils/formato'

const PRIORIDADES = [
  { valor: 'BAJA', ayuda: 'Molestia menor, hay alternativa' },
  { valor: 'MEDIA', ayuda: 'Afecta el trabajo de una persona' },
  { valor: 'ALTA', ayuda: 'Afecta a un área o un proceso clave' },
  { valor: 'CRITICA', ayuda: 'Operación detenida o riesgo de seguridad' },
]

export default function NuevoIncidente() {
  const navegar = useNavigate()
  const { categorias, error: errorCatalogos } = useCatalogos()
  const [form, setForm] = useState({ titulo: '', descripcion: '', categoriaId: '', prioridad: 'MEDIA' })
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const actualizar = (campo, valor) => setForm({ ...form, [campo]: valor })

  async function enviar(evento) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const incidente = await incidentesApi.crear({
        ...form,
        categoriaId: form.categoriaId ? Number(form.categoriaId) : undefined,
      })
      navegar(`/incidentes/${incidente.id}`, { state: { creado: codigoIncidente(incidente.id) } })
    } catch (err) {
      setError({ mensaje: err.message, detalles: err.detalles })
      setEnviando(false)
    }
  }

  return (
    <section className="pagina-angosta">
      <Link to="/incidentes" className="volver">
        <Icono nombre="flecha" tamano={16} /> Incidentes
      </Link>
      <header className="encabezado-pagina">
        <div>
          <h1>Reportar incidente</h1>
          <p className="texto-suave">Describe el problema con el mayor detalle posible para atenderlo más rápido.</p>
        </div>
      </header>

      <form onSubmit={enviar} className="tarjeta formulario" noValidate>
        <MensajeError mensaje={error?.mensaje || errorCatalogos} detalles={error?.detalles} />

        <label>
          Título
          <input
            value={form.titulo}
            onChange={(e) => actualizar('titulo', e.target.value)}
            maxLength={150}
            placeholder="Ej.: No enciende la impresora de contabilidad"
            required
          />
        </label>

        <label>
          Descripción
          <textarea
            rows={5}
            value={form.descripcion}
            onChange={(e) => actualizar('descripcion', e.target.value)}
            placeholder="¿Qué ocurre? ¿Desde cuándo? ¿A quiénes afecta? ¿Aparece algún mensaje de error?"
            required
          />
        </label>

        <label>
          Categoría
          <select value={form.categoriaId} onChange={(e) => actualizar('categoriaId', e.target.value)} required>
            <option value="">Selecciona una categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
            ))}
          </select>
        </label>

        <fieldset className="selector-prioridad">
          <legend>Prioridad</legend>
          {PRIORIDADES.map(({ valor, ayuda }) => (
            <label key={valor} className={`opcion-prioridad prioridad-${valor.toLowerCase()} ${form.prioridad === valor ? 'activa' : ''}`}>
              <input
                type="radio"
                name="prioridad"
                value={valor}
                checked={form.prioridad === valor}
                onChange={() => actualizar('prioridad', valor)}
              />
              <span className="punto" aria-hidden="true" />
              <strong>{ETIQUETAS_PRIORIDAD[valor]}</strong>
              <small>{ayuda}</small>
            </label>
          ))}
        </fieldset>

        <div className="acciones-formulario">
          <Link to="/incidentes" className="boton boton-secundario">Cancelar</Link>
          <button type="submit" className="boton boton-primario" disabled={enviando}>
            {enviando ? 'Registrando...' : 'Registrar incidente'}
          </button>
        </div>
      </form>
    </section>
  )
}
