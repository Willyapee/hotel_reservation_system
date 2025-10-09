//Import Libaries
import express from 'express';

//Import Libraries
import { verifyToken } from '../middleware/authMiddleware';
import { createPayment, getPaymentStatus } from '../controllers/paymentController.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createPayment);
router.get('/:id_invoice', getPaymentStatus);

export default router;