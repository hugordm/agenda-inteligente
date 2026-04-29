const request = require('supertest')
const app = require('../../src/server')
const prisma = require('../../src/prisma')

beforeEach(async () => {
  await prisma.tarefa.deleteMany()
  await prisma.usuario.deleteMany()
})

afterAll(async () => {
  await prisma.tarefa.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.$disconnect()
})

describe('Autenticação', () => {

  test('deve registrar um usuário com sucesso', async () => {
    const resposta = await request(app)
      .post('/auth/registro')
      .send({
        nome: 'Hugo Teste',
        email: 'hugo@teste.com',
        senha: '123456'
      })

    expect(resposta.status).toBe(201)
    expect(resposta.body).toHaveProperty('mensagem')
    expect(resposta.body).toHaveProperty('id')
  })

  test('não deve registrar com email duplicado', async () => {
    await request(app)
      .post('/auth/registro')
      .send({
        nome: 'Hugo Teste',
        email: 'hugo@teste.com',
        senha: '123456'
      })

    const resposta = await request(app)
      .post('/auth/registro')
      .send({
        nome: 'Hugo Teste',
        email: 'hugo@teste.com',
        senha: '123456'
      })

    expect(resposta.status).toBe(400)
    expect(resposta.body.erro).toBe('Email já cadastrado')
  })

  test('não deve registrar sem preencher todos os campos', async () => {
    const resposta = await request(app)
      .post('/auth/registro')
      .send({
        email: 'hugo@teste.com'
      })

    expect(resposta.status).toBe(400)
    expect(resposta.body.erro).toBe('Preencha todos os campos')
  })

  test('deve fazer login com sucesso', async () => {
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

    expect(resposta.status).toBe(200)
    expect(resposta.body).toHaveProperty('token')
    expect(resposta.body.usuario.email).toBe('hugo@teste.com')
  })

  test('não deve fazer login com senha errada', async () => {
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
        senha: 'senhaerrada'
      })

    expect(resposta.status).toBe(400)
    expect(resposta.body.erro).toBe('Email ou senha incorretos')
  })

})