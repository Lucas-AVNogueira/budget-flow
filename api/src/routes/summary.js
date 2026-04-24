import { Router } from 'express';
import { getSummaryHandler } from '../controllers/transactionController.js';
import { methodNotAllowed } from '../middlewares/methodNotAllowed.js';

const router = Router();

router.get('/:mes/:ano', getSummaryHandler);
router.all('/:mes/:ano', methodNotAllowed(['GET']));

export default router;
