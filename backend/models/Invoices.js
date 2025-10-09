//Import Libraries
import { DataTypes } from 'sequelize';

//Import Database
import db from '../config/db.js';

//Create Invoice Model
const Invoices = db.define('invoice', {
	id_invoice: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},

	total_amount: {
		type: DataTypes.DECIMAL(63, 2),
		allowNull: false,
	},
	issued_date: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: DataTypes.NOW,
	},
	due_date: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	status: {
		type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
		defaultValue: 'pending',
	},

	freezeTableName: true,
	timestamps: true,
});

export default Invoices;