import { login } from '../services/authService.js';

export function handleLogin(req, res) {
  const { username, password } = req.body;

  if (!username || typeof username !== 'string' || username.trim() === '') {
    return res.status(400).json({ erro: "O campo 'username' é obrigatório." });
  }
  if (!password || typeof password !== 'string' || password.trim() === '') {
    return res.status(400).json({ erro: "O campo 'password' é obrigatório." });
  }

  const token = login(username.trim(), password);
  if (!token) {
    return res.status(401).json({ erro: 'Credenciais inválidas.' });
  }

  return res.status(200).json({ token });
}
