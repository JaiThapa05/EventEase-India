require("dotenv").config();

const mysql = require("mysql2/promise");

async function migrate() {
  let localDB;
  let tidbDB;

  try {
    // ================================
    // XAMPP
    // ================================

    localDB = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "eventease",
      port: 3306
    });

    console.log("✅ XAMPP connected");

    // ================================
    // TIDB
    // ================================

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

    // ================================
    // TABLES
    // ================================

    const tables = [
      "states",
      "districts",
      "locations",
      "users",
      "events",
      "registrations",
      "reviews",
      "notifications",
      "village_import"
    ];

    const BATCH_SIZE = 2000;

    await tidbDB.query(
      "SET FOREIGN_KEY_CHECKS = 0"
    );

    // ================================
    // MIGRATE TABLES
    // ================================

    for (const table of tables) {

      console.log("");
      console.log("================================");
      console.log(`📦 Migrating: ${table}`);
      console.log("================================");

      // Count local rows
      const [[count]] = await localDB.query(
        `SELECT COUNT(*) AS total
         FROM \`${table}\``
      );

      const total = Number(count.total);

      console.log(`📊 Found ${total} rows`);

      if (total === 0) {
        console.log(`⚠️ ${table} is empty`);
        continue;
      }

      // Get TiDB columns
      const [columns] = await tidbDB.query(
        `SHOW COLUMNS FROM \`${table}\``
      );

      const tidbColumns = columns.map(
        column => column.Field
      );

      // Clear TiDB table
      await tidbDB.query(
        `DELETE FROM \`${table}\``
      );

      console.log("🧹 Existing TiDB data cleared");

      // ================================
      // GET PRIMARY KEY
      // ================================

      const primaryKeyColumn =
        columns.find(
          column => column.Key === "PRI"
        );

      // ================================
      // TABLE WITH PRIMARY KEY
      // ================================

      if (primaryKeyColumn) {

        const pk = primaryKeyColumn.Field;

        let lastId = 0;
        let migrated = 0;

        while (true) {

          const [rows] = await localDB.query(
            `SELECT *
             FROM \`${table}\`
             WHERE \`${pk}\` > ?
             ORDER BY \`${pk}\` ASC
             LIMIT ?`,
            [
              lastId,
              BATCH_SIZE
            ]
          );

          if (rows.length === 0) {
            break;
          }

          const columnNames =
            Object.keys(rows[0]).filter(
              column =>
                tidbColumns.includes(column)
            );

          const columnSQL =
            columnNames
              .map(
                column => `\`${column}\``
              )
              .join(", ");

          const placeholders =
            rows
              .map(
                () =>
                  `(${columnNames
                    .map(() => "?")
                    .join(", ")})`
              )
              .join(", ");

          const values = [];

          for (const row of rows) {
            for (const column of columnNames) {
              values.push(row[column]);
            }
          }

          const sql = `
            INSERT INTO \`${table}\`
            (${columnSQL})
            VALUES ${placeholders}
          `;

          await tidbDB.query(
            sql,
            values
          );

          migrated += rows.length;

          lastId =
            rows[rows.length - 1][pk];

          const percent =
            ((migrated / total) * 100)
              .toFixed(2);

          console.log(
            `🚀 ${table}: ${migrated}/${total} (${percent}%)`
          );
        }

        console.log(
          `🎉 ${table} completed: ${migrated} rows`
        );

      } else {

        // ================================
        // TABLE WITHOUT PRIMARY KEY
        // ================================

        const [rows] = await localDB.query(
          `SELECT * FROM \`${table}\``
        );

        for (
          let i = 0;
          i < rows.length;
          i += BATCH_SIZE
        ) {

          const batch =
            rows.slice(
              i,
              i + BATCH_SIZE
            );

          if (batch.length === 0) {
            continue;
          }

          const columnNames =
            Object.keys(batch[0]).filter(
              column =>
                tidbColumns.includes(column)
            );

          const columnSQL =
            columnNames
              .map(
                column => `\`${column}\``
              )
              .join(", ");

          const placeholders =
            batch
              .map(
                () =>
                  `(${columnNames
                    .map(() => "?")
                    .join(", ")})`
              )
              .join(", ");

          const values = [];

          for (const row of batch) {
            for (const column of columnNames) {
              values.push(row[column]);
            }
          }

          await tidbDB.query(
            `
              INSERT INTO \`${table}\`
              (${columnSQL})
              VALUES ${placeholders}
            `,
            values
          );

          console.log(
            `🚀 ${table}: ${Math.min(
              i + BATCH_SIZE,
              rows.length
            )}/${rows.length}`
          );
        }

        console.log(
          `🎉 ${table} completed`
        );
      }
    }

    await tidbDB.query(
      "SET FOREIGN_KEY_CHECKS = 1"
    );

    console.log("");
    console.log("================================");
    console.log("🎉 ALL MIGRATIONS COMPLETED");
    console.log("================================");

  } catch (error) {

    console.error("");
    console.error("❌ MIGRATION FAILED");
    console.error(error);

  } finally {

    if (localDB) {
      await localDB.end();
    }

    if (tidbDB) {
      await tidbDB.end();
    }

    console.log("🔌 Connections closed");
  }
}

migrate();