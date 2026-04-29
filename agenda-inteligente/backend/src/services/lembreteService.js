const { Resend } = require('resend')
const cron = require('node-cron')
const prisma = require('../prisma')

const resend = new Resend(process.env.RESEND_API_KEY)

async function verificarLembretes() {
  try {
    const agora = new Date()

    const tarefas = await prisma.tarefa.findMany({
      where: {
        emailEnviado: false,
        feita: false,
        dataLembrete: {
          lte: agora
        }
      },
      include: {
        usuario: true
      }
    })

    for (const tarefa of tarefas) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: tarefa.usuario.email,
        subject: `Lembrete: ${tarefa.titulo}`,
        html: `
          <h2>Olá, ${tarefa.usuario.nome}!</h2>
          <p>Você tem uma tarefa para fazer:</p>
          <h3>${tarefa.titulo}</h3>
          ${tarefa.descricao ? `<p>${tarefa.descricao}</p>` : ''}
          <p>Não esqueça! 😊</p>
        `
      })

      await prisma.tarefa.update({
        where: { id: tarefa.id },
        data: { emailEnviado: true }
      })

      console.log(`Email enviado para ${tarefa.usuario.email} - Tarefa: ${tarefa.titulo}`)
    }
  } catch (erro) {
    console.error('Erro ao verificar lembretes:', erro)
  }
}

function iniciarLembretes() {
  cron.schedule('* * * * *', verificarLembretes)
  console.log('Serviço de lembretes iniciado!')
}

module.exports = { iniciarLembretes, verificarLembretes }