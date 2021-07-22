let mysql = require('mysql');
const envconfig = require('../envconfig.json');

let sql = mysql.createPool({
    connectionLimit: 6,
    host: envconfig.MySQL.host,
    user: envconfig.MySQL.user,
    password: envconfig.MySQL.pass,
    port: envconfig.MySQL.port,
    supportBigNumbers: true,
    bigNumberStrings: true,
    charset: 'utf8mb4'
});

sql.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        }
    }
    if (connection) connection.release();
});


sql.query(`CREATE DATABASE IF NOT EXISTS zsurvive;`, async (err, rows) => {
    if (err) throw err;

    sql.query(`CREATE TABLE IF NOT EXISTS zsurvive.guilds (guild varchar(50) DEFAULT NULL, lang varchar(50) DEFAULT NULL);`, async (err, rows) => {
        if (err) throw err;
    });
    sql.query(`CREATE TABLE IF NOT EXISTS zsurvive.guild_count (id int NOT NULL AUTO_INCREMENT, date tinytext, amount int DEFAULT NULL, UNIQUE(id));`, async (err) => {
        if (err) throw err;
    });
    sql.query(`CREATE TABLE IF NOT EXISTS zsurvive.invites (id int NOT NULL AUTO_INCREMENT, guild text, date tinytext, joined text, UNIQUE(id));`, async (err) => {
        if (err) throw err;
    });
    sql.query(`CREATE TABLE IF NOT EXISTS zsurvive.refs (code text, main int DEFAULT '0', invite int DEFAULT '0', discord int DEFAULT '0', alias text);`, async (err) => {
        if (err) throw err;
    });
    sql.query(`CREATE TABLE IF NOT EXISTS zsurvive.users (id varchar(50) DEFAULT NULL,data mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci, createdAt tinytext, premium tinyint DEFAULT NULL, premiumUntil tinytext, lastPremiumCoins tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci, userName text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci, energyNotifAt tinytext, voteNotifAt tinytext, votes text, totalVotes int DEFAULT '0', bossesKilled int DEFAULT '0', coinsSpent int DEFAULT '0', resourcesFarmed int DEFAULT '0');`, async (err) => {
        if (err) throw err;
    });

});

module.exports = {sql};