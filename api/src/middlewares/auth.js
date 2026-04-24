import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/config.js';
import { findUserById } from '../data/users.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Acesso não autorizado.' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = findUserById(payload.user_id);
    if (!user || !user.active) {
      return res.status(401).json({ erro: 'Acesso não autorizado.' });
    }
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ erro: 'Acesso não autorizado.' });
  }
}
