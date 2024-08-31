require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

let mysqlconnection;

(async () => {
    try {
        mysqlconnection = mysql.createPool({
            host: process.env.MYSQLHOST,
            user: process.env.MYSQLUSER_NAME,
            password: process.env.MYSQLPASSWORD,
            database: process.env.DATABASE,
            multipleStatements: true
        });
        console.log("MySQL is connected");

        // Read and execute the SQL script
        const sqlScript = fs.readFileSync(path.join(__dirname, '../model.sql'), 'utf8');
        await mysqlconnection.query(sqlScript);

    } catch (err) {
        console.log("MySQL connection failed");
        console.error(err);
    }
})();

module.exports = mysqlconnection;
