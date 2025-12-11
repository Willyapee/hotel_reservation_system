import { Op } from 'sequelize';
import db from '../config/db.js';
import Reservations from '../models/Reservations.js';
import RoomReservations from '../models/RoomReservations.js';
import ServiceReservations from '../models/ServiceReservations.js';
import Invoices from '../models/Invoices.js';
import Rooms from '../models/Rooms.js';
import MsRoomType from '../models/msRoomTypes.js';
import MsServices from '../models/msServices.js';
import MsUser from '../models/MsUsers.js';

export const createReservationFromCart = async (req, res) => {
    let transaction;
    
    try {
        console.log('🔍 [CHECKOUT] Starting process...');
        
        const { guestInfo, cartItems } = req.body;
        const id_user = req.user?.id;

        console.log('📋 [CHECKOUT] Received data:', {
            userId: id_user,
            guestInfo: guestInfo,
            cartItems: cartItems
        });

        if (!id_user) {
            console.log('❌ [CHECKOUT] No user ID');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            console.log('❌ [CHECKOUT] Empty cart');
            return res.status(400).json({
                success: false,
                message: 'Your cart is empty'
            });
        }

        const user = await MsUser.findByPk(id_user);
        if (!user) {
            console.log(`❌ [CHECKOUT] User ${id_user} not found`);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        console.log(`✅ [CHECKOUT] User found: ${user.username}`);

        transaction = await db.transaction();
        console.log('✅ [CHECKOUT] Transaction started');

        try {
            console.log('📝 [CHECKOUT] Creating reservation...');
            const reservation = await Reservations.create({
                id_user: id_user,
                reservation_date: new Date()
            }, { transaction });

            console.log(`✅ [CHECKOUT] Reservation created: ID ${reservation.id_reservation}`);

            let subtotal = 0;
            const processedItems = [];

            for (const cartItem of cartItems) {
                const cartItemId = parseInt(cartItem.id);
                console.log(`🔄 [CHECKOUT] Processing cart item ID: ${cartItemId}`);

                const roomReservation = await RoomReservations.findOne({
                    where: { 
                        id_room_reservation: cartItemId,
                        status: 'draft',
                        id_reservation: null
                    },
                    transaction
                });

                if (!roomReservation) {
                    console.log(`❌ [CHECKOUT] Cart item ${cartItemId} not found`);
                    throw new Error(`Cart item ${cartItemId} not found`);
                }

                console.log(`✅ [CHECKOUT] Found room reservation for room ID: ${roomReservation.id_room}`);

                console.log(`🔍 [CHECKOUT] Checking for overlapping RESERVED bookings for room ${roomReservation.id_room}...`);
                
                const overlappingReserved = await RoomReservations.findOne({
                    where: {
                        id_room: roomReservation.id_room,
                        status: { 
                            [Op.in]: ['reserved', 'pending_payment', 'checked_in']  
                        },
                        [Op.or]: [
                            {
                                check_in_date: { 
                                    [Op.lt]: roomReservation.check_out_date 
                                },
                                check_out_date: { 
                                    [Op.gt]: roomReservation.check_in_date 
                                },
                            },
                        ],
                        id_room_reservation: {
                            [Op.ne]: roomReservation.id_room_reservation
                        }
                    },
                    transaction
                });

                if (overlappingReserved) {
                    console.log(`❌ [CHECKOUT] Room ${roomReservation.id_room} already RESERVED for overlapping dates`);
                    throw new Error(`Room already reserved for the selected dates. Please choose another room or different dates.`);
                }

                if (overlappingReserved) {
                    console.log(`❌ [CHECKOUT] Room ${roomReservation.id_room} already RESERVED for overlapping dates`);
                    console.log(`📅 Conflicting: ${overlappingReserved.check_in_date} to ${overlappingReserved.check_out_date}`);
                    throw new Error(`Room already reserved for the selected dates. Please choose another room or different dates.`);
                }
                
                console.log(`✅ [CHECKOUT] No overlapping RESERVED bookings found`);

                await roomReservation.update({
                    id_reservation: reservation.id_reservation,
                    status: 'pending_payment' 
                }, { transaction });

                console.log(`✅ [CHECKOUT] Room reservation ${cartItemId} updated to pending_payment`);

                const roomSubtotal = parseFloat(roomReservation.subtotal_price) || 0;
                subtotal += roomSubtotal;

                const services = await ServiceReservations.findAll({
                    where: { id_room_reservation: cartItemId },
                    transaction
                });

                let servicesSubtotal = 0;
                if (services && services.length > 0) {
                    for (const service of services) {
                        const servicePrice = parseFloat(service.subtotal_price) || 0;
                        servicesSubtotal += servicePrice;
                    }
                    subtotal += servicesSubtotal;
                }

                console.log(`💰 [CHECKOUT] Cart item ${cartItemId}: Room $${roomSubtotal}, Services $${servicesSubtotal}`);
            }

            const tax = subtotal * 0.1;
            const serviceFee = 10;
            const totalAmount = subtotal + tax + serviceFee;

            console.log('💰 [CHECKOUT] Final calculation:', {
                subtotal: subtotal,
                tax: tax,
                serviceFee: serviceFee,
                totalAmount: totalAmount
            });

            const dueDate = new Date();
            dueDate.setHours(dueDate.getHours() + 16);
            
            const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

            console.log('📝 [CHECKOUT] Creating invoice...');
            const invoice = await Invoices.create({
                id_reservation: reservation.id_reservation,
                invoice_number: invoiceNumber,
                total_amount: totalAmount,
                issued_date: new Date(),
                due_date: dueDate,
                status: 'pending'
            }, { transaction });

            console.log(`✅ [CHECKOUT] Invoice created: ${invoiceNumber}`);
            console.log(`⏰ [CHECKOUT] Payment due in 16 hours: ${dueDate}`);

            await transaction.commit();
            console.log('✅ [CHECKOUT] Transaction committed successfully');

            res.status(201).json({
                success: true,
                message: 'Reservation created successfully. You have 16 hours to complete payment.',
                reservation: {
                    id_reservation: reservation.id_reservation,
                    reservation_date: reservation.reservation_date
                },
                invoice: {
                    id_invoice: invoice.id_invoice,
                    invoice_number: invoice.invoice_number,
                    total_amount: parseFloat(invoice.total_amount).toFixed(2),
                    issued_date: invoice.issued_date,
                    due_date: invoice.due_date,
                    status: invoice.status
                },
                guest_info: {
                    name: `${guestInfo.firstName || ''} ${guestInfo.lastName || ''}`.trim(),
                    email: guestInfo.email || '',
                    phone: guestInfo.phone || 'Not provided'
                },
                summary: {
                    payment_due: dueDate.toISOString(),
                    subtotal: parseFloat(subtotal).toFixed(2),
                    tax: parseFloat(tax).toFixed(2),
                    service_fee: serviceFee.toFixed(2),
                    total_amount: parseFloat(totalAmount).toFixed(2),
                    rooms_count: cartItems.length,
                    note: 'Multiple users can checkout the same room. First to pay wins!'
                }
            });

        } catch (innerError) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
                console.log('🔄 [CHECKOUT] Transaction rolled back due to inner error');
            }
            throw innerError;
        }

    } catch (error) {
        console.error('❌ [CHECKOUT] Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        let errorMessage = 'Failed to process checkout';
        
        if (error.message.includes('Room already reserved')) {
            errorMessage = error.message;
        } else if (error.message.includes('foreign key constraint')) {
            errorMessage = 'Data integrity error. Please refresh your cart and try again.';
        } else if (error.message.includes('Cart item')) {
            errorMessage = error.message;
        } else if (error.name === 'SequelizeDatabaseError') {
            errorMessage = 'Database error. Please contact support.';
        }

        res.status(500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? {
                name: error.name,
                message: error.message
            } : undefined
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

        if (id_user && reservation.id_user !== parseInt(id_user)) {
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