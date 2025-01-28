const { Sequelize } = require("sequelize");

const dbConnection = new Sequelize({
    database: process.env.DB_NAME,
    dialect: process.env.DB_DIALECT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

module.exports = dbConnection;