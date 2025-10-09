// ServiceReservations.js - ✅ BENAR
import { DataTypes } from 'sequelize';
import db from '../config/db.js';

//Create Service Reservations Model
const ServiceReservations = db.define('service_reservations', {
    id_service_reservation: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    id_room_reservation: {
        type: DataTypes.INTEGER,
        allowNull: false,        
    },
    id_service: {
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
}, {  
    freezeTableName: true,
    timestamps: true,
});

export default ServiceReservations;