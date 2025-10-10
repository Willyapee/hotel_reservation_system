// controllers/invoiceController.js
import Invoices from '../models/Invoices.js';
import Reservations from '../models/Reservations.js';
import RoomReservations from '../models/RoomReservations.js';
import ServiceReservations from '../models/ServiceReservations.js';
import MsUser from '../models/Users.js';

// GET INVOICE BY ID
export const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const invoice = await Invoices.findByPk(id, {
            include: [
                {
                    model: Reservations,
                    as: 'reservation',
                    include: [
                        {
                            model: RoomReservations,
                            as: 'room_reservations',
                            include: [
                                {
                                    model: ServiceReservations,
                                    as: 'services',
                                    include: ['service']
                                },
                                {
                                    model: 'room',
                                    include: ['room_type']
                                }
                            ]
                        },
                        {
                            model: MsUser,
                            as: 'user'
                        }
                    ]
                },
                {
                    model: 'payment'
                }
            ]
        });

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        res.json(invoice);
    } catch (error) {
        console.error("Get invoice error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// GET INVOICES BY USER
export const getInvoicesByUser = async (req, res) => {
    try {
        const { id_user } = req.params;
        
        const invoices = await Invoices.findAll({
            include: [
                {
                    model: Reservations,
                    as: 'reservation',
                    where: { id_user: parseInt(id_user) },
                    include: [
                        {
                            model: RoomReservations,
                            as: 'room_reservations',
                            include: [
                                {
                                    model: 'room',
                                    include: ['room_type']
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['issued_date', 'DESC']]
        });

        res.json({ invoices });
    } catch (error) {
        console.error("Get user invoices error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// UPDATE INVOICE STATUS
export const updateInvoiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'paid', 'overdue', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: "Invalid status. Must be: pending, paid, overdue, or cancelled" 
            });
        }

        const invoice = await Invoices.findByPk(id);
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        await invoice.update({ status });

        res.json({ 
            message: "Invoice status updated successfully", 
            invoice 
        });
    } catch (error) {
        console.error("Update invoice error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// CALCULATE INVOICE TOTAL (Helper function)
export const calculateInvoiceTotal = async (id_reservation) => {
    try {
        // Calculate room reservations total
        const roomReservations = await RoomReservations.findAll({
            where: { id_reservation }
        });
        const roomTotal = roomReservations.reduce((sum, rr) => sum + parseFloat(rr.subtotal_price), 0);

        // Calculate service reservations total
        const serviceReservations = await ServiceReservations.findAll({
            include: [{
                model: RoomReservations,
                as: 'room_reservation',
                where: { id_reservation }
            }]
        });
        const serviceTotal = serviceReservations.reduce((sum, sr) => sum + parseFloat(sr.subtotal_price), 0);

        return roomTotal + serviceTotal;
    } catch (error) {
        console.error("Calculate invoice total error:", error);
        throw error;
    }
};