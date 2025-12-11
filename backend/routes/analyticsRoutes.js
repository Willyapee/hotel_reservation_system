import express from 'express';
import { 
    getCustomerLoyaltyAnalyticsDB,
    getTopSpendersAnalyticsDB,

} from '../controllers/analyticsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/customer-loyalty', verifyToken, getCustomerLoyaltyAnalyticsDB);
router.get('/top-spenders', verifyToken, getTopSpendersAnalyticsDB);


export default router;