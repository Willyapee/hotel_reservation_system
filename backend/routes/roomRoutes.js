// routes/roomRoutes.js
import express from 'express';
import { searchAvailableRooms } from '../controllers/roomController.js';

const router = express.Router();

// GET /rooms/search?check_in=2024-01-15&check_out=2024-01-20&adults=2
router.get('/search', searchAvailableRooms);

export default router;