const express = require('express')
const router = express.Router()
const autenticar = require('../middlewares/authMiddleware')
const { listarTarefas, criarTarefa, atualizarTarefa, deletarTarefa } = require('../controllers/tarefaController')

router.use(autenticar)

router.get('/', listarTarefas)
router.post('/', criarTarefa)
router.put('/:id', atualizarTarefa)
router.delete('/:id', deletarTarefa)

module.exports = router