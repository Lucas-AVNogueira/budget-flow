import {
  getAllTransactions,
  addTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from '../data/store.js';
import { validateTransaction } from '../utils/validators.js';

export function listTransactions(userId, mes, ano) {
  const m = parseInt(mes, 10);
  const y = parseInt(ano, 10);
  return getAllTransactions().filter((t) => {
    if (t.user_id !== userId) return false;
    const d = new Date(t.data + 'T00:00:00');
    return d.getMonth() + 1 === m && d.getFullYear() === y;
  });
}

export function createTransaction(userId, body) {
  const error = validateTransaction(body);
  if (error) return { error };

  const { descricao, valor, tipo, responsavel, data } = body;
  const transaction = addTransaction({
    descricao: String(descricao).trim(),
    valor,
    tipo,
    responsavel: String(responsavel).trim(),
    data,
    user_id: userId,
  });
  return { transaction };
}

export function editTransaction(userId, id, body) {
  const existing = getTransactionById(id);
  if (!existing) return { notFound: true };
  if (existing.user_id !== userId) return { notFound: true };

  const error = validateTransaction(body);
  if (error) return { error };

  const { descricao, valor, tipo, responsavel, data } = body;
  const updated = updateTransaction(id, {
    descricao: String(descricao).trim(),
    valor,
    tipo,
    responsavel: String(responsavel).trim(),
    data,
  });
  return { transaction: updated };
}

export function removeTransaction(userId, id) {
  const existing = getTransactionById(id);
  if (!existing) return { notFound: true };
  if (existing.user_id !== userId) return { notFound: true };
  deleteTransaction(id);
  return { deleted: true };
}

export function getSummary(userId, mes, ano) {
  const transactions = listTransactions(userId, mes, ano);

  const total_entradas = transactions
    .filter((t) => t.tipo === 'ENTRADA')
    .reduce((sum, t) => sum + t.valor, 0);

  const total_despesas = transactions
    .filter((t) => t.tipo === 'SAIDA')
    .reduce((sum, t) => sum + t.valor, 0);

  const saldo_mensal = total_entradas - total_despesas;
  const is_limite_excedido = saldo_mensal < 0;

  const resumo_por_pessoa = {};
  for (const t of transactions) {
    if (t.tipo === 'SAIDA') {
      resumo_por_pessoa[t.responsavel] =
        (resumo_por_pessoa[t.responsavel] || 0) + t.valor;
    }
  }

  return {
    total_entradas,
    total_despesas,
    saldo_mensal,
    is_limite_excedido,
    resumo_por_pessoa,
  };
}
