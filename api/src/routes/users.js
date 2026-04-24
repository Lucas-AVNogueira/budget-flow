import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import {
  getUserByIdHandler,
  getUsers,
  postForgotPassword,
  postResetPassword,
  postUserRegister,
  patchOwnPassword,
  patchUserStatus,
} from '../controllers/userController.js';
import { methodNotAllowed } from '../middlewares/methodNotAllowed.js';

const router = Router();

router.post('/forgot-password', postForgotPassword);
router.all('/forgot-password', methodNotAllowed(['POST']));

router.post('/reset-password', postResetPassword);
router.all('/reset-password', methodNotAllowed(['POST']));

router.get('/', authMiddleware, getUsers);
router.post('/', postUserRegister);
router.all('/', methodNotAllowed(['GET', 'POST']));

router.patch('/password', authMiddleware, patchOwnPassword);
router.all('/password', methodNotAllowed(['PATCH']));

router.patch('/:id/status', authMiddleware, patchUserStatus);
router.all('/:id/status', methodNotAllowed(['PATCH']));

router.get('/:id', authMiddleware, getUserByIdHandler);
router.all('/:id', methodNotAllowed(['GET']));

export default router;
