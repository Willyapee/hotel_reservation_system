// routes/reservationRoutes.js - UPDATE LENGKAP
import express from 'express';
import { 
    createTemporaryReservation,
    confirmReservationAfterLogin,
    getAllReservations,
    getUserReservations
} from '../controllers/reservationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /reservations/temporary - Create temporary reservation (tanpa login)
router.post('/temporary', createTemporaryReservation);

// POST /reservations/confirm - Confirm reservation setelah login
router.post('/confirm', verifyToken, confirmReservationAfterLogin);

// GET /reservations - Get all reservations (admin)
router.get('/', verifyToken, getAllReservations);

// GET /reservations/my - Get user's reservations
router.get('/my', verifyToken, getUserReservations);

export default router;