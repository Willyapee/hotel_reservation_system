import express from 'express';
import {
	getAllServices,
	getServiceById,
	createService,
	deleteServices,
	updateService,
} from '../controllers/servicesController.js';

const router = express.Router();

router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.post('/', createService);
router.delete('/:id', deleteServices);
router.put('/:id', updateService);

export default router;
