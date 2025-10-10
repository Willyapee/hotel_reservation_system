// routes/invoiceRoutes.js
import express from 'express';
import { 
    getInvoiceById,
    getInvoicesByUser,
    updateInvoiceStatus 
} from '../controllers/invoiceController.js';

const router = express.Router();

// GET /invoices/:id - Get invoice by ID
router.get('/:id', getInvoiceById);

// GET /invoices/user/:id_user - Get invoices by user
router.get('/user/:id_user', getInvoicesByUser);

// PUT /invoices/:id/status - Update invoice status
router.put('/:id/status', updateInvoiceStatus);

export default router;