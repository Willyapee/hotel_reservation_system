import { DataTypes } from "sequelize";
import db from "../config/db.js";

const BookingRoomFacility = db.define("booking_room_facility", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_facility: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_booking_room: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: false
});

export default BookingRoomFacility;