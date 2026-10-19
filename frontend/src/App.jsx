import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './hooks/useAuth'
import { rutaInicial } from './navegacion'
import { Layout } from './components/Layout'
import { RutaProtegida } from './components/RutaProtegida'
import Login from './pages/Login'
import Incidentes from './pages/Incidentes'
import NuevoIncidente from './pages/NuevoIncidente'
import DetalleIncidente from './pages/DetalleIncidente'
import Usuarios from './pages/Usuarios'
import NoEncontrado from './pages/NoEncontrado'

function Inicio() {
  const { usuario } = useAuth()
  return <Navigate to={rutaInicial(usuario.rol)} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RutaProtegida />}>
            <Route element={<Layout />}>
              <Route index element={<Inicio />} />
              <Route path="incidentes" element={<Incidentes />} />
              <Route path="incidentes/nuevo" element={<NuevoIncidente />} />
              <Route path="incidentes/:id" element={<DetalleIncidente />} />
              <Route element={<RutaProtegida roles={['ADMIN']} />}>
                <Route path="usuarios" element={<Usuarios />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}