import express from 'express';
import { addToCart, getCart, removeFromCart, clearCart } from '../controllers/cartController.js';

const router = express.Router();

router.post('/add', addToCart);
router.get('/', getCart);
router.delete('/:itemId', removeFromCart);
router.delete('/', clearCart);

export default router;