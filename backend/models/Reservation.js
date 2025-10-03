import { DataTypes } from "sequelize";
import db from "../config/db.js";

//'users' = nama tabel di database
const Reservation = db.define("reservation", {
    room_type: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    add_on: { //fasilitas tambahan hotel
        type: DataTypes.STRING,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    order_date: {
        type: DataTypes.DATE,
        allowNull: false,
    }
});

export default Reservation;