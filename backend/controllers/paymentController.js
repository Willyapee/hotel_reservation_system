//Import Models
import Payment from '../models/Payments';
import Invoice from '../models/Invoices';

//Import Libraries
import { Op } from 'sequelize';

//Create a new Payment
export const createPayment = async (req, res) => {
	try {
		const { id_invoice, amount, payment_method } = req.body;
		const userId = req.user.id;

		//Validate Invoice Exists
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
			return res.status(404).json({ message: 'invoice not found or not belong to the user' });
		}

		if (invoice.status === 'paid') {
			return res.status(400).json({ message: 'invoice already paid' });
		}

		if (parseFloat(amount) < parseFloat(invoice.total_amount)) {
			return res.status(400).json({ message: 'payment amount is less than invoice total amount' });
		}

		//Create Payment Record
		const newPayment = await Payment.create({
			id_invoice,
			amount,
			payment_method,
			status: 'completed',
		});

		await invoice.update({ status: 'paid' });

		res.status(201).json({ message: 'Payment successful', payment: newPayment });
	} catch (error) {
		console.log('Error creating payment record', error);
		res.status(500).json({ message: 'Server error' });
	}
};

export const getPaymentStatus = async (req, res) => {
	try {
		const { id_invoice } = req.params;
		const payment = await Payment.findOne({ where: { id_invoice } });

		//Validate Payment Exists
		if (!payment) return res.status(404).json({ message: 'Payment not found' });
		res.status(200).json({ status: payment.status });
	} catch (error) {
		console.log('Error fetching payment status', error);
		res.status(500).json({ message: 'Server error' });
	}
};
