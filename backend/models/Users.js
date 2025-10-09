//Import Libraries
import { DataTypes } from 'sequelize';

//Import Database
import db from '../config/db.js';

//Create User Model
const MsUser = db.define('ms_user', {
	id_user: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},

	username: {
		type: DataTypes.STRING(255),
		allowNull: false,
		unique: true,
	},
	email: {
		type: DataTypes.STRING(255),
		allowNull: false,
		unique: true,
	},
	password: {
		type: DataTypes.STRING(255),
		allowNull: false,
	},
	role: {
		type: DataTypes.ENUM('admin', 'guest'),
		defaultValue: 'guest',
	},
	freezeTableName: true,
	timestamps: true,
});

export default MsUser;