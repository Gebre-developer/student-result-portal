const { Pool, neonConfig } = require("@neondatabase/serverless");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  console.error(
    "❌ CRITICAL ERROR: DATABASE_URL variable is missing inside your .env file!",
  );
  process.exit(1);
}

// ⚡ Force the driver to use HTTP fetch requests instead of raw TCP sockets
neonConfig.poolQueryViaFetch = true;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("Connected smoothly to your Neon PostgreSQL database over HTTP!");
});

module.exports = pool;
