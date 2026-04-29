const prisma = require('../prisma')

async function listarTarefas(req, res) {
  try {
    const tarefas = await prisma.tarefa.findMany({
      where: { usuarioId: req.usuarioId },
      orderBy: { criadoEm: 'desc' }
    })

    return res.status(200).json(tarefas)
  } catch (erro) {
    console.error('Erro em listarTarefas:', erro)
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

async function criarTarefa(req, res) {
  try {
    const { titulo, descricao, dataLembrete } = req.body

    if (!titulo) {
      return res.status(400).json({ erro: 'Título é obrigatório' })
    }

    const tarefa = await prisma.tarefa.create({
      data: {
        titulo,
        descricao,
        dataLembrete: dataLembrete ? new Date(dataLembrete) : null,
        usuarioId: req.usuarioId
      }
    })

    return res.status(201).json(tarefa)
  } catch (erro) {
    console.error('Erro em criarTarefa:', erro)
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

async function atualizarTarefa(req, res) {
  try {
    const { id } = req.params
    const { titulo, descricao, feita, dataLembrete } = req.body

    const tarefaExiste = await prisma.tarefa.findFirst({
      where: {
        id: Number(id),
        usuarioId: req.usuarioId
      }
    })

    if (!tarefaExiste) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' })
    }

    const tarefa = await prisma.tarefa.update({
      where: { id: Number(id) },
      data: {
        titulo,
        descricao,
        feita,
        dataLembrete: dataLembrete ? new Date(dataLembrete) : null
      }
    })

    return res.status(200).json(tarefa)
  } catch (erro) {
    console.error('Erro em atualizarTarefa:', erro)
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

async function deletarTarefa(req, res) {
  try {
    const { id } = req.params

    const tarefaExiste = await prisma.tarefa.findFirst({
      where: {
        id: Number(id),
        usuarioId: req.usuarioId
      }
    })

    if (!tarefaExiste) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' })
    }

    await prisma.tarefa.delete({
      where: { id: Number(id) }
    })

    return res.status(200).json({ mensagem: 'Tarefa deletada com sucesso!' })
  } catch (erro) {
    console.error('Erro em deletarTarefa:', erro)
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

module.exports = { listarTarefas, criarTarefa, atualizarTarefa, deletarTarefa }