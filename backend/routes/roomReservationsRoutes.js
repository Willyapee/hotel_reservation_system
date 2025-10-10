// routes/roomReservationsRoutes.js
import express from 'express';
import { 
    createBooking, 
    getUserBookings, 
    cancelBooking,
    getRoomReservationById 
} from '../controllers/roomReservationsController.js';

const router = express.Router();

// POST /room-reservations - Create new room reservation
router.post('/', createBooking);

// GET /room-reservations/user/:id_user - Get user's room reservations
router.get('/user/:id_user', getUserBookings);

// GET /room-reservations/:id - Get room reservation by ID
router.get('/:id', getRoomReservationById);

// PUT /room-reservations/:id_reservation/cancel - Cancel room reservation
router.put('/:id/cancel', cancelBooking);

export default router;