import { Op } from 'sequelize';
import db from '../config/db.js';
import Reservations from '../models/Reservations.js';
import RoomReservations from '../models/RoomReservations.js';
import ServiceReservations from '../models/ServiceReservations.js';
import MsRoomType from '../models/msRoomTypes.js';
import Room from '../models/Rooms.js';
import MsServices from '../models/msServices.js';
import Invoices from '../models/Invoices.js';
import MsUser from '../models/MsUsers.js';

const calculateDaysDifference = (check_in, check_out) => {
	const start = new Date(check_in);
	const end = new Date(check_out);
	return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

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

		if (!customer_name || !customer_email || !check_in || !check_out || !selected_room_type_id) {
			return res.status(400).json({
				message: 'Customer info, dates, and room type are required',
			});
		}

		const stayDuration = calculateDaysDifference(check_in, check_out);

		const roomType = await MsRoomType.findByPk(selected_room_type_id);
		if (!roomType) {
			return res.status(404).json({ message: 'Room type not found' });
		}

		const availableRoom = await getOneAvailableRoom(selected_room_type_id, check_in, check_out);

		if (!availableRoom) {
			return res.status(400).json({
				message: 'No available rooms for selected type and dates',
			});
		}

		let totalAmount = roomType.price_per_night * stayDuration;

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

		const reservation = await Reservations.create({
			customer_name,
			customer_email,
			customer_phone,
			check_in: new Date(check_in),
			check_out: new Date(check_out),
			reservation_date: new Date(),
			status: 'temporary', 
		});

		const roomReservation = await RoomReservations.create({
			id_reservation: reservation.id_reservation,
			id_room: availableRoom.id_room,
			check_in_date: check_in,
			check_out_date: check_out,
			status: 'reserved',
			subtotal_price: roomType.price_per_night * stayDuration,
		});

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

export const confirmReservationAfterLogin = async (req, res) => {
	try {
		const { reservation_id } = req.body;
		const id_user = req.user.id;

		const reservation = await Reservations.findByPk(reservation_id);
		if (!reservation) {
			return res.status(404).json({ message: 'Reservation not found' });
		}

		if (reservation.status !== 'temporary') {
			return res.status(400).json({ message: 'Reservation already confirmed or invalid' });
		}

		await reservation.update({
			id_user: id_user,
			status: 'confirmed',
		});

		const dueDate = new Date();
		dueDate.setDate(dueDate.getDate() + 3);

		const roomReservations = await RoomReservations.findAll({
			where: { id_reservation: reservation_id },
			include: [
				{
					model: ServiceReservations,
					as: 'services',
				},
			],
		});

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

export const getAllReservations = async (req, res) => {
	try {
		const reservations = await Reservations.findAll({
			include: [
				{
					model: MsUser,
					as: 'user',
					attributes: ['id_user', 'username', 'email'], 
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

export const getUserReservations = async (req, res) => {
  try {
    const id_user = req.user.id;
    console.log(`🔍 [RESERVATIONS] Fetching reservations for user ${id_user}`);

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
              include: [{ 
                model: MsRoomType, 
                as: 'room_type' 
              }]
            },
            {
              model: ServiceReservations,
              as: 'service_details', 
              include: [
                {
                  model: MsServices,
                  as: 'service', 
                }
              ]
            }
          ]
        },
        {
          model: Invoices,
          as: 'invoice'  
        }
      ],
      order: [['reservation_date', 'DESC']]
    });

    console.log(`✅ [RESERVATIONS] Found ${reservations.length} reservations for user ${id_user}`);

    res.json({
      success: true,
      reservations: reservations
    });

  } catch (error) {
    console.error('❌ [RESERVATIONS] Get user reservations error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch user reservations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const confirmReservationPayment = async (req, res) => {
    let transaction;
    
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        console.log(`💰 [PAYMENT] Starting payment confirmation for reservation ${id}, user ${userId}`);
        
        const reservationExists = await Reservations.findOne({
            where: { 
                id_reservation: id,
                id_user: userId 
            }
        });
        
        if (!reservationExists) {
            console.log(`❌ [PAYMENT] Reservation ${id} not found or user mismatch`);
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }
        
        console.log(`✅ [PAYMENT] Reservation ${id} found`);
        
        transaction = await db.transaction();
        
        try {
            console.log(`🔍 [PAYMENT] Looking for pending payment rooms...`);

            const invoice = await Invoices.findOne({
                where: { 
                    id_reservation: id,
                    status: 'pending' 
                },
                transaction
            });
            
            if (!invoice) {
                await transaction.rollback();
                console.log(`❌ [PAYMENT] No pending invoice found for reservation ${id}`);
                return res.status(400).json({
                    success: false,
                    message: 'No pending invoice found. Reservation may already be paid.'
                });
            }
            
            const roomReservations = await RoomReservations.findAll({
                where: { 
                    id_reservation: id,
                    status: 'pending_payment'
                },
                transaction
            });
            
            if (!roomReservations || roomReservations.length === 0) {
                await transaction.rollback();
                console.log(`❌ [PAYMENT] No pending payment rooms found for reservation ${id}`);
                return res.status(400).json({
                    success: false,
                    message: 'No pending payment rooms found. Reservation may already be paid or cancelled.'
                });
            }
            
            console.log(`✅ [PAYMENT] Found ${roomReservations.length} pending rooms`);
            
            console.log(`🔍 [PAYMENT] Validating room availability...`);
            for (const roomRes of roomReservations) {
                console.log(`   Checking room ${roomRes.id_room} (${roomRes.check_in_date} to ${roomRes.check_out_date})`);
                
                const overlappingReserved = await RoomReservations.findOne({
                    where: {
                        id_room: roomRes.id_room,
                        status:{ 
							[Op.in]: ['reserved', 'pending_payment', 'checked_in']  
						},
                        [Op.and]: [
                            {
                                [Op.or]: [
                                    {
                                        check_in_date: { 
                                            [Op.lt]: roomRes.check_out_date 
                                        },
                                        check_out_date: { 
                                            [Op.gt]: roomRes.check_in_date 
                                        },
                                    }
                                ]
                            },
                            {
                                id_room_reservation: {
                                    [Op.ne]: roomRes.id_room_reservation
                                }
                            }
                        ]
                    },
                    transaction
                });

                if (overlappingReserved) {
                    await transaction.rollback();
                    console.log(`❌ [PAYMENT] Room ${roomRes.id_room} already reserved!`);
                    console.log(`   Conflict with reservation ${overlappingReserved.id_reservation}`);
                    console.log(`   Dates: ${overlappingReserved.check_in_date} to ${overlappingReserved.check_out_date}`);
                    return res.status(400).json({
                        success: false,
                        message: `Room ${roomRes.id_room} has already been reserved for overlapping dates. Please choose another room.`,
                        details: {
                            roomId: roomRes.id_room,
                            conflictingDates: {
                                check_in: overlappingReserved.check_in_date,
                                check_out: overlappingReserved.check_out_date
                            }
                        }
                    });
                }
            }
            
            console.log(`🔄 [PAYMENT] Updating room status to reserved...`);
            for (const roomRes of roomReservations) {
                await roomRes.update({ 
                    status: 'reserved',
                    updatedAt: new Date()
                }, { transaction });
                console.log(`   ✅ Room ${roomRes.id_room} updated to reserved`);
            }
            
            console.log(`🔄 [PAYMENT] Updating invoice status to paid...`);
            await invoice.update({ 
                status: 'paid',
                updatedAt: new Date(),
                payment_date: new Date()
            }, { transaction });
            console.log(`✅ Invoice ${invoice.id_invoice} (${invoice.invoice_number}) marked as paid`);
            
            await transaction.commit();
            console.log(`✅ [PAYMENT] Transaction completed successfully for reservation ${id}`);
            
            res.json({
                success: true,
                message: 'Payment confirmed successfully. Rooms are now reserved.',
                reservationId: id,
                roomsCount: roomReservations.length,
                invoiceNumber: invoice.invoice_number,
                totalPaid: invoice.total_amount
            });
            
        } catch (innerError) {
            console.error(`❌ [PAYMENT] Inner error in transaction:`, innerError);
            console.error(`❌ [PAYMENT] Error stack:`, innerError.stack);
            
            if (transaction && !transaction.finished) {
                await transaction.rollback();
                console.log('🔄 Transaction rolled back');
            }
            
            throw innerError;
        }
        
    } catch (error) {
        console.error('❌ [PAYMENT] Confirm payment error:', error);
        console.error('❌ [PAYMENT] Error stack:', error.stack);
        
        let errorMessage = 'Failed to confirm payment. Please try again or contact support.';
        
        if (error.name === 'SequelizeDatabaseError') {
            if (error.message.includes('ENUM')) {
                errorMessage = 'Database error: Room status not recognized. Please contact support.';
            }
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : undefined
        });
    }
};