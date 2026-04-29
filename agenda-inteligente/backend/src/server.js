const express = require('express')
const cors = require('cors')
require('dotenv/config')

const authRoutes = require('./routes/authRoutes')
const tarefaRoutes = require('./routes/tarefaRoutes')
const { iniciarLembretes } = require('./services/lembreteService')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/tarefas', tarefaRoutes)

app.get('/', (req, res) => {
  res.json({ mensagem: 'Servidor rodando!' })
})

const PORT = process.env.PORT || 3333

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
    iniciarLembretes()
  })
}

module.exports = app