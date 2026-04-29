import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../services/api'

export default function RedefinirSenha() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('')
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErro('')
    setMensagem('')

    if (!token || !email) {
      setErro('Link invalido. Solicite uma nova recuperacao de senha.')
      return
    }

    if (novaSenha.length < 6) {
      setErro('A senha deve ter no minimo 6 caracteres.')
      return
    }

    if (novaSenha !== confirmacaoSenha) {
      setErro('As senhas nao conferem.')
      return
    }

    setCarregando(true)
    try {
      const resposta = await api.post('/auth/redefinir-senha', {
        email,
        token,
        novaSenha
      })
      setMensagem(resposta.data.mensagem || 'Senha redefinida com sucesso.')
      setNovaSenha('')
      setConfirmacaoSenha('')
    } catch (err) {
      setErro(err.response?.data?.erro || 'Nao foi possivel redefinir a senha')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">Redefinir senha</h1>
        <p className="text-center text-gray-500 mb-8">Digite sua nova senha para continuar.</p>

        {erro && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{erro}</div>}
        {mensagem && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm">{mensagem}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
            <input
              type="password"
              value={novaSenha}
              onChange={(event) => setNovaSenha(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
            <input
              type="password"
              value={confirmacaoSenha}
              onChange={(event) => setConfirmacaoSenha(event.target.value)}
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
            {carregando ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Voltar para login
          </Link>
        </p>
      </div>
    </div>
  )
}
