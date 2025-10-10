// routes/paymentRoutes.js - UPDATE
import express from 'express';
import { 
    processPaymentAfterCheckout
} from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /payments/checkout - Process payment after checkout
router.post('/checkout', verifyToken, processPaymentAfterCheckout);

export default router;