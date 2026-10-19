export function Paginacion({ pagina, totalPaginas, total, onCambiar }) {
  if (!total) return null
  return (
    <div className="paginacion">
      <span>
        {total} incidente{total === 1 ? '' : 's'} · página {pagina} de {totalPaginas}
      </span>
      <div className="paginacion-botones">
        <button type="button" className="boton boton-secundario" disabled={pagina <= 1} onClick={() => onCambiar(pagina - 1)}>
          Anterior
        </button>
        <button
          type="button"
          className="boton boton-secundario"
          disabled={pagina >= totalPaginas}
          onClick={() => onCambiar(pagina + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
