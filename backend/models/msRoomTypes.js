import { DataTypes } from "sequelize";
import db from "../config/db.js";

const MsRoomType = db.define("ms_room_type", {
    id_room_type: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price_per_night: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    room_bed: { 
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'King Bed • 40m²'
    },
    max_stay_duration: {         
        type: DataTypes.INTEGER, 
        allowNull: false,
        defaultValue: 30    
    },
    image_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    }
}, {
    freezeTableName: true,
    timestamps: false
});

export default MsRoomType;