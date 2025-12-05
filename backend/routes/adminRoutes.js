import express from 'express';
import {
	createRoom,
	readRooms,
	updateRoom,
	deleteRoom,
	createRoomType,
	readRoomTypes,
	updateRoomType,
	deleteRoomType,
	readServices,
	createService,
	updateService,
	deleteServices,
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/rooms', readRooms);
router.post('/rooms', createRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

router.get('/room-types', readRoomTypes);
router.post('/room-types', createRoomType);
router.put('/room-types/:id', updateRoomType);
router.delete('/room-types/:id', deleteRoomType);

router.get('/services', readServices);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteServices);

export default router;
