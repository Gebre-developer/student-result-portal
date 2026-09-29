require("dotenv").config(); // ⚡ Essential for parsing your database connection strings
const express = require("express");
const cors = require("cors");
const pool = require("./config/db"); // Imports your Neon DB connection pool

// 🚀 Route Subsystem Imports
const authRoutes = require("./routes/authRoutes");
const resultRoutes = require("./routes/resultRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// ✅ 1. CONFIGURE CORS: Grant access to your live Vercel link and local development
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://student-result-portal-omega.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ✅ 2. Preflight handling to prevent browser redirect blocking
app.options("*", cors());

// ✅ 3. Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🚀 4. Mount Application Routing Pipelines
app.use("/api/auth", authRoutes);
app.use("/api/results", resultRoutes); // Handles your grade calculations
app.use("/api/admin", adminRoutes);

// Base diagnostic endpoint
app.get("/", (req, res) => {
  res.send(
    "Software Engineering Section B Portal Backend is Running smoothly with Neon!",
  );
});

const PORT = process.env.PORT || 5000;

// ✅ 5. Verify Database Connection before opening network ports
pool.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error("❌ Neon PostgreSQL connection failed:");
    console.error("Error Details:", err.message);
    process.exit(1);
  } else {
    console.log(
      "🚀 Secure connection established with Neon PostgreSQL cluster!",
    );
    app.listen(PORT, () => {
      console.log(`Server operating smoothly on port ${PORT}`);
    });
  }
});
