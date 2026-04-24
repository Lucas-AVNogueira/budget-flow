const BASE = '';

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function apiLogin(username, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro ao fazer login.');
  return data.token;
}

export async function apiFetchTransactions(token, mes, ano) {
  const res = await fetch(`${BASE}/transactions?mes=${mes}&ano=${ano}`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro ao listar transações.');
  return data;
}

export async function apiCreateTransaction(token, body) {
  const res = await fetch(`${BASE}/transactions`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro ao criar transação.');
  return data;
}

export async function apiUpdateTransaction(token, id, body) {
  const res = await fetch(`${BASE}/transactions/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro ao atualizar transação.');
  return data;
}

export async function apiDeleteTransaction(token, id) {
  const res = await fetch(`${BASE}/transactions/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (res.status === 204) return;
  const data = await res.json();
  throw new Error(data.erro || 'Erro ao excluir transação.');
}

export async function apiFetchSummary(token, mes, ano) {
  const res = await fetch(`${BASE}/summary/${mes}/${ano}`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro ao carregar resumo.');
  return data;
}
