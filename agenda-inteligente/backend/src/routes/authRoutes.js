const express = require('express')
const router = express.Router()
const {
  registro,
  login,
  solicitarRecuperacaoSenha,
  redefinirSenha
} = require('../controllers/authController')

router.post('/registro', registro)
router.post('/login', login)
router.post('/esqueci-senha', solicitarRecuperacaoSenha)
router.post('/redefinir-senha', redefinirSenha)

module.exports = router