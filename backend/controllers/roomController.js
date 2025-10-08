import Room from "../models/Room.js";
import { Op } from "sequelize";

export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { available: true },
      order: [['roomPrice', 'ASC']]
    });
    res.status(200).json(rooms);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ where: { roomId } });
    
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    
    res.status(200).json(room);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkRoomAvailability = async (req, res) => {
  try {
    const { startDate, endDate, guests } = req.query;
    const totalGuests = parseInt(guests) || 1;
    
    const rooms = await Room.findAll({
      where: { 
        available: true,
        maxGuests: {
          [Op.gte]: totalGuests
        }
      },
      order: [['roomPrice', 'ASC']]
    });
    
    res.status(200).json(rooms);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};