import express from 'express';
import { 
  addToCart, 
  getCart, 
  removeFromCart, 
  clearCart,
  addServiceToCartItem,        
  removeServiceFromCartItem,
  getCartRoomNumbers
} from '../controllers/cartController.js';
import { verifyToken, getOrCreateCartId } from '../middleware/cartMiddleware.js';

const router = express.Router();

router.get('/room-numbers', getCartRoomNumbers);
router.use(verifyToken); 
router.use(getOrCreateCartId); 

router.post('/add', addToCart);
router.get('/', getCart);
router.delete('/:itemId', removeFromCart);
router.delete('/', clearCart);
router.post('/:cartItemId/services', addServiceToCartItem);
router.delete('/services/:cartItemServiceId', removeServiceFromCartItem);

export default router;