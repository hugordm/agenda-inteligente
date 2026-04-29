import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/authContext'
import api from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const resposta = await api.post('/auth/login', { email, senha })
      login(resposta.data.token, resposta.data.usuario)
      navigate('/dashboard')
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao fazer login')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">

        <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">
          🗓️ Agenda Inteligente
        </h1>
        <p className="text-center text-gray-500 mb-8">Entre na sua conta</p>

        {erro && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-right text-sm mt-3">
          <Link to="/recuperar-senha" className="text-blue-600 font-medium hover:underline">
            Esqueci minha senha
          </Link>
        </p>

        <p className="text-center text-gray-500 text-sm mt-6">
          Não tem conta?{' '}
          <Link to="/registro" className="text-blue-600 font-medium hover:underline">
            Cadastre-se
          </Link>
        </p>

      </div>
    </div>
  )
}