require("dotenv").config();

const mysql = require("mysql2/promise");

async function migrate() {

  let localDB;
  let tidbDB;

  try {

    // ========================================
    // XAMPP MYSQL
    // ========================================

    localDB = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "eventease",
      port: 3306
    });

    console.log("✅ XAMPP connected");


    // ========================================
    // TIDB CLOUD
    // ========================================

    tidbDB = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT) || 4000,

      ssl: {
        minVersion: "TLSv1.2"
      }
    });

    console.log("✅ TiDB connected");


    // ========================================
    // TABLES
    // ========================================

    const tables = [
      "users",
      "events",
      "registrations",
      "reviews",
      "notifications"
    ];


    // ========================================
    // FOREIGN KEYS OFF
    // ========================================

    await tidbDB.query(
      "SET FOREIGN_KEY_CHECKS = 0"
    );


    // ========================================
    // MIGRATE
    // ========================================

    for (const table of tables) {

      console.log("");
      console.log("📦 Migrating:", table);


      // Get XAMPP data

      const [rows] = await localDB.query(
        `SELECT * FROM \`${table}\``
      );

      console.log(
        `Found ${rows.length} rows`
      );


      if (rows.length === 0) {

        console.log(
          `⚠️ ${table} is empty`
        );

        continue;
      }


      // Get TiDB columns

      const [columns] = await tidbDB.query(
        `SHOW COLUMNS FROM \`${table}\``
      );


      const tidbColumns =
        columns.map(
          column => column.Field
        );


      // Insert every row

      for (const row of rows) {

        const columnNames =
          Object.keys(row).filter(
            column =>
              tidbColumns.includes(column)
          );


        const values =
          columnNames.map(
            column => row[column]
          );


        const placeholders =
          columnNames
            .map(() => "?")
            .join(", ");


        const columnSQL =
          columnNames
            .map(
              column =>
                `\`${column}\``
            )
            .join(", ");


        const sql = `
          INSERT INTO \`${table}\`
          (${columnSQL})
          VALUES (${placeholders})
        `;


        await tidbDB.query(
          sql,
          values
        );
      }


      console.log(
        `✅ ${rows.length} rows migrated`
      );
    }


    // ========================================
    // FOREIGN KEYS ON
    // ========================================

    await tidbDB.query(
      "SET FOREIGN_KEY_CHECKS = 1"
    );


    console.log("");
    console.log("==============================");
    console.log("🎉 MIGRATION COMPLETED");
    console.log("==============================");


  } catch (error) {

    console.error("");
    console.error("❌ MIGRATION FAILED");
    console.error(error.message);

  } finally {

    if (localDB) {
      await localDB.end();
    }

    if (tidbDB) {
      await tidbDB.end();
    }

  }
}


// ========================================
// START
// ========================================

migrate();