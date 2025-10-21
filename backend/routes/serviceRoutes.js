import express from 'express';
import { 
    getAllServices, 
    getServiceById, 
    createService 
} from '../controllers/servicesController.js';

const router = express.Router();

router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.post('/', createService);

export default router;