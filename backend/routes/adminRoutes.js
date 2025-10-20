// backend/routes/adminRoutes.js
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
} from '../controllers/adminController.js';

const router = express.Router();

// === Room Management (CRUD untuk Rooms) ===
// GET /admin/rooms - (Read)
router.get('/rooms', readRooms);

// POST /admin/rooms - (Create)
router.post('/rooms', createRoom);

// PUT /admin/rooms/:id - (Update)
router.put('/rooms/:id', updateRoom);

// DELETE /admin/rooms/:id - (Delete)
router.delete('/rooms/:id', deleteRoom);

// === Room Type Management (CRUD untuk Room Types) ===
// (Sangat direkomendasikan untuk admin.jsx Anda,
// agar Anda bisa memilih Tipe Kamar saat membuat Kamar baru)

// GET /admin/room-types
router.get('/room-types', readRoomTypes);

// POST /admin/room-types
router.post('/room-types', createRoomType);

// PUT /admin/room-types/:id
router.put('/room-types/:id', updateRoomType);

// DELETE /admin/room-types/:id
router.delete('/room-types/:id', deleteRoomType);

export default router;
