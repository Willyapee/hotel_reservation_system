import express from 'express';
import { 
    addServiceToReservation, 
    getServicesByRoomReservation 
} from '../controllers/serviceReservationsController.js';

const router = express.Router();

router.post('/', addServiceToReservation);
router.get('/room-reservation/:id_room_reservation', getServicesByRoomReservation);

export default router;