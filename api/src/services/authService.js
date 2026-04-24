import jwt from 'jsonwebtoken';
import { users } from '../data/users.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../utils/config.js';

export function login(username, password) {
  const user = users.find(
    (u) => u.username === username && u.password === password && u.active
  );
  if (!user) return null;

  const token = jwt.sign({ user_id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  return token;
}
