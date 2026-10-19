import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { ENLACES } from '../navegacion'
import { ETIQUETAS_ROL } from '../utils/formato'
import { Icono } from './Icono'

export function Layout() {
  const { usuario, cerrarSesion } = useAuth()
  const enlaces = ENLACES.filter((enlace) => enlace.roles.includes(usuario.rol))
  const iniciales = usuario.nombre
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()

  return (
    <div className="app">
      <aside className="barra-lateral">
        <div className="marca">
          <span className="marca-logo" aria-hidden="true">
            <Icono nombre="alerta" tamano={18} />
          </span>
          <div>
            <strong>IT Incident Hub</strong>
            <small>Mesa de servicio TI</small>
          </div>
        </div>

        <nav className="menu" aria-label="Navegación principal">
          {enlaces.map((enlace) => (
            <NavLink key={enlace.ruta} to={enlace.ruta} end={enlace.exacta} className="menu-enlace">
              <Icono nombre={enlace.icono} />
              <span>{enlace.texto}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sesion">
          <span className="avatar" aria-hidden="true">
            {iniciales}
          </span>
          <div className="sesion-datos">
            <strong>{usuario.nombre}</strong>
            <small>{ETIQUETAS_ROL[usuario.rol]}</small>
          </div>
          <button type="button" className="boton-icono" onClick={cerrarSesion} title="Cerrar sesión">
            <Icono nombre="salir" />
            <span className="sr-only">Cerrar sesión</span>
          </button>
        </div>
        <p className="version">v{__APP_VERSION__}</p>
      </aside>

      <main className="contenido">
        <Outlet />
      </main>
    </div>
  )
}
