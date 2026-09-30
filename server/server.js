require("dotenv").config(); // ⚡ Line 1: Crucial for early parsing of environment properties
const express = require("express");
const cors = require("cors");

// Route Subsystem Imports
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const resultRoutes = require("./routes/resultRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// ✅ CORS: Grant explicit permission to both local development and your live production URL
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://student-result-portal-omega.vercel.app",
    ],
    credentials: true,
  }),
);

app.use(express.json()); // Required to parse incoming JSON data from the frontend
app.use(express.urlencoded({ extended: true }));

// ⚡ REST RESTORED: Mounted under /api prefix to match frontend api.js calls
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/admin", adminRoutes);

// Base Diagnostic Route
app.get("/", (req, res) => {
  res.send(
    "Software Engineering Section B Portal Backend is Running with Neon!",
  );
});

// Export app configuration instance so index.js can securely mount and start it
module.exports = app;
