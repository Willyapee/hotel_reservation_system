// models/BookingRoom.js
import { DataTypes } from "sequelize";
import db from "../config/db.js";

const BookingRoom = db.define("booking_room", {
    id_booking_room: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_booking: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_room: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    check_in: {
        type: DataTypes.DATE,
        allowNull: false
    },
    check_out: {
        type: DataTypes.DATE,
        allowNull: false
    },
    room_status: {
        type: DataTypes.ENUM('reserved', 'checked_in', 'checked_out', 'cancelled'),
        defaultValue: 'reserved'
    },
    subtotal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: false
});

export default BookingRoom;