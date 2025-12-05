import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const Invoices = db.define('invoice', {
	id_invoice: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},
	id_reservation: {
        type: DataTypes.INTEGER,
        allowNull: false,
	},
	invoice_number: { 
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
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
		type: DataTypes.ENUM('pending', 'paid', 'cancelled', 'expired'),
		defaultValue: 'pending',
	},
}, {  
	freezeTableName: true,
	timestamps: true,	
});

export default Invoices;