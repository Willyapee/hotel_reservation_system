// models/MsFacility.js
import { DataTypes } from "sequelize";
import db from "../config/db.js";

const MsFacility = db.define("ms_facility", {
    id_facility: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('service', 'amenity', 'extra'),
        defaultValue: 'amenity'
    }
}, {
    freezeTableName: true,
    timestamps: false
});

export default MsFacility;