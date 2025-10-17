// routes/servicesRoutes.js
import express from 'express';
import { 
    getAllServices, 
    getServiceById, 
    createService 
} from '../controllers/servicesController.js';

const router = express.Router();

// GET /services - Get all services
router.get('/', getAllServices);

// GET /services/:id - Get service by ID
router.get('/:id', getServiceById);

// POST /services - Create new service (admin)
router.post('/', createService);

export default router;