import { Link } from 'react-router'

export default function NoEncontrado() {
  return (
    <div className="no-encontrado">
      <p className="codigo">404</p>
      <h1>Página no encontrada</h1>
      <p className="texto-suave">La dirección que buscas no existe o fue movida.</p>
      <Link to="/" className="boton boton-primario">Ir al inicio</Link>
    </div>
  )
}
