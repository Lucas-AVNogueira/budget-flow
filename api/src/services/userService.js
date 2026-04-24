import crypto from 'crypto';
import {
  addUser,
  clearUserResetToken,
  findUserById,
  findUserByUsername,
  getAllUsers,
  setUserResetToken,
  updateUserPassword,
  updateUserStatus,
} from '../data/users.js';

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

function sanitizeUsername(username) {
  return String(username).trim();
}

function sanitizePassword(password) {
  return String(password).trim();
}

function safeUser(user) {
  return {
    id: user.id,
    username: user.username,
    active: user.active,
  };
}

export function listUsers() {
  return getAllUsers().map(safeUser);
}

export function getUserById(userId) {
  const user = findUserById(userId);
  if (!user) return { notFound: true };
  return { user: safeUser(user) };
}

export function registerUser({ username, password }) {
  const normalizedUsername = sanitizeUsername(username);
  const normalizedPassword = sanitizePassword(password);

  const existing = findUserByUsername(normalizedUsername);
  if (existing) return { conflict: true };

  const newUser = addUser({
    username: normalizedUsername,
    password: normalizedPassword,
  });

  return { user: safeUser(newUser) };
}

export function changeOwnPassword(userId, { current_password, new_password }) {
  const user = findUserById(userId);
  if (!user) return { notFound: true };
  if (!user.active) return { inactive: true };
  if (user.password !== current_password) return { invalidCurrentPassword: true };

  updateUserPassword(userId, sanitizePassword(new_password));
  return { updated: true };
}

export function changeUserStatus(targetUserId, active) {
  const user = updateUserStatus(targetUserId, active);
  if (!user) return { notFound: true };
  return { user: safeUser(user) };
}

export function requestPasswordReset({ username }) {
  const user = findUserByUsername(username);
  if (!user) return { notFound: true };
  if (!user.active) return { inactive: true };

  const resetToken = crypto.randomBytes(16).toString('hex');
  const expiresAt = Date.now() + RESET_TOKEN_TTL_MS;

  setUserResetToken(user.id, resetToken, expiresAt);

  return {
    reset_token: resetToken,
    expires_in_seconds: Math.floor(RESET_TOKEN_TTL_MS / 1000),
  };
}

export function resetPasswordWithToken({ username, reset_token, new_password }) {
  const user = findUserByUsername(username);
  if (!user) return { notFound: true };
  if (!user.active) return { inactive: true };

  if (!user.reset_token || !user.reset_token_expires_at) {
    return { invalidToken: true };
  }

  if (user.reset_token !== reset_token) {
    return { invalidToken: true };
  }

  if (Date.now() > user.reset_token_expires_at) {
    clearUserResetToken(user.id);
    return { expiredToken: true };
  }

  const normalizedPassword = sanitizePassword(new_password);
  if (user.password === normalizedPassword) {
    return { samePassword: true };
  }

  updateUserPassword(user.id, normalizedPassword);
  clearUserResetToken(user.id);

  return { updated: true };
}
