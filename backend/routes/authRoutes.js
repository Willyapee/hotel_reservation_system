import express from "express";
import { registerUser, loginUser, getMe} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST http://localhost:3000/auth/register
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", verifyToken, getMe);

export default router;