# Budget Flow

Aplicacao fullstack para controle financeiro compartilhado, com autenticacao JWT, CRUD de transacoes, categorias dinamicas, resumo mensal detalhado e dashboard grafico.

## Visao geral

O projeto e dividido em dois apps:

- API REST em Node.js + Express
- Frontend em React + Vite

Fluxo principal:

1. Usuario faz login.
2. Frontend recebe token JWT.
3. Frontend consome rotas protegidas para transacoes, resumo e categorias.
4. Dashboard mostra lista, resumo mensal e grafico consolidado.

## Funcionalidades

- Login com JWT
- CRUD de transacoes
- Filtro por mes e ano
- Categoria obrigatoria por transacao
- Lista de categorias carregada da API
- Resumo mensal com:
    - total de entradas
    - total de despesas
    - saldo mensal
    - flag de limite excedido
    - resumo de despesas por responsavel
    - resumo de despesas por responsavel e por categoria
- Grafico donut consolidado por tipo e categoria
- Isolamento de dados por usuario

## Stack

### Backend

- Node.js (ES Modules)
- Express
- jsonwebtoken
- swagger-ui-express
- YAML

### Frontend

- React 18
- Vite 5
- react-select

### Testes

- Mocha
- Chai
- Supertest
- Mochawesome

## Estrutura do repositorio

```text
budget-flow/
|-- api/
|   |-- src/
|   |   |-- constants/
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

## Executando localmente

Abra dois terminais.

### Terminal 1 - API

```bash
cd api
npm run dev
```

- API: http://localhost:3001
- Swagger: http://localhost:3001/api-docs

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

- App: http://localhost:5173

## Usuarios de teste

| Usuario | Senha |
|---|---|
| alice | alice123 |
| bob | bob123 |

## Autenticacao

Login:

```http
POST /auth/login
```

Exemplo:

```bash
curl -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"alice","password":"alice123"}'
```

Header para rotas protegidas:

```http
Authorization: Bearer <jwt>
```

## Endpoints principais

| Metodo | Rota | Auth | Descricao |
|---|---|---|---|
| POST | /auth/login | Nao | Login e emissao de token JWT |
| GET | /transactions?mes=&ano= | Sim | Lista transacoes do periodo |
| POST | /transactions | Sim | Cria transacao |
| PUT | /transactions/:id | Sim | Atualiza transacao |
| DELETE | /transactions/:id | Sim | Remove transacao |
| GET | /summary/:mes/:ano | Sim | Resumo mensal |
| GET | /categories | Sim | Lista categorias agrupadas |

Documentacao completa no Swagger em /api-docs.

## Modelo de transacao

Campos esperados no create/update:

```json
{
    "descricao": "Supermercado",
    "valor": 250.9,
    "tipo": "SAIDA",
    "categoria": "Supermercado (Compra do mes)",
    "responsavel": "alice",
    "data": "2026-04-24"
}
```

Regras importantes:

- valor deve ser numero positivo
- tipo deve ser ENTRADA ou SAIDA
- categoria deve existir na lista permitida
- responsavel e descricao sao obrigatorios
- dados sao isolados por usuario autenticado

## Formato do resumo mensal

Resposta de GET /summary/:mes/:ano:

```json
{
    "total_entradas": 5000,
    "total_despesas": 3120,
    "saldo_mensal": 1880,
    "is_limite_excedido": false,
    "resumo_por_pessoa": {
        "alice": 1820,
        "bob": 1300
    },
    "resumo_por_pessoa_categoria": {
        "alice": {
            "Supermercado (Compra do mes)": 520
        },
        "bob": {
            "Fatura do Cartao": 900
        }
    }
}
```

## Scripts

### API

- npm run dev: inicia API com watch
- npm start: inicia API sem watch
- npm test: executa testes automatizados

### Frontend

- npm run dev: inicia frontend em modo desenvolvimento
- npm run build: gera build de producao
- npm run preview: sobe build local para validacao

## Testes

Executar testes da API:

```bash
cd api
npm test
```

Se a porta 3001 estiver ocupada, rode com porta aleatoria no PowerShell:

```powershell
$env:PORT=0
npm test
```

Relatorio HTML gerado em:

- api/mochawesome-report/report.html

## Build de producao

```bash
cd frontend
npm run build
```

## Solucao de problemas

- Frontend sem dados: confirme API ativa em localhost:3001
- Erro 401/403: refaca login e valide o header Authorization
- Erro ao salvar transacao: valide categoria, tipo e data enviados
- Filtro sem resultados: confira mes/ano selecionados e data da transacao

## Observacoes

- Persistencia em memoria na API (dados reiniciam ao subir o servidor).
- Projeto focado em estudo/pratica de arquitetura fullstack com separacao API + SPA.
