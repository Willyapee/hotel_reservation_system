import MsUser from './MsUsers.js';
import MsServices from './msServices.js';
import ServiceReservations from './ServiceReservations.js';
import MsRoomType from './msRoomTypes.js';
import Rooms from './Rooms.js';
import Invoices from './Invoices.js';
import Payments from './Payments.js';
import Reservations from './Reservations.js';
import RoomReservations from './RoomReservations.js';

const defineRelationships = () => {
	// 1. USER - RESERVATION (One-to-Many)
	MsUser.hasMany(Reservations, {
		foreignKey: 'id_user',
		as: 'reservations',
	});
	Reservations.belongsTo(MsUser, {
		foreignKey: 'id_user',
		as: 'user',
	});

	// 2. RESERVATION - ROOM_RESERVATION (One-to-Many)
	Reservations.hasMany(RoomReservations, {
		foreignKey: 'id_reservation',
		as: 'room_reservations',
	});
	RoomReservations.belongsTo(Reservations, {
		foreignKey: 'id_reservation',
		as: 'reservation',
	});

	// 3. RESERVATION - INVOICE (One-to-One)
	Reservations.hasOne(Invoices, {
		foreignKey: 'id_reservation',
		as: 'invoice',
	});
	Invoices.belongsTo(Reservations, {
		foreignKey: 'id_reservation',
		as: 'reservation',
	});

	// 4. INVOICE - PAYMENT (One-to-One)
	Invoices.hasOne(Payments, {
		foreignKey: 'id_invoice',
		as: 'payment',
	});
	Payments.belongsTo(Invoices, {
		foreignKey: 'id_invoice',
		as: 'invoice',
	});

	// 5. ROOM TYPE - ROOM (One-to-Many)
	MsRoomType.hasMany(Rooms, {
		foreignKey: 'id_room_type',
		as: 'rooms',
		onDelete: 'CASCADE',
	});
	Rooms.belongsTo(MsRoomType, {
		foreignKey: 'id_room_type',
		as: 'room_type',
	});

	// 6. ROOM - ROOM_RESERVATION (One-to-Many)
	Rooms.hasMany(RoomReservations, {
		foreignKey: 'id_room',
		as: 'room_reservations',
	});
	RoomReservations.belongsTo(Rooms, {
		foreignKey: 'id_room',
		as: 'room',
	});

	// 7. ROOM_RESERVATION - SERVICE (Many-to-Many melalui ServiceReservations)
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

	// 8. Direct relations untuk junction table
	RoomReservations.hasMany(ServiceReservations, {
		foreignKey: 'id_room_reservation',
		as: 'service_details',
	});
	ServiceReservations.belongsTo(RoomReservations, {
		foreignKey: 'id_room_reservation',
		as: 'room_reservation',
	});

	// 9. SERVICE - SERVICE_RESERVATIONS (One-to-Many)
	MsServices.hasMany(ServiceReservations, {
		foreignKey: 'id_service',
		as: 'service_reservations',
	});
	ServiceReservations.belongsTo(MsServices, {
		foreignKey: 'id_service',
		as: 'service',
	});
};

export default defineRelationships;