import express from 'express';
import { 
    createTemporaryReservation,
    confirmReservationAfterLogin,
    getAllReservations,
    getUserReservations
} from '../controllers/reservationsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/temporary', createTemporaryReservation);
router.post('/confirm', verifyToken, confirmReservationAfterLogin);
router.get('/', verifyToken, getAllReservations);
router.get('/my', verifyToken, getUserReservations);

export default router;