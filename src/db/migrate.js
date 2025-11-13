require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("./pool");

async function runMigrations() {
    const schemaPath = path.join(__dirname, "schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf8");

    console.log("Running migrations...");
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("COMMIT");
        console.log("Migrations complete.");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Migration failed:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigrations().catch((err) => {
    console.error("Unexpected migration error:", err);
    process.exit(1);
});
