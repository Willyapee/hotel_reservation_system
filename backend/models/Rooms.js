import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Rooms = db.define("rooms", {
    id_room: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_room_type: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    room_number: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true
    },
    creation_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    freezeTableName: true,
    timestamps: false
});

export default Rooms;