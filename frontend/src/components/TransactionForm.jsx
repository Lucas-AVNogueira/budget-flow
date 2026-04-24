import { useState } from 'react';
import { apiCreateTransaction, apiUpdateTransaction } from '../services/api.js';

const EMPTY = { descricao: '', valor: '', tipo: 'SAIDA', responsavel: '', data: '' };

export default function TransactionForm({ token, editData, onSaved, onCancel, defaultDate = '' }) {
  const [form, setForm] = useState(
    editData
      ? { ...editData, valor: String(editData.valor) }
      : { ...EMPTY, data: defaultDate }
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body = {
        ...form,
        valor: parseFloat(form.valor),
      };
      if (editData) {
        await apiUpdateTransaction(token, editData.id, body);
      } else {
        await apiCreateTransaction(token, body);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <div className="form-row">
        <input
          name="descricao"
          placeholder="Descrição"
          value={form.descricao}
          onChange={handleChange}
          required
        />
        <input
          name="valor"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Valor"
          value={form.valor}
          onChange={handleChange}
          required
        />
        <select name="tipo" value={form.tipo} onChange={handleChange}>
          <option value="SAIDA">Despesa</option>
          <option value="ENTRADA">Entrada</option>
        </select>
      </div>
      <div className="form-row">
        <input
          name="responsavel"
          placeholder="Responsável"
          value={form.responsavel}
          onChange={handleChange}
          required
        />
        <input
          name="data"
          type="date"
          value={form.data}
          onChange={handleChange}
          required
        />
      </div>
      {error && <p className="error-msg">{error}</p>}
      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn-neutral" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : editData ? 'Atualizar' : 'Adicionar'}
        </button>
      </div>
    </form>
  );
}
