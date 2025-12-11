import { Op } from 'sequelize';
import MsRoomType from '../models/msRoomTypes.js';
import Rooms from '../models/Rooms.js';
import RoomReservations from '../models/RoomReservations.js';

export const searchAvailableRooms = async (req, res) => {
    try {
        const { check_in, check_out, adults } = req.query;
        
        if (!check_in || !check_out || !adults) {
            return res.status(400).json({
                success: false,
                message: 'Parameter check_in, check_out, dan adults diperlukan'
            });
        }

        const checkInDate = new Date(check_in);
        const checkOutDate = new Date(check_out);
        const adultsCount = parseInt(adults);

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

        const duration = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

        const roomTypes = await MsRoomType.findAll({
            where: {
                capacity: {
                    [Op.gte]: adultsCount
                }
            }
        });

        const groupedRooms = await Promise.all(
            roomTypes.map(async (roomType) => {
                const allRooms = await Rooms.findAll({
                    where: { id_room_type: roomType.id_room_type },
                    order: [['room_number', 'ASC']]
                });

                if (allRooms.length === 0) {
                    return null;
                }

                const bookedRooms = await RoomReservations.findAll({
                    where: {
                        id_room: allRooms.map(room => room.id_room),
                        [Op.or]: [
                            {
                                check_in_date: { [Op.lt]: checkOutDate },
                                check_out_date: { [Op.gt]: checkInDate },
                                status: { 
                                    [Op.in]: ['reserved', 'checked_in'] 
                                }
                            }
                        ]
                    },
                    attributes: ['id_room']
                });

                const bookedRoomIds = bookedRooms.map(room => room.id_room);
                
                const availableRoomsOfType = allRooms
                    .filter(room => !bookedRoomIds.includes(room.id_room))
                    .map(room => ({
                        roomId: room.id_room,
                        roomNumber: room.room_number
                    }));

                if (availableRoomsOfType.length === 0) {
                    return null;
                }

                return {
                    roomTypeId: roomType.id_room_type,
                    roomName: roomType.name,
                    roomBed: roomType.room_bed,
                    roomDesc: roomType.description,
                    roomImage: roomType.image_url || '/default-room.jpg',
                    roomPrice: parseFloat(roomType.price_per_night),
                    capacity: roomType.capacity,
                    maxStayDuration: roomType.max_stay_duration,
                    totalPrice: parseFloat(roomType.price_per_night) * duration,
                    duration: duration,
                    availableRooms: availableRoomsOfType.length,
                    availableRoomNumbers: availableRoomsOfType 
                };
            })
        );

        const availableRoomTypes = groupedRooms.filter(room => room !== null);
        
        console.log('🔍 Available room types:', availableRoomTypes.map(rt => ({
            name: rt.roomName,
            availableRooms: rt.availableRooms,
            roomNumbers: rt.availableRoomNumbers.map(r => r.roomNumber)
        })));

        res.json({
            success: true,
            searchParams: {
                check_in: check_in,
                check_out: check_out,
                adults: adultsCount,
                duration: duration
            },
            availableRooms: availableRoomTypes 
        });

    } catch (error) {
        console.error('Room search error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mencari kamar'
        });
    }
};