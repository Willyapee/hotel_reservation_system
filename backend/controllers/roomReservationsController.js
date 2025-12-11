import { Op } from 'sequelize';
import Reservations from '../models/Reservations.js';
import RoomReservations from '../models/RoomReservations.js';
import Invoices from '../models/Invoices.js';
import Payments from '../models/Payments.js';
import MsRoomType from '../models/msRoomTypes.js';
import Room from '../models/Rooms.js';

export const createBooking = async (req, res) => {
    try {
        const { id_user, rooms, check_in, check_out, special_requests } = req.body;
        
        if (!id_user || !rooms || !check_in || !check_out) {
            return res.status(400).json({
                message: "User ID, rooms, check-in, and check-out dates are required"
            });
        }

        let totalAmount = 0;
        const stayDuration = calculateDaysDifference(check_in, check_out);
        
        for (const roomData of rooms) {
            const room = await Room.findByPk(roomData.id_room, {
                include: [{ model: MsRoomType, as: 'room_type' }]
            });
            
            if (!room) {
                return res.status(404).json({
                    message: `Room with ID ${roomData.id_room} not found`
                });
            }

            const isAvailable = await checkRoomAvailability(roomData.id_room, check_in, check_out);
            if (!isAvailable) {
                return res.status(400).json({
                    message: `Room ${room.room_number} is not available for the selected dates`
                });
            }

            const subtotal = room.room_type.price_per_night * stayDuration;
            totalAmount += subtotal;
            
            roomData.subtotal = subtotal;
        }

        const reservation = await Reservations.create({
            id_user: parseInt(id_user),
            reservation_date: new Date()
        });

        const roomReservations = [];
        for (const roomData of rooms) {
            const roomReservation = await RoomReservations.create({
                id_reservation: reservation.id_reservation,
                id_room: roomData.id_room,
                check_in_date: check_in,
                check_out_date: check_out,
                status: 'reserved',
                subtotal_price: roomData.subtotal
            });
            roomReservations.push(roomReservation);
        }

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3); 
        
        const invoice = await Invoices.create({
            id_reservation: reservation.id_reservation,
            total_amount: totalAmount,
            issued_date: new Date(),
            due_date: dueDate,
            status: 'pending'
        });

        res.status(201).json({
            message: "Booking created successfully",
            reservation: {
                id_reservation: reservation.id_reservation,
                reservation_date: reservation.reservation_date
            },
            room_reservations: roomReservations,
            invoice: invoice,
            total_amount: totalAmount,
            stay_duration: stayDuration
        });

    } catch (error) {
        console.error("Create booking error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getUserBookings = async (req, res) => {
    try {
        const { id_user } = req.params;

        const reservations = await Reservations.findAll({
            where: { id_user: parseInt(id_user) },
            include: [
                {
                    model: RoomReservations,
                    as: 'room_reservations',
                    include: [
                        {
                            model: Room,
                            as: 'room',
                            include: [{ model: MsRoomType, as: 'room_type' }]
                        }
                    ]
                },
                {
                    model: Invoices,
                    as: 'invoice',
                    include: [{ model: Payments, as: 'payment' }]
                }
            ],
            order: [['reservation_date', 'DESC']]
        });

        res.json({
            bookings: reservations
        });

    } catch (error) {
        console.error("Get user bookings error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const { id_reservation } = req.params;

        const reservation = await Reservations.findByPk(id_reservation);
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        await RoomReservations.update(
            { status: 'cancelled' },
            { where: { id_reservation: parseInt(id_reservation) } }
        );

        await Invoices.update(
            { status: 'cancelled' },
            { where: { id_reservation: parseInt(id_reservation) } }
        );

        res.json({
            message: "Booking cancelled successfully"
        });

    } catch (error) {
        console.error("Cancel booking error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const calculateDaysDifference = (check_in, check_out) => {
    const start = new Date(check_in);
    const end = new Date(check_out);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

const checkRoomAvailability = async (id_room, check_in, check_out) => {
    const conflictingBooking = await RoomReservations.findOne({
        where: {
            id_room: id_room,
            status: { 
                [Op.notIn]: ['cancelled', 'checked_out'] 
            },
            [Op.and]: [
                { check_in_date: { [Op.lte]: check_out } },
                { check_out_date: { [Op.gte]: check_in } }
            ]
        }
    });
    return !conflictingBooking;
};