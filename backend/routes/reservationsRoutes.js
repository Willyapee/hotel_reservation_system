import express from 'express';
import { 
    createTemporaryReservation,
    confirmReservationAfterLogin,
    getAllReservations,
    getUserReservations,
    confirmReservationPayment
} from '../controllers/reservationsController.js';

import { 
    createReservationFromCart,
    getReservationDetails 
} from '../controllers/checkoutController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/temporary', createTemporaryReservation);
router.post('/confirm', verifyToken, confirmReservationAfterLogin);
router.get('/', verifyToken, getAllReservations);
router.get('/my', verifyToken, getUserReservations);

router.post('/:id/confirm-payment', verifyToken, confirmReservationPayment);
router.post('/create-from-cart', verifyToken, createReservationFromCart);
router.get('/:id', verifyToken, getReservationDetails);

export default router;