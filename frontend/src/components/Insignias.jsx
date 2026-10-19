import { ETIQUETAS_ESTADO, ETIQUETAS_PRIORIDAD, ETIQUETAS_ROL } from '../utils/formato'

export function InsigniaEstado({ estado }) {
  return <span className={`insignia estado-${estado.toLowerCase()}`}>{ETIQUETAS_ESTADO[estado] || estado}</span>
}

export function InsigniaPrioridad({ prioridad }) {
  return (
    <span className={`insignia prioridad prioridad-${prioridad.toLowerCase()}`}>
      <span className="punto" aria-hidden="true" />
      {ETIQUETAS_PRIORIDAD[prioridad] || prioridad}
    </span>
  )
}

export function InsigniaRol({ rol }) {
  return <span className={`insignia rol-${rol.toLowerCase()}`}>{ETIQUETAS_ROL[rol] || rol}</span>
}
