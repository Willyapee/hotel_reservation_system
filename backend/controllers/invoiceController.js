import { Op } from 'sequelize';
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
    try {
        const { invoiceId } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        console.log(`🔄 Updating invoice ${invoiceId} to status: ${status}`);

        const invoice = await Invoices.findByPk(invoiceId, {
            include: [{
                model: Reservations,
                as: 'reservation',
                where: { id_user: userId }
            }]
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

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

    } catch (error) {
        console.error('❌ Error updating invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update invoice'
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