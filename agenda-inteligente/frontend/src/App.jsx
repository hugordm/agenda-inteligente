import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/authContext'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Dashboard from './pages/Dashboard'
import SolicitarRecuperacaoSenha from './pages/recuperar-senha/SolicitarRecuperacaoSenha'
import RedefinirSenha from './pages/recuperar-senha/RedefinirSenha'

function RotaProtegida({ children }) {
  const { usuario, carregando } = useAuth()

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar-senha" element={<SolicitarRecuperacaoSenha />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route path="/dashboard" element={
        <RotaProtegida>
          <Dashboard />
        </RotaProtegida>
      } />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App