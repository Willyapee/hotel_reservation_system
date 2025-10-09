import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Room = db.define("room", {
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
    availability: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    creation_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    freezeTableName: true,
    timestamps: false
});

export default Room;