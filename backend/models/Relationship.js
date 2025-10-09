import MsUser from './Users';
import MsServices from './MSServices';
import ServiceReservations from './ServiceReservations';
import MsRoomType from './msRoomTypes';
import MsUser from './Users';
import Rooms from './Rooms';
import Invoice from './Invoices';
import Payment from './Payments';
import Reservations from './Reservations';
import RoomReservations from './RoomReservations';

const defineRelationships = () => {
	// 1. USER - BOOKING (One-to-Many)
	MsUser.hasMany(Reservations, {
		foreignKey: 'id_user',
		as: 'reservations',
	});
	Reservations.belongsTo(MsUser, {
		foreignKey: 'id_user',
		as: 'user',
	});

	// 2. BOOKING - INVOICE (One-to-One)
	Reservations.hasOne(Invoice, {
		foreignKey: 'id_reservation',
		as: 'invoice',
	});
	Invoice.belongsTo(Reservations, {
		foreignKey: 'id_reservation',
		as: 'reservation',
	});

	// 3. INVOICE - PAYMENT (One-to-One)
	Invoice.hasOne(Payment, {
		foreignKey: 'id_invoice',
		as: 'payment',
	});

	Payment.belongsTo(Invoice, {
		foreignKey: 'id_invoice',
		as: 'invoice',
	});
	/*----------------------------------------------------------*/
	// 4. ROOM TYPE - ROOM (One-to-Many)
	MsRoomType.hasMany(Rooms, {
		foreignKey: 'id_room_type',
		as: 'rooms',
	});
	Rooms.belongsTo(MsRoomType, {
		foreignKey: 'id_room_type',
		as: 'room_type',
	});

	// 5. BOOKING - BOOKING_ROOM (One-to-Many)
	Reservations.hasMany(RoomReservations, {
		foreignKey: 'id_reservation',
		as: 'room_reservations',
	});
	RoomReservations.belongsTo(Reservations, {
		foreignKey: 'id_reservation',
		as: 'reservation',
	});

	// 6. ROOM - BOOKING_ROOM (One-to-Many)
	Rooms.hasMany(RoomReservations, {
		foreignKey: 'id_room',
		as: 'room_reservations',
	});
	RoomReservations.belongsTo(Rooms, {
		foreignKey: 'id_room',
		as: 'room',
	});
	/*----------------------------------------------------------*/
	// 7. BOOKING_ROOM - FACILITY (Many-to-Many through BookingRoomFacility)
	RoomReservations.belongsToMany(MsServices, {
		through: ServiceReservations,
		foreignKey: 'id_room_reservation',
		otherKey: 'id_service',
		as: 'services',
	});

	MsServices.belongsToMany(RoomReservations, {
		through: ServiceReservations,
		foreignKey: 'id_service',
		otherKey: 'id_room_reservation',
		as: 'room_reservations',
	});

	// 8. Additional direct relations for junction table
	ServiceReservations.belongsTo(RoomReservations, {
		foreignKey: 'id_room_reservation',
	});

	ServiceReservations.belongsTo(MsServices, {
		foreignKey: 'id_service',
	});
};

export default defineRelationships;
