import express from 'express';
import { 
    getUserPendingInvoices, 
    updateInvoiceStatus,
    getInvoiceDetails 
} from '../controllers/invoiceController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/pending', verifyToken, getUserPendingInvoices);
router.get('/:invoiceId', verifyToken, getInvoiceDetails);
router.patch('/:invoiceId/status', verifyToken, updateInvoiceStatus);
router.put('/:invoiceId/status', verifyToken, updateInvoiceStatus); // backup PUT method

export default router;