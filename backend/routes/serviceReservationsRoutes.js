// routes/serviceReservationsRoutes.js
import express from 'express';
import { 
    addServiceToReservation, 
    getServicesByRoomReservation 
} from '../controllers/serviceReservationsController.js';

const router = express.Router();

// POST /service-reservations - Add service to room reservation
router.post('/', addServiceToReservation);

// GET /service-reservations/room-reservation/:id_room_reservation - Get services by room reservation
router.get('/room-reservation/:id_room_reservation', getServicesByRoomReservation);

export default router;