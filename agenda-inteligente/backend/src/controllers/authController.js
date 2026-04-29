const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { Resend } = require('resend')
const prisma = require('../prisma')

const resend = new Resend(process.env.RESEND_API_KEY)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const RESET_TOKEN_EXPIRATION_MS = 1000 * 60 * 30

function gerarHashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

async function registro(req, res) {
  try {
    const { nome, email, senha } = req.body

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Preencha todos os campos' })
    }

    const usuarioExiste = await prisma.usuario.findUnique({
      where: { email }
    })

    if (usuarioExiste) {
      return res.status(400).json({ erro: 'Email já cadastrado' })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash
      }
    })

    return res.status(201).json({ mensagem: 'Usuário criado com sucesso!', id: usuario.id })

  } catch (erro) {
    console.error('Erro em registro:', erro)
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Preencha todos os campos' })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })

    if (!usuario) {
      return res.status(400).json({ erro: 'Email ou senha incorretos' })
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha)

    if (!senhaCorreta) {
      return res.status(400).json({ erro: 'Email ou senha incorretos' })
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    })

  } catch (erro) {
    console.error('Erro em login:', erro)
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

async function solicitarRecuperacaoSenha(req, res) {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ erro: 'Email é obrigatório' })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })

    if (!usuario) {
      return res.status(200).json({
        mensagem: 'Se o email existir, enviaremos as instruções de recuperação.'
      })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = gerarHashToken(token)
    const expiraEm = new Date(Date.now() + RESET_TOKEN_EXPIRATION_MS)

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        resetSenhaToken: tokenHash,
        resetSenhaExpiraEm: expiraEm
      }
    })

    const link = `${FRONTEND_URL}/redefinir-senha?token=${token}&email=${encodeURIComponent(email)}`

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Recuperação de senha - Agenda Inteligente',
      html: `
        <h2>Recuperação de senha</h2>
        <p>Olá, ${usuario.nome}.</p>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p>
          <a href="${link}" target="_blank" rel="noopener noreferrer">
            Clique aqui para redefinir sua senha
          </a>
        </p>
        <p>Esse link expira em 30 minutos.</p>
      `
    })

    return res.status(200).json({
      mensagem: 'Se o email existir, enviaremos as instruções de recuperação.'
    })
  } catch (erro) {
    console.error('Erro em solicitarRecuperacaoSenha:', erro)
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

async function redefinirSenha(req, res) {
  try {
    const { email, token, novaSenha } = req.body

    if (!email || !token || !novaSenha) {
      return res.status(400).json({ erro: 'Email, token e nova senha são obrigatórios' })
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ erro: 'A nova senha deve ter ao menos 6 caracteres' })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })

    if (!usuario || !usuario.resetSenhaToken || !usuario.resetSenhaExpiraEm) {
      return res.status(400).json({ erro: 'Token inválido ou expirado' })
    }

    if (usuario.resetSenhaExpiraEm < new Date()) {
      return res.status(400).json({ erro: 'Token inválido ou expirado' })
    }

    const tokenHash = gerarHashToken(token)
    if (usuario.resetSenhaToken !== tokenHash) {
      return res.status(400).json({ erro: 'Token inválido ou expirado' })
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10)

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        senha: senhaHash,
        resetSenhaToken: null,
        resetSenhaExpiraEm: null
      }
    })

    return res.status(200).json({ mensagem: 'Senha redefinida com sucesso!' })
  } catch (erro) {
    console.error('Erro em redefinirSenha:', erro)
    return res.status(500).json({ erro: 'Erro interno do servidor' })
  }
}

module.exports = { registro, login, solicitarRecuperacaoSenha, redefinirSenha }