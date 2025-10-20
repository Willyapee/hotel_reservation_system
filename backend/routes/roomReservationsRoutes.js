import express from 'express';
import { 
    createBooking, 
    getUserBookings, 
    cancelBooking
} from '../controllers/roomReservationsController.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/user/:id_user', getUserBookings);
router.put('/:id/cancel', cancelBooking);

export default router;