

# Agenda Inteligente FullStack

Aplicação fullstack para gerenciamento de tarefas com autenticação JWT, lembretes por e-mail e recuperação de senha.

## Tecnologias

- **Frontend:** React, Vite, TailwindCSS, Axios, React Router
- **Backend:** Node.js, Express, Prisma ORM, JWT, bcrypt
- **Banco:** PostgreSQL
- **E-mail:** Resend
- **Testes:** Jest + Supertest

## Funcionalidades

- Cadastro e login de usuários
- Autenticação com JWT
- CRUD completo de tarefas
- Marcar tarefa como concluída/pendente
- Lembretes por e-mail com `node-cron`
- Recuperação de senha por e-mail

## Estrutura

```bash
agenda-inteligente/
  backend/
  frontend/
```

## Como rodar localmente

### Backend

```bash
cd agenda-inteligente/backend
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma generate
npm run dev
```

Backend em: `http://localhost:3333`

### Frontend

```bash
cd agenda-inteligente/frontend
npm install
cp .env.example .env
npm run dev
```

Frontend em: `http://localhost:5173`

## Variáveis de ambiente

### Backend (`backend/.env`)

- `DATABASE_URL`
- `JWT_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `FRONTEND_URL`

### Frontend (`frontend/.env`)

- `VITE_API_URL`

## Rotas principais da API

### Auth
- `POST /auth/registro`
- `POST /auth/login`
- `POST /auth/esqueci-senha`
- `POST /auth/redefinir-senha`

### Tarefas (protegidas)
- `GET /tarefas`
- `POST /tarefas`
- `PUT /tarefas/:id`
- `DELETE /tarefas/:id`

## Segurança

- Não versionar `.env`
- Não expor chaves de API
- Se uma chave vazar, revogar e gerar outra no provedor

## Status do projeto

Projeto funcional com autenticação, dashboard de tarefas, envio de e-mails e recuperação de senha.
```
