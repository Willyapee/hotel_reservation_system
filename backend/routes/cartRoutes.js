// routes/cartRoutes.js
import express from 'express';
import { 
  addToCart, 
  getCart, 
  removeFromCart, 
  clearCart,
  authorizeCart
} from '../controllers/cartController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken); // ← INI YANG HILANG!
router.use(authorizeCart);

router.post('/add', addToCart);
router.get('/', getCart);
router.delete('/:itemId', removeFromCart);
router.delete('/', clearCart);

export default router;