import MsUser from './MsUser.js';
import Booking from './Reservations.js';
import Invoice from './Invoice.js';
import Payment from './Payment.js';
import MsRoomType from './MsRoomType.js';
import Room from './Rooms.js';
import BookingRoom from './Reservations.js';
import MsFacility from './MsFacility.js';
import BookingRoomFacility from './ServiceReservations.js';

const defineRelationships = () => {
	// 1. USER - BOOKING (One-to-Many)
	MsUser.hasMany(Booking, {
		foreignKey: 'id_user',
		as: 'bookings',
	});
	Booking.belongsTo(MsUser, {
		foreignKey: 'id_user',
		as: 'user',
	});

	// 2. BOOKING - INVOICE (One-to-One)
	Booking.hasOne(Invoice, {
		foreignKey: 'id_booking',
		as: 'invoice',
	});
	Invoice.belongsTo(Booking, {
		foreignKey: 'id_booking',
		as: 'booking',
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
	MsRoomType.hasMany(Room, {
		foreignKey: 'id_room_type',
		as: 'rooms',
	});
	Room.belongsTo(MsRoomType, {
		foreignKey: 'id_room_type',
		as: 'room_type',
	});

	// 5. BOOKING - BOOKING_ROOM (One-to-Many)
	Booking.hasMany(BookingRoom, {
		foreignKey: 'id_booking',
		as: 'booking_rooms',
	});
	BookingRoom.belongsTo(Booking, {
		foreignKey: 'id_booking',
		as: 'booking',
	});

	// 6. ROOM - BOOKING_ROOM (One-to-Many)
	Room.hasMany(BookingRoom, {
		foreignKey: 'id_room',
		as: 'booking_rooms',
	});
	BookingRoom.belongsTo(Room, {
		foreignKey: 'id_room',
		as: 'room',
	});
	/*----------------------------------------------------------*/
	// 7. BOOKING_ROOM - FACILITY (Many-to-Many through BookingRoomFacility)
	BookingRoom.belongsToMany(MsFacility, {
		through: BookingRoomFacility,
		foreignKey: 'id_booking_room',
		otherKey: 'id_facility',
		as: 'facilities',
	});

	MsFacility.belongsToMany(BookingRoom, {
		through: BookingRoomFacility,
		foreignKey: 'id_facility',
		otherKey: 'id_booking_room',
		as: 'booking_rooms',
	});

	// 8. Additional direct relations for junction table
	BookingRoomFacility.belongsTo(BookingRoom, {
		foreignKey: 'id_booking_room',
	});

	BookingRoomFacility.belongsTo(MsFacility, {
		foreignKey: 'id_facility',
	});
};

export default defineRelationships;
