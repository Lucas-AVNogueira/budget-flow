import {
  listTransactions,
  createTransaction,
  editTransaction,
  removeTransaction,
  getSummary,
} from '../services/transactionService.js';

export function getTransactions(req, res) {
  const { mes, ano } = req.query;
  if (!mes || !ano) {
    return res.status(400).json({ erro: "Os parâmetros 'mes' e 'ano' são obrigatórios." });
  }
  const transactions = listTransactions(req.user.user_id, mes, ano);
  return res.status(200).json(transactions);
}

export function postTransaction(req, res) {
  const result = createTransaction(req.user.user_id, req.body);
  if (result.error) return res.status(400).json({ erro: result.error });
  return res.status(201).json(result.transaction);
}

export function putTransaction(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(404).json({ erro: 'ID de transação inexistente.' });

  const result = editTransaction(req.user.user_id, id, req.body);
  if (result.notFound) return res.status(404).json({ erro: 'ID de transação inexistente.' });
  if (result.error) return res.status(400).json({ erro: result.error });
  return res.status(200).json(result.transaction);
}

export function deleteTransactionHandler(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(404).json({ erro: 'ID de transação inexistente.' });

  const result = removeTransaction(req.user.user_id, id);
  if (result.notFound) return res.status(404).json({ erro: 'ID de transação inexistente.' });
  return res.status(204).send();
}

export function getSummaryHandler(req, res) {
  const { mes, ano } = req.params;
  const summary = getSummary(req.user.user_id, mes, ano);
  return res.status(200).json(summary);
}
