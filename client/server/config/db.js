const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 4000,

  dateStrings: true,

  ssl: {
    minVersion: "TLSv1.2"
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.log("❌ TiDB connection failed");
    console.log(err.message);
    return;
  }

  console.log("✅ TiDB connected successfully");
  connection.release();
});

module.exports = db.promise();


///XC1QSFXWcCBF6wfQ///
///6f2e8b5723203baefda0e8a5657b6479///