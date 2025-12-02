// controllers/reservationController.js
import { Op } from 'sequelize';
import Reservations from '../models/Reservations.js';
import RoomReservations from '../models/RoomReservations.js';
import ServiceReservations from '../models/ServiceReservations.js';
import MsRoomType from '../models/msRoomTypes.js';
import Room from '../models/Rooms.js';
import MsServices from '../models/msServices.js';
import Invoices from '../models/Invoices.js';
import MsUser from '../models/MsUsers.js';

// Helper function
const calculateDaysDifference = (check_in, check_out) => {
	const start = new Date(check_in);
	const end = new Date(check_out);
	return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

// Helper function - Get one available room
const getOneAvailableRoom = async (id_room_type, check_in, check_out) => {
	const rooms = await Room.findAll({
		where: { id_room_type },
	});

	for (const room of rooms) {
		const conflictingBooking = await RoomReservations.findOne({
			where: {
				id_room: room.id_room,
				status: { [Op.notIn]: ['cancelled', 'checked_out'] },
				[Op.and]: [
					{ check_in_date: { [Op.lte]: check_out } },
					{ check_out_date: { [Op.gte]: check_in } },
				],
			},
		});
		if (!conflictingBooking) return room;
	}
	return null;
};

// STEP 3: CREATE TEMPORARY RESERVATION (BELUM LOGIN)
export const createTemporaryReservation = async (req, res) => {
	try {
		const {
			customer_name,
			customer_email,
			customer_phone,
			check_in,
			check_out,
			selected_room_type_id,
			selected_services = [],
		} = req.body;

		// Validasi input
		if (!customer_name || !customer_email || !check_in || !check_out || !selected_room_type_id) {
			return res.status(400).json({
				message: 'Customer info, dates, and room type are required',
			});
		}

		const stayDuration = calculateDaysDifference(check_in, check_out);

		// 1. Validasi room type
		const roomType = await MsRoomType.findByPk(selected_room_type_id);
		if (!roomType) {
			return res.status(404).json({ message: 'Room type not found' });
		}

		// 2. Dapatkan 1 available room
		const availableRoom = await getOneAvailableRoom(selected_room_type_id, check_in, check_out);

		if (!availableRoom) {
			return res.status(400).json({
				message: 'No available rooms for selected type and dates',
			});
		}

		// 3. Hitung total amount
		let totalAmount = roomType.price_per_night * stayDuration;

		// 4. Validasi dan hitung services
		const selectedServicesDetails = [];
		for (const service of selected_services) {
			const serviceData = await MsServices.findByPk(service.id_service);
			if (serviceData) {
				const serviceSubtotal = serviceData.service_price * service.quantity;
				totalAmount += serviceSubtotal;
				selectedServicesDetails.push({
					...serviceData.toJSON(),
					quantity: service.quantity,
					subtotal: serviceSubtotal,
				});
			}
		}

		// 5. Create temporary reservation (TANPA user_id)
		const reservation = await Reservations.create({
			customer_name,
			customer_email,
			customer_phone,
			check_in: new Date(check_in),
			check_out: new Date(check_out),
			reservation_date: new Date(),
			status: 'temporary', // Status temporary
		});

		// 6. Create room reservation
		const roomReservation = await RoomReservations.create({
			id_reservation: reservation.id_reservation,
			id_room: availableRoom.id_room,
			check_in_date: check_in,
			check_out_date: check_out,
			status: 'reserved',
			subtotal_price: roomType.price_per_night * stayDuration,
		});

		// 7. Create service reservations
		const serviceReservations = [];
		for (const service of selectedServicesDetails) {
			const serviceReservation = await ServiceReservations.create({
				id_room_reservation: roomReservation.id_room_reservation,
				id_service: service.id_service,
				quantity: service.quantity,
				subtotal_price: service.subtotal,
			});
			serviceReservations.push(serviceReservation);
		}

		res.status(201).json({
			message: 'Temporary reservation created successfully. Please login/register to confirm.',
			reservation_id: reservation.id_reservation,
			reservation: {
				id_reservation: reservation.id_reservation,
				customer_name,
				customer_email,
				check_in,
				check_out,
				stay_duration: stayDuration,
			},
			room: {
				room_number: availableRoom.room_number,
				room_type: roomType.name,
				price_per_night: roomType.price_per_night,
			},
			services: selectedServicesDetails,
			total_amount: totalAmount,
			next_step: 'Please login or register to confirm your reservation',
		});
	} catch (error) {
		console.error('Create temporary reservation error:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

// STEP 4: CONFIRM RESERVATION SETELAH LOGIN
export const confirmReservationAfterLogin = async (req, res) => {
	try {
		const { reservation_id } = req.body;
		const id_user = req.user.id; // Dari middleware auth

		// 1. Cari temporary reservation
		const reservation = await Reservations.findByPk(reservation_id);
		if (!reservation) {
			return res.status(404).json({ message: 'Reservation not found' });
		}

		if (reservation.status !== 'temporary') {
			return res.status(400).json({ message: 'Reservation already confirmed or invalid' });
		}

		// 2. Update reservation dengan user_id dan status confirmed
		await reservation.update({
			id_user: id_user,
			status: 'confirmed',
		});

		// 3. Create invoice
		const dueDate = new Date();
		dueDate.setDate(dueDate.getDate() + 3); // Due date 3 hari dari sekarang

		const roomReservations = await RoomReservations.findAll({
			where: { id_reservation: reservation_id },
			include: [
				{
					model: ServiceReservations,
					as: 'services',
				},
			],
		});

		// Hitung total amount dari rooms dan services
		const totalAmount = roomReservations.reduce((sum, rr) => {
			const roomSubtotal = parseFloat(rr.subtotal_price);
			const servicesSubtotal = rr.services.reduce(
				(sSum, sr) => sSum + parseFloat(sr.subtotal_price),
				0
			);
			return sum + roomSubtotal + servicesSubtotal;
		}, 0);

		const invoice = await Invoices.create({
			id_reservation: reservation_id,
			total_amount: totalAmount,
			issued_date: new Date(),
			due_date: dueDate,
			status: 'pending',
		});

		res.json({
			message: 'Reservation confirmed successfully',
			reservation_id: reservation.id_reservation,
			status: 'confirmed',
			invoice: {
				id_invoice: invoice.id_invoice,
				total_amount: invoice.total_amount,
				due_date: invoice.due_date,
			},
		});
	} catch (error) {
		console.error('Confirm reservation error:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

// GET ALL RESERVATIONS (FOR ADMIN)
export const getAllReservations = async (req, res) => {
	try {
		const reservations = await Reservations.findAll({
			include: [
				{
					model: MsUser,
					as: 'user',
					attributes: ['id_user', 'username', 'email'], // Hanya data tertentu
				},
				{
					model: RoomReservations,
					as: 'room_reservations',
					include: [
						{
							model: Room,
							as: 'room',
							include: [
								{
									model: MsRoomType,
									as: 'room_type',
								},
							],
						},
						{
							model: ServiceReservations,
							as: 'services',
							include: [
								{
									model: MsServices,
									as: 'service',
								},
							],
						},
					],
				},
				{
					model: Invoices,
					as: 'invoice',
				},
			],
			order: [['reservation_date', 'DESC']],
		});

		res.json({
			reservations: reservations,
		});
	} catch (error) {
		console.error('Get all reservations error:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

// GET USER RESERVATIONS (FOR CUSTOMER)
export const getUserReservations = async (req, res) => {
	try {
		const id_user = req.user.id;

		const reservations = await Reservations.findAll({
			where: { id_user: id_user },
			include: [
				{
					model: RoomReservations,
					as: 'room_reservations',
					include: [
						{
							model: Room,
							as: 'room',
							include: [{ model: MsRoomType, as: 'room_type' }],
						},
						{
							// [UPDATE] Gunakan ServiceReservations dengan alias BARU
							model: ServiceReservations,
							as: 'service_details', // Sesuai Relationship.js poin 8
							include: [
								{
									model: MsServices,
									as: 'service', // Sesuai Relationship.js poin 8
								},
							],
						},
					],
				},
				{
					model: Invoices,
					as: 'invoice',
					// Hapus include payments jika modelnya belum fix/tidak perlu ditampilkan di list utama
				},
			],
			order: [['reservation_date', 'DESC']],
		});

		res.json({
			reservations: reservations,
		});
	} catch (error) {
		console.error('Get user reservations error:', error);
		res.status(500).json({ message: 'Server error' });
	}
};
