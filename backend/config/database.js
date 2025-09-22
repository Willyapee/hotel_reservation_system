import { Sequelize } from "sequelize";

const db = new Sequelize('sem3_awp_auth', 'root', '', {
    host: "localhost",
    dialect: "mysql"
});

export default db;