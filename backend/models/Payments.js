import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Payments = db.define("payment", {
    id_payment: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_invoice: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    payment_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    method: {
        type: DataTypes.ENUM('bank_transfer', 'virtual_account', 'ewallet'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'verified', 'cancelled'),
        defaultValue: 'pending'
    },
    payment_proof_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    payment_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    freezeTableName: true,
    timestamps: false
});

export default Payments;