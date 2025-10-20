import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const MsServices = db.define('ms_services', {
    id_service: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    desc: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    service_price: {
        type: DataTypes.DECIMAL(63, 2),
        allowNull: false,
    },
    unit: {
        type: DataTypes.ENUM('per_booking', 'per_person'),
        allowNull: false,
    },
}, {  
    freezeTableName: true,
    timestamps: true,
});

export default MsServices;