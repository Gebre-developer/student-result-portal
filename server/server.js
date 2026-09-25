require("dotenv").config(); // ⚡ Line 1: Crucial for early parsing of environment properties
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

// Route Subsystem Imports
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const resultRoutes = require("./routes/resultRoutes");
const adminRoutes = require("./routes/adminRoutes"); // 🚀 Added admin routes layout

const app = express();

// Standard App-Level Middlewares
app.use(cors());
app.use(express.json()); // Essential for handling incoming JSON data payloads

// Mount Application Routing Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/admin", adminRoutes); // 🚀 Mounted admin routes pipeline

// Base Diagnostic Route
app.get("/", (req, res) => {
  res.send(
    "Software Engineering Section B Portal Backend is Running with Neon!",
  );
});

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

    app.listen(PORT, () => {
      console.log(`Server is operating smoothly on port ${PORT}`);
    });
  }
});
