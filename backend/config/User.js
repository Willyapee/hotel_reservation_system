//UNTUK KONEKSI KE DATABSE
import { Sequelize } from "sequelize";

//utk membaca file .env (env = kredensial database)
/*Di Node.js, environment variable disimpan di object global bernama process.env.
dotenv.config() tugasnya hanya membaca file .env lalu menaruh setiap key-value ke process.env.*/
import dotenv from "dotenv";
dotenv.config(); //load file .env

const db = new Sequelize(
    //main db credentials
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,

    //addition
    {
        host: process.env.DB_HOST,
        dialect: "mysql", //jenis database engine yg dipake sequelize
    }
);

export default db;

/*
NOTE:
sequelize mewajibkan posisi arguments seperti berikut:
new Sequelize(NAMA_DB, username, password, options)

arguments = nilai yang diberikan ke function
------------------------------------------------------------------
Step yang sehat (untuk backend API)
Config (Database.js) ✅
⬇️
Models (misalnya User.js → tabel users)
⬇️
Controllers (authController.js → register, login, dll)
⬇️
Routes (authRoutes.js → endpoint /auth/register, /auth/login)
⬇️
Server.js (gabungin semuanya)
*/ 