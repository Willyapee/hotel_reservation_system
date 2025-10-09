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
    id_room_reservation: {          // ← TAMBAH FOREIGN KEY
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_service: {                   // ← TAMBAH FOREIGN KEY  
        type: DataTypes.INTEGER,
        allowNull: false,
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

export default ServiceReservations;