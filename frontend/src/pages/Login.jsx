import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { rutaInicial } from '../navegacion'
import { Icono } from '../components/Icono'
import { MensajeError } from '../components/Estados'

export default function Login() {
  const { usuario, iniciarSesion } = useAuth()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  if (usuario) return <Navigate to={rutaInicial(usuario.rol)} replace />

  const actualizar = (evento) => setForm({ ...form, [evento.target.name]: evento.target.value })

  async function enviar(evento) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const datos = await iniciarSesion(form.email, form.password)
      navegar(ubicacion.state?.desde || rutaInicial(datos.rol), { replace: true })
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <div className="login">
      <section className="login-panel" aria-hidden="true">
        <div className="marca marca-grande">
          <span className="marca-logo">
            <Icono nombre="alerta" tamano={22} />
          </span>
          <strong>IT Incident Hub</strong>
        </div>
        <h1>Cada incidente, trazable de principio a fin.</h1>
        <ul className="login-puntos">
          <li><Icono nombre="lista" /> Registro centralizado en lugar de llamadas y mensajes sueltos</li>
          <li><Icono nombre="reloj" /> Historial completo de asignaciones, estados y comentarios</li>
          <li><Icono nombre="grafica" /> Indicadores de carga y criticidad en tiempo real</li>
        </ul>
      </section>

      <section className="login-formulario">
        <form onSubmit={enviar} className="tarjeta formulario" noValidate>
          <h2>Iniciar sesión</h2>
          <p className="texto-suave">Usa la cuenta que te asignó el departamento de TI.</p>
          <MensajeError mensaje={error} />
          <label>
            Correo electrónico
            <input
              type="email"
              name="email"
              autoComplete="username"
              value={form.email}
              onChange={actualizar}
              required
              autoFocus
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={form.password}
              onChange={actualizar}
              required
            />
          </label>
          <button type="submit" className="boton boton-primario boton-bloque" disabled={enviando}>
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </section>
    </div>
  )
}
