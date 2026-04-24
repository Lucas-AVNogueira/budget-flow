import { useState } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

export default function App() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState('');

  function handleLogin(tok, user) {
    setToken(tok);
    setUsername(user);
  }

  function handleLogout() {
    setToken(null);
    setUsername('');
  }

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <DashboardPage token={token} username={username} onLogout={handleLogout} />;
}
