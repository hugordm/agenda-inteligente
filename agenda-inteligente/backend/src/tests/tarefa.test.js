const request = require('supertest')
const app = require('../../src/server')
const prisma = require('../../src/prisma')

let token

beforeEach(async () => {
  await prisma.tarefa.deleteMany()
  await prisma.usuario.deleteMany()

  await request(app)
    .post('/auth/registro')
    .send({
      nome: 'Hugo Teste',
      email: 'hugo@teste.com',
      senha: '123456'
    })

  const resposta = await request(app)
    .post('/auth/login')
    .send({
      email: 'hugo@teste.com',
      senha: '123456'
    })

  token = resposta.body.token
})

afterAll(async () => {
  await prisma.tarefa.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.$disconnect()
})

describe('Tarefas', () => {

  test('deve criar uma tarefa com sucesso', async () => {
    const resposta = await request(app)
      .post('/tarefas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        titulo: 'Estudar Node.js',
        descricao: 'Ver aula de middlewares'
      })

    expect(resposta.status).toBe(201)
    expect(resposta.body.titulo).toBe('Estudar Node.js')
    expect(resposta.body.feita).toBe(false)
  })

  test('não deve criar tarefa sem título', async () => {
    const resposta = await request(app)
      .post('/tarefas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        descricao: 'Sem título'
      })

    expect(resposta.status).toBe(400)
    expect(resposta.body.erro).toBe('Título é obrigatório')
  })

  test('não deve criar tarefa sem token', async () => {
    const resposta = await request(app)
      .post('/tarefas')
      .send({
        titulo: 'Tarefa sem token'
      })

    expect(resposta.status).toBe(401)
  })

  test('deve listar as tarefas do usuário', async () => {
    await request(app)
      .post('/tarefas')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Tarefa 1' })

    await request(app)
      .post('/tarefas')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Tarefa 2' })

    const resposta = await request(app)
      .get('/tarefas')
      .set('Authorization', `Bearer ${token}`)

    expect(resposta.status).toBe(200)
    expect(resposta.body.length).toBe(2)
  })

  test('deve atualizar uma tarefa', async () => {
    const criada = await request(app)
      .post('/tarefas')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Tarefa antiga' })

    const resposta = await request(app)
      .put(`/tarefas/${criada.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Tarefa atualizada', feita: true })

    expect(resposta.status).toBe(200)
    expect(resposta.body.titulo).toBe('Tarefa atualizada')
    expect(resposta.body.feita).toBe(true)
  })

  test('deve deletar uma tarefa', async () => {
    const criada = await request(app)
      .post('/tarefas')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Tarefa para deletar' })

    const resposta = await request(app)
      .delete(`/tarefas/${criada.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(resposta.status).toBe(200)
    expect(resposta.body.mensagem).toBe('Tarefa deletada com sucesso!')
  })

})