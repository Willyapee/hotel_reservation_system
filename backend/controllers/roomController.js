// controllers/roomController.js
import { Op } from 'sequelize';
import MsRoomType from '../models/msRoomTypes.js';
import Rooms from '../models/Rooms.js';
import RoomReservations from '../models/RoomReservations.js';

export const searchAvailableRooms = async (req, res) => {
    try {
        const { check_in, check_out, adults } = req.query;
        
        // Validasi parameter
        if (!check_in || !check_out || !adults) {
            return res.status(400).json({
                success: false,
                message: 'Parameter check_in, check_out, dan adults diperlukan'
            });
        }

        const checkInDate = new Date(check_in);
        const checkOutDate = new Date(check_out);
        const adultsCount = parseInt(adults);

        // Validasi tanggal
        if (checkInDate >= checkOutDate) {
            return res.status(400).json({
                success: false,
                message: 'Tanggal check-out harus setelah check-in'
            });
        }

        if (adultsCount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Jumlah adults harus lebih dari 0'
            });
        }

        // Hitung durasi menginap
        const duration = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

        // 1. Cari semua room type yang memenuhi kapasitas
        const roomTypes = await MsRoomType.findAll({
            where: {
                capacity: {
                    [Op.gte]: adultsCount
                }
            }
        });

        // 2. Untuk setiap room type, hitung kamar yang available
        const availableRooms = await Promise.all(
            roomTypes.map(async (roomType) => {
                // Cari semua kamar dengan room type ini
                const allRooms = await Rooms.findAll({
                    where: { id_room_type: roomType.id_room_type }
                });

                if (allRooms.length === 0) {
                    return null; // Skip room types tanpa actual rooms
                }

                // Cari kamar yang sudah direservasi pada periode tersebut
                const bookedRooms = await RoomReservations.findAll({
                    where: {
                        id_room: allRooms.map(room => room.id_room),
                        [Op.or]: [
                            {
                                check_in_date: { [Op.lt]: checkOutDate },
                                check_out_date: { [Op.gt]: checkInDate },
                                status: { [Op.in]: ['reserved', 'checked_in'] }
                            }
                        ]
                    },
                    attributes: ['id_room']
                });

                const bookedRoomIds = bookedRooms.map(room => room.id_room);
                const availableRoomsOfType = allRooms.filter(room => 
                    !bookedRoomIds.includes(room.id_room)
                );

                return availableRoomsOfType.map(room => ({
                    roomId: room.id_room,
                    roomName: roomType.name,
                    roomBed: roomType.room_bed,
                    roomDesc: roomType.description,
                    roomImage: roomType.image_url || '/default-room.jpg',
                    roomPrice: parseFloat(roomType.price_per_night),
                    roomNumber: room.room_number,
                    availableRooms: availableRoomsOfType.length,
                    capacity: roomType.capacity,
                    maxStayDuration: roomType.max_stay_duration,
                    totalPrice: parseFloat(roomType.price_per_night) * duration,
                    duration: duration
                }));
            })
        );

        // Flatten array dan filter null values
        const flattenedRooms = availableRooms.flat().filter(room => room !== null);
        
        // Filter hanya rooms yang available
        const filteredRooms = flattenedRooms.filter(room => room.availableRooms > 0);

        console.log('🔍 Available rooms found:', filteredRooms.map(r => ({
            roomId: r.roomId,
            roomName: r.roomName,
            roomNumber: r.roomNumber
        })));

        res.json({
            success: true,
            searchParams: {
                check_in: check_in,
                check_out: check_out,
                adults: adultsCount,
                duration: duration
            },
            availableRooms: filteredRooms
        });

    } catch (error) {
        console.error('Room search error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mencari kamar'
        });
    }
};