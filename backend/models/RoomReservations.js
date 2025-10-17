//Import Libraries
import { DataTypes } from 'sequelize';

//Import Database
import db from '../config/db.js';

//Create Room Reservation Model
const RoomReservations = db.define('room_reservations', {
	id_room_reservation: {
		type: DataTypes.INTEGER,
		 primaryKey: true,        
        autoIncrement: true,     
	},
	id_reservation: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	id_room: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	check_in_date: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	check_out_date: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	status: {
		type: DataTypes.ENUM('reserved', 'checked_in', 'checked_out', 'cancelled'),
		defaultValue: 'reserved',
	},
	subtotal_price: {
		type: DataTypes.DECIMAL(63, 2),
		allowNull: false,
	},
}, {
    freezeTableName: true,
    timestamps: true,
});

export default RoomReservations;
