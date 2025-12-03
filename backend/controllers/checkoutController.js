import { Op } from 'sequelize';
import Reservations from '../models/Reservations.js';
import RoomReservations from '../models/RoomReservations.js';
import ServiceReservations from '../models/ServiceReservations.js';
import Invoices from '../models/Invoices.js';
import Rooms from '../models/Rooms.js';
import MsRoomType from '../models/msRoomTypes.js';
import MsServices from '../models/msServices.js';

export const createReservationFromCart = async (req, res) => {
    const transaction = await db.transaction();
    
    try {
        const { guestInfo, cartItems } = req.body;
        const id_user = req.user?.id;

        if (!id_user) {
            await transaction.rollback();
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login first.'
            });
        }

        console.log('🛒 Checkout Process for USER:', id_user);

        if (!cartItems || cartItems.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        const user = await MsUser.findByPk(id_user, { transaction });
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (guestInfo?.email && guestInfo.email !== user.email) {
            console.warn(`Email mismatch: Form=${guestInfo.email}, User=${user.email}`);
        }

        const reservation = await Reservations.create({
            id_user: id_user, 
            reservation_date: new Date()
        }, { transaction });

        console.log('✅ Reservation created for user:', id_user);

        let totalAmount = 0;
        const updatedItems = [];

        for (const cartItem of cartItems) {
            const [updatedCount] = await RoomReservations.update(
                {
                    id_reservation: reservation.id_reservation,
                    status: 'reserved'
                },
                {
                    where: { 
                        id_room_reservation: cartItem.id,
                        status: 'draft',
                        id_reservation: null
                    },
                    transaction
                }
            );

            if (updatedCount === 0) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Failed to update room reservation ${cartItem.id}`
                });
            }

            updatedItems.push(cartItem.id);

            const roomRes = await RoomReservations.findByPk(cartItem.id, {
                include: [
                    {
                        model: ServiceReservations,
                        as: 'service_details'
                    }
                ],
                transaction
            });

            if (roomRes) {
                totalAmount += parseFloat(roomRes.subtotal_price || 0);
                
                if (roomRes.service_details) {
                    roomRes.service_details.forEach(service => {
                        totalAmount += parseFloat(service.subtotal_price || 0);
                    });
                }
            }
        }

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3);

        const invoice = await Invoices.create({
            id_reservation: reservation.id_reservation,
            total_amount: totalAmount,
            issued_date: new Date(),
            due_date: dueDate,
            status: 'pending'
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Reservation created successfully',
            reservation: {
                id_reservation: reservation.id_reservation,
                id_user: reservation.id_user,
                reservation_date: reservation.reservation_date
            },
            invoice: {
                id_invoice: invoice.id_invoice,
                invoice_number: `INV-${String(invoice.id_invoice).padStart(6, '0')}`,
                total_amount: parseFloat(invoice.total_amount).toFixed(2),
                issued_date: invoice.issued_date,
                due_date: invoice.due_date,
                status: invoice.status
            },
            user_info: {
                id: user.id_user,
                name: user.username || `${guestInfo?.firstName} ${guestInfo?.lastName}`,
                email: user.email
            },
            summary: {
                total_items: updatedItems.length,
                total_amount: parseFloat(totalAmount).toFixed(2)
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('❌ Checkout error:', error);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors.map(e => e.message)
            });
        }
        
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user reference'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to process checkout'
        });
    }
};

export const getReservationDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const id_user = req.user?.id;

        const reservation = await Reservations.findByPk(id, {
            include: [
                {
                    model: RoomReservations,
                    as: 'room_reservations',
                    include: [
                        {
                            model: Rooms,
                            as: 'room',
                            include: [{
                                model: MsRoomType,
                                as: 'room_type'
                            }]
                        },
                        {
                            model: ServiceReservations,
                            as: 'service_details',
                            include: [{
                                model: MsServices,
                                as: 'service'
                            }]
                        }
                    ]
                },
                {
                    model: Invoices,
                    as: 'invoice'
                }
            ]
        });

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        if (id_user && reservation.id_user !== id_user) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            reservation
        });

    } catch (error) {
        console.error('Get reservation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reservation'
        });
    }
};

const checkRoomAvailability = async (roomId, checkIn, checkOut, excludeReservationId = null, transaction = null) => {
    try {
        const whereClause = {
            id_room: roomId,
            status: { [Op.in]: ['reserved', 'checked_in'] },
            [Op.or]: [
                {
                    check_in_date: { [Op.lt]: checkOut },
                    check_out_date: { [Op.gt]: checkIn }
                }
            ]
        };

        if (excludeReservationId) {
            whereClause.id_room_reservation = { [Op.ne]: excludeReservationId };
        }

        const options = {};
        if (transaction) options.transaction = transaction;

        const conflictingBooking = await RoomReservations.findOne({
            where: whereClause,
            ...options
        });

        return !conflictingBooking;
    } catch (error) {
        console.error('Check availability error:', error);
        return false;
    }
};