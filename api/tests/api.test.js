import express from 'express';
import { expect } from 'chai';
import supertest from 'supertest';
import { createApp } from '../src/server.js';
import { resetStore } from '../src/data/store.js';
import { errorMiddleware } from '../src/middlewares/errors.js';

// ─── Setup ────────────────────────────────────────────────────────────────────

const ALICE = { username: 'alice', password: 'alice123' };
const BOB   = { username: 'bob',   password: 'bob123'   };

function txBody(overrides = {}) {
  return {
    descricao:   'Aluguel',
    valor:       1500,
    tipo:        'SAIDA',
    categoria:   'Aluguel/Financiamento',
    responsavel: 'Alice',
    data:        '2024-04-15',
    ...overrides,
  };
}

let app;
let api;
let aliceToken;
let bobToken;

before(async () => {
  app = createApp();
  api = supertest(app);

  const r1 = await api.post('/auth/login').send(ALICE);
  aliceToken = r1.body.token;

  const r2 = await api.post('/auth/login').send(BOB);
  bobToken = r2.body.token;
});

beforeEach(() => {
  resetStore();
});

const auth = (token) => ({ Authorization: `Bearer ${token}` });

// ─── POST /auth/login ─────────────────────────────────────────────────────────

describe('POST /auth/login', () => {
  it('deve retornar token com credenciais válidas', async () => {
    const res = await api.post('/auth/login').send(ALICE);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('token').that.is.a('string');
  });

  it('deve retornar 401 com credenciais inválidas', async () => {
    const res = await api.post('/auth/login').send({ username: 'alice', password: 'errada' });
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('erro');
  });
});

// ─── Autenticação ─────────────────────────────────────────────────────────────

describe('Autenticação', () => {
  it('acesso sem token retorna 401', async () => {
    const res = await api.get('/transactions?mes=4&ano=2024');
    expect(res.status).to.equal(401);
    expect(res.body.erro).to.equal('Acesso não autorizado.');
  });

  it('acesso com token inválido retorna 401', async () => {
    const res = await api
      .get('/transactions?mes=4&ano=2024')
      .set('Authorization', 'Bearer token.invalido.aqui');
    expect(res.status).to.equal(401);
    expect(res.body.erro).to.equal('Acesso não autorizado.');
  });
});

// ─── GET /transactions ────────────────────────────────────────────────────────

describe('GET /transactions', () => {
  it('retorna lista vazia quando não há transações', async () => {
    const res = await api.get('/transactions?mes=4&ano=2024').set(auth(aliceToken));
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array').that.is.empty;
  });
});

// ─── POST /transactions ───────────────────────────────────────────────────────

describe('POST /transactions', () => {
  it('cria transação com sucesso e retorna 201', async () => {
    const res = await api.post('/transactions').set(auth(aliceToken)).send(txBody());
    expect(res.status).to.equal(201);
    expect(res.body).to.include({
      descricao: 'Aluguel',
      valor: 1500,
      tipo: 'SAIDA',
      categoria: 'Aluguel/Financiamento',
    });
    expect(res.body.id).to.be.a('number');
  });

  it('IDs são incrementais', async () => {
    const r1 = await api.post('/transactions').set(auth(aliceToken)).send(txBody({ descricao: 'Tx1' }));
    const r2 = await api.post('/transactions').set(auth(aliceToken)).send(txBody({ descricao: 'Tx2' }));
    expect(r2.body.id).to.equal(r1.body.id + 1);
  });
});

// ─── Isolamento por user_id ───────────────────────────────────────────────────

describe('Isolamento por user_id', () => {
  it('alice não vê transações de bob', async () => {
    await api.post('/transactions').set(auth(bobToken)).send(txBody({ data: '2024-04-10' }));
    const res = await api.get('/transactions?mes=4&ano=2024').set(auth(aliceToken));
    expect(res.body).to.be.an('array').that.is.empty;
  });
});

// ─── PUT /transactions/:id ────────────────────────────────────────────────────

describe('PUT /transactions/:id', () => {
  it('atualiza transação com sucesso', async () => {
    const cr = await api.post('/transactions').set(auth(aliceToken)).send(txBody());
    const id = cr.body.id;

    const res = await api
      .put(`/transactions/${id}`)
      .set(auth(aliceToken))
      .send(txBody({ descricao: 'Aluguel Atualizado', valor: 2000 }));
    expect(res.status).to.equal(200);
    expect(res.body.descricao).to.equal('Aluguel Atualizado');
    expect(res.body.valor).to.equal(2000);
  });
});

// ─── DELETE /transactions/:id ─────────────────────────────────────────────────

describe('DELETE /transactions/:id', () => {
  it('exclui transação e retorna 204', async () => {
    const cr = await api.post('/transactions').set(auth(aliceToken)).send(txBody());
    const res = await api.delete(`/transactions/${cr.body.id}`).set(auth(aliceToken));
    expect(res.status).to.equal(204);
  });

  it('IDs excluídos não são reutilizados', async () => {
    const cr = await api.post('/transactions').set(auth(aliceToken)).send(txBody());
    const id = cr.body.id;

    await api.delete(`/transactions/${id}`).set(auth(aliceToken));

    const cr2 = await api.post('/transactions').set(auth(aliceToken)).send(txBody({ descricao: 'Nova' }));
    expect(cr2.body.id).to.be.greaterThan(id);
  });
});

// ─── Filtragem por mês/ano ────────────────────────────────────────────────────

describe('Filtragem por mês/ano', () => {
  it('retorna somente transações do mês/ano solicitado', async () => {
    await api.post('/transactions').set(auth(aliceToken)).send(txBody({ data: '2024-04-15' }));
    await api.post('/transactions').set(auth(aliceToken)).send(txBody({ data: '2024-05-01', descricao: 'Outro mês' }));

    const res = await api.get('/transactions?mes=4&ano=2024').set(auth(aliceToken));
    expect(res.body).to.have.lengthOf(1);
    expect(res.body[0].data).to.equal('2024-04-15');
  });
});

// ─── Validações de responsavel ────────────────────────────────────────────────

describe('Validações de responsavel', () => {
  it('responsavel nulo retorna 400', async () => {
    const res = await api.post('/transactions').set(auth(aliceToken)).send(txBody({ responsavel: null }));
    expect(res.status).to.equal(400);
    expect(res.body.erro).to.include('responsavel');
  });

  it('responsavel vazio retorna 400', async () => {
    const res = await api.post('/transactions').set(auth(aliceToken)).send(txBody({ responsavel: '' }));
    expect(res.status).to.equal(400);
    expect(res.body.erro).to.include('responsavel');
  });

  it('responsavel com apenas espaços retorna 400', async () => {
    const res = await api.post('/transactions').set(auth(aliceToken)).send(txBody({ responsavel: '   ' }));
    expect(res.status).to.equal(400);
    expect(res.body.erro).to.include('responsavel');
  });
});

// ─── Validações de valor ──────────────────────────────────────────────────────

describe('Validações de valor', () => {
  it('valor zero retorna 400', async () => {
    const res = await api.post('/transactions').set(auth(aliceToken)).send(txBody({ valor: 0 }));
    expect(res.status).to.equal(400);
    expect(res.body.erro).to.include('valor');
  });

  it('valor negativo retorna 400', async () => {
    const res = await api.post('/transactions').set(auth(aliceToken)).send(txBody({ valor: -100 }));
    expect(res.status).to.equal(400);
    expect(res.body.erro).to.include('valor');
  });
});

// ─── Validação de tipo ────────────────────────────────────────────────────────

describe('Validação de tipo', () => {
  it('tipo inválido retorna 400 com mensagem correta', async () => {
    const res = await api.post('/transactions').set(auth(aliceToken)).send(txBody({ tipo: 'INVALIDO' }));
    expect(res.status).to.equal(400);
    expect(res.body.erro).to.equal("O campo 'tipo' deve ser ENTRADA ou SAIDA.");
  });
});

// ─── Validação de data ────────────────────────────────────────────────────────

describe('Validação de data', () => {
  it('data fora do formato YYYY-MM-DD retorna 400', async () => {
    const res = await api.post('/transactions').set(auth(aliceToken)).send(txBody({ data: '15/04/2024' }));
    expect(res.status).to.equal(400);
    expect(res.body.erro).to.include('data');
  });
});

// ─── Validação de categoria ───────────────────────────────────────────────────

describe('Validação de categoria', () => {
  it("categoria 'Outros' e aceita", async () => {
    const res = await api
      .post('/transactions')
      .set(auth(aliceToken))
      .send(txBody({ categoria: 'Outros' }));
    expect(res.status).to.equal(201);
    expect(res.body.categoria).to.equal('Outros');
  });

  it('categoria vazia retorna 400', async () => {
    const res = await api.post('/transactions').set(auth(aliceToken)).send(txBody({ categoria: '' }));
    expect(res.status).to.equal(400);
    expect(res.body.erro).to.include('categoria');
  });

  it('categoria invalida retorna 400', async () => {
    const res = await api.post('/transactions').set(auth(aliceToken)).send(txBody({ categoria: 'Outra' }));
    expect(res.status).to.equal(400);
    expect(res.body.erro).to.include('categoria');
  });
});

// ─── PUT/DELETE com ID inexistente ────────────────────────────────────────────

describe('PUT/DELETE com ID inexistente', () => {
  it('PUT retorna 404', async () => {
    const res = await api.put('/transactions/9999').set(auth(aliceToken)).send(txBody());
    expect(res.status).to.equal(404);
    expect(res.body.erro).to.equal('ID de transação inexistente.');
  });

  it('DELETE retorna 404', async () => {
    const res = await api.delete('/transactions/9999').set(auth(aliceToken));
    expect(res.status).to.equal(404);
    expect(res.body.erro).to.equal('ID de transação inexistente.');
  });
});

// ─── Método não permitido ─────────────────────────────────────────────────────

describe('Método não permitido', () => {
  it('PATCH /transactions retorna 405', async () => {
    const res = await api.patch('/transactions').set(auth(aliceToken));
    expect(res.status).to.equal(405);
  });

  it('GET /auth/login retorna 405', async () => {
    const res = await api.get('/auth/login');
    expect(res.status).to.equal(405);
  });
});

// ─── Rota inexistente ─────────────────────────────────────────────────────────

describe('Rota inexistente', () => {
  it('retorna 404', async () => {
    const res = await api.get('/rota-que-nao-existe');
    expect(res.status).to.equal(404);
  });
});

// ─── Erro interno 500 ─────────────────────────────────────────────────────────

describe('Erro interno 500', () => {
  it('middleware de erro retorna 500 ao lançar exceção', async () => {
    const testApp = express();
    testApp.get('/test-error-500', (_req, _res, next) => next(new Error('Erro forçado')));
    testApp.use(errorMiddleware);
    const res = await supertest(testApp).get('/test-error-500');
    expect(res.status).to.equal(500);
    expect(res.body.erro).to.include('Erro interno');
  });
});

// ─── GET /summary/:mes/:ano ───────────────────────────────────────────────────

describe('GET /summary/:mes/:ano', () => {
  beforeEach(async () => {
    await api.post('/transactions').set(auth(aliceToken))
      .send(txBody({ descricao: 'Salário', valor: 5000, tipo: 'ENTRADA', responsavel: 'Alice', data: '2024-04-05' }));
    await api.post('/transactions').set(auth(aliceToken))
      .send(txBody({ descricao: 'Aluguel', valor: 1500, tipo: 'SAIDA', responsavel: 'Alice', data: '2024-04-10' }));
    await api.post('/transactions').set(auth(aliceToken))
      .send(txBody({ descricao: 'Mercado', valor: 800, tipo: 'SAIDA', responsavel: 'Bob', data: '2024-04-20' }));
  });

  it('calcula totais corretos', async () => {
    const res = await api.get('/summary/4/2024').set(auth(aliceToken));
    expect(res.status).to.equal(200);
    expect(res.body.total_entradas).to.equal(5000);
    expect(res.body.total_despesas).to.equal(2300);
    expect(res.body.saldo_mensal).to.equal(2700);
  });

  it('saldo_mensal negativo com sinal de subtração', async () => {
    await api.post('/transactions').set(auth(aliceToken))
      .send(txBody({ descricao: 'Despesa extra', valor: 6000, tipo: 'SAIDA', responsavel: 'Alice', data: '2024-04-25' }));
    const res = await api.get('/summary/4/2024').set(auth(aliceToken));
    expect(res.body.saldo_mensal).to.be.lessThan(0);
  });

  it('is_limite_excedido true quando saldo < 0', async () => {
    await api.post('/transactions').set(auth(aliceToken))
      .send(txBody({ descricao: 'Despesa extra', valor: 6000, tipo: 'SAIDA', responsavel: 'Alice', data: '2024-04-25' }));
    const res = await api.get('/summary/4/2024').set(auth(aliceToken));
    expect(res.body.is_limite_excedido).to.be.true;
  });

  it('is_limite_excedido false quando saldo >= 0', async () => {
    const res = await api.get('/summary/4/2024').set(auth(aliceToken));
    expect(res.body.is_limite_excedido).to.be.false;
  });

  it('resumo_por_pessoa correto', async () => {
    const res = await api.get('/summary/4/2024').set(auth(aliceToken));
    expect(res.body.resumo_por_pessoa).to.deep.equal({ Alice: 1500, Bob: 800 });
    expect(res.body.resumo_por_pessoa_categoria).to.deep.equal({
      Alice: { 'Aluguel/Financiamento': 1500 },
      Bob: { 'Aluguel/Financiamento': 800 },
    });
  });

  it('recalcula summary após criar, editar e excluir transações', async () => {
    const cr = await api.post('/transactions').set(auth(aliceToken))
      .send(txBody({ descricao: 'Extra', valor: 200, tipo: 'SAIDA', responsavel: 'Alice', data: '2024-04-28' }));

    let s = await api.get('/summary/4/2024').set(auth(aliceToken));
    expect(s.body.total_despesas).to.equal(2500);

    await api.put(`/transactions/${cr.body.id}`).set(auth(aliceToken))
      .send(txBody({ descricao: 'Extra', valor: 400, tipo: 'SAIDA', responsavel: 'Alice', data: '2024-04-28' }));
    s = await api.get('/summary/4/2024').set(auth(aliceToken));
    expect(s.body.total_despesas).to.equal(2700);

    await api.delete(`/transactions/${cr.body.id}`).set(auth(aliceToken));
    s = await api.get('/summary/4/2024').set(auth(aliceToken));
    expect(s.body.total_despesas).to.equal(2300);
  });
});

// ─── GET /categories ─────────────────────────────────────────────────────────

describe('GET /categories', () => {
  it('retorna lista de categorias para usuario autenticado', async () => {
    const res = await api.get('/categories').set(auth(aliceToken));
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array').that.is.not.empty;
    expect(res.body[0]).to.have.property('group');
    expect(res.body[0]).to.have.property('options');
    expect(res.body[0].options).to.be.an('array').that.is.not.empty;
  });

  it('retorna 401 sem token', async () => {
    const res = await api.get('/categories');
    expect(res.status).to.equal(401);
    expect(res.body.erro).to.equal('Acesso não autorizado.');
  });
});
