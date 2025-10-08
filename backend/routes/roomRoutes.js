import express from "express";
import { 
  getAllRooms, 
  getRoomById, 
  checkRoomAvailability
} from "../controllers/roomController.js";

const router = express.Router();

router.get("/", getAllRooms);
router.get("/:roomId", getRoomById);
router.get("/availability/check", checkRoomAvailability);

export default router;