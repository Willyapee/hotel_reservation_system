// routes/adminRoutes.js
import express from 'express';
import { 
    assignRoomOnCheckin,
    addServicesDuringStay,
    checkoutAndGenerateInvoice,
    getActiveStays
} from '../controllers/adminController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /admin/checkin - Assign room on check-in
router.post('/checkin', verifyToken, assignRoomOnCheckin);

// POST /admin/services - Add services during stay
router.post('/services', verifyToken, addServicesDuringStay);

// POST /admin/checkout - Checkout and generate final invoice
router.post('/checkout', verifyToken, checkoutAndGenerateInvoice);

// GET /admin/active-stays - Get active stays
router.get('/active-stays', verifyToken, getActiveStays);

export default router;