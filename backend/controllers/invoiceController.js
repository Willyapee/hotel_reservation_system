import { Op } from 'sequelize';
import db from '../config/db.js';
import Invoices from '../models/Invoices.js';
import Reservations from '../models/Reservations.js';
import RoomReservations from '../models/RoomReservations.js';
import Rooms from '../models/Rooms.js';
import MsRoomType from '../models/msRoomTypes.js';

export const getUserPendingInvoices = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();

        console.log(`🔍 Fetching pending invoices for user ${userId}`);

        const reservations = await Reservations.findAll({
            where: { id_user: userId },
            include: [{
                model: Invoices,
                as: 'invoice',
                where: {
                    status: 'pending',
                    due_date: { [Op.gt]: now } 
                },
                required: true 
            }]
        });

        const pendingInvoices = reservations.map(reservation => {
            const invoice = reservation.invoice;
            return {
                id_invoice: invoice.id_invoice,
                invoice_number: invoice.invoice_number,
                total_amount: invoice.total_amount,
                issued_date: invoice.issued_date,
                due_date: invoice.due_date,
                status: invoice.status,
                reservation_id: reservation.id_reservation,
                time_remaining: Math.max(0, Math.floor((new Date(invoice.due_date) - now) / (1000 * 60 * 60)))
            };
        });

        console.log(`✅ Found ${pendingInvoices.length} pending invoices`);

        res.json({
            success: true,
            invoices: pendingInvoices
        });

    } catch (error) {
        console.error('❌ Error fetching pending invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending invoices'
        });
    }
};

export const updateInvoiceStatus = async (req, res) => {
    let transaction;
    
    try {
        const { invoiceId } = req.params;
        const { status, payment_method } = req.body;
        const userId = req.user.id;

        console.log(`🔄 Updating invoice ${invoiceId} to status: ${status}`);

        const invoice = await Invoices.findByPk(invoiceId, {
            include: [{
                model: Reservations,
                as: 'reservation',
                where: { id_user: userId },
                include: [{
                    model: RoomReservations,
                    as: 'room_reservations',
                    where: { 
                        status: 'pending_payment' 
                    },
                    required: false
                }]
            }]
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        if (status === 'paid') {
            transaction = await db.transaction();
            
            try {
                console.log(`🔍 [INVOICE PAYMENT] Validating room availability...`);
                for (const roomRes of invoice.reservation.room_reservations) {
                    if (roomRes.status === 'pending_payment') {
                        const overlappingBooking = await RoomReservations.findOne({
                            where: {
                                id_room: roomRes.id_room,
                                status: { 
                                    [Op.in]: ['reserved', 'checked_in'] 
                                },
                                [Op.or]: [
                                    {
                                        check_in_date: { 
                                            [Op.lt]: roomRes.check_out_date 
                                        },
                                        check_out_date: { 
                                            [Op.gt]: roomRes.check_in_date 
                                        },
                                    }
                                ],
                                id_room_reservation: {
                                    [Op.ne]: roomRes.id_room_reservation
                                }
                            },
                            transaction
                        });

                        if (overlappingBooking) {
                            await transaction.rollback();
                            console.log(`❌ [INVOICE PAYMENT] Room ${roomRes.id_room} already ${overlappingBooking.status}!`);
                            return res.status(400).json({
                                success: false,
                                message: `Room ${roomRes.id_room} has already been ${overlappingBooking.status} for overlapping dates.`,
                                details: {
                                    roomId: roomRes.id_room,
                                    conflictingStatus: overlappingBooking.status
                                }
                            });
                        }
                    }
                }

                console.log(`✅ [INVOICE PAYMENT] No overlapping bookings found`);
               
                console.log(`🔄 [INVOICE PAYMENT] Updating room status to reserved...`);
                for (const roomRes of invoice.reservation.room_reservations) {
                    if (roomRes.status === 'pending_payment') {
                        await roomRes.update({ 
                            status: 'reserved',
                            updatedAt: new Date()
                        }, { transaction });
                        console.log(`   ✅ Room ${roomRes.id_room} updated to reserved`);
                    }
                }

                const updateData = { 
                    status: 'paid',
                    updatedAt: new Date(),
                    payment_date: new Date()
                };
                
                if (payment_method) {
                    updateData.payment_method = payment_method;
                }
                
                await invoice.update(updateData, { transaction });
                
                await transaction.commit();
                
                console.log(`✅ Invoice ${invoiceId} updated to paid and rooms reserved`);
                
                res.json({
                    success: true,
                    message: 'Payment successful! Rooms are now reserved.',
                    invoice: {
                        id_invoice: invoice.id_invoice,
                        invoice_number: invoice.invoice_number,
                        status: invoice.status,
                        payment_date: invoice.payment_date
                    }
                });
                
            } catch (error) {
                if (transaction && !transaction.finished) {
                    await transaction.rollback();
                    console.log('🔄 Transaction rolled back');
                }
                throw error;
            }
            
        } else {
            await invoice.update({ status });
            console.log(`✅ Invoice ${invoiceId} updated to ${status}`);
            
            res.json({
                success: true,
                message: `Invoice status updated to ${status}`,
                invoice: {
                    id_invoice: invoice.id_invoice,
                    invoice_number: invoice.invoice_number,
                    status: invoice.status
                }
            });
        }

    } catch (error) {
        console.error('❌ Error updating invoice:', error);
        
        let errorMessage = 'Failed to update invoice status';
        
        if (error.message.includes('Room already')) {
            errorMessage = error.message;
        } else if (error.name === 'SequelizeDatabaseError') {
            errorMessage = 'Database error. Please contact support.';
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getInvoiceDetails = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const userId = req.user.id;

        console.log(`🔍 Fetching details for invoice ${invoiceId}`);

        const invoice = await Invoices.findByPk(invoiceId, {
            include: [{
                model: Reservations,
                as: 'reservation',
                where: { id_user: userId },
                include: [{
                    model: RoomReservations,
                    as: 'room_reservations',
                    include: [{
                        model: Rooms,
                        as: 'room',
                        include: [{
                            model: MsRoomType,
                            as: 'room_type'
                        }]
                    }]
                }]
            }]
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            invoice: {
                id_invoice: invoice.id_invoice,
                invoice_number: invoice.invoice_number,
                total_amount: invoice.total_amount,
                issued_date: invoice.issued_date,
                due_date: invoice.due_date,
                status: invoice.status,
                reservation: invoice.reservation
            }
        });

    } catch (error) {
        console.error('❌ Error fetching invoice details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invoice details'
        });
    }
};