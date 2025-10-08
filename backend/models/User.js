/*FUNGSI FOLDER MODELS:
Model = representasi tabel di database, tapi dalam bentuk kode JavaScript.
Model mendefinisikan:
- Nama tabel
- Kolom + tipe data (STRING, INTEGER, TEXT, dll)
- Constraint (allowNull, unique, primaryKey, dll)
- Relasi antar tabel (hasMany, belongsTo, dll)
*/
import { DataTypes } from "sequelize";
import db from "../config/db.js";

//'users' = nama tabel di database
// models/MsUser.js
const MsUser = db.define("ms_user", {
    id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        defaultValue: 'user'
    }
}, {
    freezeTableName: true, // 👈 bikin Sequelize pakai nama persis
    timestamps: true
});

export default MsUser;
