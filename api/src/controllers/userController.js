import {
  getUserById,
  listUsers,
  requestPasswordReset,
  resetPasswordWithToken,
  registerUser,
  changeOwnPassword,
  changeUserStatus,
} from '../services/userService.js';

export function getUsers(req, res) {
  const users = listUsers();
  return res.status(200).json(users);
}

export function getUserByIdHandler(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  const result = getUserById(id);
  if (result.notFound) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  return res.status(200).json(result.user);
}

export function postUserRegister(req, res) {
  const { username, password } = req.body;

  if (!username || typeof username !== 'string' || username.trim() === '') {
    return res.status(400).json({ erro: "O campo 'username' é obrigatório." });
  }

  if (!password || typeof password !== 'string' || password.trim() === '') {
    return res.status(400).json({ erro: "O campo 'password' é obrigatório." });
  }

  const result = registerUser({ username, password });
  if (result.conflict) {
    return res.status(409).json({ erro: 'Usuário já cadastrado.' });
  }

  return res.status(201).json(result.user);
}

export function patchOwnPassword(req, res) {
  const { current_password, new_password } = req.body;

  if (!current_password || typeof current_password !== 'string' || current_password.trim() === '') {
    return res.status(400).json({ erro: "O campo 'current_password' é obrigatório." });
  }

  if (!new_password || typeof new_password !== 'string' || new_password.trim() === '') {
    return res.status(400).json({ erro: "O campo 'new_password' é obrigatório." });
  }

  if (current_password.trim() === new_password.trim()) {
    return res.status(400).json({ erro: 'A nova senha deve ser diferente da senha atual.' });
  }

  const result = changeOwnPassword(req.user.user_id, {
    current_password: current_password.trim(),
    new_password: new_password.trim(),
  });

  if (result.notFound || result.inactive) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  if (result.invalidCurrentPassword) {
    return res.status(400).json({ erro: 'Senha atual inválida.' });
  }

  return res.status(200).json({ mensagem: 'Senha atualizada com sucesso.' });
}

export function patchUserStatus(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  const { active } = req.body;
  if (typeof active !== 'boolean') {
    return res.status(400).json({ erro: "O campo 'active' deve ser booleano." });
  }

  const result = changeUserStatus(id, active);
  if (result.notFound) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  return res.status(200).json(result.user);
}

export function postForgotPassword(req, res) {
  const { username } = req.body;

  if (!username || typeof username !== 'string' || username.trim() === '') {
    return res.status(400).json({ erro: "O campo 'username' é obrigatório." });
  }

  const result = requestPasswordReset({ username: username.trim() });
  if (result.notFound || result.inactive) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  return res.status(200).json(result);
}

export function postResetPassword(req, res) {
  const { username, reset_token, new_password } = req.body;

  if (!username || typeof username !== 'string' || username.trim() === '') {
    return res.status(400).json({ erro: "O campo 'username' é obrigatório." });
  }

  if (!reset_token || typeof reset_token !== 'string' || reset_token.trim() === '') {
    return res.status(400).json({ erro: "O campo 'reset_token' é obrigatório." });
  }

  if (!new_password || typeof new_password !== 'string' || new_password.trim() === '') {
    return res.status(400).json({ erro: "O campo 'new_password' é obrigatório." });
  }

  const result = resetPasswordWithToken({
    username: username.trim(),
    reset_token: reset_token.trim(),
    new_password: new_password.trim(),
  });

  if (result.notFound || result.inactive) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  if (result.invalidToken) {
    return res.status(400).json({ erro: 'Token de recuperação inválido.' });
  }

  if (result.expiredToken) {
    return res.status(400).json({ erro: 'Token de recuperação expirado.' });
  }

  if (result.samePassword) {
    return res.status(400).json({ erro: 'A nova senha deve ser diferente da senha atual.' });
  }

  return res.status(200).json({ mensagem: 'Senha redefinida com sucesso.' });
}
