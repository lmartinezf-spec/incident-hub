import { useCallback, useEffect, useState } from 'react'
import { usuariosApi } from '../api/servicios'
import { useAuth } from '../hooks/useAuth'
import { InsigniaRol } from '../components/Insignias'
import { Cargando, MensajeError } from '../components/Estados'
import { ETIQUETAS_ROL, formatearFecha } from '../utils/formato'

const FORM_VACIO = { nombre: '', email: '', password: '', rol: 'USUARIO' }

export default function Usuarios() {
  const { usuario: actual } = useAuth()
  const [usuarios, setUsuarios] = useState(null)
  const [filtroRol, setFiltroRol] = useState('')
  const [form, setForm] = useState(FORM_VACIO)
  const [error, setError] = useState(null)
  const [errorForm, setErrorForm] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const cargar = useCallback(() => {
    usuariosApi
      .listar({ rol: filtroRol })
      .then(setUsuarios)
      .catch((err) => setError(err.message))
  }, [filtroRol])

  useEffect(() => {
    cargar()
  }, [cargar])

  async function crear(evento) {
    evento.preventDefault()
    setErrorForm(null)
    setAviso(null)
    setEnviando(true)
    try {
      const nuevo = await usuariosApi.crear(form)
      setAviso(`Usuario ${nuevo.email} creado como ${ETIQUETAS_ROL[nuevo.rol].toLowerCase()}.`)
      setForm(FORM_VACIO)
      cargar()
    } catch (err) {
      setErrorForm({ mensaje: err.message, detalles: err.detalles })
    } finally {
      setEnviando(false)
    }
  }

  async function alternar(usuario) {
    setError(null)
    try {
      await usuariosApi.cambiarEstado(usuario.id, !usuario.activo)
      cargar()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section>
      <header className="encabezado-pagina">
        <div>
          <h1>Usuarios</h1>
          <p className="texto-suave">Cuentas con acceso al sistema. Los usuarios se desactivan, no se eliminan.</p>
        </div>
      </header>

      <div className="detalle">
        <div className="detalle-principal">
          <div className="tarjeta tabla-contenedor">
            <div className="tabs" role="tablist" aria-label="Filtrar por rol">
              {['', 'ADMIN', 'TECNICO', 'USUARIO'].map((rol) => (
                <button
                  key={rol || 'todos'}
                  type="button"
                  role="tab"
                  aria-selected={filtroRol === rol}
                  className={`tab ${filtroRol === rol ? 'activa' : ''}`}
                  onClick={() => setFiltroRol(rol)}
                >
                  {rol ? ETIQUETAS_ROL[rol] : 'Todos'}
                </button>
              ))}
            </div>
            <MensajeError mensaje={error} />
            {!usuarios ? (
              <Cargando />
            ) : (
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Creado</th>
                    <th aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id} className={u.activo ? '' : 'fila-inactiva'}>
                      <td>
                        <span className="celda-titulo">{u.nombre}</span>
                        <small className="texto-suave">{u.email}</small>
                      </td>
                      <td><InsigniaRol rol={u.rol} /></td>
                      <td>{u.activo ? 'Activo' : 'Inactivo'}</td>
                      <td>{formatearFecha(u.creado_en)}</td>
                      <td className="celda-accion">
                        {u.id !== actual.id && (
                          <button type="button" className="boton boton-texto" onClick={() => alternar(u)}>
                            {u.activo ? 'Desactivar' : 'Activar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <aside className="detalle-lateral">
          <form onSubmit={crear} className="tarjeta formulario" noValidate>
            <h2 className="tarjeta-titulo">Nuevo usuario</h2>
            {aviso && <div className="alerta alerta-exito" role="status">{aviso}</div>}
            <MensajeError mensaje={errorForm?.mensaje} detalles={errorForm?.detalles} />
            <label>
              Nombre completo
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </label>
            <label>
              Correo electrónico
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label>
              Contraseña temporal
              <input
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <small className="texto-suave">Mínimo 8 caracteres, con letras y números.</small>
            </label>
            <label>
              Rol
              <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                <option value="USUARIO">Usuario</option>
                <option value="TECNICO">Técnico</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </label>
            <button type="submit" className="boton boton-primario boton-bloque" disabled={enviando}>
              {enviando ? 'Creando...' : 'Crear usuario'}
            </button>
          </form>
        </aside>
      </div>
    </section>
  )
}
