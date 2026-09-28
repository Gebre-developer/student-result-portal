require("dotenv").config(); // ⚡ Line 1: Crucial for early parsing of environment properties
const express = require("express");
const cors = require("cors");

// Route Subsystem Imports
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const resultRoutes = require("./routes/resultRoutes");
const adminRoutes = require("./routes/adminRoutes"); // 🚀 Added admin routes layout

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

app.use(express.json()); // Required to parse incoming JSON data from the frontend
app.use(express.urlencoded({ extended: true }));

// ⚡ REMOVED "/api" PREFIX: Routes match your frontend links exactly now
app.use("/auth", authRoutes);
app.use("/students", studentRoutes);
app.use("/results", resultRoutes);
app.use("/admin", adminRoutes); // 🚀 Mounted admin routes pipeline

// Base Diagnostic Route
app.get("/", (req, res) => {
  res.send(
    "Software Engineering Section B Portal Backend is Running with Neon!",
  );
});

// Export app configuration instance so index.js can securely mount and start it
module.exports = app;
