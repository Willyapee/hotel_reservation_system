//Import Libraries
import { DataTypes } from 'sequelize';

//Import Database
import db from '../config/db.js';

//Create Reservation Model
const Reservations = db.define('reservation', {
	id_reservation: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},
	id_user: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	reservation_date: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: DataTypes.NOW,
    },
}, {
    freezeTableName: true,
    timestamps: true,
});

export default Reservations;