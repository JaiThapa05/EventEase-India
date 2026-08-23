const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  dateStrings:true
});



db.getConnection((err, connection) => {
  if (err) {
    console.log("❌ MySQL connection failed");
    console.log(err.message);
    return;
  }

  console.log("✅ MySQL connected successfully");

  connection.release();
});

module.exports = db.promise();