import express from 'express';
import { 
  addToCart, 
  getCart, 
  removeFromCart, 
  clearCart,
  authorizeCart,
  addServiceToCartItem,        
  removeServiceFromCartItem    
} from '../controllers/cartController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(authorizeCart);

router.post('/add', addToCart);
router.get('/', getCart);
router.delete('/:itemId', removeFromCart);
router.delete('/', clearCart);

router.post('/:cartItemId/services', addServiceToCartItem);
router.delete('/services/:cartItemServiceId', removeServiceFromCartItem);

export default router;