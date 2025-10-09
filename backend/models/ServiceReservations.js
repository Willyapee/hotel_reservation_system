//Import Libraries
import { DataTypes } from 'sequelize';

//Import Database
import db from '../config/db.js';

//Create Service Reservations Model
const ServiceReservations = db.define('service_reservations', {
	id_service_reservation: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},
	quantity: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	subtotal_price: {
		type: DataTypes.DECIMAL(63, 2),
		allowNull: false,
	},
});
