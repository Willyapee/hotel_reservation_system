import express from "express";
import { 
  createReservation, 
  getUserReservations
} from "../controllers/reservationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createReservation);
router.get("/my-reservations", verifyToken, getUserReservations);

export default router;