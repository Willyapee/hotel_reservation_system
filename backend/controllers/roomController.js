// controllers/roomController.js
import { Op } from 'sequelize';
import db from '../config/db.js';
import MsRoomType from '../models/msRoomTypes.js';
import Room from '../models/Rooms.js';
import RoomReservations from '../models/RoomReservations.js';
import MsServices from '../models/msServices.js';

// Helper function
const calculateDaysDifference = (check_in, check_out) => {
    const start = new Date(check_in);
    const end = new Date(check_out);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

// Helper function - Count available rooms by type
const countAvailableRoomsByType = async (id_room_type, check_in, check_out) => {
    const rooms = await Room.findAll({
        where: { id_room_type }
    });

    let availableCount = 0;
    for (const room of rooms) {
        const conflictingBooking = await RoomReservations.findOne({
            where: {
                id_room: room.id_room,
                status: { [Op.notIn]: ['cancelled', 'checked_out'] },
                [Op.and]: [
                    { check_in_date: { [Op.lte]: check_out } },
                    { check_out_date: { [Op.gte]: check_in } }
                ]
            }
        });
        if (!conflictingBooking) availableCount++;
    }
    return availableCount;
};

// STEP 1-2: SEARCH AVAILABLE ROOM TYPES
export const searchAvailableRooms = async (req, res) => {
    try {
        const { check_in, check_out, adults } = req.query;
        
        // Validasi input
        if (!check_in || !check_out || !adults) {
            return res.status(400).json({
                message: "Check-in, check-out dates and adults count are required"
            });
        }

        const stayDuration = calculateDaysDifference(check_in, check_out);
        
        // 1. Cari room types yang sesuai capacity dan max_stay_duration
        const roomTypes = await MsRoomType.findAll({
            where: {
                capacity: { [Op.gte]: parseInt(adults) },
                max_stay_duration: { [Op.gte]: stayDuration }
            }
        });

        // 2. Untuk setiap room type, hitung available rooms
        const availableRoomTypes = [];
        for (const roomType of roomTypes) {
            const availableRoomsCount = await countAvailableRoomsByType(
                roomType.id_room_type, check_in, check_out
            );
            
            if (availableRoomsCount > 0) {
                availableRoomTypes.push({
                    ...roomType.toJSON(),
                    available_rooms_count: availableRoomsCount,
                    total_price: roomType.price_per_night * stayDuration
                });
            }
        }

        // 3. Get available services untuk ditampilkan
        const availableServices = await MsServices.findAll();

        res.json({
            check_in,
            check_out,
            stay_duration: stayDuration,
            adults: parseInt(adults),
            available_room_types: availableRoomTypes,
            available_services: availableServices
        });

    } catch (error) {
        console.error("Search rooms error:", error);
        res.status(500).json({ message: "Server error" });
    }
};