import Reservation from "../models/Reservation.js";
import Room from "../models/Room.js";
import { Op } from "sequelize";
import { v4 as uuidv4 } from 'uuid';

export const createReservation = async (req, res) => {
  try {
    const { 
      roomId, 
      checkIn, 
      checkOut, 
      adults, 
      children, 
      childAges
    } = req.body;

    const userId = req.user.id;

    // Validasi room exists
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check availability
    const existingReservation = await Reservation.findOne({
      where: {
        roomId,
        status: {
          [Op.in]: ['pending', 'confirmed', 'checked-in']
        },
        [Op.or]: [
          {
            checkIn: { [Op.between]: [new Date(checkIn), new Date(checkOut)] }
          },
          {
            checkOut: { [Op.between]: [new Date(checkIn), new Date(checkOut)] }
          }
        ]
      }
    });

    if (existingReservation) {
      return res.status(400).json({ message: "Room not available for selected dates" });
    }

    // Calculate price
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const totalPrice = room.pricePerNight * nights;

    // Create reservation
    const reservation = await Reservation.create({
      reservationCode: `RES-${uuidv4().slice(0, 8).toUpperCase()}`,
      userId,
      roomId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      nights,
      adults,
      children,
      childAges,
      pricePerNight: room.pricePerNight,
      totalPrice,
      status: 'pending'
    });

    // Include room details in response
    const reservationWithRoom = await Reservation.findByPk(reservation.id, {
      include: [{
        model: Room,
        attributes: ['roomId', 'roomName', 'roomBed', 'roomImage']
      }]
    });

    res.status(201).json({
      message: "Reservation created successfully",
      reservation: reservationWithRoom
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserReservations = async (req, res) => {
  try {
    const userId = req.user.id;

    const reservations = await Reservation.findAll({
      where: { userId },
      include: [{
        model: Room,
        attributes: ['roomId', 'roomName', 'roomBed', 'roomImage']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(reservations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};