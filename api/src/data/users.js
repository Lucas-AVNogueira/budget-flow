// Usuários mockados em memória
const initialUsers = [
  {
    id: 1,
    username: 'alice',
    password: 'alice123',
    active: true,
    reset_token: null,
    reset_token_expires_at: null,
  },
  {
    id: 2,
    username: 'bob',
    password: 'bob123',
    active: true,
    reset_token: null,
    reset_token_expires_at: null,
  },
];

export let users = initialUsers.map((user) => ({ ...user }));
let nextUserId = users.length + 1;

export function findUserById(id) {
  return users.find((user) => user.id === id);
}

export function getAllUsers() {
  return users;
}

export function findUserByUsername(username) {
  const normalized = String(username).trim().toLowerCase();
  return users.find((user) => user.username.toLowerCase() === normalized);
}

export function addUser({ username, password }) {
  const newUser = {
    id: nextUserId++,
    username,
    password,
    active: true,
  };
  users.push(newUser);
  return newUser;
}

export function updateUserPassword(id, newPassword) {
  const user = findUserById(id);
  if (!user) return null;
  user.password = newPassword;
  return user;
}

export function updateUserStatus(id, active) {
  const user = findUserById(id);
  if (!user) return null;
  user.active = active;
  return user;
}

export function setUserResetToken(id, token, expiresAt) {
  const user = findUserById(id);
  if (!user) return null;
  user.reset_token = token;
  user.reset_token_expires_at = expiresAt;
  return user;
}

export function clearUserResetToken(id) {
  const user = findUserById(id);
  if (!user) return null;
  user.reset_token = null;
  user.reset_token_expires_at = null;
  return user;
}

export function resetUsers() {
  users = initialUsers.map((user) => ({ ...user }));
  nextUserId = users.length + 1;
}
