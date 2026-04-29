import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function SolicitarRecuperacaoSenha() {
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErro('')
    setMensagem('')
    setCarregando(true)

    try {
      const resposta = await api.post('/auth/esqueci-senha', { email })
      setMensagem(resposta.data.mensagem || 'Solicitacao enviada com sucesso.')
    } catch (err) {
      setErro(err.response?.data?.erro || 'Nao foi possivel enviar o email de recuperacao')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">Recuperar senha</h1>
        <p className="text-center text-gray-500 mb-8">Informe seu email para receber o link.</p>

        {erro && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{erro}</div>}
        {mensagem && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm">{mensagem}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {carregando ? 'Enviando...' : 'Enviar link'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Lembrou sua senha?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Voltar para login
          </Link>
        </p>
      </div>
    </div>
  )
}
