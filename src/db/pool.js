require("dotenv").config();
const { Pool } = require("pg");

const {
    DATABASE_URL,
    NODE_ENV,
    PGUSER,
    PGPASSWORD,
    PGHOST,
    PGPORT,
    PGDATABASE,
} = process.env;

const isProduction = NODE_ENV === "production";

const poolConfig =
    DATABASE_URL && isProduction
        ? {
              connectionString: DATABASE_URL,
              ssl: { rejectUnauthorized: false },
          }
        : {
              user: PGUSER,
              password: PGPASSWORD,
              host: PGHOST,
              port: PGPORT,
              database: PGDATABASE,
              ssl: isProduction ? { rejectUnauthorized: false } : false,
          };

const pool = new Pool(poolConfig);

pool.on("connect", () => {
    console.log("Connected to PostgreSQL");
});

pool.on("error", (err) => {
    console.error("Unexpected PG pool error", err);
    process.exit(-1);
});

module.exports = pool;
