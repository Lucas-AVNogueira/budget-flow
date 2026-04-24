import { Router } from 'express';
import { handleLogin } from '../controllers/authController.js';
import { methodNotAllowed } from '../middlewares/methodNotAllowed.js';

const router = Router();

router.post('/login', handleLogin);
router.all('/login', methodNotAllowed(['POST']));

export default router;
