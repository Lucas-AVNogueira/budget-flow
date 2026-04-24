import { Router } from 'express';
import { CATEGORY_GROUPS } from '../constants/categories.js';
import { methodNotAllowed } from '../middlewares/methodNotAllowed.js';

const router = Router();

router.get('/', (_req, res) => {
  return res.status(200).json(CATEGORY_GROUPS);
});

router.all('/', methodNotAllowed(['GET']));

export default router;
