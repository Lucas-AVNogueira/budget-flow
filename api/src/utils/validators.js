export function validateTransaction(body) {
  const { descricao, valor, tipo, responsavel, data } = body;

  if (
    responsavel === undefined ||
    responsavel === null ||
    String(responsavel).trim() === ''
  ) {
    return "O campo 'responsavel' é obrigatório e não pode estar vazio.";
  }

  if (typeof valor !== 'number' || valor <= 0) {
    return "O campo 'valor' deve ser um número positivo.";
  }

  if (tipo !== 'ENTRADA' && tipo !== 'SAIDA') {
    return "O campo 'tipo' deve ser ENTRADA ou SAIDA.";
  }

  if (!descricao || String(descricao).trim() === '') {
    return "O campo 'descricao' é obrigatório e não pode estar vazio.";
  }

  if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return "O campo 'data' deve estar no formato YYYY-MM-DD.";
  }

  return null;
}
