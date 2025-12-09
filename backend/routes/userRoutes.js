import express from 'express';
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getTopSpendingUsers
} from '../controllers/userController.js';

const router = express.Router();

router.get('/allusers', getAllUsers)
router.get('/users/:id', getUser);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/analytics/top-spenders', getTopSpendingUsers);

export default router;
