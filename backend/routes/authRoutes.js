import express from "express";
import { 
  registerUser, 
  loginUser, 
  getMe, 
  logoutUser,
  checkAuthStatus
} from "../controllers/authController.js";
import { verifyToken, checkAuth } from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", checkAuth, getMe);
router.get("/check", checkAuth, checkAuthStatus);
router.post("/logout", logoutUser);

export default router;