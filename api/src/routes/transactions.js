import { Router } from 'express';
import {
  getTransactions,
  postTransaction,
  putTransaction,
  deleteTransactionHandler,
  getSummaryHandler,
} from '../controllers/transactionController.js';
import { methodNotAllowed } from '../middlewares/methodNotAllowed.js';

const router = Router();

router.get('/', getTransactions);
router.post('/', postTransaction);
router.all('/', methodNotAllowed(['GET', 'POST']));

router.put('/:id', putTransaction);
router.delete('/:id', deleteTransactionHandler);
router.all('/:id', methodNotAllowed(['PUT', 'DELETE']));

export default router;
