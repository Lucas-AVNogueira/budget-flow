// Armazenamento em memória
let transactions = [];
let nextId = 1;

export function getAllTransactions() {
  return transactions;
}

export function getTransactionById(id) {
  return transactions.find((t) => t.id === id);
}

export function addTransaction(data) {
  const transaction = { id: nextId++, ...data };
  transactions.push(transaction);
  return transaction;
}

export function updateTransaction(id, data) {
  const index = transactions.findIndex((t) => t.id === id);
  if (index === -1) return null;
  transactions[index] = { ...transactions[index], ...data };
  return transactions[index];
}

export function deleteTransaction(id) {
  const index = transactions.findIndex((t) => t.id === id);
  if (index === -1) return false;
  transactions.splice(index, 1);
  return true;
}

export function resetStore() {
  transactions = [];
  nextId = 1;
}
