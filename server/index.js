// server/index.js
const app = require("./server"); // 🚀 Imports the app configuration from server.js safely
const pool = require("./config/db"); // Imports your Neon PostgreSQL database client pool

const PORT = process.env.PORT || 5000;

// Verify Database Connection State cleanly over HTTP before starting server listener
pool.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error(
      "❌ Connection failed. Could not verify Neon PostgreSQL connection:",
    );
    console.error("Error Details:", err.message);
    process.exit(1);
  } else {
    console.log(
      "Connected smoothly to your Neon PostgreSQL database over HTTP!",
    );
    console.log(
      "🚀 Connected to the Neon PostgreSQL database cluster securely.",
    );

    // Boot up the network listener safely after database validation passes
    app.listen(PORT, () => {
      console.log(`Server is operating smoothly on port ${PORT}`);
    });
  }
});
