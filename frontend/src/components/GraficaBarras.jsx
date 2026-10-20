import { porcentaje } from '../utils/formato'

/**
 * Barras horizontales de una sola serie. Cada fila puede llevar a un listado filtrado.
 * filas: [{ clave, etiqueta, valor, enlace? }]
 */
export function GraficaBarras({ titulo, filas, onSeleccionar }) {
  const maximo = Math.max(1, ...filas.map((fila) => fila.valor))
  const total = filas.reduce((suma, fila) => suma + fila.valor, 0)

  return (
    <figure className="grafica">
      <figcaption className="grafica-titulo">{titulo}</figcaption>
      <ul className="barras">
        {filas.map((fila) => {
          const contenido = (
            <>
              <span className="barra-etiqueta">{fila.etiqueta}</span>
              <span className="barra-pista">
                <span className="barra-relleno" style={{ width: `${(fila.valor / maximo) * 100}%` }} />
              </span>
              <span className="barra-valor">{fila.valor}</span>
            </>
          )
          const descripcion = `${fila.etiqueta}: ${fila.valor} (${porcentaje(fila.valor, total)}% del total)`
          return (
            <li key={fila.clave}>
              {onSeleccionar ? (
                <button type="button" className="barra-fila" title={descripcion} onClick={() => onSeleccionar(fila)}>
                  {contenido}
                </button>
              ) : (
                <div className="barra-fila" title={descripcion}>
                  {contenido}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </figure>
  )
}

/** Barras apiladas de dos series (atendidos / en curso) con leyenda. */
export function GraficaTecnicos({ titulo, filas }) {
  const maximo = Math.max(1, ...filas.map((fila) => fila.atendidos + fila.en_curso))
  return (
    <figure className="grafica">
      <figcaption className="grafica-titulo">{titulo}</figcaption>
      <div className="leyenda">
        <span><i className="muestra serie-1" />Atendidos</span>
        <span><i className="muestra serie-2" />En curso</span>
      </div>
      {filas.length === 0 ? (
        <p className="texto-suave">No hay técnicos activos.</p>
      ) : (
        <ul className="barras">
          {filas.map((fila) => (
            <li key={fila.id}>
              <div
                className="barra-fila"
                title={`${fila.tecnico}: ${fila.atendidos} atendidos, ${fila.en_curso} en curso`}
              >
                <span className="barra-etiqueta">{fila.tecnico}</span>
                <span className="barra-pista barra-apilada">
                  {fila.atendidos > 0 && (
                    <span className="segmento serie-1" style={{ width: `${(fila.atendidos / maximo) * 100}%` }} />
                  )}
                  {fila.en_curso > 0 && (
                    <span className="segmento serie-2" style={{ width: `${(fila.en_curso / maximo) * 100}%` }} />
                  )}
                </span>
                <span className="barra-valor">{fila.atendidos + fila.en_curso}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </figure>
  )
}
