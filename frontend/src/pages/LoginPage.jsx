import { useState } from 'react';
import { apiLogin } from '../services/api.js';
import BrandLogo from '../components/BrandLogo.jsx';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = await apiLogin(username, password);
      onLogin(token, username);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-brand-panel">
          <BrandLogo variant="dark" className="login-logo" />
          <h2 className="login-brand-title">Gerencie suas finanças com clareza.</h2>
          <p className="login-brand-copy">Controle entradas, despesas e saldo em um só lugar.</p>
        </div>

        <div className="login-right-panel">
          <div className="login-form-card">
            <h1 className="login-title">Entrar</h1>
            <p className="login-subtitle">Acesse sua área financeira compartilhada.</p>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-row login-form-row">
                <input
                  type="text"
                  placeholder="Usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="error-msg">{error}</p>}
              <button
                type="submit"
                className="btn-primary login-submit"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
