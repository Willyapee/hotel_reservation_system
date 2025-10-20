import express from 'express';
import { searchAvailableRooms } from '../controllers/roomController.js';

const router = express.Router();

router.get('/search', searchAvailableRooms);

export default router;