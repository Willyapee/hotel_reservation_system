import Payment from '../models/Payments.js';
import Invoice from '../models/Invoices.js';

export const createPayment = async (req, res) => {
	try {
		const { id_invoice, amount, payment_method } = req.body;
		const userId = req.user.id;

		const invoice = await Invoice.findOne({
			where: { id_invoice },
			include: [
				{
					association: 'booking',
					where: { id_user: userId },
				},
			],
		});

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        if (invoice.status === 'paid') {
            return res.status(400).json({ message: "Invoice already paid" });
        }

        if (invoice.status === 'cancelled') {
            return res.status(400).json({ message: "Cannot pay cancelled invoice" });
        }

        if (parseFloat(amount) !== parseFloat(invoice.total_amount)) {
            return res.status(400).json({
                message: `Payment amount (${amount}) must match invoice total (${invoice.total_amount})`
            });
        }

        const payment = await Payments.create({
            id_invoice: parseInt(id_invoice),
            amount: parseFloat(amount),
            method,
            transaction_id,
            payment_date: new Date(),
            status: 'completed'
        });

        await invoice.update({ status: 'paid' });

        if (invoice.reservation && invoice.reservation.room_reservations) {
            await RoomReservations.update(
                { status: 'confirmed' },
                { where: { id_reservation: invoice.reservation.id_reservation } }
            );
        }

        res.status(201).json({
            message: "Payment processed successfully",
            payment,
            invoice: {
                id_invoice: invoice.id_invoice,
                status: 'paid',
                total_amount: invoice.total_amount
            }
        });

    } catch (error) {
        console.error("Process payment error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const payment = await Payments.findByPk(id, {
            include: [{
                model: 'invoice',
                include: ['reservation']
            }]
        });

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        res.json(payment);
    } catch (error) {
        console.error("Get payment error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getPaymentsByInvoice = async (req, res) => {
    try {
        const { id_invoice } = req.params;
        
        const payments = await Payments.findAll({
            where: { id_invoice: parseInt(id_invoice) },
            order: [['payment_date', 'DESC']]
        });

        res.json({ payments });
    } catch (error) {
        console.error("Get payments by invoice error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const refundPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { refund_reason } = req.body;

        const payment = await Payments.findByPk(id);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        if (payment.status !== 'completed') {
            return res.status(400).json({ message: "Only completed payments can be refunded" });
        }

        await payment.update({ status: 'refunded' });

        await Invoices.update(
            { status: 'pending' },
            { where: { id_invoice: payment.id_invoice } }
        );

        const invoice = await Invoices.findByPk(payment.id_invoice, {
            include: [{
                model: 'reservation',
                include: ['room_reservations']
            }]
        });

        if (invoice.reservation && invoice.reservation.room_reservations) {
            await RoomReservations.update(
                { status: 'cancelled' },
                { where: { id_reservation: invoice.reservation.id_reservation } }
            );
        }

        res.json({
            message: "Payment refunded successfully",
            payment
        });

    } catch (error) {
        console.error("Refund payment error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const processPaymentAfterCheckout = async (req, res) => {
    try {
        const { reservation_id, amount, method, transaction_id } = req.body;

        if (!reservation_id || !amount || !method) {
            return res.status(400).json({
                message: "Reservation ID, amount, and payment method are required"
            });
        }

        const reservation = await Reservations.findByPk(reservation_id, {
            include: [{
                model: Invoices,
                as: 'invoice'
            }]
        });

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        if (reservation.status !== 'checked_out') {
            return res.status(400).json({ message: "Reservation is not checked out yet" });
        }

        if (!reservation.invoice) {
            return res.status(400).json({ message: "Invoice not found for this reservation" });
        }

        const invoice = reservation.invoice;

        if (parseFloat(amount) !== parseFloat(invoice.total_amount)) {
            return res.status(400).json({
                message: `Payment amount (${amount}) must match invoice total (${invoice.total_amount})`
            });
        }

        const payment = await Payments.create({
            id_invoice: invoice.id_invoice,
            amount: parseFloat(amount),
            method,
            transaction_id,
            payment_date: new Date(),
            status: 'completed'
        });

        await invoice.update({ status: 'paid' });

        await reservation.update({ status: 'completed' });

        res.status(201).json({
            message: "Payment processed successfully",
            reservation_id: reservation_id,
            status: 'completed',
            payment: {
                id_payment: payment.id_payment,
                amount: payment.amount,
                method: payment.method,
                payment_date: payment.payment_date
            },
            invoice: {
                id_invoice: invoice.id_invoice,
                total_amount: invoice.total_amount,
                status: 'paid'
            }
        });

    } catch (error) {
        console.error("Process payment after checkout error:", error);
        res.status(500).json({ message: "Server error" });
    }
};