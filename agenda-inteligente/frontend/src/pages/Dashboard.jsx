import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/authContext'
import api from '../services/api'

export default function Dashboard() {
  const { usuario, logout } = useAuth()
  const [tarefas, setTarefas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [tarefaEditando, setTarefaEditando] = useState(null)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [dataLembrete, setDataLembrete] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    buscarTarefas()
  }, [])

  async function buscarTarefas() {
    try {
      const resposta = await api.get('/tarefas')
      setTarefas(resposta.data)
    } catch {
      setErro('Erro ao buscar tarefas')
    } finally {
      setCarregando(false)
    }
  }

  function abrirModalNova() {
    setTarefaEditando(null)
    setTitulo('')
    setDescricao('')
    setDataLembrete('')
    setErro('')
    setModalAberto(true)
  }

  function abrirModalEditar(tarefa) {
    setTarefaEditando(tarefa)
    setTitulo(tarefa.titulo)
    setDescricao(tarefa.descricao || '')
    setDataLembrete(tarefa.dataLembrete ? tarefa.dataLembrete.slice(0, 16) : '')
    setErro('')
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setTarefaEditando(null)
    setTitulo('')
    setDescricao('')
    setDataLembrete('')
    setErro('')
  }

  async function salvarTarefa() {
    if (!titulo.trim()) {
      setErro('Título é obrigatório')
      return
    }

    try {
      if (tarefaEditando) {
        await api.put(`/tarefas/${tarefaEditando.id}`, {
          titulo,
          descricao,
          dataLembrete: dataLembrete || null,
          feita: tarefaEditando.feita
        })
      } else {
        await api.post('/tarefas', {
          titulo,
          descricao,
          dataLembrete: dataLembrete || null
        })
      }
      fecharModal()
      buscarTarefas()
    } catch {
      setErro('Erro ao salvar tarefa')
    }
  }

  async function alternarFeita(tarefa) {
    try {
      await api.put(`/tarefas/${tarefa.id}`, {
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        dataLembrete: tarefa.dataLembrete,
        feita: !tarefa.feita
      })
      buscarTarefas()
    } catch {
      setErro('Erro ao atualizar tarefa')
    }
  }

  async function deletarTarefa(id) {
    if (!confirm('Tem certeza que quer deletar essa tarefa?')) return
    try {
      await api.delete(`/tarefas/${id}`)
      buscarTarefas()
    } catch {
      setErro('Erro ao deletar tarefa')
    }
  }

  const tarefasPendentes = tarefas.filter(t => !t.feita)
  const tarefasConcluidas = tarefas.filter(t => t.feita)

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">🗓️ Agenda Inteligente</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Olá, {usuario?.nome}!</span>
          <button
            onClick={logout}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Botão nova tarefa */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Minhas Tarefas</h2>
          <button
            onClick={abrirModalNova}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            + Nova Tarefa
          </button>
        </div>

        {carregando ? (
          <p className="text-center text-gray-500">Carregando tarefas...</p>
        ) : (
          <>
            {/* Tarefas pendentes */}
            {tarefasPendentes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Pendentes ({tarefasPendentes.length})
                </h3>
                <div className="space-y-3">
                  {tarefasPendentes.map(tarefa => (
                    <CartaoTarefa
                      key={tarefa.id}
                      tarefa={tarefa}
                      onEditar={abrirModalEditar}
                      onDeletar={deletarTarefa}
                      onAlternar={alternarFeita}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tarefas concluídas */}
            {tarefasConcluidas.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Concluídas ({tarefasConcluidas.length})
                </h3>
                <div className="space-y-3">
                  {tarefasConcluidas.map(tarefa => (
                    <CartaoTarefa
                      key={tarefa.id}
                      tarefa={tarefa}
                      onEditar={abrirModalEditar}
                      onDeletar={deletarTarefa}
                      onAlternar={alternarFeita}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sem tarefas */}
            {tarefas.length === 0 && (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">📝</p>
                <p className="text-gray-500">Nenhuma tarefa ainda.</p>
                <p className="text-gray-400 text-sm">Clique em "Nova Tarefa" para começar!</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {tarefaEditando ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>

            {erro && (
              <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
                {erro}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Estudar React"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Detalhes da tarefa..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lembrete por email
                </label>
                <input
                  type="datetime-local"
                  value={dataLembrete}
                  onChange={(e) => setDataLembrete(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={fecharModal}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={salvarTarefa}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                {tarefaEditando ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CartaoTarefa({ tarefa, onEditar, onDeletar, onAlternar }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 flex items-start gap-3 ${tarefa.feita ? 'opacity-60' : ''}`}>
      <button
        onClick={() => onAlternar(tarefa)}
        className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 transition ${
          tarefa.feita
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 hover:border-blue-500'
        }`}
      />

      <div className="flex-1 min-w-0">
        <p className={`font-medium text-gray-800 ${tarefa.feita ? 'line-through text-gray-400' : ''}`}>
          {tarefa.titulo}
        </p>
        {tarefa.descricao && (
          <p className="text-sm text-gray-500 mt-1">{tarefa.descricao}</p>
        )}
        {tarefa.dataLembrete && (
          <p className="text-xs text-blue-500 mt-1">
            🔔 {new Date(tarefa.dataLembrete).toLocaleString('pt-BR', { timeZone: 'America/Recife' })}
          </p>
        )}
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => onEditar(tarefa)}
          className="text-gray-400 hover:text-blue-600 text-sm transition"
        >
          ✏️
        </button>
        <button
          onClick={() => onDeletar(tarefa.id)}
          className="text-gray-400 hover:text-red-500 text-sm transition"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}