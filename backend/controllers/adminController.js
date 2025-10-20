//Import Models
import MsUser from '../models/MsUsers.js'
import MsServices from '../models/msServices.js';
import ServiceReservations from '../models/ServiceReservations.js';
import MsRoomType from '../models//msRoomTypes.js';
import Rooms from '../models//Rooms.js';
import Invoices from '../models//Invoices.js';
import Payments from '../models//Payments.js';
import Reservations from '../models//Reservations.js';
import RoomReservations from '../models//RoomReservations.js';

//Import Libraries
import { where } from 'sequelize';

//Services Management
//Create New Service
export const createService = async (req, res) => {
	try {
		const newService = await MsServices.create(req.body);
		res.status(201).json({ message: 'Service created successfully', service: newService });
	} catch (error) {
		res.status(500).json({ message: 'Error Creating New Service', error: error.message });
	}
};
//Read Services
export const readServices = async (req, res) => {
	try {
		const services = await MsServices.findAll();
		res.status(200).json(services);
	} catch (error) {
		res.status(500).json({ message: 'Error reading services', error: error.message });
	}
};
//Update Service
export const updateService = async (req, res) => {
	try {
		const { id } = req.params;
		const [updated] = await MsServices.update(req.body, { where: { id_service: id } });
	} catch (error) {
		res.status(500).json({ message: 'Error updating service', error: error.message });
	}
};
//Delete Service
export const deleteService = async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await MsServices.destroy({ where: { id_service: id } });
		if (deleted) {
			res.status(200).json({ message: 'Service deleted successfully' });
		} else {
			res.status(404).json({ message: 'Service not found' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Error deleting service', error: error.message });
	}
};

//Reservation Management
//Create New Reservation
export const createReservation = async (req, res) => {
	try {
		const reservation = await Reservations.create(req.body);
		res.status(201).json({ message: 'Reservation created successfully', reservation });
	} catch (error) {
		res.status(500).json({ message: 'Error creating reservation', error: error.message });
	}
};

//Read Reservations
export const readReservations = async (req, res) => {
	try {
		const reservations = await Reservations.findAll({
			include: [
				{ model: MsUser, as: 'id_user' },
				{ model: Rooms, as: 'id_room' },
			],
		});
		res.status(200).json(reservations);
	} catch (error) {}
};

//Update Reservation
export const updateReservation = async (req, res) => {
	try {
		const { id } = req.params;
		const [updated] = await Reservations.update(req.body, { where: { id_reservation: id } });
		if (updated) {
			const updatedReservation = await Reservations.findByPk(id);
			res
				.status(200)
				.json({ message: 'Reservation updated successfully', reservation: updatedReservation });
		} else {
			res.status(404).json({ message: 'Reservation not found' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Error updating reservation', error: error.message });
	}
};

//Delete Reservation
export const deleteReservation = async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await Reservations.destroy({ where: { id_reservation: id } });
		if (deleted) {
			res.status(200).json({ message: 'Reservation deleted successfully' });
		} else {
			res.status(404).json({ message: 'Reservation not found' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Error deleting reservation', error: error.message });
	}
};

//Invoice Management
//Create New Invoice
export const createInvoice = async (req, res) => {
	try {
		const invoice = await Invoices.create(req.body);
		res.status(201).json({ message: 'Invoice created successfully', invoice });
	} catch (error) {
		res.status(500).json({ message: 'Error creating invoice', error: error.message });
	}
};

//Read Invoices
export const readInvoices = async (req, res) => {
	try {
		const invoices = await Invoices.findAll({
			include: [{ model: Reservations, as: 'id_reservation' }],
		});
		res.status(200).json(invoices);
	} catch (error) {
		res.status(500).json({ message: 'Error reading invoices', error: error.message });
	}
};

//Update Invoice
export const updateInvoice = async (req, res) => {
	try {
		const { id } = req.params;
		const [updated] = await Invoices.update(req.body, { where: { id_invoice: id } });
		if (updated) {
			const updatedInvoice = await Invoices.findByPk(id);
			res.status(200).json({ message: 'Invoice updated successfully', invoice: updatedInvoice });
		} else {
			res.status(404).json({ message: 'Invoice not found' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Error updating invoice', error: error.message });
	}
};

//Delete Invoice
export const deleteInvoice = async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await Invoices.destroy({ where: { id_invoice: id } });
		if (deleted) {
			res.status(200).json({ message: 'Invoice deleted successfully' });
		} else {
			res.status(404).json({ message: 'Invoice not found' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Error deleting invoice', error: error.message });
	}
};

//Payment Management
//Create New Payment
export const createPayment = async (req, res) => {
	try {
		const payment = await Payments.create(req.body);
		res.status(201).json({ message: 'Payment created successfully', payment });
	} catch (error) {
		res.status(500).json({ message: 'Error creating payment', error: error.message });
	}
};

//Read Payments
export const readPayments = async (req, res) => {
	try {
		const payments = await Payments.findAll({
			include: [{ model: Invoices, as: 'id_invoice' }],
		});
		res.status(200).json(payments);
	} catch (error) {
		res.status(500).json({ message: 'Error reading payments', error: error.message });
	}
};

//Update Payment
export const updatePayment = async (req, res) => {
	try {
		const { id } = req.params;
		const [updated] = await Payments.update(req.body, { where: { id_payment: id } });

		if (updated) {
			const updatedPayment = await Payments.findByPk(id);
			res.status(200).json({ message: 'Payment updated successfully', payment: updatedPayment });
		} else {
			res.status(404).json({ message: 'Payment not found' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Error updating payment', error: error.message });
	}
};

//Delete Payment
export const deletePayment = async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await Payments.destroy({ where: { id_payment: id } });
		if (deleted) {
			res.status(200).json({ message: 'Payment deleted successfully' });
		} else {
			res.status(404).json({ message: 'Payment not found' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Error deleting payment', error: error.message });
	}
};

//Room Reservation Management
//Create New Room Reservation
export const createRoomReservation = async (req, res) => {
	try {
		const roomReservation = await RoomReservations.create(req.body);
		res.status(201).json({ message: 'Room reservation created successfully', roomReservation });
	} catch (error) {
		res.status(500).json({ message: 'Error creating room reservation', error: error.message });
	}
};

//Read Room Reservations
export const readRoomReservations = async (req, res) => {
	try {
		const roomReservations = await RoomReservations.findAll({
			include: [
				{ model: Reservations, as: 'id_reservation' },
				{ model: Rooms, as: 'id_room' },
			],
		});
		res.status(200).json(roomReservations);
	} catch (error) {
		res.status(500).json({ message: 'Error reading room reservations', error: error.message });
	}
};

//Update Room Reservation
export const updateRoomReservation = async (req, res) => {
	try {
		const { id } = req.params;
		const [updated] = await RoomReservations.update(req.body, {
			where: { id_room_reservation: id },
		});
		if (updated) {
			const updatedRoomReservation = await RoomReservations.findByPk(id);
			res.status(200).json({
				message: 'Room reservation updated successfully',
				roomReservation: updatedRoomReservation,
			});
		}
	} catch (error) {
		res.status(500).json({ message: 'Error updating room reservation', error: error.message });
	}
};

//Delete Room Reservation
export const deleteRoomReservation = async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await RoomReservations.destroy({ where: { id_room_reservation: id } });
		if (deleted) {
			res.status(200).json({ message: 'Room reservation deleted successfully' });
		} else {
			res.status(404).json({ message: 'Room reservation not found' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Error deleting room reservation', error: error.message });
	}
};

//Service Reservation Management
//Create New Service Reservation
export const createServiceReservation = async (req, res) => {
	try {
		const serviceReservation = await ServiceReservations.create(req.body);
		res
			.status(201)
			.json({ message: 'Service reservation created successfully', serviceReservation });
	} catch (error) {
		res.status(500).json({ message: 'Error creating service reservation', error: error.message });
	}
};

//Read Service Reservations
export const readServiceReservations = async (req, res) => {
	try {
		const serviceReservations = await ServiceReservations.findAll({
			include: [
				{ model: Reservations, as: 'id_reservation' },
				{ model: MsServices, as: 'id_service' },
			],
		});
		res.status(200).json(serviceReservations);
	} catch (error) {
		res.status(500).json({ message: 'Error reading service reservations', error: error.message });
	}
};

//Update Service Reservation
export const updateServiceReservation = async (req, res) => {
	try {
		const { id } = req.params;
		const [updated] = await ServiceReservations.update(req.body, {
			where: { id_service_reservation: id },
		});
		if (updated) {
			const updatedServiceReservation = await ServiceReservations.findByPk(id);
			res.status(200).json({
				message: 'Service reservation updated successfully',
				serviceReservation: updatedServiceReservation,
			});
		}
	} catch (error) {
		res.status(500).json({ message: 'Error updating service reservation', error: error.message });
	}
};

//Delete Service Reservation
export const deleteServiceReservation = async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await ServiceReservations.destroy({ where: { id_service_reservation: id } });
		if (deleted) {
			res.status(200).json({ message: 'Service reservation deleted successfully' });
		} else {
			res.status(404).json({ message: 'Service reservation not found' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Error deleting service reservation', error: error.message });
	}
};

