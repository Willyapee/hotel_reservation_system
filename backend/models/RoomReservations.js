import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const RoomReservations = db.define(
	'room_reservations',
	{
		id_room_reservation: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		id_reservation: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: null,
		},
		id_user: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: null,
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
			type: DataTypes.ENUM('draft', 'reserved', 'checked_in', 'checked_out', 'cancelled'),
			defaultValue: 'draft',
		},
		subtotal_price: {
			type: DataTypes.DECIMAL(63, 2),
			allowNull: false,
		},
		guest_adults: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 1,
		},
		guest_children: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
	},
	{
		freezeTableName: true,
		timestamps: true,
	}
);

export default RoomReservations;
