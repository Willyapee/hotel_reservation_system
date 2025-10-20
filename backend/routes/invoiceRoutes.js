import express from 'express';
import { 
    getInvoiceById,
    getInvoicesByUser,
    updateInvoiceStatus 
} from '../controllers/invoiceController.js';

const router = express.Router();

router.get('/:id', getInvoiceById);
router.get('/user/:id_user', getInvoicesByUser);
router.put('/:id/status', updateInvoiceStatus);

export default router;