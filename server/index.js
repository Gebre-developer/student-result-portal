// index.js
const express = require("express");
const cors = require("cors");
const app = express();

// ✅ FIXED CORS: Grant explicit permission to both local development and your live production URL
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://student-result-portal-omega.vercel.app", // 👈 Your exact live production website domain path
    ],
    credentials: true,
  }),
);

app.use(express.json()); // Required to parse incoming json data from the frontend
const app = require("./server"); // Import your clean configured app instance
const pool = require("./config/db"); // Connection pool for Neon Postgres

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
