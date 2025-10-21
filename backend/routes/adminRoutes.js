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
} from '../controllers/adminRoomController.js';

const router = express.Router();

//CRUD untuk Rooms
router.get('/rooms', readRooms);
router.post('/rooms', createRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

//CRUD untuk Room Types
router.get('/room-types', readRoomTypes);
router.post('/room-types', createRoomType);
router.put('/room-types/:id', updateRoomType);
router.delete('/room-types/:id', deleteRoomType);

export default router;

