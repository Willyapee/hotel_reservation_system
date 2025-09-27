/*FUNGSI FOLDER MODELS:
Model = representasi tabel di database, tapi dalam bentuk kode JavaScript.
Model mendefinisikan:
- Nama tabel
- Kolom + tipe data (STRING, INTEGER, TEXT, dll)
- Constraint (allowNull, unique, primaryKey, dll)
- Relasi antar tabel (hasMany, belongsTo, dll)
*/
import { DataTypes } from "sequelize";
import db from "../config/User.js";

//'users' = nama tabel di database
const Users = db.define("users", {
    name: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verificationToken: {
        type: DataTypes.STRING,
        allowNull: true
    }

});

export default Users;