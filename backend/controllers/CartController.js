import { Op } from 'sequelize';
import RoomReservations from '../models/RoomReservations.js';
import Rooms from '../models/Rooms.js';
import MsRoomType from '../models/msRoomTypes.js';
import MsServices from '../models/msServices.js';
import ServiceReservations from '../models/ServiceReservations.js';

export const addToCart = async (req, res) => {
	try {
		const { roomId, checkIn, checkOut, guests } = req.body;

		const userId = req.user ? req.user.id : null;

		console.log('📥 Received cart data:', {
			roomId,
			checkIn,
			checkOut,
			guests,
		});

		const roomIdNumber = parseInt(roomId);
		const room = await Rooms.findByPk(roomIdNumber, {
			include: [
				{
					model: MsRoomType,
					as: 'room_type',
				},
			],
		});

		if (!room) {
			return res.status(404).json({
				success: false,
				message: 'Room not found',
			});
		}

		const checkInDate = new Date(checkIn);
		const checkOutDate = new Date(checkOut);

		if (checkInDate >= checkOutDate) {
			return res.status(400).json({
				success: false,
				message: 'Check-out date must be after check-in date',
			});
		}

		const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
		const roomPrice = parseFloat(room.room_type?.price_per_night || 0);
		const subtotal = roomPrice * nights;

		console.log('💵 Room price calculation:', {
			roomPrice: roomPrice,
			nights: nights,
			subtotal: subtotal,
		});

		const adults = parseInt(guests?.adults) || 1;
		const children = parseInt(guests?.children) || 0;

		console.log('👥 Guest info to save:', { adults, children });

		const existingInCart = await RoomReservations.findOne({
			where: {
				id_room: roomIdNumber,
				status: 'draft',
				id_reservation: null,
				id_user: userId,
				[Op.or]: [
					{
						check_in_date: { [Op.lte]: checkOutDate },
						check_out_date: { [Op.gte]: checkInDate },
					},
				],
			},
		});

		if (existingInCart) {
			return res.status(400).json({
				success: false,
				message: 'Room already in cart',
			});
		}

		const isAvailable = await checkRoomAvailability(roomIdNumber, checkInDate, checkOutDate);
		if (!isAvailable) {
			return res.status(400).json({
				success: false,
				message: 'Room not available',
			});
		}

		const cartItem = await RoomReservations.create({
			id_room: roomIdNumber,
			id_user: userId,
			check_in_date: checkInDate,
			check_out_date: checkOutDate,
			status: 'draft',
			subtotal_price: subtotal,
			id_reservation: null,
			guest_adults: adults,
			guest_children: children,
		});

		console.log('✅ Cart item created:', {
			id: cartItem.id_room_reservation,
			guest_adults: cartItem.guest_adults,
			guest_children: cartItem.guest_children,
		});

		res.json({
			success: true,
			message: 'Room added to cart successfully',
			cartItem: {
				id: cartItem.id_room_reservation,
				roomId: cartItem.id_room,
				nights: nights,
				subtotal: subtotal,
				pricePerNight: roomPrice,
				totalForStay: subtotal,
				guests: {
					adults: cartItem.guest_adults,
					children: cartItem.guest_children,
				},
			},
		});
	} catch (error) {
		console.error('Add to cart error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to add room to cart',
		});
	}
};

const checkRoomAvailability = async (roomId, checkIn, checkOut) => {
    try {
        const conflictingBooking = await RoomReservations.findOne({
            where: {
                id_room: roomId,
                status: {
                    [Op.in]: ['reserved', 'checked_in'], 
                },
                [Op.or]: [
                    {
                        check_in_date: { [Op.lt]: checkOut },
                        check_out_date: { [Op.gt]: checkIn },
                    },
                ],
            },
        });

        return !conflictingBooking; 
    } catch (error) {
        console.error('Check availability error:', error);
        return false;
    }
};

export const getCart = async (req, res) => {
	try {
		const userId = req.user ? req.user.id : null;

		const cartItems = await RoomReservations.findAll({
			where: {
				status: 'draft',
				id_reservation: null,
				id_user: userId,
			},
			include: [
				{
					model: Rooms,
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
					as: 'service_details',
					include: [
						{
							model: MsServices,
							as: 'service',
						},
					],
				},
			],
			order: [['createdAt', 'DESC']],
		});

		console.log('📦 Found cart items:', cartItems.length);

		const formattedCart = cartItems.map((item) => {
			const room = item.room;
			const roomType = room?.room_type;

			const guestInfo = {
				adults: parseInt(item.guest_adults) || 1,
				children: parseInt(item.guest_children) || 0,
			};

			console.log('👥 Guest info from database:', {
				itemId: item.id_room_reservation,
				guest_adults: item.guest_adults,
				guest_children: item.guest_children,
				guestInfo: guestInfo,
			});

			const checkIn = new Date(item.check_in_date);
			const checkOut = new Date(item.check_out_date);
			const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));

			const pricePerNight = parseFloat(roomType?.price_per_night || 0);
			const roomSubtotal = pricePerNight * nights;

			let servicesTotal = 0;
			const services =
				item.service_details?.map((service) => {
					const serviceData = service.service;
					const isPerPerson = serviceData?.unit === 'per_person';
					const unitPrice = parseFloat(serviceData?.service_price || 0);

					let subtotal = 0;

					if (isPerPerson) {
						const adultPrice = unitPrice * guestInfo.adults;
						const childPrice = unitPrice * 0.5 * guestInfo.children;
						subtotal = adultPrice + childPrice;
					} else {
						subtotal = parseFloat(service.subtotal_price) || unitPrice;
					}

					servicesTotal += subtotal;

					return {
						id: service.id_service_reservation,
						service: {
							id: serviceData?.id_service,
							name: serviceData?.name,
							price: unitPrice,
							unit: serviceData?.unit,
						},
						totalPrice: subtotal.toFixed(2),
					};
				}) || [];

			const totalPrice = (roomSubtotal + servicesTotal).toFixed(2);

			return {
				id: item.id_room_reservation,
				roomId: item.id_room,
				checkIn: item.check_in_date,
				checkOut: item.check_out_date,
				nights: nights,
				guests: guestInfo,
				room: {
					id: room?.id_room,
					name: roomType?.name || 'Unknown Room',
					pricePerNight: pricePerNight.toFixed(2),
					totalForStay: roomSubtotal.toFixed(2),
					image: roomType?.image_url || '/default-room.jpg',
					description: roomType?.description,
					bed_type: roomType?.room_bed,
					room_number: room?.room_number,
					roomNumber: room?.room_number,
					guests: guestInfo,
				},
				services: services,
				totalPrice: totalPrice,
				subtotal: roomSubtotal.toFixed(2),
			};
		});

		res.json({
			success: true,
			cart: formattedCart,
		});
	} catch (error) {
		console.error('Get cart error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch cart',
		});
	}
};

async function updateServiceQuantityInDatabase(
	serviceReservationId,
	correctQuantity,
	correctSubtotal
) {
	try {
		await ServiceReservations.update(
			{
				quantity: correctQuantity,
				subtotal_price: correctSubtotal,
			},
			{
				where: { id_service_reservation: serviceReservationId },
			}
		);
		console.log(
			`✅ Fixed service ${serviceReservationId}: quantity=${correctQuantity}, subtotal=${correctSubtotal}`
		);
	} catch (error) {
		console.error(`❌ Failed to fix service ${serviceReservationId}:`, error);
	}
}

export const removeFromCart = async (req, res) => {
	try {
		const { itemId } = req.params;

		const userId = req.user ? req.user.id : null;

		const cartItem = await RoomReservations.findOne({
			where: {
				id_room_reservation: itemId,
				status: 'draft',
				id_user: userId,
			},
		});

		if (!cartItem) {
			return res.status(404).json({
				success: false,
				message: 'Cart item not found',
			});
		}

		await ServiceReservations.destroy({
			where: { id_room_reservation: itemId },
		});

		await cartItem.destroy();

		res.json({
			success: true,
			message: 'Item removed from cart',
		});
	} catch (error) {
		console.error('Remove from cart error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to remove item from cart',
		});
	}
};

export const addServiceToCartItem = async (req, res) => {
	try {
		const { cartItemId } = req.params;
		const { serviceId } = req.body;

		const userId = req.user ? req.user.id : null;

		if (!serviceId) {
			return res.status(400).json({
				success: false,
				message: 'serviceId is required',
			});
		}

		const cartItem = await RoomReservations.findByPk(cartItemId);
		if (!cartItem) {
			return res.status(404).json({
				success: false,
				message: 'Cart item not found',
			});
		}

		const service = await MsServices.findByPk(serviceId);
		if (!service) {
			return res.status(404).json({
				success: false,
				message: 'Service not found',
			});
		}

		const guestInfo = {
			adults: parseInt(cartItem.guest_adults) || 1,
			children: parseInt(cartItem.guest_children) || 0,
		};

		console.log('👥 Guest info for service calculation:', guestInfo);

		let subtotal = 0;

		const servicePrice = parseFloat(service.service_price);

		if (service.unit === 'per_person') {
			const adultPrice = servicePrice * guestInfo.adults;
			const childPrice = servicePrice * 0.5 * guestInfo.children;
			subtotal = adultPrice + childPrice;

			console.log('💰 Per Person Service Calculation:', {
				adults: guestInfo.adults,
				children: guestInfo.children,
				adultPrice: adultPrice,
				childPrice: childPrice,
				total: subtotal,
			});
		} else {
			subtotal = servicePrice;

			const existingService = await ServiceReservations.findOne({
				where: {
					id_room_reservation: cartItemId,
					id_service: serviceId,
				},
			});

			if (existingService) {
				return res.status(400).json({
					success: false,
					message: `Service "${service.name}" already added to this booking`,
				});
			}
		}

		const serviceReservation = await ServiceReservations.create({
			id_room_reservation: cartItemId,
			id_service: serviceId,
			quantity: service.unit === 'per_person' ? guestInfo.adults + guestInfo.children : 1,
			subtotal_price: subtotal,
		});

		const roomSubtotal = parseFloat(cartItem.subtotal_price || 0);
		const newSubtotal = roomSubtotal + subtotal;
		await cartItem.update({ subtotal_price: newSubtotal });

		res.json({
			success: true,
			message: `Service "${service.name}" added successfully`,
			service: {
				id: serviceReservation.id_service_reservation,
				service: {
					id: service.id_service,
					name: service.name,
					price: servicePrice,
					unit: service.unit,
				},
				totalPrice: subtotal.toFixed(2),
			},
		});
	} catch (error) {
		console.error('Add service error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to add service to cart item',
		});
	}
};

export const removeServiceFromCartItem = async (req, res) => {
	try {
		const { cartItemServiceId } = req.params;
		const userId = req.user ? req.user.id : null;

		const serviceReservation = await ServiceReservations.findByPk(cartItemServiceId, {
			include: [
				{
					model: MsServices,
					as: 'service',
				},
				{
					model: RoomReservations,
					as: 'room_reservation',
				},
			],
		});

		if (!serviceReservation) {
			return res.status(404).json({
				success: false,
				message: 'Service reservation not found',
			});
		}

		if (serviceReservation.room_reservation.id_user !== userId) {
			return res.status(403).json({
				success: false,
				message: 'Unauthorized action',
			});
		}

		console.log('🗑️ Removing service:', {
			id: serviceReservation.id_service_reservation,
			name: serviceReservation.service?.name,
			unit: serviceReservation.service?.unit,
			quantity: serviceReservation.quantity,
			subtotal: serviceReservation.subtotal_price,
		});

		await serviceReservation.destroy();
		console.log('✅ Service removed from database');

		res.json({
			success: true,
			message: 'Service removed from cart item',
			removedService: {
				id: serviceReservation.id_service_reservation,
				name: serviceReservation.service?.name,
				amountRemoved: serviceReservation.subtotal_price,
			},
		});
	} catch (error) {
		console.error('Remove service error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to remove service from cart item',
		});
	}
};

export const clearCart = async (req, res) => {
	try {
		const userId = req.user ? req.user.id : null;

		if (!userId) return res.status(401).json({ message: 'Unauthorized' });

		const cartItems = await RoomReservations.findAll({
			where: { status: 'draft' },
		});

		for (const item of cartItems) {
			await ServiceReservations.destroy({
				where: { id_room_reservation: item.id_room_reservation },
			});
		}

		await RoomReservations.destroy({
			where: { status: 'draft', id_user: userId },
		});

		res.json({
			success: true,
			message: 'Cart cleared successfully',
		});
	} catch (error) {
		console.error('Clear cart error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to clear cart',
		});
	}
};

export const getCartRoomNumbers = async (req, res) => {
	try {
		const userId = req.user ? req.user.id : null;

		if (!userId) {
			return res.json({ success: true, roomNumbers: [] });
		}
		const cartItems = await RoomReservations.findAll({
			where: {
				status: 'draft',
				id_reservation: null,
				id_user: userId,
			},
			include: [
				{
					model: Rooms,
					as: 'room',
					attributes: ['id_room'],
				},
			],
		});

		const roomNumbers = cartItems
			.map((item) => item.room?.id_room)
			.filter((id) => id !== undefined && id !== null)
			.map((id) => parseInt(id));

		console.log('📋 Cart room numbers:', roomNumbers);

		res.json({
			success: true,
			roomNumbers: roomNumbers,
		});
	} catch (error) {
		console.error('Get cart room numbers error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch cart room numbers',
		});
	}
};
