// server/index.js
require("dotenv").config(); // Ensures environment variables are parsed early
const app = require("./server"); // 🚀 Imports the app configuration from server.js safely
const pool = require("./config/db"); // Imports your Neon PostgreSQL database client pool

const PORT = process.env.PORT || 5000;

/**
 * Handles database testing with automated retry attempts.
 * Prevents Render from crashing if the database is temporarily sleeping.
 */
const connectWithRetry = async (retries = 5, delay = 3000) => {
  while (retries > 0) {
    try {
      // Run a simple query to confirm the connection is active
      const res = await pool.query("SELECT NOW()");
      console.log(
        "Connected smoothly to your Neon PostgreSQL database over HTTP!",
      );
      console.log(
        "🚀 Connected to the Neon PostgreSQL database cluster securely.",
      );
      return true;
    } catch (err) {
      retries -= 1;
      console.warn(
        `⚠️ Neon DB connection waiting... Retries remaining: ${retries}`,
      );
      console.error(`Error context: ${err.message}`);

      if (retries === 0) {
        console.error(
          "❌ Crucial connection error: All Neon DB verification retries exhausted.",
        );
        // We do NOT use process.exit(1) here so that the Render build finishes successfully
        // and allows the server application to automatically recover later.
        return false;
      }

      // Wait for the specified delay before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Start the network listener immediately so Render/Vercel platform checks pass safely
app.listen(PORT, async () => {
  console.log(`Server is operating smoothly on port ${PORT}`);

  // Kick off the background database connection validation checklist
  await connectWithRetry();
});
