# Budget-Flow

Aplicacao fullstack para gestao financeira compartilhada, com autenticacao JWT, CRUD de transacoes e painel mensal com resumo e grafico.

## Visao Geral

O projeto e dividido em duas aplicacoes:

- API em Node.js + Express
- Frontend em React + Vite

Funcionalidades principais:

- Login com JWT
- Cadastro, edicao e exclusao de transacoes
- Filtro por mes e ano
- Resumo mensal (entradas, despesas e saldo)
- Grafico de transacoes no dashboard
- Isolamento de dados por usuario

## Tecnologias

### Backend

- Node.js (ES Modules)
- Express
- jsonwebtoken
- Swagger UI
- YAML

### Frontend

- React 18
- Vite 5

### Testes

- Mocha
- Chai
- Supertest
- Mochawesome

## Estrutura

```text
budget-flow/
|-- api/
|   |-- src/
|   |   |-- controllers/
|   |   |-- data/
|   |   |-- middlewares/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- utils/
|   |   |-- swagger.yaml
|   |   `-- server.js
|   |-- tests/
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   `-- services/
|   `-- package.json
`-- README.md
```

## Pre-requisitos

- Node.js 18+
- npm 9+

## Instalacao

```bash
cd api
npm install

cd ../frontend
npm install
```

## Como Rodar

Abra dois terminais.

### Terminal 1 - API

```bash
cd api
npm run dev
```

API: http://localhost:3001

Swagger: http://localhost:3001/api-docs

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

App: http://localhost:5173

## Scripts

### API

- `npm run dev`: sobe API com watch
- `npm start`: sobe API sem watch
- `npm test`: executa testes

### Frontend

- `npm run dev`: sobe frontend em desenvolvimento
- `npm run build`: gera build de producao
- `npm run preview`: visualiza build local

## Usuarios de Teste

| Usuario | Senha    |
|--------|----------|
| alice  | alice123 |
| bob    | bob123   |

## Autenticacao

Token JWT e emitido no login:

`POST /auth/login`

Exemplo:

```bash
curl -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"alice","password":"alice123"}'
```

Use o token nas rotas protegidas:

```http
Authorization: Bearer <jwt>
```

## Endpoints

| Metodo | Rota                   | Auth | Descricao                    |
|-------|-------------------------|------|------------------------------|
| POST  | /auth/login             | Nao  | Login e geracao de JWT       |
| GET   | /transactions?mes=&ano= | Sim  | Lista transacoes por periodo |
| POST  | /transactions           | Sim  | Cria transacao               |
| PUT   | /transactions/:id       | Sim  | Atualiza transacao           |
| DELETE| /transactions/:id       | Sim  | Remove transacao             |
| GET   | /summary/:mes/:ano      | Sim  | Retorna resumo mensal        |

## Regras de Negocio

- Persistencia em memoria (dados reiniciam ao subir a API)
- IDs auto-incrementais e nao reutilizados
- `valor` deve ser numero positivo
- `tipo` deve ser `ENTRADA` ou `SAIDA`
- `saldo_mensal = total_entradas - total_despesas`
- `is_limite_excedido = true` quando saldo < 0
- Isolamento por `user_id` do JWT

## Testes

```bash
cd api
npm test
```

Relatorio HTML:

`api/mochawesome-report/report.html`

## Solucao de Problemas

- Frontend sem dados: confirme que a API esta rodando na porta 3001
- Erro de token: faca login novamente e valide header Authorization
- Transacao nao aparece no filtro: confira se a data pertence ao mes/ano selecionados

## Licenca

Projeto para estudo e uso interno.
