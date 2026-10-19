import { Icono } from './Icono'

export function Cargando({ texto = 'Cargando...' }) {
  return (
    <div className="cargando" role="status">
      <span className="spinner" aria-hidden="true" />
      {texto}
    </div>
  )
}

export function MensajeError({ mensaje, detalles }) {
  if (!mensaje) return null
  return (
    <div className="alerta alerta-error" role="alert">
      <Icono nombre="alerta" />
      <div>
        <strong>{mensaje}</strong>
        {detalles?.length > 0 && (
          <ul>
            {detalles.map((d) => (
              <li key={d.campo}>{d.mensaje}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export function Vacio({ titulo, children }) {
  return (
    <div className="vacio">
      <p className="vacio-titulo">{titulo}</p>
      {children}
    </div>
  )
}
